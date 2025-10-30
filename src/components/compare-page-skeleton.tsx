export function ComparePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-accent-purple-50">
      {/* Header Skeleton */}
      <div className="bg-accent-purple py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-4 w-32 bg-white/20 rounded mb-4 animate-pulse" />
          <div className="h-10 w-64 bg-white/30 rounded mb-2 animate-pulse" />
          <div className="h-6 w-96 bg-white/20 rounded animate-pulse" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* District Selection Skeleton */}
        <section>
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-100 rounded mb-4" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Charts Skeleton */}
        {[...Array(3)].map((_, i) => (
          <section key={i}>
            <div className="bg-white rounded-lg border p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-4 w-64 bg-gray-100 rounded mb-6 animate-pulse" />
              <div className="h-[400px] bg-gray-50 rounded animate-pulse" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
