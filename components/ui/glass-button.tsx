import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type GlassVariant =
  | "dark"
  | "gold"
  | "bordeaux"
  | "sarfati"
  | "delicatess";

interface GlassButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: GlassVariant;
  icon?: LucideIcon;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variantClasses: Record<GlassVariant, string> = {
  dark: "border-white/20 bg-white/5 text-[#F7F0E4] shadow-black/30 before:via-white/20 hover:bg-white/10",
  gold: "border-[#C6A15B]/40 bg-[#C6A15B]/10 text-[#C6A15B] shadow-[#C6A15B]/20 before:via-[#C6A15B]/30 hover:bg-[#C6A15B]/20",
  bordeaux: "border-[#692031]/40 bg-[#692031]/15 text-[#F7F0E4] shadow-[#692031]/20 before:via-[#7B3140]/30 hover:bg-[#692031]/25",
  sarfati: "border-[#3F6170]/40 bg-[#3F6170]/15 text-[#F7F0E4] shadow-[#3F6170]/20 before:via-[#466268]/30 hover:bg-[#3F6170]/25",
  delicatess: "border-[#C6A15B]/40 bg-[#1B1814]/80 text-[#C6A15B] shadow-black/40 before:via-[#C6A15B]/20 hover:bg-[#1B1814]",
};

export function GlassButton({
  href,
  onClick,
  children,
  variant = "dark",
  icon: Icon,
  className,
  type = "button",
  disabled,
}: GlassButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm border px-7 py-3.5 text-sm font-medium tracking-wide backdrop-blur-md transition-all duration-200",
    "shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C6A15B] focus-visible:ring-offset-[#151411]",
    "active:scale-[0.98]",
    variantClasses[variant],
    "before:absolute before:left-0 before:top-0 before:h-px before:w-full before:bg-gradient-to-r before:from-transparent before:to-transparent",
    "after:absolute after:bottom-0 after:left-0 after:h-1/2 after:w-full after:bg-gradient-to-t after:from-black/20 after:to-transparent",
    disabled && "opacity-50 cursor-not-allowed",
    className,
  );

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4 transition-transform group-hover:-rotate-6" />}
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
