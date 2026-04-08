"use client";

import { sitePersonName } from "@/lib/site";
import { getMessagePlaceholder } from "@/lib/occasion";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Wish } from "@/lib/types";
import { getImageSrc } from "@/lib/image";
import ImageUpload from "./ImageUpload";
import Button from "@atlaskit/button/new";

const OWNED_KEY = "wish-board-owned";

function markWishOwned(wishId: string) {
  try {
    const raw = localStorage.getItem(OWNED_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    if (!arr.includes(wishId)) {
      localStorage.setItem(OWNED_KEY, JSON.stringify([...arr, wishId]));
    }
  } catch { /* ignore */ }
}

function resolveInitialMediaTab(wish?: Wish): MediaTab {
  if (!wish) return "illustration";
  if (wish.illustration) return "illustration";
  if (wish.image) return wish.image.startsWith("/") ? "upload" : "gif";
  return "illustration";
}

// ─── Constants ────────────────────────────────────────────

const WORD_LIMIT = 50;

const CARD_COLORS = [
  { label: "Blue",   hex: "#2672C8" },
  { label: "Green",  hex: "#5A9A28" },
  { label: "Purple", hex: "#BE70CC" },
  { label: "Orange", hex: "#D06510" },
];

const ILLUSTRATIONS = [
  { key: "spacemonkey", src: "/illustrations/spacemonkey.png", label: "Spacemonkey" },
  { key: "confetti",    src: "/illustrations/confetti.png",    label: "Confetti"    },
  { key: "flower",      src: "/illustrations/flower.png",      label: "Flower"      },
  { key: "hifive",      src: "/illustrations/hifive.png",      label: "Hi-Five"     },
  { key: "drinks",      src: "/illustrations/drinks.png",      label: "Drinks"      },
  { key: "stars",       src: "/illustrations/stars.png",       label: "Stars"       },
];

type MediaTab = "illustration" | "upload" | "gif";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── GIF Picker ───────────────────────────────────────────

interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
}

interface GifPickerProps {
  selected: string | null;
  onSelect: (url: string | null) => void;
}

const GIF_PAGE_SIZE = 18;

