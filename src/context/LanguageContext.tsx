"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Lang,
  Translations,
  LANGUAGES,
  translations,
} from "@/i18n/translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Persist language choice across page navigations via localStorage
  const [lang, setLangState] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read persisted language on mount
    try {
      const saved = localStorage.getItem("grd-lang") as Lang | null;
      if (saved && translations[saved]) setLangState(saved);
    } catch {}
    setMounted(true);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("grd-lang", l); } catch {}
  };

  const meta = LANGUAGES.find((l) => l.code === lang)!;
  const dir = meta.dir;

  // Sync document direction for RTL (Arabic)
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [dir, lang, mounted]);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t: translations[lang], dir }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
