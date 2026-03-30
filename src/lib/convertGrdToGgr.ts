/**
 * convertGrdToGgr.ts
 * =====================================================================
 * Pure-browser converter: Adobe Photoshop .GRD  →  GIMP/Krita .GGR
 *
 * .GRD binary structure (Adobe Big-Endian descriptor format)
 *  Offset 0–3   : "8BGR" signature  (some files use "GrdL")
 *  Offset 4–7   : version (uint16 BE)
 *  Offset 8–…   : 8BIM block header
 *  Offset 32    : start of the gradient descriptor (KeyValue list)
 *
 * The parsing approach here is adapted from hi104/psd-grd (MIT licence).
 *
 * .GGR text structure:
 *  Line 1   : "GIMP Gradient"
 *  Line 2   : "Name: <name>"
 *  Line 3   : "Number of segments: <n>"
 *  Lines 4+ : one line per segment
 *    <left_pos> <mid_pos> <right_pos> <R0> <G0> <B0> <A0> <R1> <G1> <B1> <A1> <blending> <coloring>
 *    all positions are 0.0–1.0, all colours are 0.0–1.0
 *    blending = 0 (linear), coloring = 0 (RGB)
 * =====================================================================
 */

// ---------------------------------------------------------------------------
// Helper: map 0-255 → 0.0-1.0, clamped to 6 decimal places
// ---------------------------------------------------------------------------
function toUnit(value: number): string {
  return Math.min(1, Math.max(0, value / 255)).toFixed(6);
}

// ---------------------------------------------------------------------------
// Helper: map 0-100 opacity → 0.0-1.0
// ---------------------------------------------------------------------------
function opacityToUnit(opacity: number): string {
  return Math.min(1, Math.max(0, opacity / 100)).toFixed(6);
}

// ---------------------------------------------------------------------------
// Lightweight stream reader (Big-Endian, matching Adobe's byte order)
// ---------------------------------------------------------------------------
class Stream {
  private view: DataView;
  private pos: number;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
    this.pos = 0;
  }

  tell(): number { return this.pos; }
  seek(offset: number): void { this.pos = offset; }
  skip(n: number): void { this.pos += n; }

  readUint8(): number { return this.view.getUint8(this.pos++); }

  readInt32(): number {
    const v = this.view.getInt32(this.pos, false); // Big-Endian
    this.pos += 4;
    return v;
  }

  readUint32(): number {
    const v = this.view.getUint32(this.pos, false);
    this.pos += 4;
    return v;
  }

  readFloat64(): number {
    const v = this.view.getFloat64(this.pos, false); // Big-Endian
    this.pos += 8;
    return v;
  }

  /** Read n ASCII bytes as a string */
  readString(n: number): string {
    let s = "";
    for (let i = 0; i < n; i++) s += String.fromCharCode(this.view.getUint8(this.pos++));
    return s;
  }

  /** Read n UTF-16 BE code-units as a string */
  readWideString(n: number): string {
    let s = "";
    for (let i = 0; i < n; i++) {
      const code = this.view.getUint16(this.pos, false);
      this.pos += 2;
      s += String.fromCharCode(code);
    }
    return s;
  }

  read(n: number): Uint8Array {
    const slice = new Uint8Array(this.view.buffer, this.pos, n);
    this.pos += n;
    return slice;
  }
}

// ---------------------------------------------------------------------------
// Descriptor-tree types (mirrors hi104/psd-grd internal structure)
// ---------------------------------------------------------------------------
type DescValue =
  | { tag: "long";   value: number }
  | { tag: "doub";   value: number }
  | { tag: "UntF";   type: string; value: number }
  | { tag: "TEXT";   value: string }
  | { tag: "bool";   value: number }
  | { tag: "enum";   typeId: string; value: string }
  | { tag: "Objc";   name: string; typename: string; props: Record<string, DescValue> }
  | { tag: "VlLs";   items: DescValue[] }
  | { tag: "tdtd";   value: Uint8Array };

