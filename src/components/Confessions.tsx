import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useMode } from '../contexts/ModeContext';
import { Send, Trash2, MessageCircle, X } from 'lucide-react';
import BackButton from './BackButton';

interface Confession {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile_name?: string;
}

interface Comment {
  id: string;
  confession_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile_name?: string;
}

export function Confessions() {
  const { user, profile } = useAuth();
  const { mode } = useMode();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [newConfession, setNewConfession] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [showCommentInput, setShowCommentInput] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [postingComment, setPostingComment] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchConfessions();
    const subscription = subscribeToConfessions();
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchConfessions = async () => {
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select(`
          id,
          user_id,
          content,
          created_at,
          profiles (college_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const formatted = data.map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          profile_name: c.profiles?.college_name
            ? `Someone from ${c.profiles.college_name}`
            : 'Someone from DU',
        }));
        setConfessions(formatted);
        // Load comments for each confession
        formatted.forEach((f) => {
          loadComments(f.id);
        });
      }
    } catch (error) {
      console.error('Error fetching confessions:', error);
    }
    setLoading(false);
  };

  const subscribeToConfessions = () => {
    const channel = supabase
      .channel('confessions-' + Date.now())
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'confessions' },
        async (payload) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('college_name')
            .eq('id', payload.new.user_id)
            .maybeSingle();

          setConfessions((prev) => [
            {
              id: payload.new.id,
              user_id: payload.new.user_id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              profile_name: profileData?.college_name
                ? `Someone from ${profileData.college_name}`
                : 'Someone from DU',
            },
            ...prev,
          ]);
          // Load comments for new confession
          loadComments(payload.new.id);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'confessions' },
        (payload) => {
          setConfessions((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return channel;
  };

  const handlePostConfession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConfession.trim() || !user) return;

    setPosting(true);
    try {
      const { error } = await supabase.from('confessions').insert({
        user_id: user.id,
        content: newConfession.trim(),
      });

      if (!error) {
        setNewConfession('');
      }
    } catch (error) {
      console.error('Error posting confession:', error);
    }
    setPosting(false);
  };

  const handleDeleteConfession = async (id: string) => {
    try {
      await supabase.from('confessions').delete().eq('id', id);
    } catch (error) {
      console.error('Error deleting confession:', error);
    }
  };

  const toggleLike = (id: string) => {
    setInteractions((prev) => {
      const current = prev[id] ?? { likes: 0, liked: false };
      const liked = !current.liked;
      const likes = liked ? current.likes + 1 : Math.max(0, current.likes - 1);
      return { ...prev, [id]: { ...current, liked, likes } };
    });
  };

  const loadComments = async (confessionId: string) => {
    try {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('confession_id', confessionId)
        .order('created_at', { ascending: true });

      if (data) {
        setComments((prev) => ({ ...prev, [confessionId]: data }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handlePostComment = async (confessionId: string) => {
    const text = commentText[confessionId]?.trim();
    if (!text || !user) return;

    setPostingComment((prev) => ({ ...prev, [confessionId]: true }));
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          confession_id: confessionId,
          user_id: user.id,
          content: text,
        })
        .select();

      if (error) throw error;

      if (data) {
        const newComment = data[0] as Comment;
        setComments((prev) => ({
          ...prev,
          [confessionId]: [...(prev[confessionId] || []), newComment],
        }));
        setCommentText((prev) => ({ ...prev, [confessionId]: '' }));
        setShowCommentInput((prev) => ({ ...prev, [confessionId]: false }));
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPostingComment((prev) => ({ ...prev, [confessionId]: false }));
    }
  };

  const handleDeleteComment = async (commentId: string, confessionId: string) => {
    try {
      await supabase.from('comments').delete().eq('id', commentId);
      setComments((prev) => ({
        ...prev,
        [confessionId]: (prev[confessionId] || []).filter((c) => c.id !== commentId),
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Subscribe to comment changes
  useEffect(() => {
    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const newComment = payload.new as Comment;
          setComments((prev) => ({
            ...prev,
            [newComment.confession_id]: [
              ...(prev[newComment.confession_id] || []),
              newComment,
            ],
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments' },
        (payload) => {
          const deletedComment = payload.old as Comment;
          setComments((prev) => ({
            ...prev,
            [deletedComment.confession_id]: (prev[deletedComment.confession_id] || []).filter(
              (c) => c.id !== deletedComment.id
            ),
          }));
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getInitial = (name?: string) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  const isNerd = mode === 'nerd';
  const accentColor = isNerd ? 'from-blue-600 to-blue-700' : 'from-purple-600 to-pink-600';
  const accentText = isNerd ? 'text-blue-600' : 'text-purple-600';
  const accentBg = isNerd ? 'bg-blue-50' : 'bg-purple-50';
  const accentGradient = isNerd 
    ? 'from-blue-600 to-blue-500' 
    : 'from-purple-600 to-pink-500';
  const accentBorder = isNerd ? 'border-blue-200' : 'border-purple-200';
  const accentPlaceholder = isNerd ? 'placeholder-blue-400' : 'placeholder-purple-400';
  const cardGradient = isNerd
    ? 'bg-gradient-to-br from-blue-50 to-indigo-50'
    : 'bg-gradient-to-br from-purple-50 to-pink-50';

  return (
    <div className="min-h-screen bg-white page-transition">
      {/* Header - Fixed on mobile */}
      <div className={`bg-gradient-to-r ${accentColor} text-white px-4 sm:px-6 py-6 sm:py-8 fixed md:sticky top-0 left-0 right-0 z-30`}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-2">
            <BackButton />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">🍵 Tea</h1>
          <p className="text-sm sm:text-base opacity-90 mt-1">Spill the tea anonymously</p>
        </div>
      </div>

      {/* Spacer for fixed header on mobile */}
      <div className="h-[120px] md:h-0"></div>

      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 pb-24">
        {/* Post Form - Fixed on mobile */}
        <form onSubmit={handlePostConfession} className="mb-6 sm:mb-8 animate-slideUp fixed md:relative top-[120px] md:top-auto left-0 right-0 z-20 bg-white md:bg-transparent pb-2 md:pb-0 px-3 sm:px-6 pt-2 md:pt-0 shadow-lg md:shadow-none">
          <div className={`${cardGradient} border ${accentBorder} rounded-2xl p-4 sm:p-6 shadow-sm max-w-2xl mx-auto`}>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              ☕ Have a tea? Why not share it?
            </label>
            <textarea
              value={newConfession}
              onChange={(e) => setNewConfession(e.target.value)}
              placeholder="Spill the tea here... (max 500 characters)"
              maxLength={500}
              className={`w-full bg-white text-gray-900 ${accentPlaceholder} border ${accentBorder} rounded-xl p-3 sm:p-4 focus:border-current focus:ring-2 focus:ring-opacity-20 focus:outline-none resize-none text-sm sm:text-base leading-relaxed transition-all`}
              rows={4}
            />
            <div className="flex items-center justify-between mt-4 gap-3">
              <span className={`text-xs sm:text-sm font-medium ${isNerd ? 'text-blue-600' : 'text-purple-600'}`}>
                {newConfession.length}/500
              </span>
              <button
                type="submit"
                disabled={!newConfession.trim() || posting}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r ${accentGradient} text-white rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none`}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 stroke-current" />
                <span>{posting ? 'Spilling...' : 'Share Tea'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Spacer for fixed form on mobile */}
        <div className="h-[280px] md:h-0"></div>

        {/* Confessions List */}
        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : confessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4 stroke-current" />
            <p className="text-sm sm:text-base text-gray-600 text-center">No tea yet... 👀 Why not start the drama?</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {confessions.map((confession) => {
              const initial = getInitial(confession.profile_name);
              const isOwner = confession.user_id === user?.id;

              return (
                <div
                  key={confession.id}
                  className={`${cardGradient} border ${accentBorder} rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xs hover:shadow-sm transition-all duration-200 animate-slideUp`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${
                          isNerd ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-pink-600'
                        } text-white flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold shadow-sm`}
                      >
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {confession.profile_name}
                        </p>
                        <p className="text-xs text-gray-600">{formatDate(confession.created_at)}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteConfession(confession.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-current" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-sm sm:text-base text-gray-900 leading-relaxed mb-3 break-words font-medium">
                    {confession.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-start gap-1 sm:gap-2">
                    <button
                      onClick={() => setShowCommentInput((prev) => ({ ...prev, [confession.id]: !prev[confession.id] }))}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        isNerd
                          ? 'text-blue-600 hover:bg-blue-100'
                          : 'text-purple-600 hover:bg-purple-100'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 stroke-current" />
                      <span>{(comments[confession.id] || []).length || 'Reply'}</span>
                    </button>
                  </div>

                  {/* Comment Section */}
                  {showCommentInput[confession.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={commentText[confession.id] || ''}
                          onChange={(e) => setCommentText((prev) => ({ ...prev, [confession.id]: e.target.value }))}
                          placeholder="Share your thoughts... (max 200)"
                          maxLength={200}
                          className={`flex-1 bg-white text-gray-900 ${accentPlaceholder} border ${accentBorder} rounded-lg px-3 py-2 text-xs sm:text-sm focus:border-current focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-all`}
                        />
                        <button
                          onClick={() => handlePostComment(confession.id)}
                          disabled={!commentText[confession.id]?.trim() || postingComment[confession.id]}
                          className={`flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r ${accentGradient} text-white rounded-lg font-semibold text-xs sm:text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Send className="w-3.5 h-3.5 stroke-current" />
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(comments[confession.id] || []).map((comment) => (
                          <div key={comment.id} className="flex gap-2 py-2 px-3 bg-white bg-opacity-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-900 break-words">{comment.content}</p>
                              <p className="text-xs text-gray-600 mt-1">⏰ {formatDate(comment.created_at)}</p>
                            </div>
                            {comment.user_id === user?.id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, confession.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5 stroke-current" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
