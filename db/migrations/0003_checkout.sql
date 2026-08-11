-- TERMINAL 3 — checkout support
-- Adds fulfillment (pickup/delivery) details to orders, a customer
-- self-declaration flag for age-restricted items, and an automatic
-- profile row creation trigger so every authenticated user has a
-- `profiles` row without any extra client-side round trip.

create type order_fulfillment_type as enum ('pickup', 'delivery');

alter table orders
  add column fulfillment_type order_fulfillment_type not null default 'pickup',
  add column delivery_address text,
  add column customer_notes text,
  -- Customer self-declaration at checkout ("I am 18+"). This is NOT proof of
  -- age — real verification still happens via the `age_verifications` table,
  -- confirmed by staff/the delivery person against a physical teuda.
  add column age_self_declared boolean not null default false,
  add constraint delivery_requires_address check (
    fulfillment_type = 'pickup' or delivery_address is not null
  );

-- ============================================================
-- Auto-create a `profiles` row whenever a new auth user is created.
-- ============================================================

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, phone)
  values (new.id, new.email, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();
