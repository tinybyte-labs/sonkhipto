import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { EVENT_KEYS } from "@/constants/event-keys";
import { TranslationKey, languageTranslations } from "@/constants/translations";
import { Language } from "@/types/language";

export type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (
    value: TranslationKey,
    replacements?: Record<string, string>,
  ) => string;
  hasSelectedLanguage: boolean;
  changeLanguage: (lang: Language) => Promise<void>;
};

export const LanguageContext = createContext<LanguageContextType | null>(null);

const availableLanguages = ["english", "bangla"];

export default function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("english");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  const translate: LanguageContextType["translate"] = useCallback(
    (id, replacements) => {
      let value =
        languageTranslations[language][id] ??
        languageTranslations["english"][id];
      if (replacements) {
        Object.entries(replacements).forEach((replacement) => {
          value = value.replaceAll(`{${replacement[0]}}`, replacement[1]);
        });
      }
      return value;
    },
    [language],
  );

  const changeLanguage: LanguageContextType["changeLanguage"] = useCallback(
    async (lang) => {
      setLanguage(lang);
      setHasSelectedLanguage(true);
      await AsyncStorage.setItem(EVENT_KEYS.SELECTED_LANGUAGE, lang);
    },
    [],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const languageStr = await AsyncStorage.getItem(
          EVENT_KEYS.SELECTED_LANGUAGE,
        );

        if (!!languageStr && availableLanguages.includes(languageStr)) {
          setHasSelectedLanguage(true);
          setLanguage(languageStr as Language);
        }
      } catch (error: any) {
        console.log(error);
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translate,
        hasSelectedLanguage,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must use insdie LanguageProvider");
  }
  return context;
};
