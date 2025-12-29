import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, MessageCircle, LogOut, User, Search, Coffee } from 'lucide-react';

type LayoutProps = {
  children: ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
};

export function Layout({ children, currentTab, onTabChange }: LayoutProps) {
  const { user, profile, signOut } = useAuth();

  const socialTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'confessions', label: 'Tea', icon: Coffee },
    { id: 'chat', label: 'Chats', icon: MessageCircle },
    { id: 'search', label: 'Search', icon: Search },
  ];

  const tabs = socialTabs;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation - Desktop Only */}
      <nav className="hidden sm:block sticky top-0 z-40 bg-white border-b border-gray-200 page-transition">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                DU Central
              </h1>
            </div>

            {/* Nav Tabs - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 stroke-current ${isActive ? 'text-white' : ''}`} />
                    <span className={isActive ? 'text-white' : ''}>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Profile Button */}
              <button
                onClick={() => onTabChange('profile')}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all bg-purple-600 text-white hover:bg-purple-700"
                title="View Profile"
              >
                <User className="w-4 h-4" />
                <span className="text-white">Profile</span>
              </button>

              {/* User Name - Desktop Only */}
              {user && profile && (
                <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 px-3 py-2 rounded-md bg-gray-50">
                  <User className="w-4 h-4 stroke-current text-gray-700" />
                  <span className="hidden md:inline truncate max-w-[120px]">{profile?.name}</span>
                </div>
              )}

              {/* Logout */}
              {user && (
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 stroke-current" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 sm:pb-0">
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
                  isActive
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 stroke-2 text-current" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}

          {/* Profile Button in Mobile Nav */}
          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              currentTab === 'profile'
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="View Profile"
          >
            <User className="w-5 h-5 stroke-2" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
