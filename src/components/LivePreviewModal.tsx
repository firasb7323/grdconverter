"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import { ConversionResult, downloadGgr, GradientStopPreview } from "@/lib/convertGrdToGgr";
import { useLanguage } from "@/context/LanguageContext";

interface LivePreviewModalProps {
  result: ConversionResult | null;
  onClose: () => void;
}

function buildCSSGradient(preview: ConversionResult["preview"]): string {
  if (!preview || preview.length < 2) return "linear-gradient(to right, #667eea, #764ba2)";
  const stops = preview.map(
    (s) => `rgba(${s.r},${s.g},${s.b},${(s.a / 255).toFixed(3)}) ${(s.pos * 100).toFixed(1)}%`
  );
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

function samplePreview(preview: GradientStopPreview[], t: number) {
  const sorted = [...preview].sort((a, b) => a.pos - b.pos);
  if (t <= sorted[0].pos) return sorted[0];
  if (t >= sorted[sorted.length - 1].pos) return sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (t >= p1.pos && t <= p2.pos) {
      const f = p2.pos === p1.pos ? 0 : (t - p1.pos) / (p2.pos - p1.pos);
      return {
        r: Math.round(p1.r + (p2.r - p1.r) * f),
        g: Math.round(p1.g + (p2.g - p1.g) * f),
        b: Math.round(p1.b + (p2.b - p1.b) * f),
      };
    }
  }
  return sorted[sorted.length - 1];
}

export default function LivePreviewModal({ result, onClose }: LivePreviewModalProps) {
  const { t } = useLanguage();

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = result ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [result]);

  const gradientCSS = result ? buildCSSGradient(result.preview) : "";
  const stopCount = result?.preview?.length ?? 0;

  // Build the lookup table for the SVG feComponentTransfer
  const lutTable = useMemo(() => {
    if (!result || !result.preview || result.preview.length === 0) {
      return { r: "", g: "", b: "" };
    }
    const steps = 64;
    const rs = [], gs = [], bs = [];
    for (let i = 0; i <= steps; i++) {
      const c = samplePreview(result.preview, i / steps);
      rs.push((c.r / 255).toFixed(3));
      gs.push((c.g / 255).toFixed(3));
      bs.push((c.b / 255).toFixed(3));
    }
    return { r: rs.join(" "), g: gs.join(" "), b: bs.join(" ") };
  }, [result]);

  const handleDownload = () => {
    if (!result) return;
    const safeName = result.gradientName.replace(/[^a-z0-9_\- ]/gi, "_").slice(0, 60) || "gradient";
    downloadGgr(result.ggrContent, safeName);
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {result && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label={t.modal.title}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed inset-4 md:inset-x-auto md:left-1/2 md:top-1/2 z-50 md:-translate-x-1/2 md:-translate-y-1/2 mx-auto max-w-[1000px] w-full flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20"
            style={{ maxHeight: "88vh" }}
          >
            <svg className="hidden">
              <defs>
                <filter id="modal-grad-map" colorInterpolationFilters="sRGB">
                  <feColorMatrix
                    type="matrix"
                    values="0.299 0.587 0.114 0 0
                            0.299 0.587 0.114 0 0
                            0.299 0.587 0.114 0 0
                            0 0 0 1 0"
                  />
                  <feComponentTransfer>
                    <feFuncR type="table" tableValues={lutTable.r} />
                    <feFuncG type="table" tableValues={lutTable.g} />
                    <feFuncB type="table" tableValues={lutTable.b} />
                  </feComponentTransfer>
                </filter>
              </defs>
            </svg>

            {/* Left: Image Preview (scaled to fit nicely) */}
            <div className="relative w-full md:w-[60%] bg-gray-50 flex-shrink-0 min-h-[30vh] md:min-h-[450px]">
              <Image
                src="/previewimage.png"
                alt="Gradient map preview"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                style={{ filter: "url(#modal-grad-map)" }}
                priority
              />
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col flex-1 min-w-0 bg-white">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">{t.modal.title}</h2>
                <button
                  id="modal-close-btn"
                  onClick={onClose}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label={t.modal.close}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="p-4 flex-1 flex flex-col md:overflow-y-auto">
                <div
                  className="h-10 md:h-12 w-full rounded-xl shadow-inner mb-4 flex-shrink-0"
                  style={{ background: gradientCSS }}
                />

                <div className="mb-4 flex-shrink-0">
                  <p className="text-xs font-medium text-gray-500">{t.modal.gradientLabel}</p>
                  <p className="mt-1 text-base font-bold text-gray-900 break-words line-clamp-2">
                    {result.gradientName}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    {stopCount} {t.modal.stopsLabel}
                  </p>
                </div>

                <div className="mt-auto flex flex-col gap-4 flex-shrink-0 pt-4 border-t border-gray-50">
                  <button
                    id="modal-download-btn"
                    onClick={handleDownload}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-pink px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-pale/60 transition-all hover:bg-brand-blue hover:shadow-lg active:scale-95"
                  >
                    <Download size={16} />
                    {t.modal.download}
                  </button>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500 flex flex-col gap-2">
                    <p>
                      {t.create?.imageBy ?? "Image by"}{" "}
                      <a href="https://pixabay.com/users/coconotas-53467" className="font-medium text-brand-blue hover:text-brand-pink transition-colors" target="_blank" rel="noopener noreferrer">Carlos Insignares</a>
                      {" "}{t.create?.from ?? "from"}{" "}
                      <a href="https://pixabay.com" className="font-medium text-brand-blue hover:text-brand-pink transition-colors" target="_blank" rel="noopener noreferrer">Pixabay</a>
                    </p>
                    <a href="https://www.instagram.com/coco_notas/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-brand-pink transition-colors w-fit">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      @coco_notas
                      <ExternalLink size={10} className="opacity-50" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
