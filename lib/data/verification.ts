import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export type VerificationStatus =
  | "pending_verification"
  | "verified"
  | "rejected"
  | "suspended";

export interface VerificationProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  verificationStatus: VerificationStatus;
  verificationReason: string | null;
  verificationDecidedAt: string | null;
}

/**
 * Returns the current authenticated user's verification profile, or null
 * if not authenticated. Used both by account pages (to show status) and by
 * the checkout gate (to block ordering before `verified`).
 */
export async function getMyVerificationProfile(): Promise<VerificationProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- verification columns are not yet declared in the generated Database type
    .select("id, first_name, last_name, phone, email, verification_status, verification_reason, verification_decided_at" as any)
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    verificationStatus: (row.verification_status ?? "pending_verification") as VerificationStatus,
    verificationReason: row.verification_reason,
    verificationDecidedAt: row.verification_decided_at,
  };
}

export interface IdentityVerificationRow {
  id: string;
  side: "front" | "back";
  storagePath: string;
  status: string;
  createdAt: string;
}

/**
 * Lists the current user's uploaded identity documents (metadata only —
 * never the raw file, which stays in the private bucket behind signed URLs).
 */
export async function getMyIdentityDocuments(): Promise<IdentityVerificationRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("identity_verifications")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("id, side, storage_path, status, created_at" as any)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    side: row.side,
    storagePath: row.storage_path,
    status: row.status,
    createdAt: row.created_at,
  }));
}

/**
 * Generates a short-lived signed URL for a private identity document.
 * Callers MUST already have verified the requester is either the document's
 * owner or an admin (RLS also enforces this at the storage layer).
 */
export async function getSignedIdentityDocUrl(storagePath: string): Promise<string | null> {
  const service = createServiceRoleClient();
  const { data, error } = await service.storage
    .from("identity-docs")
    .createSignedUrl(storagePath, 60 * 5);
  if (error || !data) return null;
  return data.signedUrl;
}
