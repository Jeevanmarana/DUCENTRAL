import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User, Search } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';

export function Profiles() {
  const { mode } = useMode();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const filteredProfiles = profiles.filter((profile) => {
    const search = searchTerm.toLowerCase();
    return (
      profile.name.toLowerCase().includes(search) ||
      profile.college_name.toLowerCase().includes(search) ||
      profile.course.toLowerCase().includes(search)
    );
  });

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${mode === 'social' ? 'bg-du-bg' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${mode === 'social' ? 'text-white' : 'text-gray-900'} mb-2`}>Student Profiles</h1>
        <p className={` ${mode === 'social' ? 'text-white/90' : 'text-gray-600'}`}>Connect with fellow students from University of Delhi</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${mode === 'social' ? 'text-du' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search by name, college, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 ${mode === 'social' ? 'focus:ring-du' : 'focus:ring-blue-500'} focus:border-transparent`}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading profiles...</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No profiles found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100 ${mode === 'social' ? 'md:bg-gray-800' : ''}`}
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className={`${mode === 'social' ? 'bg-du/10' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0`}> 
                  <User className={`w-7 h-7 ${mode === 'social' ? 'text-du' : 'text-white'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{profile.college_name}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className={`${mode === 'social' ? 'bg-du/10 text-du' : 'bg-blue-50 text-blue-700'} px-3 py-1 rounded-full text-sm font-medium inline-block`}>
                  {profile.course}
                </div>
              </div>

              {profile.unique_trait && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 italic">"{profile.unique_trait}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
