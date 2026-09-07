export interface ThemeValues extends Record<string, string | undefined> {
  /* Legacy short keys kept for compatibility with existing rows. */
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

export interface DesignToken {
  key: string;
  label: string;
  defaultValue: string;
  group: string;
}

export interface DesignTokenGroup {
  label: string;
  tokens: DesignToken[];
}

export const DESIGN_TOKEN_GROUPS: DesignTokenGroup[] = [
  {
    label: "Marque",
    tokens: [
      { key: "t3-bordeaux-principal", label: "Bordeaux principal", defaultValue: "#692031", group: "Marque" },
      { key: "t3-bordeaux-fonce", label: "Bordeaux foncé", defaultValue: "#551525", group: "Marque" },
      { key: "t3-bordeaux-clair", label: "Bordeaux clair", defaultValue: "#7B3140", group: "Marque" },
      { key: "t3-or-principal", label: "Or principal", defaultValue: "#C6A15B", group: "Marque" },
      { key: "t3-or-clair", label: "Or clair", defaultValue: "#D7B16B", group: "Marque" },
      { key: "t3-creme", label: "Crème", defaultValue: "#F4EFE5", group: "Marque" },
    ],
  },
  {
    label: "Fonds publics",
    tokens: [
      { key: "t3-noir-profond", label: "Noir profond", defaultValue: "#151411", group: "Fonds publics" },
      { key: "t3-noir-chaud", label: "Noir chaud", defaultValue: "#1B1814", group: "Fonds publics" },
      { key: "t3-brun-cave", label: "Brun cave", defaultValue: "#2B211A", group: "Fonds publics" },
      { key: "t3-brun-lumineux", label: "Brun lumineux", defaultValue: "#684734", group: "Fonds publics" },
      { key: "t3-fond-papier", label: "Fond papier", defaultValue: "#FBF8F1", group: "Fonds publics" },
      { key: "t3-beige", label: "Beige", defaultValue: "#EEE7DB", group: "Fonds publics" },
      { key: "t3-beige-fonce", label: "Beige foncé", defaultValue: "#E7DECE", group: "Fonds publics" },
    ],
  },
  {
    label: "Textes publics",
    tokens: [
      { key: "t3-texte-clair", label: "Texte clair", defaultValue: "#F7F0E4", group: "Textes publics" },
      { key: "t3-gris-chaud", label: "Gris chaud", defaultValue: "#71695F", group: "Textes publics" },
    ],
  },
  {
    label: "Accents",
    tokens: [
      { key: "t3-brun-ambre", label: "Brun ambre", defaultValue: "#7C5129", group: "Accents" },
      { key: "t3-cuivre", label: "Cuivre", defaultValue: "#986236", group: "Accents" },
      { key: "t3-cuivre-charcuterie", label: "Cuivre charcuterie", defaultValue: "#8B4936", group: "Accents" },
      { key: "t3-brun-rouge", label: "Brun rouge", defaultValue: "#743B2D", group: "Accents" },
      { key: "t3-noir-poisson", label: "Noir poisson", defaultValue: "#101515", group: "Accents" },
      { key: "t3-noir-poisson-chaud", label: "Noir poisson chaud", defaultValue: "#151A1A", group: "Accents" },
      { key: "t3-bleu-cave", label: "Bleu cave", defaultValue: "#1C2B2E", group: "Accents" },
      { key: "t3-bleu-gris", label: "Bleu gris", defaultValue: "#3F4B4D", group: "Accents" },
      { key: "t3-bleu-mineral", label: "Bleu minéral", defaultValue: "#466268", group: "Accents" },
    ],
  },
  {
    label: "Feedback",
    tokens: [
      { key: "t3-amber-700", label: "Amber 700", defaultValue: "#b45309", group: "Feedback" },
      { key: "t3-amber-900", label: "Amber 900", defaultValue: "#78350f", group: "Feedback" },
      { key: "t3-orange-700", label: "Orange 700", defaultValue: "#c2410c", group: "Feedback" },
      { key: "t3-orange-900", label: "Orange 900", defaultValue: "#7c2d12", group: "Feedback" },
      { key: "t3-slate-600", label: "Slate 600", defaultValue: "#475569", group: "Feedback" },
      { key: "t3-slate-800", label: "Slate 800", defaultValue: "#1e293b", group: "Feedback" },
    ],
  },
  {
    label: "Admin",
    tokens: [
      { key: "admin-bg", label: "Admin fond", defaultValue: "#F7F3EC", group: "Admin" },
      { key: "admin-surface", label: "Admin surface", defaultValue: "#FFFFFF", group: "Admin" },
      { key: "admin-surface-soft", label: "Admin surface soft", defaultValue: "#EFE8DC", group: "Admin" },
      { key: "admin-sidebar", label: "Admin sidebar", defaultValue: "#15130F", group: "Admin" },
      { key: "admin-text", label: "Admin texte", defaultValue: "#1D1B18", group: "Admin" },
      { key: "admin-text-muted", label: "Admin texte muted", defaultValue: "#625C53", group: "Admin" },
      { key: "admin-border", label: "Admin bordure", defaultValue: "#D8CCBA", group: "Admin" },
      { key: "admin-border-strong", label: "Admin bordure forte", defaultValue: "#A99678", group: "Admin" },
      { key: "admin-gold", label: "Admin or", defaultValue: "#C6A15B", group: "Admin" },
      { key: "admin-gold-dark", label: "Admin or foncé", defaultValue: "#87651F", group: "Admin" },
      { key: "admin-burgundy", label: "Admin bordeaux", defaultValue: "#7A2038", group: "Admin" },
      { key: "admin-burgundy-hover", label: "Admin bordeaux hover", defaultValue: "#63172C", group: "Admin" },
      { key: "admin-success", label: "Admin succès", defaultValue: "#2F6B4F", group: "Admin" },
      { key: "admin-warning", label: "Admin avertissement", defaultValue: "#A55F18", group: "Admin" },
      { key: "admin-danger", label: "Admin danger", defaultValue: "#B42332", group: "Admin" },
      { key: "admin-info", label: "Admin info", defaultValue: "#315D82", group: "Admin" },
      { key: "admin-focus", label: "Admin focus", defaultValue: "#7A2038", group: "Admin" },
    ],
  },
  {
    label: "Typographie",
    tokens: [
      { key: "headingFont", label: "Police titres", defaultValue: "var(--font-editorial-serif), serif", group: "Typographie" },
      { key: "bodyFont", label: "Police corps", defaultValue: "var(--font-editorial-sans), sans-serif", group: "Typographie" },
      { key: "borderRadius", label: "Rayon de bordure", defaultValue: "0.125rem", group: "Typographie" },
      { key: "maxContentWidth", label: "Largeur max contenu", defaultValue: "1400px", group: "Typographie" },
    ],
  },
];

const LEGACY_MAP: Record<string, string> = {
  primaryColor: "t3-bordeaux-principal",
  secondaryColor: "t3-bordeaux-fonce",
  accentColor: "t3-or-principal",
  bgDark: "t3-noir-profond",
  bgLight: "t3-fond-papier",
  textLight: "t3-texte-clair",
  textDark: "t3-noir-profond",
};

export const ALL_DESIGN_TOKENS = DESIGN_TOKEN_GROUPS.flatMap((g) => g.tokens);

export const FALLBACK: ThemeValues = Object.fromEntries(
  ALL_DESIGN_TOKENS.map((t) => [t.key, t.defaultValue]),
) as ThemeValues;

export function normalizeThemeValues(stored: Record<string, string>): ThemeValues {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(stored)) {
    if (LEGACY_MAP[key]) {
      normalized[LEGACY_MAP[key]] = value;
    } else {
      normalized[key] = value;
    }
  }
  return { ...FALLBACK, ...normalized };
}

