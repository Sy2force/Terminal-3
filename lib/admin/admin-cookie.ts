const COOKIE_NAME = "admin_session";

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const bin = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): string {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4);
  const bytes = new Uint8Array(
    Array.from(atob(padded)).map((c) => c.charCodeAt(0)),
  );
  return new TextDecoder().decode(bytes);
}

export interface AdminCookiePayload {
  u: string;
  r: string;
  t: number;
}

export interface AdminCookieSession {
  userId: string;
  role: string;
  email: string;
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

export async function signAdminCookie(
  userId: string,
  role: string,
  secret: string,
): Promise<string> {
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");

  const payload: AdminCookiePayload = { u: userId, r: role, t: Date.now() };
  const payloadString = JSON.stringify(payload);
  const encoded = toBase64Url(payloadString);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(encoded));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${encoded}.${signatureHex}`;
}

export async function verifyAdminCookie(
  cookieValue: string | undefined,
  secret: string | undefined,
): Promise<AdminCookieSession | null> {
  if (!cookieValue || !secret) return null;

  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [encoded, signatureHex] = parts;

  let payload: AdminCookiePayload;
  try {
    payload = JSON.parse(fromBase64Url(encoded)) as AdminCookiePayload;
  } catch {
    return null;
  }

  if (typeof payload.u !== "string" || typeof payload.r !== "string" || typeof payload.t !== "number") {
    return null;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const expected = new Uint8Array(
    Array.from(signatureHex).reduce<number[]>((acc, _, i) => {
      if (i % 2 === 0) acc.push(parseInt(signatureHex.slice(i, i + 2), 16));
      return acc;
    }, []),
  );

  const valid = await crypto.subtle.verify("HMAC", key, expected, encoder.encode(encoded));
  if (!valid) return null;

  // 14 days max
  const maxAge = 14 * 24 * 60 * 60 * 1000;
  if (Date.now() - payload.t > maxAge) return null;

  return {
    userId: payload.u,
    role: payload.r,
    email: "admin@terminal3.co.il",
  };
}
