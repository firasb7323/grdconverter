"use client";

import { useCallback, useState, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { UploadCloud, FileWarning, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "@/context/LanguageContext";

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  hasFiles: boolean;
}

export default function Dropzone({ onFilesAdded, hasFiles }: DropzoneProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scaleSpring = useSpring(1, { stiffness: 400, damping: 20 });
  const scale = useTransform(scaleSpring, (v) => v);

  const validate = useCallback(
    (files: File[]): File[] => {
      const valid = files.filter((f) => f.name.toLowerCase().endsWith(".grd"));
      if (valid.length === 0) {
        setError(t.dropzone.errorTitle);
        return [];
      }
      setError(null);
      return valid;
    },
    [t.dropzone.errorTitle],
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const valid = validate(arr);
      if (valid.length > 0) onFilesAdded(valid);
    },
    [validate, onFilesAdded],
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isDragging) {
        setIsDragging(true);
        scaleSpring.set(1.03);
      }
    },
    [isDragging, scaleSpring],
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setIsDragging(false);
      scaleSpring.set(1);
    },
    [scaleSpring],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      scaleSpring.set(1);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, scaleSpring],
  );

  const onClick = () => inputRef.current?.click();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const state: "idle" | "dragging" | "hasFiles" | "error" =
    error ? "error" : isDragging ? "dragging" : hasFiles ? "hasFiles" : "idle";

  return (
    <motion.div style={{ scale }}>
      <div
        id="dropzone"
        role="button"
        tabIndex={0}
        aria-label="Drop zone for .GRD files"
        onClick={state === "error" ? undefined : onClick}
        onKeyDown={(e) => e.key === "Enter" && state !== "error" && onClick()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={clsx(
          "relative flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed",
          "min-h-[280px] w-full select-none transition-all duration-300",
          "px-8 py-14 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink",
          state !== "error" && "cursor-pointer",
          state === "idle" &&
            "border-gray-200 bg-gray-50 hover:border-brand-pink/40 hover:bg-brand-pale/20",
          state === "dragging" &&
            "border-brand-pink bg-brand-pale/30 shadow-lg shadow-brand-pink/10",
          state === "hasFiles" && "border-brand-sky/50 bg-brand-pale/10",
          state === "error" && "border-red-300 bg-red-50",
        )}
      >
        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept=".grd"
          multiple
          className="sr-only"
          onChange={onInputChange}
          aria-label="Select .GRD files"
        />

        {/* Icon — FIX: single-value animate props so only 2 keyframes exist */}
        <motion.div
          animate={{
            scale: isDragging ? 1.14 : 1,
            rotate: isDragging ? -6 : 0,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className={clsx(
            "flex h-16 w-16 items-center justify-center rounded-2xl",
            state === "error"
              ? "bg-red-100 text-red-500"
              : state === "hasFiles"
                ? "bg-brand-pale text-brand-blue"
                : state === "dragging"
                  ? "bg-brand-pink/15 text-brand-pink"
                  : "bg-gray-100 text-gray-400",
          )}
        >
          {state === "error" ? (
            <FileWarning size={32} strokeWidth={1.5} />
          ) : state === "hasFiles" ? (
            <CheckCircle2 size={32} strokeWidth={1.5} />
          ) : (
            <UploadCloud size={32} strokeWidth={1.5} />
          )}
        </motion.div>

        {/* Text states */}
        {state === "dragging" ? (
          <div>
            <p className="text-lg font-semibold text-brand-pink">
              {t.dropzone.draggingTitle}
            </p>
            <p className="mt-1 text-sm text-brand-blue/70">{t.dropzone.draggingSub}</p>
          </div>
        ) : state === "error" ? (
          <div>
            <p className="text-base font-semibold text-red-700">{t.dropzone.errorTitle}</p>
            <p className="mt-1 max-w-xs text-sm text-red-500">{error}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
              }}
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-200 transition-colors"
            >
              {t.dropzone.errorDismiss}
            </button>
          </div>
        ) : state === "hasFiles" ? (
          <div>
            <p className="text-base font-semibold text-gray-800">{t.dropzone.hasFilesTitle}</p>
            <p className="mt-1 text-sm text-gray-500">
              <span className="text-brand-pink underline underline-offset-2">
                {t.dropzone.idleSub}
              </span>
            </p>
          </div>
        ) : (
          <div>
            <p className="text-base font-semibold text-gray-800">
              {t.dropzone.idleTitle}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              <span className="text-brand-pink underline underline-offset-2">
                {t.dropzone.idleSub}
              </span>
            </p>
            <p className="mt-3 text-xs text-gray-400">{t.dropzone.idleCaption}</p>
          </div>
        )}

        {isDragging && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-pale/40 to-transparent" />
        )}
      </div>
    </motion.div>
  );
}
