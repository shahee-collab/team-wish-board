"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Wish } from "@/lib/types";
import WishModal from "./WishModal";
import { fireCelebration } from "@/lib/celebration";

type WishModalContextValue = {
  isOpen: boolean;
  openWishModal: () => void;
  openEditModal: (wish: Wish) => void;
};

const WishModalContext = createContext<WishModalContextValue | null>(null);

export function useWishModal() {
  return useContext(WishModalContext);
}

export function WishModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const isEditRef = useRef(false);

  const openWishModal = useCallback(() => {
    isEditRef.current = false;
    setEditingWish(null);
    setOpen(true);
  }, []);

  const openEditModal = useCallback((wish: Wish) => {
    isEditRef.current = true;
    setEditingWish(wish);
    setOpen(true);
  }, []);

  const closeWishModal = useCallback(() => {
    setOpen(false);
    setEditingWish(null);
  }, []);

  const handleSuccess = useCallback(() => {
    const wasNewWish = !isEditRef.current;
    setOpen(false);
    setEditingWish(null);
    window.dispatchEvent(new CustomEvent("wishes-updated"));
    // Fire celebration only when a brand-new wish is sent
    if (wasNewWish) fireCelebration();
  }, []);

  const value = useMemo(() => ({ isOpen: open, openWishModal, openEditModal }), [open, openWishModal, openEditModal]);

  return (
    <WishModalContext.Provider value={value}>
      {children}
      <WishModal
        open={open}
        onClose={closeWishModal}
        onSuccess={handleSuccess}
        initialWish={editingWish ?? undefined}
      />
    </WishModalContext.Provider>
  );
}
