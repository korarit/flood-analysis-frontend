import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalizedString } from '../types/basin';
import { getStoredLanguage, setStoredLanguage } from '../services/storageService';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (val: LocalizedString | string) => string;
  isThai: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage());

  useEffect(() => {
    setStoredLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (val: LocalizedString | string): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[language] || val.th || val.en || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isThai: language === 'th' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if not within provider
    return {
      language: 'th',
      setLanguage: () => {},
      t: (val) => (typeof val === 'string' ? val : val?.th || ''),
      isThai: true,
    };
  }
  return context;
}
