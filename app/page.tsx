"use client";

import { useState, useEffect, useCallback } from "react";
import type { Wish } from "@/lib/types";
import WishWall from "@/components/WishWall";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useWishModal } from "@/components/WishModalContext";
import { fireOccasionConfetti } from "@/lib/celebration";
import { siteOccasionDate } from "@/lib/site";

const OCCASION_DATE = siteOccasionDate;
const SESSION_KEY = "wish-board-confetti-fired";

function isOccasionDayOrAfter(): boolean {
  if (!OCCASION_DATE) return false;
  const target = new Date(OCCASION_DATE);
  const now = new Date();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return today >= targetDay;
}

export default function HomePage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const wishModal = useWishModal();

  const fetchWishes = useCallback(async () => {
    setFetchError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/wishes", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setWishes(data);
      } else {
        setFetchError("Could not load wishes. Please refresh.");
      }
    } catch {
      clearTimeout(timeoutId);
      setFetchError("Could not load wishes. Please refresh.");
      setWishes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  useEffect(() => {
    const handler = () => fetchWishes();
    window.addEventListener("wishes-updated", handler);
    return () => window.removeEventListener("wishes-updated", handler);
  }, [fetchWishes]);

  useEffect(() => {
    if (loading) return;
    if (!isOccasionDayOrAfter()) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = setTimeout(() => fireOccasionConfetti(), 500);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <div role="main">
      {loading ? (
        <LoadingSkeleton />
      ) : fetchError ? (
        <div className="board-error-panel rounded-2xl border-4 p-8 text-center">
          <p className="mb-4 font-medium" style={{ color: "var(--board-error-text, #6B6E76)" }} role="alert">
            {fetchError}
          </p>
          <button
            type="button"
            onClick={() => { setLoading(true); fetchWishes(); }}
            className="rounded-lg text-white font-bold py-2.5 px-6 shadow-md transition-all"
            style={{ background: "var(--board-error-btn, #0052CC)" }}
          >
            Try again
          </button>
        </div>
      ) : (
        <WishWall
          wishes={wishes}
          onAddTile={() => wishModal?.openWishModal()}
        />
      )}
    </div>
  );
}
