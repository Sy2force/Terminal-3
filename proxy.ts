import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");
  const res = await updateSession(request);
  res.headers.set("x-is-admin", isAdmin ? "1" : "0");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
