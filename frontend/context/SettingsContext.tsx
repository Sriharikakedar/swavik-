import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  aiDetection: boolean;
  setAiDetection: (val: boolean) => void;
  autoParsing: boolean;
  setAutoParsing: (val: boolean) => void;
  incidentAlerts: boolean;
  setIncidentAlerts: (val: boolean) => void;
  alertEmail: string;
  setAlertEmail: (val: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [aiDetection, setAiDetection] = useState(() => {
    const saved = localStorage.getItem('resolvex_aiDetection');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [autoParsing, setAutoParsing] = useState(() => {
    const saved = localStorage.getItem('resolvex_autoParsing');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [incidentAlerts, setIncidentAlerts] = useState(() => {
    const saved = localStorage.getItem('resolvex_incidentAlerts');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [alertEmail, setAlertEmail] = useState(() => {
    const saved = localStorage.getItem('resolvex_alertEmail');
    return saved || 'admin@resolvex.ai';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('resolvex_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('resolvex_aiDetection', JSON.stringify(aiDetection));
  }, [aiDetection]);

  useEffect(() => {
    localStorage.setItem('resolvex_autoParsing', JSON.stringify(autoParsing));
  }, [autoParsing]);

  useEffect(() => {
    localStorage.setItem('resolvex_incidentAlerts', JSON.stringify(incidentAlerts));
  }, [incidentAlerts]);

  useEffect(() => {
    localStorage.setItem('resolvex_alertEmail', alertEmail);
  }, [alertEmail]);

  useEffect(() => {
    localStorage.setItem('resolvex_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <SettingsContext.Provider value={{
      aiDetection, setAiDetection,
      autoParsing, setAutoParsing,
      incidentAlerts, setIncidentAlerts,
      alertEmail, setAlertEmail,
      theme, setTheme
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