// ---------------------------------------------------------------------------
// Descriptor parser
// ---------------------------------------------------------------------------
function parseDescriptor(s: Stream): DescValue {
  const typeKey = s.readString(4);

  switch (typeKey) {
    case "long": {
      return { tag: "long", value: s.readInt32() };
    }
    case "doub": {
      return { tag: "doub", value: s.readFloat64() };
    }
    case "UntF": {
      const unitType = s.readString(4);
      const val = s.readFloat64();
      return { tag: "UntF", type: unitType, value: val };
    }
    case "TEXT": {
      const len = s.readInt32();
      return { tag: "TEXT", value: s.readWideString(len) };
    }
    case "bool": {
      return { tag: "bool", value: s.readUint8() };
    }
    case "enum": {
      const typeLen = s.readInt32() || 4;
      const typeId = s.readString(typeLen);
      const valLen = s.readInt32() || 4;
      const val = s.readString(valLen);
      return { tag: "enum", typeId, value: val };
    }
    case "Objc": {
      // unicode name length (may be 0 → read 0 wchar)
      const nameLen = s.readInt32();
      const name = s.readWideString(nameLen);
      // typename
      const typenameLen = s.readInt32() || 4;
      const typename = s.readString(typenameLen);
      const propCount = s.readInt32();
      const props: Record<string, DescValue> = {};
      for (let i = 0; i < propCount; i++) {
        const keyLen = s.readInt32() || 4;
        const key = s.readString(keyLen);
        props[key] = parseDescriptor(s);
      }
      return { tag: "Objc", name, typename, props };
    }
    case "VlLs": {
      const count = s.readInt32();
      const items: DescValue[] = [];
      for (let i = 0; i < count; i++) items.push(parseDescriptor(s));
      return { tag: "VlLs", items };
    }
    case "tdtd": {
      const len = s.readInt32();
      return { tag: "tdtd", value: s.read(len) };
    }
    default:
      throw new Error(`Unknown descriptor type: "${typeKey}" at offset ${s.tell()}`);
  }
}

// ---------------------------------------------------------------------------
// Typed accessors (throw with clear messages on bad structure)
// ---------------------------------------------------------------------------
function asObj(v: DescValue, ctx: string): Extract<DescValue, { tag: "Objc" }> {
  if (v.tag !== "Objc") throw new Error(`Expected Objc at ${ctx}, got ${v.tag}`);
  return v;
}
function asList(v: DescValue, ctx: string): Extract<DescValue, { tag: "VlLs" }> {
  if (v.tag !== "VlLs") throw new Error(`Expected VlLs at ${ctx}, got ${v.tag}`);
  return v;
}
function asDouble(v: DescValue, ctx: string): number {
  if (v.tag === "doub") return v.value;
  if (v.tag === "long") return v.value;
  if (v.tag === "UntF") return v.value;
  throw new Error(`Expected numeric at ${ctx}, got ${v.tag}`);
}
function asText(v: DescValue, ctx: string): string {
  if (v.tag === "TEXT") return v.value;
  throw new Error(`Expected TEXT at ${ctx}, got ${v.tag}`);
}

// ---------------------------------------------------------------------------
// Colour stop data
// ---------------------------------------------------------------------------
interface ColorStop {
  /** position 0 – 4096 */
  lctn: number;
  /** midpoint 0-100 */
  mdpn: number;
  r: number; g: number; b: number; // 0-255
  colorModel: "RGB" | "HSB" | "CMYK" | "LAB" | "GRAY";
}

interface TransparencyStop {
  lctn: number;
  mdpn: number;
  opacity: number; // 0-100
}

// ---------------------------------------------------------------------------
// Extract a single colour stop from a VlLs item
// ---------------------------------------------------------------------------
function parseColorStop(item: DescValue): ColorStop {
  const obj = asObj(item, "ColorStop");
  const props = obj.props;

  const lctn = asDouble(props["Lctn"], "Lctn");
  const mdpn = asDouble(props["Mdpn"], "Mdpn");

  const clrObj = asObj(props["Clr "], "Clr ");
  const typename = clrObj.typename;

  let r = 0, g = 0, b = 0;
  let colorModel: ColorStop["colorModel"] = "RGB";

  if (typename === "RGBC") {
    r = asDouble(clrObj.props["Rd  "], "Rd  ");
    g = asDouble(clrObj.props["Grn "], "Grn ");
    b = asDouble(clrObj.props["Bl  "], "Bl  ");
    colorModel = "RGB";
  } else if (typename === "HSBC") {
    // Convert HSB → RGB
    const h = asDouble(clrObj.props["H   "], "H   ") / 360;
    const s = asDouble(clrObj.props["Strt"], "Strt") / 100;
    const v = asDouble(clrObj.props["Brgh"], "Brgh") / 100;
    [r, g, b] = hsbToRgb(h, s, v);
    colorModel = "HSB";
  } else if (typename === "CMYC") {
    // CMYK → RGB approximation
    const c = asDouble(clrObj.props["Cyn "], "Cyn ") / 100;
    const m = asDouble(clrObj.props["Mgnt"], "Mgnt") / 100;
    const y = asDouble(clrObj.props["Yllw"], "Yllw") / 100;
    const k = asDouble(clrObj.props["Blck"], "Blck") / 100;
    r = 255 * (1 - c) * (1 - k);
    g = 255 * (1 - m) * (1 - k);
    b = 255 * (1 - y) * (1 - k);
    colorModel = "CMYK";
  } else if (typename === "Grsc") {
    // Grayscale
    const gray = asDouble(clrObj.props["Gry "], "Gry ") / 100;
    r = g = b = gray * 255;
    colorModel = "GRAY";
  } else {
    // Fallback: black
    r = g = b = 0;
  }

  return { lctn, mdpn, r, g, b, colorModel };
}

