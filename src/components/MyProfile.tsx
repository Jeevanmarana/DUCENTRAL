import { useAuth } from '../contexts/AuthContext';
import { useMode } from '../contexts/ModeContext';
import { ArrowLeft, User } from 'lucide-react';
import BackButton from './BackButton';

export function MyProfile() {
  const { profile } = useAuth();
  const { mode } = useMode();

  const isNerd = mode === 'nerd';
  const accentColor = isNerd ? 'from-blue-600 to-blue-700' : 'from-purple-600 to-pink-600';
  const accentBg = isNerd ? 'bg-blue-50' : 'bg-purple-50';
  const accentBorder = isNerd ? 'border-blue-200' : 'border-purple-200';

  const getInitial = (name?: string) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">No profile found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${accentColor} text-white px-4 sm:px-6 py-6 sm:py-8`}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <div className={`${accentBg} border ${accentBorder} rounded-2xl p-6 sm:p-8 shadow-sm`}>
          {/* Avatar and Name */}
          <div className="flex flex-col items-center mb-6">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${
                isNerd ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-pink-600'
              } text-white flex items-center justify-center text-2xl sm:text-3xl font-bold mb-4 shadow-lg`}
            >
              {getInitial(profile.name)}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
            <p className="text-sm sm:text-base text-gray-600">{profile.college_name}</p>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Course</h3>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{profile.course}</p>
            </div>

            {profile.unique_trait && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">About Me</h3>
                <p className="text-sm sm:text-base text-gray-700 italic">"{profile.unique_trait}"</p>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Member Since</h3>
              <p className="text-sm sm:text-base text-gray-700">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

