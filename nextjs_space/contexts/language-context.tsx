'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations, TranslationKey, getTranslation, languageNames, languageFlags } from '@/lib/i18n/translations';
import { useSession } from 'next-auth/react';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  languageNames: typeof languageNames;
  languageFlags: typeof languageFlags;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession() || {};
  const [language, setLanguageState] = useState<Language>('ES');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preferencia de idioma del usuario
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        // Primero intentar cargar del localStorage para usuarios no autenticados
        const storedLang = localStorage.getItem('preferred_language') as Language;
        if (storedLang && Object.keys(translations).includes(storedLang)) {
          setLanguageState(storedLang);
        }

        // Si el usuario está autenticado, cargar preferencia del servidor
        if (session?.user) {
          const response = await fetch('/api/user/language');
          if (response.ok) {
            const data = await response.json();
            if (data.language) {
              setLanguageState(data.language);
              localStorage.setItem('preferred_language', data.language);
            }
          }
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguagePreference();
  }, [session?.user]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);

    // Si el usuario está autenticado, guardar preferencia en el servidor
    if (session?.user) {
      try {
        await fetch('/api/user/language', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lang })
        });
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  }, [session?.user]);

  const t = useCallback((key: TranslationKey): string => {
    return getTranslation(language, key);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      languageNames, 
      languageFlags,
      isLoading 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook simplificado para usar solo traducciones
export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
