import { cn } from "@/lib/utils";

const VARIANTS = {
  gold: "border-champagne/50 text-champagne",
  ivory: "border-ivory/30 text-ivory/90",
  amber: "border-amber-400/60 text-amber-300",
} as const;

export function Badge({
  children,
  variant = "gold",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
