"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Layers, Download, Wand2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

interface NavbarProps {
  /** Called when the Generate button is clicked (main page only) */
  onGenerate?: () => void;
  /** Whether converted files are available to download */
  hasDownloadable?: boolean;
}

export default function Navbar({ onGenerate, hasDownloadable = false }: NavbarProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navLink = (href: string, label: string) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-brand-pale text-brand-blue"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-brand-pale bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        {/* Logo + nav links */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5" id="nav-logo">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-pink to-brand-blue shadow-sm shadow-brand-pink/30">
              <Layers size={16} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900">
              GRD<span className="text-brand-pink">→</span>GGR
            </span>
          </Link>

          {/* Route links */}
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main navigation">
            {navLink("/", t.nav.converter ?? "Converter")}
            {navLink("/create", t.nav.createGradient ?? "Create Gradient")}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
