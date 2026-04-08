"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Wish } from "@/lib/types";
import { getModalSubtitle } from "@/lib/occasion";
import WishCardBuilder from "./WishCardBuilder";

interface WishModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialWish?: Wish;
}

export default function WishModal({ open, onClose, onSuccess, initialWish }: WishModalProps) {
  const isEditMode = !!initialWish;
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const handleSuccess = useCallback(() => {
    onSuccess();
    setTimeout(onClose, 2400);
  }, [onSuccess, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50"
            style={{ background: "var(--shell-backdrop, rgba(9,30,66,0.54))", backdropFilter: "blur(2px)" }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-3xl pointer-events-auto rounded-xl overflow-hidden flex flex-col dark-modal-panel"
              style={{
                background: "var(--shell-modal-bg, #ffffff)",
                border: "1px solid var(--ds-border, #DFE1E6)",
                boxShadow: "var(--shell-modal-shadow, 0 20px 60px rgba(9,30,66,0.22), 0 4px 16px rgba(9,30,66,0.1))",
                maxHeight: "90vh",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ADS-style modal header */}
              <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: "1px solid var(--ds-border, #DFE1E6)" }}
              >
                <div>
                  <h2
                    id="modal-title"
                    className="font-sans font-semibold"
                    style={{ color: "var(--ds-text, #172B4D)", fontSize: 18 }}
                  >
                    {isEditMode ? "Edit your wish card" : "Create your wish card"}
                  </h2>
                  <p
                    className="font-sans mt-0.5"
                    style={{ color: "var(--ds-text-subtlest, #6B778C)", fontSize: 12 }}
                  >
                    {getModalSubtitle(isEditMode)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[var(--shell-close-hover,#F4F5F7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary,#0052CC)]"
                  style={{ color: "var(--ds-text-subtle, #44546F)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12.192 3.22a.75.75 0 0 1 0 1.06L9.06 7.414l3.133 3.133a.75.75 0 1 1-1.06 1.06L8 8.475l-3.132 3.133a.75.75 0 0 1-1.06-1.06L6.94 7.413 3.806 4.28a.75.75 0 1 1 1.06-1.06L8 6.354l3.132-3.133a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                </button>
              </div>

              {/* Builder */}
              <div className="flex-1 overflow-hidden">
                <WishCardBuilder onSuccess={handleSuccess} initialWish={initialWish} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
