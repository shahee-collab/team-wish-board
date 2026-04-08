import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import LayoutShell from "@/components/LayoutShell";
import AtlaskitTheme from "@/components/AtlaskitTheme";
import { sitePersonName, siteTeamName, siteOccasionDate } from "@/lib/site";
import { isDarkUI } from "@/lib/ui";
import { getBoardTitle, getMetaDescription } from "@/lib/occasion";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-dark",
  weight: ["400", "500", "600", "700"],
});

export function generateMetadata(): Metadata {
  return {
    title: getBoardTitle(sitePersonName),
    description: getMetaDescription(sitePersonName, siteTeamName),
  };
}

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: isDarkUI ? "#1e1e1e" : "#0052CC",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const htmlClass = [
    inter.variable,
    isDarkUI ? jetbrainsMono.variable : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html
      lang="en"
      className={htmlClass}
      data-color-mode={isDarkUI ? "dark" : "light"}
      data-theme={isDarkUI ? "dark:dark" : "light:light"}
      data-ui={isDarkUI ? "dark" : "default"}
    >
      <head>
        {!isDarkUI && <AtlaskitTheme />}
      </head>
      <body className="min-h-screen font-sans antialiased">
        <ErrorBoundary>
          <LayoutShell teamName={siteTeamName} occasionDate={siteOccasionDate} darkUI={isDarkUI}>
            {children}
          </LayoutShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
