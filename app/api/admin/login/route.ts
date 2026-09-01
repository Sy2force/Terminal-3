import { NextResponse } from "next/server";
import { signAdminCookie } from "@/lib/admin/admin-cookie";
import { timingSafeEqual } from "crypto";

export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  const formData = await request.formData();
  const password = formData.get("password");

  if (!expected || !secret || typeof password !== "string" || !password.trim()) {
    return redirectWithError("Identifiants invalides", request);
  }

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(password);

  if (expectedBuf.length !== providedBuf.length) {
    return redirectWithError("Mot de passe incorrect", request);
  }

  const ok = timingSafeEqual(expectedBuf, providedBuf);
  if (!ok) {
    return redirectWithError("Mot de passe incorrect", request);
  }

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

function redirectWithError(message: string, request: Request): NextResponse {
  return NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent(message)}`, request.url), {
    status: 303,
  });
}
