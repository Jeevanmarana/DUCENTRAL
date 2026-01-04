import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface UnreadMessagesContextType {
  unreadCounts: Record<string, number>;
  totalUnreadCount: number;
  markRoomAsRead: (roomId: string) => void;
  refreshUnreadCounts: () => Promise<void>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const channelRef = useRef<any>(null);

  // Get last viewed timestamp for a room from localStorage
  const getLastViewed = useCallback((roomId: string): string | null => {
    if (!user) return null;
    const key = `lastViewed_${user.id}_${roomId}`;
    return localStorage.getItem(key);
  }, [user]);

  // Mark a room as read (update last viewed timestamp)
  const markRoomAsRead = useCallback((roomId: string) => {
    if (!user) return;
    const key = `lastViewed_${user.id}_${roomId}`;
    localStorage.setItem(key, new Date().toISOString());
    // Update the count immediately
    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
  }, [user]);

  // Fetch unread counts for all rooms
  const refreshUnreadCounts = useCallback(async () => {
    if (!user) {
      setUnreadCounts({});
      return;
    }

    try {
      // Fetch all rooms
      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('id');

      if (!rooms) return;

      const counts: Record<string, number> = {};

      // For each room, count unread messages
      for (const room of rooms) {
        const lastViewed = getLastViewed(room.id);
        
        if (!lastViewed) {
          // If never viewed, count all messages except own messages
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .neq('user_id', user.id);
          counts[room.id] = count || 0;
        } else {
          // Count messages after last viewed
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .gt('created_at', lastViewed)
            .neq('user_id', user.id); // Don't count own messages
          counts[room.id] = count || 0;
        }
      }

      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  }, [user, getLastViewed]);

  // Subscribe to all new messages to update counts in real-time
  useEffect(() => {
    if (!user) {
      setUnreadCounts({});
      return;
    }

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to all chat_messages
    channelRef.current = supabase
      .channel('unread-messages-tracker')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          const roomId = payload.new.room_id;
          const userId = payload.new.user_id;
          
          // Don't count own messages
          if (userId === user.id) return;

          const lastViewed = getLastViewed(roomId);
          
          // If room was never viewed or message is newer than last viewed, increment count
          if (!lastViewed || payload.new.created_at > lastViewed) {
            setUnreadCounts((prev) => ({
              ...prev,
              [roomId]: (prev[roomId] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    // Initial fetch
    refreshUnreadCounts();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, getLastViewed, refreshUnreadCounts]);

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCounts,
        totalUnreadCount,
        markRoomAsRead,
        refreshUnreadCounts,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error('useUnreadMessages must be used within UnreadMessagesProvider');
  }
  return context;
}

