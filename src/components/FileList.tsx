"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileImage,
  Trash2,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import { clsx } from "clsx";
import JSZip from "jszip";
import { convertGrdToGgr, downloadGgr, ConversionResult } from "@/lib/convertGrdToGgr";
import GradientPreview from "@/components/GradientPreview";
import { useLanguage } from "@/context/LanguageContext";

export interface FileEntry {
  id: string;
  file: File;
  status: "pending" | "converting" | "done" | "error";
  results?: ConversionResult[];
  error?: string;
}

interface FileListProps {
  entries: FileEntry[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<FileEntry>) => void;
  onPreview: (result: ConversionResult) => void;
}

const listItemVariants = {
  hidden:  { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.97 },
};

export default function FileList({ entries, onRemove, onUpdate, onPreview }: FileListProps) {
  const { t } = useLanguage();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const convertOne = useCallback(
    async (entry: FileEntry) => {
      onUpdate(entry.id, { status: "converting", error: undefined });
      try {
        const buffer = await entry.file.arrayBuffer();
        const results = convertGrdToGgr(buffer);
        onUpdate(entry.id, { status: "done", results });
        setExpandedIds((prev) => new Set([...prev, entry.id]));
      } catch (err) {
        onUpdate(entry.id, { status: "error", error: (err as Error).message });
      }
    },
    [onUpdate],
  );

  const convertAll = useCallback(async () => {
    const pending = entries.filter((e) => e.status === "pending");
    await Promise.all(pending.map(convertOne));
  }, [entries, convertOne]);

  const downloadOne = (result: ConversionResult, baseName: string) => {
    const safeName =
      result.gradientName.replace(/[^a-z0-9_\- ]/gi, "_").slice(0, 60) || baseName;
    downloadGgr(result.ggrContent, safeName);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    let hasFiles = false;
    const nameCounts = new Map<string, number>();

    const doneEntries = entries.filter((e) => e.status === "done" && e.results && e.results.length > 0);
    if (doneEntries.length === 0) return;

    let zipName = "gradients.zip";
    if (doneEntries.length === 1) {
      zipName = `${doneEntries[0].file.name.replace(/\.grd$/i, "")}.zip`;
    } else {
      zipName = `${doneEntries[0].file.name.replace(/\.grd$/i, "")}_and_${doneEntries.length - 1}_others.zip`;
    }

    entries.forEach((entry) => {
      if (entry.status === "done" && entry.results) {
        const baseName = entry.file.name.replace(/\.grd$/i, "");
        entry.results.forEach((r) => {
          const safeName = r.gradientName.replace(/[^a-z0-9_\- ]/gi, "_").slice(0, 60) || baseName;
          const currentCount = nameCounts.get(safeName) || 0;
          nameCounts.set(safeName, currentCount + 1);
          
          const finalName = currentCount > 0 ? `${safeName} (${currentCount})` : safeName;
          
          zip.file(`${finalName}.ggr`, r.ggrContent);
          hasFiles = true;
        });
      }
    });

    if (hasFiles) {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const doneCount = entries.filter((e) => e.status === "done").length;

  return (
    <section aria-label="Loaded files" className="flex flex-col gap-4">
      {/* ── Action bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">
          {t.list.filesLoaded(entries.length)}
          {doneCount > 0 && (
            <span className="ms-1.5 text-brand-pink">
              · {t.list.converted(doneCount)}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          {doneCount > 0 && (
            <button
              id="download-all-btn"
              onClick={downloadAll}
              className="inline-flex items-center gap-2 rounded-full border border-brand-pale/60 bg-white px-4 py-2 text-sm font-medium text-brand-blue shadow-sm transition-all hover:bg-brand-pale/30 hover:border-violet-300 active:scale-95"
            >
              <Download size={14} />
              {t.list.downloadAll}
            </button>
          )}
          {pendingCount > 0 && (
            <button
              id="convert-all-btn"
              onClick={convertAll}
              className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-pale/60 transition-all hover:bg-brand-blue hover:shadow-lg active:scale-95"
            >
              <Wand2 size={14} />
              {t.list.convertAll}
            </button>
          )}
        </div>
      </div>

      {/* ── File cards ── */}
      <motion.ul
        layout
        className="flex flex-col gap-3"
        role="list"
        aria-label="File list"
      >
        <AnimatePresence initial={false}>
          {entries.map((entry) => {
            const isExpanded = expandedIds.has(entry.id);
            const baseName = entry.file.name.replace(/\.grd$/i, "");
            const sizeKb = (entry.file.size / 1024).toFixed(1);

            return (
              <motion.li
                key={entry.id}
                layout
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={clsx(
                  "overflow-hidden rounded-2xl border bg-white shadow-sm",
                  entry.status === "done" && "border-brand-pale",
                  entry.status === "error" && "border-red-200 bg-red-50/30",
                  (entry.status === "pending" || entry.status === "converting") &&
                    "border-gray-100",
                )}
              >
                {/* Row header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Icon */}
                  <div
                    className={clsx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      entry.status === "done" && "bg-brand-pale text-brand-pink",
                      entry.status === "error" && "bg-red-100 text-red-500",
                      (entry.status === "pending" || entry.status === "converting") &&
                        "bg-gray-100 text-gray-400",
                    )}
                  >
                    {entry.status === "converting" ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : entry.status === "done" ? (
                      <CheckCircle2 size={20} />
                    ) : entry.status === "error" ? (
                      <AlertCircle size={20} />
                    ) : (
                      <FileImage size={20} />
                    )}
                  </div>

                  {/* Name & meta */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {entry.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {sizeKb} KB
                      {entry.status === "done" && entry.results && (
                        <span className="text-brand-pale/300">
                          {" "}· {t.list.gradientsFound(entry.results.length)}
                        </span>
                      )}
                      {entry.status === "error" && (
                        <span className="text-red-500"> · {t.list.error}</span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {entry.status === "pending" && (
                      <button
                        id={`convert-btn-${entry.id}`}
                        onClick={() => convertOne(entry)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-pink px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-blue active:scale-95"
                      >
                        <Wand2 size={13} />
                        {t.list.convert}
                      </button>
                    )}
                    {entry.status === "done" && entry.results && (
                      <>
                        {entry.results.length > 1 && (
                          <button
                            id={`expand-btn-${entry.id}`}
                            onClick={() => toggleExpand(entry.id)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                            {t.list.gradients(entry.results.length)}
                          </button>
                        )}
                        {entry.results.length === 1 && (
                          <>
                            <button
                              id={`preview-btn-${entry.id}`}
                              onClick={() => onPreview(entry.results![0])}
                              title={t.list.preview}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-brand-pale/30 hover:text-brand-pink transition-colors"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              id={`download-btn-${entry.id}`}
                              onClick={() => downloadOne(entry.results![0], baseName)}
                              title={t.list.download}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-brand-pale/30 hover:text-brand-pink transition-colors"
                            >
                              <Download size={15} />
                            </button>
                          </>
                        )}
                      </>
                    )}
                    <button
                      id={`remove-btn-${entry.id}`}
                      onClick={() => onRemove(entry.id)}
                      title={t.list.remove}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Error detail */}
                {entry.status === "error" && entry.error && (
                  <div className="border-t border-red-100 px-4 pb-3 pt-2">
                    <p className="text-xs text-red-500">{entry.error}</p>
                  </div>
                )}

                {/* Gradient list — clean full-width rows, no extra x-padding offset */}
                {entry.status === "done" &&
                  entry.results &&
                  (isExpanded || entry.results.length === 1) && (
                    <div
                      className={clsx(
                        "border-t border-gray-50 p-3",
                        entry.results.length > 1
                          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8"
                          : "flex flex-col gap-2",
                      )}
                    >
                      {entry.results.map((result, ri) => (
                        <motion.div
                          key={ri}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          transition={{ delay: ri * 0.05, duration: 0.2 }}
                          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition-all hover:border-brand-sky/40 hover:shadow-sm"
                        >
                          {/* Gradient preview bar — full width, no padding offset */}
                          <GradientPreview
                            preview={result.preview}
                            name={result.gradientName}
                          />

                          {/* Name + actions row */}
                          <div className="flex items-center justify-between gap-2 px-3 py-2">
                            <p className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-700">
                              {result.gradientName}
                            </p>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                id={`preview-gradient-btn-${entry.id}-${ri}`}
                                onClick={() => onPreview(result)}
                                title={t.list.preview}
                                className="flex items-center justify-center rounded-lg p-1.5 text-brand-pink opacity-0 transition-all group-hover:opacity-100 hover:bg-brand-pale"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                id={`download-gradient-btn-${entry.id}-${ri}`}
                                onClick={() => downloadOne(result, baseName)}
                                title={t.list.download}
                                className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 opacity-0 transition-all group-hover:opacity-100 hover:border-brand-pale hover:bg-brand-pale/30 hover:text-brand-pink"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}

