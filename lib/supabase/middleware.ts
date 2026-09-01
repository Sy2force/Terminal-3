import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminCookie } from "@/lib/admin/admin-cookie";

const CUSTOMER_PROTECTED_PREFIXES = ["/account", "/compte", "/checkout", "/demande-produit"];

/**
 * Refreshes the Supabase auth session only for customer-protected routes and
 * checks the admin cookie for admin routes. Public catalog pages skip Supabase
 * entirely to keep first byte fast.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  // Admin login must not be gated, otherwise infinite redirects.
  if (pathname.startsWith("/admin/login")) {
    return response;
  }

  // Admin area: check the signed cookie, do not call Supabase Auth.
  if (pathname.startsWith("/admin")) {
    const adminCookie = request.cookies.get("admin_session")?.value;
    const adminSession = await verifyAdminCookie(
      adminCookie,
      process.env.ADMIN_SESSION_SECRET,
    );
    if (adminSession) {
      return response;
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Public routes: skip Supabase entirely.
  const isCustomerProtected = CUSTOMER_PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (!isCustomerProtected) {
    return response;
  }

  // Customer-protected routes: verify Supabase session.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