function GifPicker({ selected, onSelect }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "loadingMore" | "error" | "no-key">("loading");

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Use refs so the IntersectionObserver callback always sees fresh values
  const queryRef = useRef(query);
  queryRef.current = query;
  const offsetRef = useRef(offset);
  offsetRef.current = offset;
  const canLoadMoreRef = useRef(false);
  canLoadMoreRef.current = fetchState === "idle" && hasMore;

  const fetchGifs = useCallback(async (q: string, off: number, append: boolean) => {
    if (append) setFetchState("loadingMore");
    else setFetchState("loading");
    try {
      const res = await fetch(`/api/gifs?q=${encodeURIComponent(q)}&offset=${off}`);
      if (res.status === 503) { setFetchState("no-key"); return; }
      if (!res.ok) { setFetchState("error"); return; }
      const data = await res.json();
      const incoming: GifItem[] = data.gifs ?? [];
      if (append) setGifs((prev) => [...prev, ...incoming]);
      else setGifs(incoming);
      setOffset(off + incoming.length);
      setHasMore(incoming.length >= GIF_PAGE_SIZE);
      setFetchState("idle");
    } catch {
      setFetchState("error");
    }
  }, []);

  // Initial trending load
  useEffect(() => { fetchGifs("", 0, false); }, [fetchGifs]);

  // Sentinel IntersectionObserver — set up once, reads state via refs
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canLoadMoreRef.current) {
          fetchGifs(queryRef.current, offsetRef.current, true);
        }
      },
      { root: container, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchGifs]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setGifs([]);
    setOffset(0);
    setHasMore(true);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => fetchGifs(val, 0, false), 450);
  };

  if (fetchState === "no-key") {
    return (
      <div
        className="rounded-lg p-4 text-center"
        style={{ background: "var(--ds-background-neutral, #F4F5F7)", border: "1px solid var(--ds-border, #DFE1E6)" }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "var(--ds-text, #172B4D)" }}>
          GIF search not configured
        </p>
        <p className="text-xs" style={{ color: "var(--ds-text-subtlest, #6B778C)" }}>
          Add <code className="px-1 rounded" style={{ background: "#EBECF0" }}>GIPHY_API_KEY</code> to{" "}
          <code className="px-1 rounded" style={{ background: "#EBECF0" }}>.env.local</code> (local) or Vercel{" "}
          <strong>Settings → Environment Variables</strong> (deployed), then restart or redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="search"
        value={query}
        onChange={handleSearch}
        placeholder="Search GIFs…"
        className="w-full rounded-md px-3 py-2 text-sm"
        style={{
          border: "2px solid var(--ds-border, #DFE1E6)",
          outline: "none",
          color: "var(--ds-text, #172B4D)",
          background: "var(--ds-background-input, #FAFBFC)",
          transition: "border-color 0.15s",
        }}
      />

      <div
        ref={containerRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 4,
          maxHeight: 220,
          overflowY: "auto",
          borderRadius: 8,
          border: "1px solid var(--ds-border, #DFE1E6)",
          padding: 4,
          background: "var(--ds-background-neutral, #F4F5F7)",
        }}
      >
        {fetchState === "loading" && (
          <div style={{ gridColumn: "1/-1", padding: "28px 0", textAlign: "center" }}>
            <span className="text-xs" style={{ color: "var(--ds-text-subtlest, #6B778C)" }}>Loading…</span>
          </div>
        )}
        {fetchState === "error" && (
          <div style={{ gridColumn: "1/-1", padding: "28px 0", textAlign: "center" }}>
            <span className="text-xs" style={{ color: "var(--ds-text-danger, #AE2E24)" }}>Failed to load GIFs</span>
          </div>
        )}
        {fetchState === "idle" && gifs.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "28px 0", textAlign: "center" }}>
            <span className="text-xs" style={{ color: "var(--ds-text-subtlest, #6B778C)" }}>No GIFs found</span>
          </div>
        )}

        {gifs.map((gif) => (
          <button
            key={gif.id}
            type="button"
            onClick={() => onSelect(gif.url)}
            title={gif.title}
            style={{
              border: selected === gif.url
                ? "2px solid var(--ds-border-focused, #0052CC)"
                : "2px solid transparent",
              borderRadius: 6,
              overflow: "hidden",
              padding: 0,
              cursor: "pointer",
              background: "none",
              outline: "none",
              transition: "border-color 0.12s",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gif.previewUrl}
              alt={gif.title}
              style={{ width: "100%", height: 60, objectFit: "cover", display: "block" }}
            />
          </button>
        ))}

        {/* Sentinel — entering the viewport triggers next page load */}
        <div
          ref={sentinelRef}
          style={{ gridColumn: "1/-1", height: 1 }}
          aria-hidden
        />

        {/* "Loading more" indicator shown while appending */}
        {fetchState === "loadingMore" && (
          <div style={{ gridColumn: "1/-1", padding: "8px 0", textAlign: "center" }}>
            <span className="text-xs" style={{ color: "var(--ds-text-subtlest, #6B778C)" }}>Loading more…</span>
          </div>
        )}
      </div>

      {selected && (
        <p className="text-xs" style={{ color: "var(--ds-text-subtlest, #6B778C)" }}>
          GIF selected ✓ —{" "}
          <button
            type="button"
            onClick={() => onSelect(null)}
            style={{
              color: "var(--ds-link, #0052CC)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: "inherit",
            }}
          >
            Clear
          </button>
        </p>
      )}
    </div>
  );
}

// ─── Card Preview ─────────────────────────────────────────

interface CardPreviewProps {
  cardColor: string;
  illustration: string | null;
  imageFile: File | null;
  gifUrl: string | null;
  existingImageUrl?: string | null;
  message: string;
  name: string;
}

