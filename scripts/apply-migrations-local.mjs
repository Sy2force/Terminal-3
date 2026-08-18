#!/usr/bin/env node
/**
 * Local, safe migration procedure for the Terminal 3 Supabase project.
 *
 * This script intentionally NEVER writes secrets to stdout or to the repo.
 * It reads the required tokens from environment variables and runs the
 * Supabase CLI in the current terminal.
 *
 * Usage:
 *   node scripts/apply-migrations-local.mjs --dry-run
 *   node scripts/apply-migrations-local.mjs --apply
 *
 * Required env variables (from .env, not committed):
 *   SUPABASE_ACCESS_TOKEN
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *
 * It will abort if any safety check fails.
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const PROJECT_REF = "ewkbyndaiosqestfzsqd";
const EXPECTED_HOST = `https://${PROJECT_REF}.supabase.co`;

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isApply = args.includes("--apply");

if (!isDryRun && !isApply) {
  console.error("Usage: node scripts/apply-migrations-local.mjs --dry-run | --apply");
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function run(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  return execSync(cmd, {
    stdio: "inherit",
    cwd: process.cwd(),
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
    },
    ...opts,
  });
}

async function main() {
  // 1. Verify env without exposing values
  requireEnv("SUPABASE_ACCESS_TOKEN");
  requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl.startsWith(EXPECTED_HOST)) {
    console.error(`Configured Supabase project does not match ${PROJECT_REF}. Aborting.`);
    process.exit(1);
  }

  // 2. Verify CLI is available
  run("supabase --version");

  // 3. Link project
  run(`supabase link --project-ref ${PROJECT_REF}`);

  // 4. Check duplicate slugs before migration
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, slug");
  if (productError) throw productError;

  const productSlugs = new Map();
  const productDuplicates = [];
  for (const p of products ?? []) {
    if (productSlugs.has(p.slug)) {
      productDuplicates.push(p.slug);
    }
    productSlugs.set(p.slug, p.id);
  }

  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug");
  if (categoryError) throw categoryError;

  const categorySlugs = new Map();
  const categoryDuplicates = [];
  for (const c of categories ?? []) {
    if (categorySlugs.has(c.slug)) {
      categoryDuplicates.push(c.slug);
    }
    categorySlugs.set(c.slug, c.id);
  }

  if (productDuplicates.length > 0 || categoryDuplicates.length > 0) {
    console.error("\nDuplicate slugs found. Fix before migration:");
    if (productDuplicates.length) console.error(`  Products: ${[...new Set(productDuplicates)].join(", ")}`);
    if (categoryDuplicates.length) console.error(`  Categories: ${[...new Set(categoryDuplicates)].join(", ")}`);
    process.exit(1);
  }

  console.log(`\nSlug check passed: ${products?.length ?? 0} products, ${categories?.length ?? 0} categories.`);

  // 5. List pending migrations
  run("supabase migration list");

  // 6. Dry-run or apply
  if (isDryRun) {
    console.log("\n--- DRY RUN ---");
    run("supabase db push --dry-run");
  } else {
    console.log("\n--- APPLYING MIGRATIONS ---");
    run("supabase db push");
  }

  // 7. Regenerate types (only when actually applying)
  if (isApply) {
    console.log("\n--- REGENERATING TYPES ---");
    try {
      const output = execSync("supabase gen types typescript --linked", {
        env: process.env,
        cwd: process.cwd(),
        encoding: "utf8",
      });
      writeFileSync("types/supabase.generated.ts", output);
      console.log("Generated types/supabase.generated.ts");
    } catch (err) {
      console.error("Type generation failed:", err.message);
      process.exit(1);
    }
  }

  // 8. Run checks after apply only
  if (isApply) {
    console.log("\n--- RUNNING CHECKS ---");
    run("npm run test:unit");
    run("npm run lint");
    run("npx tsc --noEmit");
    run("npm run build");
  }

  console.log("\nProcedure completed.");
  if (isDryRun) {
    console.log("This was a dry run. Run with --apply to apply migrations.");
  }
}

main().catch((err) => {
  console.error("Procedure failed:", err.message || err);
  process.exit(1);
});
