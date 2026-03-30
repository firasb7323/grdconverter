"use client";

/** Stable gradient preview bar used both in FileList and GradientEditor */
interface GradientPreviewProps {
  preview: { pos: number; r: number; g: number; b: number; a: number }[];
  name: string;
}

export default function GradientPreview({ preview, name }: GradientPreviewProps) {
  if (!preview || preview.length < 2) return null;

  const stops = preview.map((s) => {
    const alpha = (s.a / 255).toFixed(3);
    return `rgba(${s.r},${s.g},${s.b},${alpha}) ${(s.pos * 100).toFixed(1)}%`;
  });

  const gradient = `linear-gradient(to right, ${stops.join(", ")})`;

  return (
    <div
      style={{
        height: "40px",
        width: "100%",
        background: gradient,
        backgroundRepeat: "no-repeat",
        borderRadius: "10px",
      }}
      title={`Preview of "${name}"`}
      aria-label={`Gradient preview for ${name}`}
      role="img"
    />
  );
}
