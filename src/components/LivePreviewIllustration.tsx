"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { EditorStop } from "@/lib/exporter";
import { useLanguage } from "@/context/LanguageContext";

// ─────────────────────────────────────────────────────────────────────────────
// Gradient processing for instantaneous CSS/SVG updates
// ─────────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").padEnd(6, "0");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function sampleGradient(stops: EditorStop[], t: number): [number, number, number] {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const first = sorted[0];
  const last  = sorted[sorted.length - 1];

  if (t <= first.position / 100) return hexToRgb(first.color);
  if (t >= last.position / 100) return hexToRgb(last.color);

  for (let i = 0; i < sorted.length - 1; i++) {
    const lp = sorted[i].position / 100;
    const rp = sorted[i + 1].position / 100;
    if (t >= lp && t <= rp) {
      const f = rp === lp ? 0 : (t - lp) / (rp - lp);
      const [lr, lg, lb] = hexToRgb(sorted[i].color);
      const [rr, rg, rb] = hexToRgb(sorted[i + 1].color);
      return [
        Math.round(lr + (rr - lr) * f),
        Math.round(lg + (rg - lg) * f),
        Math.round(lb + (rb - lb) * f),
      ];
    }
  }
  return hexToRgb(last.color);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface LivePreviewIllustrationProps {
  stops: EditorStop[];
  imageSrc?: string;
}

export default function LivePreviewIllustration({
  stops,
  imageSrc = "/previewimage.png",
}: LivePreviewIllustrationProps) {
  const { t } = useLanguage();
  const [imgOk, setImgOk] = useState(true);

  // Instead of modifying canvas pixels (which causes extreme lag and flickering),
  // we use an SVG filter with feComponentTransfer table to do GPU-accelerated gradient mapping!
  const lutTable = useMemo(() => {
    const steps = 64; // High fidelity
    const rs = [], gs = [], bs = [];
    for (let i = 0; i <= steps; i++) {
      const [r, g, b] = sampleGradient(stops, i / steps);
      rs.push((r / 255).toFixed(3));
      gs.push((g / 255).toFixed(3));
      bs.push((b / 255).toFixed(3));
    }
    return { r: rs.join(" "), g: gs.join(" "), b: bs.join(" ") };
  }, [stops]);

  // Fallback gradient for when image isn't available
  const fallbackGrad = `linear-gradient(135deg, ${stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ")})`;

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden SVG Filter definition */}
      <svg className="hidden">
        <defs>
          <filter id="fast-grad-map" colorInterpolationFilters="sRGB">
            {/* Convert image to greyscale based on luminance */}
            <feColorMatrix
              type="matrix"
              values="0.299 0.587 0.114 0 0
                      0.299 0.587 0.114 0 0
                      0.299 0.587 0.114 0 0
                      0 0 0 1 0"
            />
            {/* Map luminance channel to custom gradient curves! */}
            <feComponentTransfer>
              <feFuncR type="table" tableValues={lutTable.r} />
              <feFuncG type="table" tableValues={lutTable.g} />
              <feFuncB type="table" tableValues={lutTable.b} />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Preview title */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-brand-pale" />
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-sky">
          {t.create?.previewTitle ?? "Live Preview"}
        </span>
        <div className="h-px flex-1 bg-brand-pale" />
      </div>

      {/* GPU Accelerated Preview */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-brand-pale shadow-sm">
        {imgOk ? (
          <Image
            src={imageSrc}
            alt="Gradient map preview"
            width={700}
            height={700}
            priority
            onError={() => setImgOk(false)}
            className="w-full h-auto object-cover max-h-[600px]"
            style={{ filter: "url(#fast-grad-map)" }}
          />
        ) : (
          <div
            className="flex h-[400px] w-full items-center justify-center text-sm text-gray-400"
            style={{ background: fallbackGrad }}
          >
            <span className="rounded-lg bg-white/60 px-4 py-2 font-semibold text-gray-700 backdrop-blur-sm">
              Place {imageSrc} in /public
            </span>
          </div>
        )}
      </div>

      {/* Attribution */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          {t.create?.imageBy ?? "Image by"}{" "}
          <a
            href="https://pixabay.com/users/coconotas-53467/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=7829058"
            className="font-medium text-brand-blue underline underline-offset-2 hover:text-brand-pink transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Carlos Insignares
          </a>{" "}
          {t.create?.from ?? "from"}{" "}
          <a
            href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=7829058"
            className="font-medium text-brand-blue underline underline-offset-2 hover:text-brand-pink transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pixabay
          </a>
        </p>

        <a
          href="https://www.instagram.com/coco_notas/"
          target="_blank"
          rel="noopener noreferrer"
          id="artist-instagram-link"
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-pale bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-brand-pink/40 hover:bg-brand-pale/30 hover:text-brand-pink"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
          @coco_notas
          <ExternalLink size={11} className="opacity-50" />
        </a>
      </div>
    </div>
  );
}
