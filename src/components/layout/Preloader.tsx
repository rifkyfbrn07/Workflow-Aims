"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import officialLogo from "@/image/WhatsApp Image 2026-10-05 at 13.36.35.jpeg";

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show on initial load for a smooth corporate greeting
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <Image
              src={officialLogo}
              alt="Pertamina Nusantara Regas"
              priority
              className="h-20 w-auto object-contain"
            />

            <div className="mt-5 text-center">
              <h1 className="text-base font-extrabold tracking-wider text-slate-900">
                WORKTRACK
              </h1>
              <p className="text-[11px] font-medium tracking-wide text-slate-500 mt-0.5 uppercase">
                Operational Monitoring System
              </p>
            </div>

            {/* Subtle Green Progress Line */}
            <div className="mt-6 w-40 h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="w-full h-full bg-[#008651] rounded-full"
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-3 font-medium">
              Preparing your workspace...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
