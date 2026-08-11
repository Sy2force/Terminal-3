export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-[4/5] w-full animate-pulse rounded-sm bg-graphite/50" />
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-3 w-20 animate-pulse rounded-full bg-graphite/50" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-graphite/50" />
        <div className="h-3 w-full animate-pulse rounded-full bg-graphite/40" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded-full bg-graphite/40" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
