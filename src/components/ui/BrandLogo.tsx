"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logoColor from "@/image/pertamina1.png";
import logoMono from "@/image/WhatsApp Image 2026-10-05 at 13.36.35.jpeg";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  variant?: "auto" | "color" | "mono";
  priority?: boolean;
}

/**
 * BrandLogo provides theme-adaptive display of official PT Nusantara Regas / Pertamina logo.
 * - In Light mode: Displays the official full-color Pertamina logo with genuine transparency.
 * - In Dark mode: Displays the official monochrome Pertamina logo in a crisp high-contrast surface.
 * - Automatically switches instantly upon theme changes without page reload.
 */
export function BrandLogo({
  className,
  imageClassName,
  variant = "auto",
  priority = false,
}: BrandLogoProps) {
  if (variant === "color") {
    return (
      <div className={cn("relative flex items-center justify-center shrink-0 overflow-hidden", className)}>
        <Image
          src={logoColor}
          alt="Pertamina Nusantara Regas"
          priority={priority}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </div>
    );
  }

  if (variant === "mono") {
    return (
      <div className={cn("relative flex items-center justify-center shrink-0 overflow-hidden bg-white rounded-lg p-0.5 shadow-xs border border-slate-200 dark:border-slate-700/60", className)}>
        <Image
          src={logoMono}
          alt="Pertamina Nusantara Regas Monochrome"
          priority={priority}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center shrink-0 overflow-hidden", className)}>
      {/* Light Mode: Official Full Color Logo with genuine transparency */}
      <div className="block dark:hidden h-full w-full">
        <Image
          src={logoColor}
          alt="Pertamina Nusantara Regas"
          priority={priority}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </div>

      {/* Dark Mode: Official Monochrome Logo in crisp high-contrast surface */}
      <div className="hidden dark:flex h-full w-full items-center justify-center bg-white rounded-lg p-0.5 shadow-xs border border-slate-700/60">
        <Image
          src={logoMono}
          alt="Pertamina Nusantara Regas Monochrome"
          priority={priority}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </div>
    </div>
  );
}