// ---------------------------------------------------------------------------
// HSB → RGB helper (h,s,v all in 0-1, returns [r,g,b] in 0-255)
// ---------------------------------------------------------------------------
function hsbToRgb(h: number, s: number, v: number): [number, number, number] {
  if (s === 0) {
    const g255 = Math.round(v * 255);
    return [g255, g255, g255];
  }
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r: number, g: number, b: number;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    default: r = v; g = p; b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ---------------------------------------------------------------------------
// Extract a single transparency stop
// ---------------------------------------------------------------------------
function parseTransparencyStop(item: DescValue): TransparencyStop {
  const obj = asObj(item, "TransStop");
  const props = obj.props;
  const lctn = asDouble(props["Lctn"], "Lctn");
  const mdpn = asDouble(props["Mdpn"], "Mdpn");
  // Opacity is stored as UntF with unit "%" — value is 0-100
  const opDesc = props["Opct"];
  const opacity = opDesc.tag === "UntF" ? opDesc.value : asDouble(opDesc, "Opct");
  return { lctn, mdpn, opacity };
}

// ---------------------------------------------------------------------------
// Interpolate opacity at a given lctn position
// ---------------------------------------------------------------------------
function interpolateOpacity(lctn: number, stops: TransparencyStop[]): number {
  if (stops.length === 0) return 100;
  if (lctn <= stops[0].lctn) return stops[0].opacity;
  if (lctn >= stops[stops.length - 1].lctn) return stops[stops.length - 1].opacity;
  for (let i = 1; i < stops.length; i++) {
    const prev = stops[i - 1];
    const curr = stops[i];
    if (lctn <= curr.lctn) {
      const t = (lctn - prev.lctn) / (curr.lctn - prev.lctn);
      return prev.opacity + t * (curr.opacity - prev.opacity);
    }
  }
  return stops[stops.length - 1].opacity;
}

// ---------------------------------------------------------------------------
// Gradient data structure
// ---------------------------------------------------------------------------
export interface ParsedGradient {
  name: string;
  colorStops: ColorStop[];
  transparencyStops: TransparencyStop[];
}

export interface GradientStopPreview {
  pos: number; r: number; g: number; b: number; a: number;
}

export interface ConversionResult {
  gradientName: string;
  ggrContent: string;
  preview: GradientStopPreview[];
}

// ---------------------------------------------------------------------------
// Main parser: reads the file header and all gradient descriptors
// ---------------------------------------------------------------------------
function parseGrdFile(buffer: ArrayBuffer): ParsedGradient[] {
  const s = new Stream(buffer);

  // ---- Validate signature ----
  const sig = s.readString(4);
  if (sig !== "8BGR") {
    throw new Error('Invalid .GRD file — expected "8BGR" signature at offset 0');
  }
  const version = s.readUint32(); // version (usually 5)
  if (version < 3) {
    throw new Error(`Unsupported .GRD version: ${version} (minimum supported: 3)`);
  }

  // ---- Skip to gradient list descriptor (offset 32) ----
  // Bytes 8-11: "8BIM" resource marker
  // Bytes 12-15: key "GrdL"
  // Bytes 16-19: pascal string (2 bytes length + padding)
  // Bytes 20-23: resource data length
  // Then 8 more ignored bytes of descriptor prefix before actual data
  s.seek(32);

  // Read the top-level key (should be "GrdL")
  const grdlKey = s.readString(4);
  if (grdlKey !== "GrdL") {
    throw new Error(`Expected "GrdL" key at offset 32, got "${grdlKey}"`);
  }

  // The value type is "VlLs"
  const vlType = s.readString(4);
  if (vlType !== "VlLs") {
    throw new Error(`Expected "VlLs" after GrdL, got "${vlType}"`);
  }

  const count = s.readInt32();
  const gradients: ParsedGradient[] = [];

  for (let i = 0; i < count; i++) {
    try {
      // Each item in the list is a descriptor for one gradient
      const item = parseDescriptor(s);

      // Navigate: Objc → props["Grad"] → Objc
      const topObj = asObj(item, `GradItem[${i}]`);
      const gradDesc = asObj(topObj.props["Grad"], `GradItem[${i}].Grad`);

      // --- Name ---
      const name = asText(gradDesc.props["Nm  "], "Nm  ").replace(/\0/g, "").trim() || `Gradient ${i + 1}`;

      // --- Color stops ---
      const clrsList = asList(gradDesc.props["Clrs"], "Clrs");
      const colorStops = clrsList.items.map(parseColorStop);

      // Sort by position
      colorStops.sort((a, b) => a.lctn - b.lctn);

      // --- Transparency stops ---
      const trnsList = asList(gradDesc.props["Trns"], "Trns");
      const transparencyStops = trnsList.items.map(parseTransparencyStop);
      transparencyStops.sort((a, b) => a.lctn - b.lctn);

      gradients.push({ name, colorStops, transparencyStops });
    } catch (err) {
      console.warn(`Skipping gradient ${i}: ${(err as Error).message}`);
    }
  }

  if (gradients.length === 0) {
    throw new Error("No valid gradients found in .GRD file");
  }

  return gradients;
}

// ---------------------------------------------------------------------------
// Build a single GGR string from a ParsedGradient
// ---------------------------------------------------------------------------
function buildGgr(grad: ParsedGradient): ConversionResult {
  const { name, colorStops, transparencyStops } = grad;

  // Need at least 2 stops to form a segment
  if (colorStops.length < 2) {
    throw new Error(`Gradient "${name}" has fewer than 2 colour stops`);
  }

  // Number of segments = number of intervals between consecutive colour stops
  const numSegments = colorStops.length - 1;

  // Build GGR lines
  const lines: string[] = [];
  lines.push("GIMP Gradient");
  lines.push(`Name: ${name}`);
  lines.push(`Number of segments: ${numSegments}`);

  // Preview data (for the UI gradient bar)
  const preview: ConversionResult["preview"] = [];

  for (let i = 0; i < numSegments; i++) {
    const left = colorStops[i];
    const right = colorStops[i + 1];

    // Normalise positions from [0, 4096] → [0.0, 1.0]
    const leftPos  = left.lctn  / 4096;
    const rightPos = right.lctn / 4096;

    // Midpoint: the mdpn field says where the 50% interpolation point is
    // within this segment (0-100 → fraction of the segment width)
    const midFraction = (right.mdpn || 50) / 100;
    const midPos = leftPos + (rightPos - leftPos) * midFraction;

    // Opacities (interpolated from transparency stops)
    const leftOpacity  = interpolateOpacity(left.lctn, transparencyStops);
    const rightOpacity = interpolateOpacity(right.lctn, transparencyStops);

    // GIMP segment line:
    // left_pos mid_pos right_pos R0 G0 B0 A0 R1 G1 B1 A1 blending coloring
    const line = [
      leftPos.toFixed(6),
      midPos.toFixed(6),
      rightPos.toFixed(6),
      toUnit(left.r), toUnit(left.g), toUnit(left.b), opacityToUnit(leftOpacity),
      toUnit(right.r), toUnit(right.g), toUnit(right.b), opacityToUnit(rightOpacity),
      "0", // blending: 0 = linear
      "0", // coloring: 0 = RGB
    ].join(" ");
    lines.push(line);

    // Collect preview points
    if (i === 0) {
      preview.push({
        pos: leftPos,
        r: left.r, g: left.g, b: left.b,
        a: Math.round(leftOpacity * 2.55),
      });
    }
    preview.push({
      pos: rightPos,
      r: right.r, g: right.g, b: right.b,
      a: Math.round(rightOpacity * 2.55),
    });
  }

  return { gradientName: name, ggrContent: lines.join("\n") + "\n", preview };
}

// ---------------------------------------------------------------------------
// Public API: convert an ArrayBuffer (.grd) → array of ConversionResult
// ---------------------------------------------------------------------------
export function convertGrdToGgr(buffer: ArrayBuffer): ConversionResult[] {
  const gradients = parseGrdFile(buffer);
  return gradients.map(buildGgr);
}

// ---------------------------------------------------------------------------
// Helper: trigger a browser download from a string
// ---------------------------------------------------------------------------
export function downloadGgr(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ggr") ? filename : `${filename}.ggr`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
