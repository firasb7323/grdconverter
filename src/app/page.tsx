"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { ConversionResult, downloadGgr } from "@/lib/convertGrdToGgr";
import Navbar from "@/components/Navbar";
import Dropzone from "@/components/Dropzone";
import FileList, { FileEntry } from "@/components/FileList";
import LivePreviewModal from "@/components/LivePreviewModal";

// ─────────────────────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const fadeInUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// ID generator
// ─────────────────────────────────────────────────────────────────────────────
let idCounter = 0;
const newId = () => `entry-${Date.now()}-${++idCounter}`;

// ─────────────────────────────────────────────────────────────────────────────
// Inner app (consumes language context)
// ─────────────────────────────────────────────────────────────────────────────
function AppInner() {
  const { t } = useLanguage();

  const [entries, setEntries]           = useState<FileEntry[]>([]);
  const [previewResult, setPreviewResult] = useState<ConversionResult | null>(null);

  // ── File handlers ─────────────────────────────────────────────────────
  const addFiles = useCallback((files: File[]) => {
    setEntries((prev) => [
      ...prev,
      ...files.map((file) => ({ id: newId(), file, status: "pending" as const })),
    ]);
  }, []);

  const removeEntry  = useCallback((id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)), []);
  const updateEntry  = useCallback((id: string, patch: Partial<FileEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  // ── Navbar generate button ────────────────────────────────────────────
  const convertedEntries = entries.filter((e) => e.status === "done" && e.results);
  const hasDownloadable  = convertedEntries.length > 0;

  const handleNavbarGenerate = () => {
    convertedEntries.forEach((entry) => {
      const baseName = entry.file.name.replace(/\.grd$/i, "");
      entry.results!.forEach((r) => {
        const safeName = r.gradientName.replace(/[^a-z0-9_\- ]/gi, "_").slice(0, 60) || baseName;
        downloadGgr(r.ggrContent, safeName);
      });
    });
  };

  const steps = [
    { emoji: "🗂️", title: t.hero.step1Title, desc: t.hero.step1Desc },
    { emoji: "⚡", title: t.hero.step2Title, desc: t.hero.step2Desc },
    { emoji: "✅", title: t.hero.step3Title, desc: t.hero.step3Desc },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar
        onGenerate={hasDownloadable ? handleNavbarGenerate : undefined}
        hasDownloadable={hasDownloadable}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-6 sm:px-8 lg:py-10">

        {/* ── Two-column hero + converter ──────────────────────────────── */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">

          {/* LEFT: Hero */}
          <div className="flex flex-col gap-6">
            <motion.div
              variants={fadeInUp}
              custom={0}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
                {t.hero.title1}
                <br />
                <span className="bg-gradient-to-r from-brand-pink to-brand-blue bg-clip-text text-transparent">
                  {t.hero.title2}
                </span>
              </h1>
              <p className="max-w-md text-base leading-relaxed text-gray-500 sm:text-lg">
                {t.hero.subtitle}
              </p>
            </motion.div>

            {/* Steps */}
            <motion.div
              variants={fadeInUp}
              custom={0.08}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4"
            >
              {steps.map((step, i) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-brand-pale">
                      {step.emoji}
                    </div>
                    {i < steps.length - 1 && <div className="h-5 w-px bg-brand-pale" />}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>


          </div>

          {/* RIGHT: Dropzone */}
          <motion.div
            variants={fadeInUp}
            custom={0.1}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <Dropzone onFilesAdded={addFiles} hasFiles={entries.length > 0} />
          </motion.div>
        </div>

        {/* BOTTOM: FileList (full width) */}
        {entries.length > 0 && (
          <motion.div
            variants={fadeInUp}
            custom={0.2}
            initial="hidden"
            animate="visible"
            className="mt-10"
          >
            <FileList
              entries={entries}
              onRemove={removeEntry}
              onUpdate={updateEntry}
              onPreview={setPreviewResult}
            />
          </motion.div>
        )}
      </main>

      <footer className="border-t border-brand-pale bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <span className="text-xs text-gray-400">
            {t.footer.made}{" "}
            <a href="https://github.com/betzadev" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-pink">
              @betzadev
            </a>
          </span>
          <span className="text-xs text-gray-300">GRD → GGR · MIT</span>
        </div>
      </footer>

      <LivePreviewModal result={previewResult} onClose={() => setPreviewResult(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  // By waiting for the component to mount on the client,
  // we completely avoid hydration mismatch errors caused by
  // browser extensions (like Bitdefender) injecting attributes 
  // into the HTML before React hydrates, whilst also waiting
  // for the language state to be fully resolved.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
