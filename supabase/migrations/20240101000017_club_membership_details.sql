-- TERMINAL 3 — Club membership details
-- Adds the signup details requested on /club (date of birth, preferred
-- language, category preferences, marketing consent, privacy policy
-- acceptance) that `club_memberships` was missing. Purely additive —
-- every column is nullable or has a safe default, no existing rows are
-- touched, dropped, or renamed.

begin;

alter table club_memberships
  add column if not exists date_of_birth date,
  add column if not exists preferred_language text,
  add column if not exists preferences text[] not null default '{}',
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists privacy_accepted boolean not null default false;

commit;
