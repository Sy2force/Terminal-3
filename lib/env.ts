import { z } from "zod";

/**
 * Environment validation.
 *
 * Runs at server startup (instrumentation.ts register()) and can be reused
 * by diagnostics. In demo mode (NEXT_PUBLIC_DEMO_MODE=true) the Supabase
 * requirements are downgraded to warnings because the app intentionally
 * runs without a live backend.
 */

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL doit être une URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, "NEXT_PUBLIC_SUPABASE_ANON_KEY invalide"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "SUPABASE_SERVICE_ROLE_KEY invalide"),
});

const optionalSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_DEMO_MODE: z.enum(["true", "false"]).optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),
  CRON_SECRET: z.string().min(16).optional(),
});

export interface EnvReport {
  ok: boolean;
  demoMode: boolean;
  missing: string[];
  invalid: string[];
  warnings: string[];
}

export function validateEnv(env: NodeJS.ProcessEnv = process.env): EnvReport {
  const demoMode = env.NEXT_PUBLIC_DEMO_MODE === "true";
  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  const required = serverSchema.safeParse(env);
  if (!required.success) {
    for (const issue of required.error.issues) {
      const key = String(issue.path[0]);
      if (env[key] === undefined) missing.push(key);
      else invalid.push(`${key}: ${issue.message}`);
    }
  }

  const optional = optionalSchema.safeParse(env);
  if (!optional.success) {
    for (const issue of optional.error.issues) {
      const key = String(issue.path[0]);
      warnings.push(`${key}: ${issue.message}`);
    }
  }

  if (!env.ADMIN_PASSWORD) warnings.push("ADMIN_PASSWORD non défini — la connexion admin de secours est inactive.");
  if (!env.ADMIN_SESSION_SECRET) warnings.push("ADMIN_SESSION_SECRET non défini — les cookies admin signés sont indisponibles.");
  if (demoMode) warnings.push("NEXT_PUBLIC_DEMO_MODE=true — données de démonstration, ne pas utiliser en production.");

  return {
    ok: demoMode ? invalid.length === 0 : missing.length === 0 && invalid.length === 0,
    demoMode,
    missing: demoMode ? [] : missing,
    invalid,
    warnings,
  };
}

/** Logs a human-readable report; never throws. */
export function reportEnvIssues(report: EnvReport): void {
  for (const key of report.missing) {
    console.error(`[env] Variable obligatoire manquante : ${key}`);
  }
  for (const issue of report.invalid) {
    console.error(`[env] Variable invalide : ${issue}`);
  }
  for (const warning of report.warnings) {
    console.warn(`[env] ${warning}`);
  }
}
