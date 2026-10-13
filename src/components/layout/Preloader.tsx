"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on initial session or page entry to avoid interrupting navigation
    const hasSeen = sessionStorage.getItem("nr_preloader_dismissed");
    if (hasSeen === "true") {
      setVisible(false);
      return;
    }

    setMounted(true);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      sessionStorage.setItem("nr_preloader_dismissed", "true");
      setVisible(false);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("nr_preloader_dismissed", "true");
          setVisible(false);
        },
      });

      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.94, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power2.out" }
      )
        .fromTo(
          textRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
          "-=0.2"
        )
        .fromTo(
          progressRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.5, ease: "power1.inOut" },
          "-=0.1"
        )
        .to(containerRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          delay: 0.1,
        });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-[#090D16] transition-colors select-none"
      style={{ willChange: "opacity" }}
      aria-live="polite"
      aria-label="Memuat aplikasi operasional"
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center">
        {/* Official Nusantara Regas Logo with theme adaptiveness */}
        <div
          ref={logoRef}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg border border-slate-200/80 dark:border-slate-700/80"
        >
          <BrandLogo className="h-full w-full" priority />
        </div>

        {/* Operational Brand & Heading */}
        <div ref={textRef} className="mt-5 space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-slate-100 uppercase">
              NUSANTARA REGAS
            </h1>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-[#008651] dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded font-mono border border-emerald-200 dark:border-emerald-800">
              AIMS
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Sistem Monitoring Jadwal Laporan &amp; Kepatuhan Operasional
          </p>
        </div>

        {/* Progress Line */}
        <div className="mt-6 w-44 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="w-full h-full bg-[#008651] dark:bg-emerald-400 origin-left"
          />
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-mono">
          Menyiapkan modul operasional...
        </p>
      </div>
    </div>
  );
}
