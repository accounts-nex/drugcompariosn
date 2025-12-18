import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EmailContextType {
  email: string | null;
  setEmail: (email: string) => void;
  clearEmail: () => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
  const [email, setEmailState] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setEmailState(savedEmail);
    }
  }, []);

  const setEmail = (newEmail: string) => {
    localStorage.setItem('userEmail', newEmail);
    setEmailState(newEmail);
  };

  const clearEmail = () => {
    localStorage.removeItem('userEmail');
    setEmailState(null);
  };

  return (
    <EmailContext.Provider value={{ email, setEmail, clearEmail }}>
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
}
