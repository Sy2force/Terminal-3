import { NextResponse } from "next/server";
import { signAdminCookie } from "@/lib/admin/admin-cookie";
import { timingSafeEqual } from "crypto";

const GENERIC_ERROR = "Mot de passe incorrect ou accès refusé.";
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const attemptsByIp = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attemptsByIp.get(ip);
  if (!entry || now > entry.resetAt) {
    attemptsByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX_ATTEMPTS;
}

function redirectWithError(request: Request): NextResponse {
  return NextResponse.redirect(
    new URL(`/admin/login?error=${encodeURIComponent(GENERIC_ERROR)}`, request.url),
    { status: 303 },
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return redirectWithError(request);
  }

  let formData: FormData;
  let password: string;
  try {
    formData = await request.formData();
    const raw = formData.get("password");
    password = typeof raw === "string" ? raw : "";
  } catch {
    password = "";
  }

  if (!expected || !secret || !password.trim()) {
    return redirectWithError(request);
  }

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(password);

  if (expectedBuf.length !== providedBuf.length) {
    return redirectWithError(request);
  }

  const ok = timingSafeEqual(expectedBuf, providedBuf);
  if (!ok) {
    return redirectWithError(request);
  }

  attemptsByIp.delete(ip);

  const token = await signAdminCookie("admin", "OWNER", secret);

  const response = NextResponse.redirect(new URL("/admin", request.url), {
    status: 303,
  });

  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
