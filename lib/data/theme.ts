import "server-only";
import { createClient } from "@/lib/supabase/server";
export interface ThemeValues {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  bgDark?: string;
  bgLight?: string;
  textLight?: string;
  textDark?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
  maxContentWidth?: string;
}

const FALLBACK: ThemeValues = {
  primaryColor: "#B97832",
  secondaryColor: "#9B3444",
  accentColor: "#D4AF37",
  bgDark: "#0A0A0A",
  bgLight: "#F1EADC",
  textLight: "#F1EADC",
  textDark: "#151411",
  headingFont: "var(--font-editorial-serif), serif",
  bodyFont: "var(--font-editorial-sans), sans-serif",
  borderRadius: "0.125rem",
  maxContentWidth: "1400px",
};

export async function getPublishedTheme(): Promise<ThemeValues> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("theme_settings")
    .select("value")
    .eq("key", "theme")
    .maybeSingle();

  if (!data?.value) return FALLBACK;
  return { ...FALLBACK, ...(data.value as unknown as ThemeValues) };
}

export function themeToCssVars(values: ThemeValues): Record<string, string> {
  return {
    "--color-primary": values.primaryColor ?? FALLBACK.primaryColor ?? "",
    "--color-secondary": values.secondaryColor ?? FALLBACK.secondaryColor ?? "",
    "--color-accent": values.accentColor ?? FALLBACK.accentColor ?? "",
    "--color-background": values.bgDark ?? FALLBACK.bgDark ?? "",
    "--color-surface": values.bgLight ?? FALLBACK.bgLight ?? "",
    "--color-text": values.textLight ?? FALLBACK.textLight ?? "",
    "--color-muted": "#71695F",
    "--color-border": "rgba(241,234,220,0.1)",
    "--font-heading": values.headingFont ?? FALLBACK.headingFont ?? "",
    "--font-body": values.bodyFont ?? FALLBACK.bodyFont ?? "",
    "--radius-card": values.borderRadius ?? FALLBACK.borderRadius ?? "",
    "--radius-button": values.borderRadius ?? FALLBACK.borderRadius ?? "",
    "--content-max-width": values.maxContentWidth ?? FALLBACK.maxContentWidth ?? "",
  };
}
