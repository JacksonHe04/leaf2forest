import { LeafMotif } from "./LeafMotif";

/**
 * PageSkeleton — lightweight loading indicator shown while server
 * components fetch data. Renders instantly so the user gets
 * immediate feedback on navigation.
 */
export function PageSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="shimmer-paper h-3 w-24 rounded mb-3" />
        <div className="shimmer-paper h-9 w-72 rounded" />
        <div className="shimmer-paper h-4 w-96 rounded mt-3" />
      </div>

      {/* Content skeleton — 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="surface-paper rounded-md p-5 space-y-3">
            <div className="shimmer-paper h-4 w-2/3 rounded" />
            <div className="shimmer-paper h-3 w-full rounded" />
            <div className="shimmer-paper h-3 w-4/5 rounded" />
            <div className="shimmer-paper h-20 w-full rounded mt-2" />
            <div className="shimmer-paper h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>

      {/* Closing mark */}
      <div className="mt-10 flex justify-center">
        <LeafMotif variant="sprig" className="h-7 w-20 text-forest/20" />
      </div>
    </main>
  );
}
