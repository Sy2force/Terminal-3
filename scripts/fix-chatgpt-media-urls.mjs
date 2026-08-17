#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(process.cwd(), ".env"), "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k, v.join("=")];
    }),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function normalizeUrl(url) {
  return url.replace(/,/g, "").replace(/ /g, "_").replace(/:/g, "_");
}

async function main() {
  const { data, error } = await supabase.from("product_media").select("id, url");
  if (error) { console.error(error.message); process.exit(1); }
  let updated = 0;
  for (const { id, url } of data) {
    if (!/ChatGPT Image/.test(url)) continue;
    const newUrl = normalizeUrl(url);
    const filePath = path.join(process.cwd(), "public", newUrl);
    if (fs.existsSync(filePath)) {
      const { error: u } = await supabase.from("product_media").update({ url: newUrl }).eq("id", id);
      if (!u) { updated++; console.log("✅", newUrl); }
      else console.log("❌ update", u.message);
    } else {
      console.log("⚠️ missing file", newUrl);
    }
  }
  console.log(`Updated ${updated} URLs`);
}

main();
