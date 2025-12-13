import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, User } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type SearchProps = {
  onTabChange: (tab: string) => void;
};

export function Search({ onTabChange }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { mode } = useMode();
  const { user } = useAuth();

  const isNerd = mode === 'nerd';
  const accentColor = isNerd ? 'text-blue-600' : 'text-purple-600';
  const accentBg = isNerd ? 'bg-blue-50' : 'bg-purple-50';
  const accentBorder = isNerd ? 'border-blue-200' : 'border-purple-200';

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      searchProfiles(searchTerm);
    } else {
      setProfiles([]);
    }
  }, [searchTerm]);

  const searchProfiles = async (term: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${term}%,college_name.ilike.%${term}%,course.ilike.%${term}%`)
        .limit(50);

      if (!error && data) {
        setProfiles(data);
      }
    } catch (error) {
      console.error('Error searching profiles:', error);
    }
    setLoading(false);
  };

  const getInitial = (name?: string) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Compact Header - Mobile */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 md:hidden">
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-2xl mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search people..."
            className="w-full pl-10 pr-10 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-2 pb-24 md:pb-4">
        {loading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : searchTerm.trim().length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <SearchIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-sm md:text-base text-gray-500">Search for people by name, college, or course</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <User className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-sm md:text-base text-gray-500">No results found</p>
          </div>
        ) : (
          <div className="space-y-1 md:space-y-2">
            {profiles.map((profile) => {
              const initial = getInitial(profile.name);
              const isOwn = profile.id === user?.id;
              
              return (
                <div
                  key={profile.id}
                  className={`flex items-center gap-2.5 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    isOwn ? 'opacity-60' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${
                      isNerd ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-pink-600'
                    } text-white flex items-center justify-center flex-shrink-0 text-xs md:text-sm font-bold`}
                  >
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
                      {profile.name}
                      {isOwn && <span className="text-gray-400 text-xs ml-1">(You)</span>}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">
                      {profile.college_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {profile.course}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
