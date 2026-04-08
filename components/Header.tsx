"use client";

import { sitePersonName, siteOccasionDate } from "@/lib/site";
import { getBoardTitle } from "@/lib/occasion";
import { useWishModal } from "./WishModalContext";
import Button from "@atlaskit/button/new";
import WaveText from "./WaveText";

interface HeaderProps {
  teamName?: string;
  occasionDate: string;
  darkUI?: boolean;
}

const canAddWish = Date.now() < new Date(siteOccasionDate).getTime();

export default function Header({
  teamName = "my-team",
  occasionDate: _occasionDate,
  darkUI = false,
}: HeaderProps) {
  const wishModal = useWishModal();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 w-full"
      style={{
        background: "var(--shell-header-bg, #FFFFFF)",
        borderBottom: "1px solid var(--ds-border, #DFE1E6)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1
                className={darkUI ? "font-dark-mono leading-tight" : "font-sans leading-tight"}
                style={{
                  color: "var(--ds-text, #172B4D)",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                  fontWeight: darkUI ? 600 : 700,
                  letterSpacing: darkUI ? "-0.03em" : "-0.01em",
                }}
              >
                <WaveText text={getBoardTitle(sitePersonName)} />
              </h1>
              <p
                className={`text-xs font-medium uppercase mt-0.5 ${darkUI ? "font-dark-mono" : ""}`}
                style={{
                  color: "var(--ds-text-subtlest, #6B778C)",
                  letterSpacing: darkUI ? "0.14em" : "0.1em",
                  fontSize: darkUI ? "0.65rem" : undefined,
                }}
              >
                {teamName} team
              </p>
            </div>
          </div>

          {canAddWish && (
            <div className="flex-shrink-0 dark-send-wishes">
              {wishModal && (
                <Button appearance="primary" onClick={wishModal.openWishModal}>
                  Send wish
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
