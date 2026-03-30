// ─────────────────────────────────────────────────────────────────────────────
// exporter.ts
// Converts a list of user-defined color stops into a valid .GGR string
// (GIMP/Krita gradient format) and triggers a browser download.
// This is the counterpart to convertGrdToGgr.ts — it goes the OTHER direction:
// user-created data → .GGR text file.
// ─────────────────────────────────────────────────────────────────────────────

export interface EditorStop {
  /** Unique key for React rendering */
  id: string;
  /** Position on gradient: 0–100 */
  position: number;
  /** CSS hex color, e.g. "#D94389" */
  color: string;
  /** Left in for typing compatibility, unused in Krita mode */
  opacity?: number;
}

// ── Private helpers ──────────────────────────────────────────────────────────

/** Parse a 6-char hex string → [r, g, b] in 0–255 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").padEnd(6, "0");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

/** Map 0–255 → 0.0–1.0, 6 decimal places */
function byteToUnit(v: number): string {
  return Math.min(1, Math.max(0, v / 255)).toFixed(6);
}

/** Map 0–100 (percent opacity) → 0.0–1.0 */
function opacityToUnit(pct: number): string {
  return Math.min(1, Math.max(0, pct / 100)).toFixed(6);
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a valid .GGR text string from a list of editor color stops.
 *
 * .GGR segment format (one per line after the header):
 *   left_pos  mid_pos  right_pos  R0 G0 B0 A0  R1 G1 B1 A1  blending  coloring
 *   All positions: 0.0–1.0
 *   All color channels: 0.0–1.0
 *   blending 0 = linear, coloring 0 = RGB
 *
 * @param stops  Array of EditorStop (order doesn't matter; sorted by position)
 * @param name   Gradient name for the .GGR header
 */
export function buildGgrFromEditorStops(
  stops: EditorStop[],
  name: string = "Custom Gradient",
): string {
  if (stops.length < 2) {
    throw new Error("A gradient needs at least 2 colour stops.");
  }

  // Sort ascending by position
  const sorted = [...stops].sort((a, b) => a.position - b.position);

  // Ensure the gradient spans from 0 to 100
  if (sorted[0].position > 0) {
    sorted.unshift({ ...sorted[0], id: "__auto_start__", position: 0 });
  }
  if (sorted[sorted.length - 1].position < 100) {
    const last = sorted[sorted.length - 1];
    sorted.push({ ...last, id: "__auto_end__", position: 100 });
  }

  const numSegments = sorted.length - 1;
  const lines: string[] = [
    "GIMP Gradient",
    `Name: ${name.replace(/[\n\r]/g, " ").trim() || "Custom Gradient"}`,
    `${numSegments}`,
  ];

  for (let i = 0; i < numSegments; i++) {
    const left  = sorted[i];
    const right = sorted[i + 1];

    const leftPos  = left.position  / 100;
    const rightPos = right.position / 100;
    const midPos   = leftPos + (rightPos - leftPos) * 0.5; // linear midpoint

    const [lr, lg, lb] = hexToRgb(left.color);
    const [rr, rg, rb] = hexToRgb(right.color);

    lines.push(
      [
        leftPos.toFixed(6),
        midPos.toFixed(6),
        rightPos.toFixed(6),
        byteToUnit(lr), byteToUnit(lg), byteToUnit(lb), "1.000000",
        byteToUnit(rr), byteToUnit(rg), byteToUnit(rb), "1.000000",
        "0", // blending: linear
        "0", // coloring: RGB
        "0", // color type left: fixed
        "0", // color type right: fixed
      ].join(" "),
    );
  }

  return lines.join("\n") + "\n";
}

/**
 * Build a CSS linear-gradient string for live preview.
 */
export function buildCSSGradient(stops: EditorStop[]): string {
  if (stops.length === 0) return "linear-gradient(to right, #D94389, #117DBF)";
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const parts = sorted.map((s) => {
    const [r, g, b] = hexToRgb(s.color);
    return `rgb(${r},${g},${b}) ${s.position}%`;
  });
  return `linear-gradient(to right, ${parts.join(", ")})`;
}

/**
 * Trigger a browser download of a .GGR file.
 */
export function downloadGgrString(content: string, name: string): void {
  const fileName = name.replace(/[^a-z0-9_\- ]/gi, "_").slice(0, 80) || "gradient";
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = fileName.endsWith(".ggr") ? fileName : `${fileName}.ggr`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
