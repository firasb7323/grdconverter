"use client";

import { useState, useRef, useCallback, useId, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Plus, Trash2, AlertCircle } from "lucide-react";
import {
  EditorStop,
  buildGgrFromEditorStops,
  buildCSSGradient,
  downloadGgrString,
} from "@/lib/exporter";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import LivePreviewIllustration from "@/components/LivePreviewIllustration";

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_STOPS: EditorStop[] = [
  { id: "s0", position: 0,   color: "#D94389", opacity: 100 },
  { id: "s1", position: 50,  color: "#117DBF", opacity: 100 },
  { id: "s2", position: 100, color: "#27DEF2", opacity: 100 },
];

let idCounter = 0;
const newId = () => `stop-${Date.now()}-${++idCounter}`;

// ─────────────────────────────────────────────────────────────────────────────
// Draggable gradient bar
// ─────────────────────────────────────────────────────────────────────────────
interface GradientBarProps {
  stops: EditorStop[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, pos: number) => void;
  onAddStop: (pos: number) => void;
  /** Callback fired if a stop is dragged far below the bar */
  onRemoveStop?: (id: string) => void;
}

function GradientBar({
  stops,
  selectedId,
  onSelect,
  onUpdatePosition,
  onAddStop,
  onRemoveStop,
}: GradientBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const css = buildCSSGradient(stops);

  // Shared: convert pointer X to gradient position 0–100
  const ptrToPos = (clientX: number): number => {
    const rect = rectRef.current || barRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  // Drag a stop
  const handleStopPointerDown = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    rectRef.current = barRef.current?.getBoundingClientRect() || null;
    setDragId(id);
    onSelect(id);
  };

  const handleStopPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragId(null);
    
    // Check for drag-to-delete (pulled far below the bar)
    const rect = barRef.current?.getBoundingClientRect();
    if (rect && onRemoveStop) {
      if (e.clientY > rect.bottom + 60) {
        onRemoveStop(e.currentTarget.dataset.stopid!);
      }
    }
  };

  const handleStopPointerMove = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (e.buttons === 0) return; // no button held
    
    // Just update position based on X, even if they pull Y down (shows intent)
    onUpdatePosition(id, ptrToPos(e.clientX));
  };

  // Click on bar background → add stop
  const handleBarClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-stop]")) return;
    onAddStop(ptrToPos(e.clientX));
  };

  return (
    <div className="relative">
      {/* Full-screen invisible grabbing layer to prevent React-induced cursor flickering */}
      {dragId && (
        <div
          className="fixed inset-0 z-50"
          style={{ cursor: "grabbing" }}
        />
      )}

      {/* Container gives bottom padding for handles */}
      <div className="relative pb-6 pt-2">
        {/* Gradient visual bar */}
        <div
          ref={barRef}
          onPointerDown={handleBarClick}
          className="relative h-14 w-full cursor-crosshair select-none flex-shrink-0"
          style={{ 
            background: css,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1), inset 0 2px 4px rgba(0,0,0,0.1)",
          }}
          aria-label="Gradient preview bar — click to add stops, drag handles"
        />

        {/* Draggable handles */}
        {stops.map((stop) => {
          const isSelected = stop.id === selectedId;
          return (
            <button
              key={stop.id}
              data-stop
              data-stopid={stop.id}
              id={`stop-handle-${stop.id}`}
              aria-label={`Color stop at ${stop.position}%`}
              onPointerDown={(e) => handleStopPointerDown(e, stop.id)}
              onPointerMove={(e) => handleStopPointerMove(e, stop.id)}
              onPointerUp={handleStopPointerUp}
              onPointerCancel={handleStopPointerUp}
              onLostPointerCapture={handleStopPointerUp}
              className="absolute group z-10 hover:z-20 outline-none"
              style={{
                left: `${stop.position}%`,
                top: "12px", // align cleanly intersecting bottom of bar
                transform: "translate(-50%, 0)",
                touchAction: "none",
              }}
            >
              {/* The hit-box and visual triangle/square handle */}
              <div 
                className="flex flex-col items-center justify-start h-12 w-6 transition-transform"
                style={{ transform: isSelected ? "scale(1.15)" : "scale(1)" }}
              >
                {/* Pointer tip (CSS triangle intersecting the bar) */}
                <div 
                  className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px]"
                  style={{ borderBottomColor: isSelected ? "#000" : "#666" }}
                />
                {/* Box holding the color */}
                <div 
                  className="w-5 h-5 shadow-md flex items-center justify-center -mt-px relative"
                  style={{
                    backgroundColor: "#fff",
                    border: `2px solid ${isSelected ? "#000" : "#666"}`,
                    borderRadius: "3px"
                  }}
                >
                  <div 
                    className="w-full h-full rounded-[1px]" 
                    style={{ backgroundColor: stop.color }}
                  />
                  {/* Visual delete-intent indicator (appears when pulled far down, implemented later or pure CSS) */}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between px-1 text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">
        <span>0%</span>
        <span>Drag down to delete</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Create page inner (consumes language context)
// ─────────────────────────────────────────────────────────────────────────────
function CreatePageInner() {
  const { t } = useLanguage();
  const uid = useId();

  const [stops, setStops]       = useState<EditorStop[]>(DEFAULT_STOPS);
  const deferredStops = useDeferredValue(stops);
  const [selectedId, setSelectedId] = useState<string | null>(DEFAULT_STOPS[0].id);
  const [name, setName]         = useState("My Gradient");
  const [error, setError]       = useState<string | null>(null);

  // ── Derived ─────────────────────────────────────────────────────────────
  const selectedStop = stops.find((s) => s.id === selectedId) ?? null;
  const sortedStops  = [...stops].sort((a, b) => a.position - b.position);

  // ── Stop CRUD ────────────────────────────────────────────────────────────
  const updateStop = useCallback((id: string, patch: Partial<EditorStop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const addStop = useCallback((position: number) => {
    const newStop: EditorStop = {
      id: newId(),
      position,
      color: "#29A7D9",
      opacity: 100,
    };
    setStops((prev) => [...prev, newStop]);
    setSelectedId(newStop.id);
  }, []);

  const removeStop = useCallback((id: string) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(stops.find((s) => s.id !== id)?.id ?? null);
  }, [stops, selectedId]);

  // ── Download ──────────────────────────────────────────────────────────────
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 lg:py-14">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t.create?.pageTitle ?? "Gradient Creator"}
          </h1>
          <p className="mt-2 max-w-xl text-base text-gray-500">
            {t.create?.heroSubtitle ?? "Design a gradient visually and download it as a .GGR file for GIMP & Krita."}
          </p>
        </motion.div>

        {/* Two-column layout: Editor on Left, Image on Right */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">

          {/* ── LEFT: Gradient editor (Controls) ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.10, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 lg:col-span-5"
          >
            {/* Inspector Panel */}
            <div className="flex flex-col rounded-2xl border border-brand-pale bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-brand-pink rounded-full block"></span>
                  {t.create?.editorTitle ?? "Gradient Editor"}
                </h2>
              </div>
              
              <div className="p-5">
                {/* Draggable gradient bar */}
                <GradientBar
                  stops={stops}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onUpdatePosition={(id, pos) => updateStop(id, { position: pos })}
                  onAddStop={addStop}
                  onRemoveStop={removeStop}
                />

                {/* Selected Stop Properties */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  {selectedStop ? (
                    <div className="flex flex-col gap-5">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-sky">
                        {t.create?.selectedStop ?? "Selected Stop"} — {selectedStop.position}%
                      </p>

                      <div className="grid grid-cols-5 gap-4">
                        {/* Massive color picker block - 3 cols */}
                        <div className="col-span-3">
                          <label
                            htmlFor={`${uid}-color`}
                            className="mb-1.5 block text-xs font-semibold text-gray-500"
                          >
                            {t.editor?.stopsLabel ?? "Color"}
                          </label>
                          <label
                            htmlFor={`${uid}-color`}
                            className="group relative flex h-14 w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 shadow-sm ring-1 ring-black/10 transition-transform active:scale-95"
                            style={{ background: selectedStop.color }}
                          >
                            <input
                              id={`${uid}-color`}
                              type="color"
                              value={selectedStop.color}
                              onChange={(e) => updateStop(selectedStop.id, { color: e.target.value })}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              aria-label="Pick color"
                            />
                            {/* Inverted text badge for readability */}
                            <span className="rounded bg-black/30 px-2 py-1 text-xs font-mono font-bold text-white backdrop-blur-md">
                              {selectedStop.color.toUpperCase()}
                            </span>
                          </label>
                        </div>

                        {/* Exact position number - 2 cols */}
                        <div className="col-span-2">
                          <label
                            htmlFor={`${uid}-pos`}
                            className="mb-1.5 block text-xs font-semibold text-gray-500"
                          >
                            {t.editor?.position ?? "Loc (%)"}
                          </label>
                          <input
                            id={`${uid}-pos`}
                            type="number"
                            min={0}
                            max={100}
                            value={selectedStop.position}
                            onChange={(e) =>
                              updateStop(selectedStop.id, {
                                position: Math.max(0, Math.min(100, Number(e.target.value))),
                              })
                            }
                            className="w-full h-14 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-800 outline-none transition-colors focus:border-brand-pink focus:bg-white focus:ring-1 focus:ring-brand-pink/30"
                          />
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm font-medium text-gray-300">
                      Select a stop to edit
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Export Settings Panel */}
            <div className="flex flex-col gap-4 rounded-2xl border border-brand-pale bg-brand-pale/10 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label htmlFor={`${uid}-name`} className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-brand-sky">
                    {t.editor?.namePlaceholder ?? "Gradient name"}
                  </label>
                  <input
                    id={`${uid}-name`}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    placeholder="My Gradient"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/30"
                  />
                </div>
                <motion.button
                  id="download-ggr-btn"
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-pink to-brand-blue px-6 text-sm font-bold text-white shadow-md shadow-brand-pink/25 transition-shadow hover:shadow-lg hover:shadow-brand-pink/30"
                >
                  <Download size={16} />
                  {t.editor?.download ?? "Download"}
                </motion.button>
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-100"
                  >
                    <AlertCircle size={13} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── RIGHT: Live illustration preview (Larger) ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.16, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <LivePreviewIllustration stops={deferredStops} />
          </motion.div>

        </div>
      </main>

      <footer className="border-t border-brand-pale bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <span className="text-xs text-gray-400">
            {t.footer?.made}{" "}
            <a href="https://github.com/betzadev" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-pink">
              @betzadev
            </a>
          </span>
          <span className="text-xs text-gray-300">GRD → GGR · MIT</span>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export — wraps in LanguageProvider (preserves language via localStorage)
// ─────────────────────────────────────────────────────────────────────────────
export default function CreatePage() {
  return (
    <LanguageProvider>
      <CreatePageInner />
    </LanguageProvider>
  );
}
