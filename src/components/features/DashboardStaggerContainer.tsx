"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface DashboardStaggerContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardStaggerContainer({ children, className }: DashboardStaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const items = containerRef.current?.querySelectorAll(".gsap-stagger-item");
      if (items && items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.05,
            ease: "power2.out",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
