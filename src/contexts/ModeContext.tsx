import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Mode = 'nerd' | 'social';

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('nerd');

  useEffect(() => {
    const body = document.body;
    body.dataset.mode = mode;
    body.classList.toggle('mode-social', mode === 'social');
    body.classList.toggle('mode-nerd', mode === 'nerd');

    return () => {
      delete body.dataset.mode;
      body.classList.remove('mode-social', 'mode-nerd');
    };
  }, [mode]);

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
