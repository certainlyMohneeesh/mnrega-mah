export default function LoadingStatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section Skeleton */}
      <section className="relative py-12 md:py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6 flex items-center gap-2">
            <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
          </div>

          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-32 bg-primary/20 animate-pulse rounded-full"></div>
            <div className="h-12 w-64 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-96 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="py-12 container mx-auto px-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </section>

      {/* Districts Section Skeleton */}
      <section className="py-12 bg-accent/5">
        <div className="container mx-auto px-4">
          {/* Search Skeleton */}
          <div className="mb-8 h-12 w-full max-w-lg bg-muted animate-pulse rounded-lg"></div>

          {/* Districts Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
