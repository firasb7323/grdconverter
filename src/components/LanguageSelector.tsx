"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { LANGUAGES, LangMeta } from "@/i18n/translations";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentMeta = LANGUAGES.find((l) => l.code === lang)!;

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const select = (meta: LangMeta) => {
    setLang(meta.code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative" id="language-selector">
      {/* Trigger */}
      <button
        id="lang-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-brand-sky hover:bg-brand-pale/30/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pale/300"
      >
        <span className="flex items-center justify-center shrink-0 w-5 h-5 overflow-hidden rounded-full ring-1 ring-black/5">
          <img
            src={`https://flagcdn.com/w40/${currentMeta.flagCode}.png`}
            alt=""
            className="w-full h-full object-cover"
          />
        </span>
        <span className="hidden sm:inline">{currentMeta.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg shadow-gray-200/80"
          >
            {LANGUAGES.map((meta) => {
              const isSelected = meta.code === lang;
              return (
                <li key={meta.code}>
                  <button
                    id={`lang-option-${meta.code}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => select(meta)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-brand-pale/30 text-brand-blue font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center justify-center shrink-0 w-5 h-5 overflow-hidden rounded-full ring-1 ring-black/5">
                      <img
                        src={`https://flagcdn.com/w40/${meta.flagCode}.png`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </span>
                    <span className="flex-1 text-start">{meta.label}</span>
                    {isSelected && (
                      <Check size={13} className="text-brand-pale/300 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

