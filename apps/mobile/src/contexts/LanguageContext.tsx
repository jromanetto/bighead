import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getLocales } from "expo-localization";
import { translations, TranslationKey, Language } from "../i18n/translations";
import { getSettings, saveSettings } from "../services/settings";
import { claimMilestone } from "../services/universalXp";
import { useAuth } from "./AuthContext";

const SUPPORTED_LANGUAGES: Language[] = ["en", "fr", "es", "de"];

function isSupportedLanguage(value: unknown): value is Language {
  return typeof value === "string" && (SUPPORTED_LANGUAGES as string[]).includes(value);
}

function getDeviceLanguage(): Language {
  const deviceLang = getLocales()[0]?.languageCode;
  if (deviceLang === "fr") return "fr";
  if (deviceLang === "es") return "es";
  if (deviceLang === "de") return "de";
  return "en";
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(getDeviceLanguage());

  useEffect(() => {
    loadLanguage();
  }, [user]);

  const loadLanguage = async () => {
    try {
      const settings = await getSettings(user?.id);
      if (isSupportedLanguage(settings.language)) {
        setLanguageState(settings.language);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    const previous = language;
    setLanguageState(lang);
    try {
      await saveSettings({ language: lang }, user?.id);
      // Reward language_change once (lifetime dedupe server-side).
      // Only fire when the user actually switched to a different language.
      if (previous !== lang) {
        claimMilestone("language_change").catch(() => {});
      }
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
