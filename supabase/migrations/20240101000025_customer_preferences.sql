-- Adds customer communication/language preferences to profiles, used by
-- /compte/parametres.

alter table profiles
  add column if not exists preferred_language text not null default 'fr' check (preferred_language in ('fr', 'he')),
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists account_deletion_requested_at timestamptz;
