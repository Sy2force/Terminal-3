export function WineCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-brun-cave/40 bg-[#FAF7F0]">
      <div className="aspect-[3/4] w-full animate-pulse bg-beige-fonce/60" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded-sm bg-beige-fonce/60" />
        <div className="h-5 w-3/4 animate-pulse rounded-sm bg-beige-fonce/60" />
        <div className="h-3 w-1/2 animate-pulse rounded-sm bg-beige-fonce/60" />
        <div className="mt-4 h-9 w-full animate-pulse rounded-sm bg-beige-fonce/60" />
      </div>
    </div>
  );
}
