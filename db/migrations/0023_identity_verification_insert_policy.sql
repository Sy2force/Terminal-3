-- Allows a customer to insert their own identity verification document rows
-- (metadata only — the file itself lives in the private "identity-docs"
-- bucket, gated separately by storage policies). Missing from 0021, which
-- only granted owner SELECT and admin ALL.

alter table identity_verifications enable row level security;

drop policy if exists "identity_verifications_owner_insert" on identity_verifications;
create policy "identity_verifications_owner_insert"
  on identity_verifications for insert
  with check (auth.uid() = user_id);

-- Also allow customer_addresses insert explicitly (owner policy used "for
-- all" which already covers insert, kept here as a safety no-op check).
drop policy if exists "customer_addresses_owner_insert" on customer_addresses;
create policy "customer_addresses_owner_insert"
  on customer_addresses for insert
  with check (auth.uid() = user_id);
