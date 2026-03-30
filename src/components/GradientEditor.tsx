"use client";

import { useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Download, Wand2, AlertCircle } from "lucide-react";
import {
  EditorStop,
  buildGgrFromEditorStops,
  buildCSSGradient,
  downloadGgrString,
} from "@/lib/exporter";
import { useLanguage } from "@/context/LanguageContext";

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_STOPS: EditorStop[] = [
  { id: "s0", position: 0,   color: "#D94389", opacity: 100 },
  { id: "s1", position: 50,  color: "#117DBF", opacity: 100 },
  { id: "s2", position: 100, color: "#27DEF2", opacity: 100 },
];

let idCounter = 0;
const newStopId = () => `stop-${Date.now()}-${++idCounter}`;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function GradientEditor() {
  const { t } = useLanguage();
  const uid = useId();

  const [stops, setStops] = useState<EditorStop[]>(DEFAULT_STOPS);
  const [name, setName]   = useState("My Gradient");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────
  const css = buildCSSGradient(stops);
  const sorted = [...stops].sort((a, b) => a.position - b.position);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const updateStop = useCallback(
    (id: string, patch: Partial<EditorStop>) => {
      setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    },
    [],
  );

  const addStop = useCallback(() => {
    const sortedNow = [...stops].sort((a, b) => a.position - b.position);
    // Insert at the midpoint of the first gap, or after the last stop
    let newPos = 50;
    if (sortedNow.length >= 2) {
      let largestGap  = 0;
      let gapMid      = 50;
      for (let i = 0; i < sortedNow.length - 1; i++) {
        const gap = sortedNow[i + 1].position - sortedNow[i].position;
        if (gap > largestGap) {
          largestGap = gap;
          gapMid = Math.round((sortedNow[i].position + sortedNow[i + 1].position) / 2);
        }
      }
      newPos = gapMid;
    }
    setStops((prev) => [
      ...prev,
      { id: newStopId(), position: newPos, color: "#29A7D9", opacity: 100 },
    ]);
  }, [stops]);

  const removeStop = useCallback((id: string) => {
    setStops((prev) => {
      if (prev.length <= 2) return prev; // minimum 2 stops
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const handleDownload = () => {
    setError(null);
    try {
      const content = buildGgrFromEditorStops(stops, name);
      downloadGgrString(content, name);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section
      id="editor"
      aria-label="Gradient Editor"
      className="rounded-3xl border border-brand-pale bg-white p-6 shadow-sm"
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-pink to-brand-blue shadow-sm">
          <Wand2 size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {t.editor?.title ?? "Gradient Creator"}
          </h2>
          <p className="text-xs text-gray-400">
            {t.editor?.subtitle ?? "Build and export a custom .GGR gradient"}
          </p>
        </div>
      </div>

      {/* Live preview bar */}
      <div
        className="mb-5 h-12 w-full rounded-xl shadow-inner"
        style={{
          background: css,
          backgroundRepeat: "no-repeat",
        }}
        aria-label="Live gradient preview"
      />

      {/* Color stops list */}
      <div className="mb-4 flex flex-col gap-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t.editor?.stopsLabel ?? "Color Stops"}
        </p>

        <AnimatePresence initial={false}>
          {sorted.map((stop) => (
            <motion.div
              key={stop.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
            >
              {/* Color swatch + picker */}
              <label
                htmlFor={`${uid}-color-${stop.id}`}
                className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg shadow-sm ring-1 ring-black/10"
                style={{ background: stop.color }}
                title="Click to change colour"
              >
                <input
                  id={`${uid}-color-${stop.id}`}
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={`Colour for stop at ${stop.position}%`}
                />
              </label>

              {/* Position slider */}
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {t.editor?.position ?? "Position"}
                  </span>
                  <span className="w-10 text-right text-xs font-semibold text-gray-700">
                    {stop.position}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) =>
                    updateStop(stop.id, { position: Number(e.target.value) })
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand-pink"
                  aria-label={`Position for stop at ${stop.position}%`}
                />
              </div>

              {/* Opacity slider */}
              <div className="flex w-20 flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {t.editor?.opacity ?? "Alpha"}
                  </span>
                  <span className="text-xs font-semibold text-gray-700">
                    {stop.opacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.opacity}
                  onChange={(e) =>
                    updateStop(stop.id, { opacity: Number(e.target.value) })
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand-sky"
                  aria-label={`Opacity for stop at ${stop.position}%`}
                />
              </div>

              {/* Delete */}
              <button
                id={`remove-stop-${stop.id}`}
                onClick={() => removeStop(stop.id)}
                disabled={stops.length <= 2}
                title={t.editor?.removeStop ?? "Remove stop"}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add stop */}
      <button
        id="add-stop-btn"
        onClick={addStop}
        disabled={stops.length >= 10}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-sky/50 py-2 text-sm font-medium text-brand-sky transition-all hover:border-brand-sky hover:bg-brand-pale/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={15} />
        {t.editor?.addStop ?? "Add colour stop"}
      </button>

      {/* Name + Download row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor={`${uid}-gradient-name`}
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            {t.editor?.namePlaceholder ?? "Gradient name"}
          </label>
          <input
            id={`${uid}-gradient-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Gradient"
            maxLength={80}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/30"
          />
        </div>

        <motion.button
          id="editor-download-btn"
          onClick={handleDownload}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-pink to-brand-blue px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-pink/25 transition-shadow hover:shadow-lg hover:shadow-brand-pink/30"
        >
          <Download size={15} />
          {t.editor?.download ?? "Download .GGR"}
        </motion.button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
          >
            <AlertCircle size={13} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
