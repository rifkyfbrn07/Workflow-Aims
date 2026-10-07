"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, message, type, title, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title: string = "Berhasil") => {
      showToast(message, "success", title);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title: string = "Perhatian") => {
      showToast(message, "warning", title);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title: string = "Terjadi Kesalahan") => {
      showToast(message, "error", title);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title: string = "Informasi") => {
      showToast(message, "info", title);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, warning, error, info }}>
      {children}
      {/* Toast viewport fixed to top-right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isWarning = toast.type === "warning";
            const isError = toast.type === "error";

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className={`pointer-events-auto rounded-xl p-3.5 shadow-lg border text-xs flex items-start gap-3 bg-white ${
                  isSuccess
                    ? "border-emerald-200 ring-1 ring-emerald-500/10"
                    : isWarning
                    ? "border-amber-200 ring-1 ring-amber-500/10"
                    : isError
                    ? "border-red-200 ring-1 ring-red-500/10"
                    : "border-blue-200 ring-1 ring-blue-500/10"
                }`}
              >
                {/* Icon Indicator */}
                <div className="shrink-0 mt-0.5">
                  {isSuccess && <CheckCircle2 className="h-4 w-4 text-[#008651]" />}
                  {isWarning && <AlertTriangle className="h-4 w-4 text-[#D97706]" />}
                  {isError && <XCircle className="h-4 w-4 text-[#DC2626]" />}
                  {!isSuccess && !isWarning && !isError && <Info className="h-4 w-4 text-[#0055A5]" />}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  {toast.title && (
                    <p className="font-bold text-slate-900 tracking-tight leading-snug">
                      {toast.title}
                    </p>
                  )}
                  <p className="text-slate-600 leading-snug mt-0.5">{toast.message}</p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
