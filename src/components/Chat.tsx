import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, ChatRoom, ChatMessage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useMode } from '../contexts/ModeContext';
import { MessageCircle, Send, Users, ArrowLeft, Home, LogOut, BookOpen, Heart } from 'lucide-react';

interface ExtendedChatMessage extends ChatMessage {
  sender_name?: string;
}

interface TypingUser {
  user_id: string;
  name: string;
}

export function Chat() {
  const { user, profile, signOut } = useAuth();
  const { mode, setMode } = useMode();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      setMessages([]);
      setTypingUsers(new Map());
      fetchMessages(selectedRoom);
      subscribeToMessages(selectedRoom);
      subscribeToTyping(selectedRoom);
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
    };
  }, [selectedRoom]);

  // Toggle a body class when a chat room is open so layout can hide mobile nav
  useEffect(() => {
    if (selectedRoom) {
      document.body.classList.add('chat-room-open');
    } else {
      document.body.classList.remove('chat-room-open');
    }
    return () => {
      document.body.classList.remove('chat-room-open');
    };
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at');

    if (!error && data) {
      setRooms(data);
    }
    setLoading(false);
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          room_id,
          user_id,
          message,
          created_at,
          profiles (name)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        const formattedMessages: ExtendedChatMessage[] = data.map((msg: any) => ({
          id: msg.id,
          room_id: msg.room_id,
          user_id: msg.user_id,
          message: msg.message,
          created_at: msg.created_at,
          sender_name: msg.profiles?.name || 'Unknown',
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = (roomId: string) => {
    channelRef.current = supabase
      .channel(`room:${roomId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user?.id },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', payload.new.user_id)
            .maybeSingle();

          const newMsg: ExtendedChatMessage = {
            id: payload.new.id,
            room_id: payload.new.room_id,
            user_id: payload.new.user_id,
            message: payload.new.message,
            created_at: payload.new.created_at,
            sender_name: profileData?.name || 'Unknown',
          };

          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            return exists ? prev : [...prev, newMsg];
          });

          setTypingUsers((prev) => {
            const updated = new Map(prev);
            updated.delete(payload.new.user_id);
            return updated;
          });
        }
      )
      .subscribe();
  };

  const subscribeToTyping = (roomId: string) => {
    typingChannelRef.current = supabase.channel(`typing:${roomId}`);

    typingChannelRef.current
      .on('broadcast', { event: 'user_typing' }, (payload: { payload: { user_id: string; name: string } }) => {
        if (payload.payload.user_id !== user?.id) {
          setTypingUsers((prev) => {
            const updated = new Map(prev);
            updated.set(payload.payload.user_id, {
              user_id: payload.payload.user_id,
              name: payload.payload.name,
            });
            return updated;
          });

          setTimeout(() => {
            setTypingUsers((prev) => {
              const updated = new Map(prev);
              updated.delete(payload.payload.user_id);
              return updated;
            });
          }, 3000);
        }
      })
      .subscribe();
  };

  const broadcastTyping = useCallback(async () => {
    if (!selectedRoom || !user || !profile) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingChannelRef.current?.send({
      type: 'broadcast',
      event: 'user_typing',
      payload: {
        user_id: user.id,
        name: profile.name,
        room_id: selectedRoom,
      },
    });

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = undefined;
    }, 3000);
  }, [selectedRoom, user, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      broadcastTyping();
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !user || !profile) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await supabase
        .from('chat_messages')
        .insert({
          room_id: selectedRoom,
          user_id: user.id,
          message: messageText,
        });
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    }
  };

  const currentRoom = rooms.find((room) => room.id === selectedRoom);

  if (selectedRoom && currentRoom) {
  return (
    <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col">
      <div className="md:max-w-4xl md:mx-auto md:my-8 md:rounded-2xl md:shadow-lg md:border md:border-gray-200 md:overflow-hidden flex-1 bg-white flex flex-col">
          <div className="fixed md:relative top-0 left-0 right-0 z-50 md:z-auto p-4 border-b bg-white md:bg-white flex items-center space-x-4 md:border-gray-200 border-gray-200" style={{ backgroundColor: '#76424E' }}>
            <button
              onClick={() => setSelectedRoom(null)}
              className="md:hidden text-white hover:opacity-80 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => setSelectedRoom(null)}
              className="hidden md:block text-white hover:opacity-80 transition"
            >
              <Home className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{currentRoom.name}</h3>
              <p className="text-sm text-white/70">{currentRoom.description}</p>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setMode(mode === 'nerd' ? 'social' : 'nerd')}
                className="text-white hover:opacity-80 transition p-2 rounded"
              >
                {mode === 'nerd' ? <Heart className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
              </button>
              <button
                onClick={() => signOut()}
                className="text-white hover:opacity-80 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col h-full mt-16 md:mt-0 relative">

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 pb-32 md:p-4 md:space-y-4 md:pb-0">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isOwn = message.user_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] lg:max-w-md rounded-2xl px-3 py-2 text-sm md:text-base shadow-sm ${
                            isOwn
                              ? 'text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                          style={isOwn ? { backgroundColor: '#76424E' } : {}}
                        >
                          {!isOwn && message.sender_name && (
                            <p className="text-xs font-semibold mb-1 text-gray-600">
                              {message.sender_name}
                            </p>
                          )}
                          <p className="break-words">{message.message}</p>
                          <p
                            className={`text-[10px] md:text-xs mt-1 ${
                              isOwn ? 'text-white/70' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="fixed md:relative bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-3 md:p-4 z-50 md:z-auto md:border-t md:bg-white flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
              {typingUsers.size > 0 && (
                <div className="mb-2 text-xs text-gray-500 italic">
                  {Array.from(typingUsers.values())
                    .map((u) => u.name)
                    .join(', ')}{' '}
                  {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </div>
              )}
              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 min-w-0 px-3 py-2 text-base md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-0">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b flex items-center space-x-4" style={{ backgroundColor: '#76424E' }}>
          <div className="bg-white/20 p-2 rounded-lg">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Chat Rooms</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 lg:grid-cols-3 md:p-4">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className="p-3 text-left hover:shadow-md transition border rounded-lg space-y-1"
                style={{ borderColor: '#76424E', backgroundColor: '#fff' }}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#76424E' }}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-sm md:text-base" style={{ color: '#76424E' }}>
                      {room.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 truncate">
                      {room.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
