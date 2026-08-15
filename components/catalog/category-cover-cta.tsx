import { ArrowDown } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

type CoverVariant = "gold" | "bordeaux" | "sarfati" | "delicatess" | "dark";

/**
 * Shared CTA used on every category cover (vins, spiritueux, poissons,
 * charcuterie, plateaux, promotions). Centralizes the button so each
 * page only chooses a variant instead of duplicating button markup —
 * colors themselves come from GlassButton's variant map and the CSS
 * custom properties in globals.css, never inline hex values here.
 */
export function CategoryCoverCta({
  variant,
  label = "Voir la sélection",
  targetId = "catalogue",
}: {
  variant: CoverVariant;
  label?: string;
  targetId?: string;
}) {
  return (
    <div className="mt-8">
      <GlassButton href={`#${targetId}`} variant={variant} icon={ArrowDown}>
        {label}
      </GlassButton>
    </div>
  );
}
