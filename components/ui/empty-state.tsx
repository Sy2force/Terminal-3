export function EmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-sm border border-white/5 bg-graphite/40 px-6 py-16 text-center ${className ?? ""}`}
    >
      <p className="font-serif text-lg text-ivory/80">{message}</p>
    </div>
  );
}
