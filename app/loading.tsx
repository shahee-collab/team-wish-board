export default function Loading() {
  return (
    <div className="space-y-10" role="status" aria-label="Loading wishes">
      <section>
        <div className="h-8 w-48 bg-border rounded animate-pulse mb-4" />
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="h-10 bg-border rounded animate-pulse" />
          <div className="h-32 bg-border rounded animate-pulse" />
          <div className="h-10 bg-border rounded animate-pulse" />
        </div>
      </section>

      <section>
        <div className="h-7 w-32 bg-border rounded animate-pulse mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface p-4 animate-pulse"
            >
              <div className="h-4 bg-border rounded w-1/3 mb-2" />
              <div className="h-3 bg-border rounded w-full mb-1" />
              <div className="h-3 bg-border rounded w-2/3 mb-2" />
              <div className="h-32 bg-border rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
