"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/gif,image/webp";

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({ value, onChange, disabled, className = "" }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Please use JPG, PNG, GIF, or WebP.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Image must be under ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File | null) => {
      setError(null);
      if (!file) {
        onChange(null);
        return;
      }
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      onChange(file);
    },
    [onChange, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFile(file ?? null);
      e.target.value = "";
    },
    [handleFile]
  );

  const removeImage = useCallback(() => {
    setError(null);
    onChange(null);
  }, [onChange]);

  return (
    <div className={className}>
      {value ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-lg border border-border bg-surface overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={URL.createObjectURL(value)}
            alt="Upload preview"
            className="w-full h-40 object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            disabled={disabled}
            className="absolute top-2 right-2 rounded-full bg-surface/90 shadow-md p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary transition-colors disabled:opacity-50"
            aria-label="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      ) : (
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`
            flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors
            min-h-[120px] py-6 px-4
            ${dragActive && !disabled ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept={ACCEPT}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            aria-label="Upload image"
          />
          <svg
            className="w-10 h-10 text-text-secondary mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-text-secondary text-center">
            Drag and drop an image, or <span className="text-primary font-medium">browse</span>
          </span>
          <span className="text-xs text-text-secondary mt-1">JPG, PNG, GIF or WebP. Max {MAX_SIZE_MB}MB.</span>
        </motion.label>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