function CardPreview({ cardColor, illustration, imageFile, gifUrl, existingImageUrl, message, name }: CardPreviewProps) {
  const illSrc = ILLUSTRATIONS.find((i) => i.key === illustration)?.src ?? null;
  const uploadedUrl = imageFile ? URL.createObjectURL(imageFile) : null;
  const mediaUrl = uploadedUrl ?? gifUrl ?? (existingImageUrl ? getImageSrc(existingImageUrl) : null);

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg w-full"
      style={{ border: "1px solid var(--ds-border, #DFE1E6)" }}
    >
      {/* Colored top — illustration, uploaded image, or GIF */}
      <div
        style={{
          background: cardColor,
          minHeight: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl}
            alt="Preview"
            style={{ width: "100%", height: 160, objectFit: "cover" }}
          />
        ) : illSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={illSrc}
            alt=""
            style={{ height: 120, objectFit: "contain", userSelect: "none" }}
          />
        ) : (
          <span
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Choose illustration
          </span>
        )}
      </div>

      {/* Bottom — message + footer */}
      <div
        style={{
          background: "var(--card-message-bg, #ffffff)",
          padding: "12px 16px",
          borderTop: "1px solid var(--ds-border, #DFE1E6)",
        }}
      >
        {/* Message */}
        <p
          style={{
            fontSize: "0.875rem",
            color: message.trim() ? "var(--ds-text, #172B4D)" : "var(--ds-text-subtlest, #6B778C)",
            lineHeight: 1.55,
            minHeight: 40,
            wordBreak: "break-word",
          }}
        >
          {message.trim() || "Your message…"}
        </p>

        {/* Footer: sender + heart */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid var(--ds-border, #DFE1E6)",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: name.trim() ? "var(--ds-text, #172B4D)" : "var(--ds-text-subtlest, #6B778C)",
            }}
          >
            {name.trim() || "Your name"}
          </p>
          {/* Static heart placeholder */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="rgba(0,0,0,0)"
            stroke="var(--ds-text-subtlest, #6B778C)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────

const TABS: { id: MediaTab; label: string }[] = [
  { id: "illustration", label: "Illustrations" },
  { id: "upload",       label: "Upload"         },
  { id: "gif",          label: "GIF"            },
];

// ─── Main builder ─────────────────────────────────────────

interface WishCardBuilderProps {
  onSuccess?: () => void;
  initialWish?: Wish;
}

export default function WishCardBuilder({ onSuccess, initialWish }: WishCardBuilderProps) {
  const isEditMode = !!initialWish;

  const [name, setName] = useState(initialWish?.name ?? "");
  const [message, setMessage] = useState(initialWish?.message ?? "");
  const [cardColor, setCardColor] = useState(initialWish?.cardColor ?? CARD_COLORS[0].hex);
  const [illustration, setIllustration] = useState<string | null>(
    initialWish?.illustration ?? ILLUSTRATIONS[0].key
  );
  const [mediaTab, setMediaTab] = useState<MediaTab>(() => resolveInitialMediaTab(initialWish));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(
    initialWish?.image && !initialWish.image.startsWith("/") ? initialWish.image : null
  );
  // Preserves existing uploaded image URL when editing (can't turn a URL back into a File)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    initialWish?.image?.startsWith("/") ? initialWish.image : null
  );

  const [nameTouched, setNameTouched] = useState(false);
  const [messageTouched, setMessageTouched] = useState(false);
  const [shakeFields, setShakeFields] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = useMemo(() => countWords(message), [message]);
  const wordLimitExceeded = wordCount > WORD_LIMIT;
  const nameError = nameTouched && !name.trim() ? "Name is required" : null;
  const messageError = messageTouched && !message.trim() ? "Message is required" : null;
  const wordError = wordLimitExceeded ? `${wordCount} / ${WORD_LIMIT} words — too long` : null;

  const handleTabChange = useCallback((tab: MediaTab) => {
    setMediaTab(tab);
    if (tab !== "upload") { setImageFile(null); setExistingImageUrl(null); }
    if (tab !== "gif") setGifUrl(null);
    if (tab !== "illustration") setIllustration(null);
    else setIllustration(ILLUSTRATIONS[0].key);
  }, []);

  const handleIllustrationSelect = useCallback((key: string) => {
    setIllustration(key);
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    setImageFile(file);
  }, []);

  const handleGifSelect = useCallback((url: string | null) => {
    setGifUrl(url);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    setMessageTouched(true);
    setError(null);

    const hasErrors = !name.trim() || !message.trim() || wordLimitExceeded;
    if (hasErrors) {
      setShakeFields(true);
      setTimeout(() => setShakeFields(false), 600);
      if (!name.trim()) nameRef.current?.focus();
      else if (!message.trim() || wordLimitExceeded) messageRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | undefined;

      if (mediaTab === "upload") {
        if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          if (!uploadRes.ok) {
            const data = await uploadRes.json().catch(() => ({}));
            const msg = [data?.error, data?.detail].filter(Boolean).join(" — ") || `Image upload failed (${uploadRes.status})`;
            throw new Error(msg);
          }
          imageUrl = (await uploadRes.json()).url;
        } else if (existingImageUrl) {
          // Preserve existing uploaded image if user didn't pick a new one
          imageUrl = existingImageUrl;
        }
      } else if (mediaTab === "gif" && gifUrl) {
        imageUrl = gifUrl;
      }

      const payload = {
        name: name.trim(),
        message: message.trim(),
        cardColor,
        illustration: mediaTab === "illustration" ? illustration ?? undefined : undefined,
        image: imageUrl,
      };

      if (isEditMode && initialWish) {
        const res = await fetch(`/api/wishes/${initialWish.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to update wish");
        }
      } else {
        const res = await fetch("/api/wishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to submit wish");
        }
        const newWish = await res.json();
        markWishOwned(newWish.id);
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [name, message, cardColor, illustration, imageFile, gifUrl, existingImageUrl, mediaTab, isEditMode, initialWish, wordLimitExceeded, onSuccess]);

  // ── Success state ────────────────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div style={{ fontSize: "3rem", lineHeight: 1, marginBottom: 16 }}>{isEditMode ? "✏️" : "🎉"}</div>
        <p className="font-semibold text-lg mb-1" style={{ color: "var(--ds-text, #172B4D)" }}>
          {isEditMode ? "Wish updated!" : "Wish sent!"}
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--ds-text-subtlest, #6B778C)" }}>
          {isEditMode ? "Your card has been updated on the board." : "Your card has been added to the board."}
        </p>
        <Button
          appearance="subtle"
          onClick={() => {
            setSuccess(false);
            setName("");
            setMessage("");
            setImageFile(null);
            setGifUrl(null);
            setIllustration(ILLUSTRATIONS[0].key);
            setMediaTab("illustration");
            setNameTouched(false);
            setMessageTouched(false);
            setShakeFields(false);
          }}
        >
          Send another wish
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col lg:flex-row gap-0 min-h-0">

        {/* ── Left: controls ─────────────────────────────── */}
        <div
          className="flex-1 flex flex-col gap-5 p-6 overflow-y-auto"
          style={{ maxHeight: "70vh" }}
        >
          {/* Name */}
          <div>
            <label
              htmlFor="wb-name"
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--ds-text, #172B4D)" }}
            >
              Your name <span style={{ color: "var(--ds-text-danger, #AE2E24)" }}>*</span>
            </label>
            <input
              ref={nameRef}
              id="wb-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder="e.g. Jane"
              maxLength={100}
              disabled={loading}
              className={`w-full rounded-md px-3 py-2 text-sm${nameError && shakeFields ? " animate-shake" : ""}`}
              style={{
                border: nameError
                  ? "2px solid var(--ds-border-danger, #AE2E24)"
                  : "2px solid var(--ds-border, #DFE1E6)",
                outline: "none",
                color: "var(--ds-text, #172B4D)",
                background: "var(--ds-background-input, #FAFBFC)",
                transition: "border-color 0.15s",
              }}
              aria-required
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "wb-name-error" : undefined}
            />
            {nameError && (
              <p id="wb-name-error" className="mt-1 text-xs" style={{ color: "var(--ds-text-danger, #AE2E24)" }} role="alert">
                {nameError}
              </p>
            )}
          </div>

          {/* Card color */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--ds-text, #172B4D)" }}>
              Card color
            </p>
            <div className="flex gap-3">
              {CARD_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => setCardColor(c.hex)}
                  disabled={loading}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: c.hex,
                    border: "3px solid transparent",
                    outline: "3px solid transparent",
                    outlineOffset: 2,
                    cursor: "pointer",
                    transition: "box-shadow 0.12s",
                    boxShadow: cardColor === c.hex ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Media picker — 3-tab */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--ds-text, #172B4D)" }}>
              Card image
            </p>

            {/* Tab bar */}
            <div
              className="flex rounded-lg overflow-hidden mb-3 media-tab-bar"
              style={{ border: "1px solid var(--ds-border, #DFE1E6)", width: "fit-content" }}
            >
              {TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  disabled={loading}
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    border: "none",
                    borderLeft: i > 0 ? "1px solid var(--ds-border, #DFE1E6)" : "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    background: mediaTab === tab.id
                      ? "var(--tab-active-bg, var(--ds-background-selected, #DEEBFF))"
                      : "var(--tab-bg, var(--ds-background-neutral, #F4F5F7))",
                    color: mediaTab === tab.id
                      ? "var(--tab-active-color, var(--ds-text-selected, #0052CC))"
                      : "var(--tab-inactive-color, var(--ds-text-subtle, #44546F))",
                    transition: "background 0.12s, color 0.12s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            <AnimatePresence mode="wait">
              {mediaTab === "illustration" && (
                <motion.div
                  key="illustration"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 8,
                    }}
                  >
                    {ILLUSTRATIONS.map((ill) => (
                      <button
                        key={ill.key}
                        type="button"
                        aria-label={ill.label}
                        title={ill.label}
                        onClick={() => handleIllustrationSelect(ill.key)}
                        disabled={loading}
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          borderRadius: 10,
                          border: illustration === ill.key
                            ? "2px solid var(--ds-border-focused, #0052CC)"
                            : "2px solid var(--ds-border, #DFE1E6)",
                          background: illustration === ill.key
                            ? "var(--ds-background-selected, #DEEBFF)"
                            : "var(--ds-background-neutral, #F4F5F7)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "border-color 0.12s, background 0.12s",
                          padding: 8,
                          overflow: "hidden",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ill.src}
                          alt={ill.label}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {mediaTab === "upload" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {existingImageUrl && !imageFile && (
                    <div className="mb-2 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={existingImageUrl}
                        alt="Current"
                        style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid var(--ds-border, #DFE1E6)" }}
                      />
                      <span className="text-xs" style={{ color: "var(--ds-text-subtlest, #6B778C)" }}>
                        Current image — upload a new one to replace it
                      </span>
                    </div>
                  )}
                  <ImageUpload value={imageFile} onChange={handleImageChange} disabled={loading} />
                </motion.div>
              )}

              {mediaTab === "gif" && (
                <motion.div
                  key="gif"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <GifPicker selected={gifUrl} onSelect={handleGifSelect} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Message */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label
                htmlFor="wb-message"
                className="text-sm font-semibold"
                style={{ color: "var(--ds-text, #172B4D)" }}
              >
                Your message <span style={{ color: "var(--ds-text-danger, #AE2E24)" }}>*</span>
              </label>
              <span
                className="text-xs"
                style={{ color: wordLimitExceeded ? "var(--ds-text-danger, #AE2E24)" : "var(--ds-text-subtlest, #6B778C)" }}
              >
                {wordCount} / {WORD_LIMIT} words
              </span>
            </div>
            <textarea
              ref={messageRef}
              id="wb-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => setMessageTouched(true)}
              placeholder={getMessagePlaceholder(sitePersonName)}
              rows={4}
              disabled={loading}
              className={`w-full rounded-md px-3 py-2 text-sm resize-none${(messageError || wordError) && shakeFields ? " animate-shake" : ""}`}
              style={{
                border: messageError || wordError
                  ? "2px solid var(--ds-border-danger, #AE2E24)"
                  : "2px solid var(--ds-border, #DFE1E6)",
                outline: "none",
                color: "var(--ds-text, #172B4D)",
                background: "var(--ds-background-input, #FAFBFC)",
                transition: "border-color 0.15s",
              }}
              aria-required
              aria-invalid={!!(messageError || wordError)}
            />
            {(messageError || wordError) && (
              <p className="mt-1 text-xs" style={{ color: "var(--ds-text-danger, #AE2E24)" }} role="alert">
                {messageError ?? wordError}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--ds-text-danger, #AE2E24)" }} role="alert">
              {error}
            </p>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              appearance="primary"
              isDisabled={loading}
              isLoading={loading}
            >
              Send wish
            </Button>
          </div>
        </div>

        {/* ── Right: live preview ─────────────────────────── */}
        <div
          className="hidden lg:flex flex-col justify-start p-6 preview-panel"
          style={{
            width: 280,
            flexShrink: 0,
            borderLeft: "1px solid var(--ds-border, #DFE1E6)",
            background: "var(--ds-background-neutral, #F4F5F7)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--ds-text-subtlest, #6B778C)" }}
          >
            Preview
          </p>
          <CardPreview
            cardColor={cardColor}
            illustration={mediaTab === "illustration" ? illustration : null}
            imageFile={mediaTab === "upload" ? imageFile : null}
            gifUrl={mediaTab === "gif" ? gifUrl : null}
            existingImageUrl={mediaTab === "upload" ? existingImageUrl : null}
            message={message}
            name={name}
          />
        </div>

      </div>
    </form>
  );
}
