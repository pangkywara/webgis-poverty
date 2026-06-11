"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Portal, PortalBackdrop } from "@/components/portal";

const navLinks = [
  { label: "Tentang", href: "#about" },
  { label: "Modul Peta", href: "#projects" },
  { label: "Dokumentasi", href: "/auth/login" },
];

export function LandingHeader() {
  const scrolled = useScroll(10);
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="w-full max-w-[1440px] mx-auto p-2 sm:p-3">
        <nav
          className={cn(
            "flex items-center justify-between rounded-full p-[5px] border border-transparent transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            scrolled
              ? "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-gray-100/50"
              : "bg-white/70 backdrop-blur-sm"
          )}
        >
          {/* Brand */}
          <Link
            href="/"
            className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold tracking-tight text-[10px] sm:text-[11px] hover:bg-gray-800 transition-colors duration-300 shrink-0"
          >
            W
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[14px] font-medium text-gray-900 hover:text-gray-500 transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA - routes to Login */}
          <Link
            href="/auth/login"
            className="group hidden md:flex items-center gap-3 bg-primary hover:bg-primary/80 text-primary-foreground text-[14px] font-medium rounded-full pl-6 pr-2 py-2 transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer"
          >
            <span className="overflow-hidden h-[20px] relative inline-block">
              <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                <span className="h-[20px] flex items-center">Login</span>
                <span className="h-[20px] flex items-center">Login</span>
              </span>
            </span>
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-[-45deg] shrink-0">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setOpen((value) => !value)}
            className="md:hidden w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center text-white transition-transform duration-300 active:scale-95 cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
            aria-controls="landing-mobile-nav"
            aria-expanded={open}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <Portal className="md:hidden justify-end" id="landing-mobile-nav">
          <PortalBackdrop onClick={() => setOpen(false)} />
          <div className="bg-white rounded-2xl mx-3 mb-3 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-bottom duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <div className="flex justify-between items-center border-b pb-4 border-gray-100">
              <span className="text-[12px] font-semibold tracking-wider uppercase text-gray-900">
                Waras — Portal GIS
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-[28px] sm:text-[32px] font-medium text-gray-900 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Action Button - routes to Login */}
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="group w-full flex items-center justify-between bg-primary text-primary-foreground text-[14px] font-medium rounded-full pl-6 pr-2 py-2.5 transition-all duration-300 hover:bg-primary/80"
            >
              <span>Login</span>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </Portal>
      )}
    </header>
  );
}
