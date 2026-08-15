import type { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  icon?: LucideIcon;
}

export function Button({
  children,
  variant = "primary",
  icon: Icon,
  className = "",
  ...rest
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-medium uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const styles = {
    primary: "bg-[#692031] text-[#F7F0E4] hover:bg-[#551525]",
    outline: "border border-[#692031] text-[#692031] hover:bg-[#692031] hover:text-[#F7F0E4]",
    ghost: "text-[#71695F] hover:text-[#692031] hover:bg-[#692031]/5",
  };

  return (
    <button type="button" className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
