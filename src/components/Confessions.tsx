import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Send, Trash2 } from 'lucide-react';
import BackButton from './BackButton';

interface Confession {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile_name?: string;
}

export function Confessions() {
  const { user, profile } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [newConfession, setNewConfession] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6 pb-24">
        <div className="mb-4">
          <BackButton />
        </div>
        <form onSubmit={handlePostConfession} className="sticky top-20 z-40">
          <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black border border-green-500/20 rounded-xl p-4 shadow-lg shadow-green-500/10">
            <textarea
              value={newConfession}
              onChange={(e) => setNewConfession(e.target.value)}
              placeholder="What's on your mind? Drop your confession..."
              maxLength={500}
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 border border-green-500/30 rounded-lg p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500/50 focus:outline-none resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">
                {newConfession.length}/500
              </span>
              <button
                type="submit"
                disabled={!newConfession.trim() || posting}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 rounded-lg hover:from-green-500 hover:to-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Send className="w-4 h-4" />
                <span>{posting ? 'Posting...' : 'Confess'}</span>
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : confessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No confessions yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {confessions.map((confession) => (
              <div
                key={confession.id}
                className="bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition shadow-lg shadow-green-500/5"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-green-400 font-semibold text-sm mb-2">
                      {confession.profile_name}
                    </p>
                    <p className="text-gray-100 leading-relaxed break-words">
                      {confession.content}
                    </p>
                    <p className="text-gray-500 text-xs mt-3">
                      {new Date(confession.created_at).toLocaleDateString(
                        [],
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                  {confession.user_id === user?.id && (
                    <button
                      onClick={() => handleDeleteConfession(confession.id)}
                      className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
