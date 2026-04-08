"use client";

import Header from "@/components/Header";
import { WishModalProvider } from "@/components/WishModalContext";
import SpotlightBackground from "@/components/SpotlightBackground";
import Starfield from "@/components/Starfield";

export default function LayoutShell({
  teamName,
  occasionDate,
  darkUI = false,
  children,
}: {
  teamName: string;
  occasionDate: string;
  darkUI?: boolean;
  children: React.ReactNode;
}) {
  return (
    <WishModalProvider>
      {darkUI && <Starfield />}
      <SpotlightBackground darkUI={darkUI} />

      <Header teamName={teamName} occasionDate={occasionDate} darkUI={darkUI} />
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-8 sm:px-6 sm:pt-28 lg:px-8" style={{ position: "relative", zIndex: 1 }}>
        <main>{children}</main>
      </div>
    </WishModalProvider>
  );
}
