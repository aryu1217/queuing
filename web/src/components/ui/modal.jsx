// src/components/ui/modal.jsx
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white/50 shadow-xl ring-1 ring-black/5 border border-black/5"
        onClick={(e) => e.stopPropagation()} // 내부 클릭은 닫기 방지
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
