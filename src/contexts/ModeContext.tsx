import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Mode = 'social';

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('social');
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('app-mode') as Mode | null;
    const initialMode = stored || 'social';
    setModeState(initialMode);
    setMounted(true);
    applyTheme(initialMode);
  }, []);

  // Apply theme to DOM when mode changes
  useEffect(() => {
    if (mounted) {
      applyTheme(mode);
      localStorage.setItem('app-mode', mode);
    }
  }, [mode, mounted]);

  const applyTheme = (newMode: Mode) => {
    const body = document.documentElement;
    
    // Remove old classes
    body.classList.remove('mode-social');
    
    // Add new class
    body.classList.add(`mode-${newMode}`);
    
    // Update data attribute for CSS selectors
    body.dataset.mode = newMode;
    
    // Trigger smooth transition
    body.style.transition = 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
      body.style.transition = '';
    }, 200);
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
}
