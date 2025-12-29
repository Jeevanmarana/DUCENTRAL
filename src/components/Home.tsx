import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMode } from '../contexts/ModeContext';
import { MessageCircle, Trash2, Send, X, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

type HomeProps = {
  onTabChange: (tab: string) => void;
};

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

export function Home({ onTabChange }: HomeProps) {
  const { user, profile } = useAuth();
  const { mode } = useMode();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
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

  const toggleLike = (id: string) => {
    setInteractions((prev) => {
      const current = prev[id] ?? { likes: 0, liked: false };
      const liked = !current.liked;
      const likes = liked ? current.likes + 1 : Math.max(0, current.likes - 1);
      return { ...prev, [id]: { ...current, liked, likes } };
    });
  };

  const handleDeleteConfession = async (id: string) => {
    try {
      await supabase.from('confessions').delete().eq('id', id);
    } catch (error) {
      console.error('Error deleting confession:', error);
    }
  };

  const handlePostComment = async (confessionId: string) => {
    const text = commentText[confessionId]?.trim();
    if (!text || !user) return;

    setPostingComment((prev) => ({ ...prev, [confessionId]: true }));
    try {
      const { data, error } = await supabase.from('comments').insert({
        confession_id: confessionId,
        user_id: user.id,
        content: text,
      }).select();

      if (!error && data) {
        const newComment: Comment = {
          id: data[0].id,
          confession_id: data[0].confession_id,
          user_id: data[0].user_id,
          content: data[0].content,
          created_at: data[0].created_at,
          profile_name: profile?.college_name ? `You` : 'Someone from DU',
        };
        setComments((prev) => ({
          ...prev,
          [confessionId]: [newComment, ...(prev[confessionId] || [])],
        }));
        setCommentText((prev) => ({ ...prev, [confessionId]: '' }));
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
    setPostingComment((prev) => ({ ...prev, [confessionId]: false }));
  };

  const handleDeleteComment = async (commentId: string, confessionId: string) => {
    try {
      await supabase.from('comments').delete().eq('id', commentId);
      setComments((prev) => ({
        ...prev,
        [confessionId]: prev[confessionId].filter((c) => c.id !== commentId),
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
  const accentHover = isNerd ? 'hover:bg-blue-100' : 'hover:bg-purple-100';
  const accentBadge = isNerd ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
  const accentBorder = isNerd ? 'border-blue-200' : 'border-purple-200';
  const accentPlaceholder = isNerd ? 'placeholder-blue-400' : 'placeholder-purple-400';
  const accentGradient = isNerd 
    ? 'from-blue-600 to-blue-500' 
    : 'from-purple-600 to-pink-500';

  return (
    <div className="min-h-screen bg-white page-transition">
      {/* Welcome Banner */}
      <div className={`bg-gradient-to-r ${accentColor} text-white px-4 sm:px-6 py-6 sm:py-8`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {user && profile ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">Welcome back, {profile?.name}!</h2>
                  <p className="text-sm sm:text-base opacity-90">
                    {profile?.college_name} • {profile?.course}
                  </p>
                  {profile?.unique_trait && (
                    <p className="text-xs sm:text-sm opacity-75 italic mt-2">"{profile.unique_trait}"</p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">Welcome to DU Central</h2>
                  <p className="text-sm sm:text-base opacity-90">
                    Discover what's happening around campus
                  </p>
                  <p className="text-xs sm:text-sm opacity-75 italic mt-2">Login or signup to share and chat with friends!</p>
                </>
              )}
            </div>
            {user && profile && (
              <button
                onClick={() => onTabChange('profile')}
                className="ml-4 p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
                title="View Profile"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Banner Image */}
      <div className="w-full h-48 sm:h-56 overflow-hidden bg-gray-200">
        <img 
          src="https://res.cloudinary.com/dc8sm79wh/image/upload/v1766962920/IMG_4676_fdrjtp.png"
          alt="Header Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Feed Section */}
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 pb-24">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Feed</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">What's the tea? ☕</h3>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 rounded-lg sm:rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : confessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4 stroke-current" />
            <p className="text-sm sm:text-base text-gray-600 text-center">No tea yet. 👀 Why not spill some?</p>
            {mode === 'social' && (
              <button
                onClick={() => onTabChange('confessions')}
                className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all ${
                  isNerd ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                Share Some Tea
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {confessions.map((confession) => {
              const initial = getInitial(confession.profile_name);
              const isOwner = confession.user_id === user?.id;

              return (
                <div
                  key={confession.id}
                  className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-xs hover:shadow-sm transition-all duration-200 animate-slideUp"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${
                          isNerd ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-pink-600'
                        } text-white flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold`}
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
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-current" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-sm sm:text-base text-gray-900 leading-relaxed mb-3 break-words">
                    {confession.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-start gap-1 sm:gap-2">
                    <button
                      onClick={() => setShowCommentInput((prev) => ({ ...prev, [confession.id]: !prev[confession.id] }))}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        isNerd
                          ? 'text-blue-600 hover:bg-blue-50'
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 stroke-current" />
                      <span className="font-semibold">{comments[confession.id]?.length || 0}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showCommentInput[confession.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {/* Comment Input */}
                      {user && (
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={commentText[confession.id] || ''}
                            onChange={(e) => setCommentText((prev) => ({ ...prev, [confession.id]: e.target.value }))}
                            placeholder="Share your thoughts... (max 200)"
                            maxLength={200}
                            className={`flex-1 bg-white text-gray-900 ${accentPlaceholder} border ${accentBorder} rounded-lg px-3 py-2 text-base sm:text-sm focus:border-current focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-all`}
                          />
                          <button
                            onClick={() => handlePostComment(confession.id)}
                            disabled={!commentText[confession.id]?.trim() || postingComment[confession.id]}
                            className={`flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r ${accentGradient} text-white rounded-lg font-semibold text-xs sm:text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <Send className="w-3.5 h-3.5 stroke-current" />
                          </button>
                        </div>
                      )}

                      {/* Comments List */}
                      {comments[confession.id]?.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {comments[confession.id].map((comment) => (
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
                      )}
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
