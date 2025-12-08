import { useAuth } from '../contexts/AuthContext';
import { useMode } from '../contexts/ModeContext';
import { Users, BookOpen, MessageCircle, Sparkles, Lightbulb, Mail } from 'lucide-react';

type HomeProps = {
  onTabChange: (tab: string) => void;
};

export function Home({ onTabChange }: HomeProps) {
  const { profile } = useAuth();
  const { mode } = useMode();

  if (mode === 'social') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="bg-du md:bg-gradient-to-r md:from-green-600 md:to-green-800 rounded-2xl p-8 mb-8 text-white md:border border-green-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Welcome, {profile?.name}!</h1>
          </div>
          <p className="text-green-100 text-lg">
            {profile?.college_name} • {profile?.course}
          </p>
          {profile?.unique_trait && (
            <p className="mt-4 text-green-50 italic">"{profile.unique_trait}"</p>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white md:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl md:hover:border-green-500/50 transition p-6 md:border md:border-green-500/20">
            <div className="bg-du/10 md:bg-green-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 md:border md:border-green-500/30">
              <Mail className="w-6 h-6 text-du md:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-du md:text-green-400 mb-2">
              Drop Confessions
            </h3>
            <p className="text-gray-600 md:text-gray-400 mb-4">Share your thoughts anonymously with the community</p>
            <button
              onClick={() => onTabChange('confessions')}
              className="text-du md:text-green-400 hover:opacity-90 font-medium flex items-center space-x-2"
            >
              <span>Start Confessing</span>
              <span>→</span>
            </button>
          </div>

          <div className="bg-white md:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl md:hover:border-green-500/50 transition p-6 md:border md:border-green-500/20">
            <div className="bg-du/10 md:bg-green-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 md:border md:border-green-500/30">
              <Users className="w-6 h-6 text-du md:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-du md:text-green-400 mb-2">
              Connect & Chat
            </h3>
            <p className="text-gray-600 md:text-gray-400 mb-4">Find friends and join conversations</p>
            <button
              onClick={() => onTabChange('chat')}
              className="text-du md:text-green-400 hover:opacity-90 font-medium flex items-center space-x-2"
            >
              <span>Join Chats</span>
              <span>→</span>
            </button>
          </div>

          <div className="bg-white md:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl md:hover:border-green-500/50 transition p-6 md:border md:border-green-500/20">
            <div className="bg-du/10 md:bg-green-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 md:border md:border-green-500/30">
              <Users className="w-6 h-6 text-du md:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-du md:text-green-400 mb-2">
              Browse Profiles
            </h3>
            <p className="text-gray-600 md:text-gray-400 mb-4">Explore students from your college</p>
            <button
              onClick={() => onTabChange('profiles')}
              className="text-du md:text-green-400 hover:opacity-90 font-medium flex items-center space-x-2"
            >
              <span>View Profiles</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Study Materials',
      description: 'Access notes for BCP, SEC, GE, VAC, and AEC subjects',
      action: 'Browse Studies',
      tab: 'study',
      color: 'bg-blue-500',
    },
    {
      icon: Lightbulb,
      title: 'Last-Night Prep',
      description: 'Get quick short notes and revision materials for exams',
      action: 'Get Notes',
      tab: 'notes',
      color: 'bg-yellow-500',
    },
    {
      icon: Users,
      title: 'Find Friends',
      description: 'Connect with fellow students from your college',
      action: 'Browse Friends',
      tab: 'profiles',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Welcome back, {profile?.name}!</h1>
        </div>
        <p className="text-blue-100 text-lg">
          {profile?.college_name} • {profile?.course}
        </p>
        {profile?.unique_trait && (
          <p className="mt-4 text-blue-50 italic">"{profile.unique_trait}"</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.tab}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100"
            >
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <button
                onClick={() => onTabChange(feature.tab)}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
              >
                <span>{feature.action}</span>
                <span>→</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