export function themeToCssVars(values: ThemeValues): Record<string, string> {
  const cssVars: Record<string, string> = {};
  for (const token of ALL_DESIGN_TOKENS) {
    const v = values[token.key] ?? token.defaultValue;
    cssVars[`--${token.key}`] = v;
  }

  // Legacy aliases for any direct consumer.
  cssVars["--color-primary"] = values["t3-bordeaux-principal"] ?? FALLBACK["t3-bordeaux-principal"]!;
  cssVars["--color-secondary"] = values["t3-or-principal"] ?? FALLBACK["t3-or-principal"]!;
  cssVars["--color-accent"] = values["t3-or-clair"] ?? FALLBACK["t3-or-clair"]!;
  cssVars["--color-background"] = values["t3-noir-profond"] ?? FALLBACK["t3-noir-profond"]!;
  cssVars["--color-surface"] = values["t3-fond-papier"] ?? FALLBACK["t3-fond-papier"]!;
  cssVars["--color-text"] = values["t3-texte-clair"] ?? FALLBACK["t3-texte-clair"]!;
  cssVars["--font-heading"] = values.headingFont ?? FALLBACK.headingFont!;
  cssVars["--font-body"] = values.bodyFont ?? FALLBACK.bodyFont!;
  cssVars["--radius-card"] = values.borderRadius ?? FALLBACK.borderRadius!;
  cssVars["--radius-button"] = values.borderRadius ?? FALLBACK.borderRadius!;
  cssVars["--content-max-width"] = values.maxContentWidth ?? FALLBACK.maxContentWidth!;

  return cssVars;
}
