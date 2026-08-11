/**
 * Demo mode detection.
 *
 * Demo mode is ONLY for local development without a live Supabase instance.
 * It uses mock data so the UI can be previewed.
 *
 * In production, if Supabase is misconfigured, the app will fail safely
 * rather than silently showing fake commercial data.
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
