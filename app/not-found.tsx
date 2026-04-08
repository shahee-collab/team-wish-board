import { getNotFoundMessage } from "@/lib/occasion";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-text-primary mb-2">
        Page Not Found
      </h2>
      <p className="text-text-secondary mb-6 max-w-md">
        {getNotFoundMessage()}
      </p>
      <a
        href="/"
        className="rounded-lg font-medium py-2.5 px-6 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
        style={{ background: "var(--board-error-btn, var(--primary, #0052CC))", color: "#fff" }}
      >
        Go back home
      </a>
    </div>
  );
}
