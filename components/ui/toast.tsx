"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, X, Heart, Send, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "match" | "message";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastContextType = {
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id, duration: toast.duration || 3000 };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      hideToast(id);
    }, newToast.duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 max-w-md w-full px-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    match: <Heart className="w-5 h-5 text-primary fill-primary" />,
    message: <Send className="w-5 h-5 text-primary" />,
  };

  const bgColors = {
    success: "from-green-500/20 to-green-500/5 border-green-500/30",
    error: "from-red-500/20 to-red-500/5 border-red-500/30",
    warning: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
    info: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    match: "from-primary/20 to-primary/5 border-primary/30",
    message: "from-primary/20 to-primary/5 border-primary/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`
        relative flex items-start gap-3 p-4 rounded-2xl
        bg-gradient-to-r ${bgColors[toast.type]}
        border backdrop-blur-xl shadow-2xl
      `}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (toast.duration || 3000) / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50 origin-left rounded-b-2xl"
      />
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
