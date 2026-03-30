import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GRD → GGR Converter | Photoshop to GIMP/Krita Gradients",
  description:
    "Convert Adobe Photoshop .GRD gradient files to GIMP/Krita .GGR format instantly in your browser. No server, no upload — 100% private.",
  keywords: ["GRD", "GGR", "Photoshop gradient", "GIMP gradient", "Krita gradient", "converter"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
