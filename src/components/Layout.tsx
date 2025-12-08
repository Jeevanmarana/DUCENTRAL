import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMode } from '../contexts/ModeContext';
import { Home, Users, BookOpen, MessageCircle, LogOut, User, Mail, Heart } from 'lucide-react';

type LayoutProps = {
  children: ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
};

export function Layout({ children, currentTab, onTabChange }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const { mode, setMode } = useMode();

  const nerdTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'profiles', label: 'Profile', icon: User },
  ];

  const socialTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'confessions', label: 'Confess', icon: Mail },
    { id: 'chat', label: 'Chats', icon: MessageCircle },
    { id: 'profiles', label: 'Profile', icon: User },
  ];

  const tabs = mode === 'nerd' ? nerdTabs : socialTabs;
  // For social mode: desktop keeps dark theme, but mobile should use light header/footer
  const bgClass = mode === 'social' ? 'md:bg-gray-950 bg-du-bg' : 'bg-gray-50';
  const navBgClass = mode === 'social'
    ? 'md:bg-gray-900 md:border-b md:border-green-500/20 bg-white border-b border-gray-200'
    : 'bg-white border-b border-gray-200';
  const textClass = mode === 'social' ? 'md:text-gray-100 text-gray-100' : 'text-gray-900';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <nav className={`${navBgClass} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className={mode === 'social' ? 'md:bg-green-600 bg-white p-2 rounded-lg' : 'bg-blue-600 p-2 rounded-lg'}>
                <Home className={`w-5 h-5 ${mode === 'social' ? 'text-purple-300' : 'text-white'}`} />
              </div>
              <span className={`text-xl font-bold ${textClass}`}>
                {mode === 'social' ? 'Social' : 'Study'}
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      mode === 'social'
                        ? isActive
                          ? 'bg-green-600/20 text-green-400 border border-green-500/50'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                        : isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMode(mode === 'nerd' ? 'social' : 'nerd')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                    mode === 'social'
                      ? 'bg-green-600/20 text-green-400 border border-green-500/50'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}
                  title={`Switch to ${mode === 'nerd' ? 'Social' : 'Study'} Mode`}
                >
                  {mode === 'nerd' ? (
                    <Heart className="w-4 h-4" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                  <span className="text-xs font-semibold uppercase">
                    {mode === 'nerd' ? 'Social' : 'Study'}
                  </span>
                </button>
              </div>

              <div className={`hidden sm:flex items-center space-x-2 text-sm ${textClass}`}>
                <User className="w-4 h-4" />
                <span className="font-medium">{profile?.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                  mode === 'social'
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-24 md:pb-0">{children}</main>

      <div className={`mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t ${mode === 'social' ? 'border-gray-200 bg-white text-gray-100' : 'border-gray-200 bg-white'} z-40`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition ${
                mode === 'social'
                  ? isActive
                    ? 'text-purple-400'
                    : 'text-purple-300 hover:text-purple-400'
                  : isActive
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMode(mode === 'nerd' ? 'social' : 'nerd')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition ${
            mode === 'social'
              ? 'text-purple-300 hover:text-purple-400'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={`Switch to ${mode === 'nerd' ? 'Social' : 'Study'} Mode`}
        >
          {mode === 'nerd' ? (
            <Heart className="w-5 h-5" />
          ) : (
            <BookOpen className="w-5 h-5" />
          )}
          <span className="text-xs font-medium">
            {mode === 'nerd' ? 'Social' : 'Study'}
          </span>
        </button>
      </div>
    </div>
  );
}
