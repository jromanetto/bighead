import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, TranslationKey, Language } from "../i18n/translations";
import { getSettings, saveSettings } from "../services/settings";
import { useAuth } from "./AuthContext";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    loadLanguage();
  }, [user]);

  const loadLanguage = async () => {
    try {
      const settings = await getSettings(user?.id);
      if (settings.language && (settings.language === "en" || settings.language === "fr")) {
        setLanguageState(settings.language);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await saveSettings({ language: lang }, user?.id);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Convenience hook for just translations
export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
