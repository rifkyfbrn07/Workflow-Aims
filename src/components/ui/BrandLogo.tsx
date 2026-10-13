"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logoColor from "@/image/pertamina1.png";
import logoMono from "@/image/WhatsApp Image 2026-10-05 at 13.36.35.jpeg";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  variant?: "auto" | "color" | "contrast";
  priority?: boolean;
}

/**
 * BrandLogo provides theme-adaptive display of official PT Nusantara Regas / Pertamina logo.
 * - In Light mode: Displays the official full-color Pertamina logo (Red, Corporate Blue, Eco Green).
 * - In Dark mode: Displays the logo in a high-contrast container or official crisp variant.
 * Avoids any hydration mismatch by using CSS class-based switching (block dark:hidden / hidden dark:block).
 */
export function BrandLogo({
  className,
  imageClassName,
  variant = "auto",
  priority = false,
}: BrandLogoProps) {
  if (variant === "color") {
    return (
      <div className={cn("relative flex items-center justify-center shrink-0 overflow-hidden bg-white rounded-lg p-0.5", className)}>
        <Image
          src={logoColor}
          alt="Pertamina Nusantara Regas"
          priority={priority}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center shrink-0 overflow-hidden rounded-lg", className)}>
      {/* Light Mode: Official Full Color Logo */}
      <div className="block dark:hidden h-full w-full bg-white rounded-lg p-0.5">
        <Image
          src={logoColor}
          alt="Pertamina Nusantara Regas"
          priority={priority}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </div>

      {/* Dark Mode: Crisp Official Logo in High-Contrast Container */}
      <div className="hidden dark:flex h-full w-full items-center justify-center bg-white/95 rounded-lg p-0.5 shadow-sm border border-slate-700/60">
        <Image
          src={logoColor}
          alt="Pertamina Nusantara Regas"
          priority={priority}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </div>
    </div>
  );
}
