"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 max-w-lg">
        <h2 className="text-2xl font-semibold text-red-900 mb-3">
          Something went wrong
        </h2>
        <p className="text-sm text-red-700 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary text-white font-medium py-2.5 px-6 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
