import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModeProvider } from './contexts/ModeContext';
import { Auth } from './components/Auth';
import { Landing } from './components/Landing';
import { Help } from './components/Help';
import { Contact } from './components/Contact';
import { CreateProfile } from './components/CreateProfile';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Chat } from './components/Chat';
import { Confessions } from './components/Confessions';
import { Search } from './components/Search';
import { MyProfile } from './components/MyProfile';

function AppContent() {
  const [route, setRoute] = useState(window.location.pathname || '/');

  // sync with browser navigation
  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const { user, profile, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Serve simple pages even when not authenticated
  if (route === '/help') {
    return <Help />;
  }
  if (route === '/contact') {
    return <Contact />;
  }

  // If not authenticated, show home page with login/signup option
  if (!user) {
    if (showAuth) {
      return <Auth initialMode={authMode} onClose={() => setShowAuth(false)} />;
    }
    
    // Show home page to non-authenticated users (read-only)
    return (
      <Layout currentTab={currentTab} onTabChange={(tab) => {
        // Require login for certain tabs
        if (tab === 'confessions' || tab === 'chat' || tab === 'profile') {
          setAuthMode(tab === 'confessions' ? 'login' : 'login');
          setShowAuth(true);
        } else {
          setCurrentTab(tab);
        }
      }}>
        <Home onTabChange={(tab) => {
          if (tab === 'confessions' || tab === 'chat' || tab === 'profile') {
            setAuthMode(tab === 'confessions' ? 'login' : 'login');
            setShowAuth(true);
          } else {
            setCurrentTab(tab);
          }
        }} />
      </Layout>
    );
  }

  if (!profile) {
    return <CreateProfile />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home onTabChange={setCurrentTab} />;
      case 'search':
        return <Search onTabChange={setCurrentTab} />;
      case 'chat':
        return <Chat />;
      case 'confessions':
        return <Confessions />;
      case 'profile':
        return <MyProfile />;
      default:
        return <Home onTabChange={setCurrentTab} />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <AppContent />
      </ModeProvider>
    </AuthProvider>
  );
}

export default App;
