/**
 * Next.js instrumentation hook — runs once at server startup.
 * Validates required environment variables and logs explicit errors.
 * Never throws: demo mode and CI builds must keep working.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv, reportEnvIssues } = await import("./lib/env");
    reportEnvIssues(validateEnv());
  }
}
