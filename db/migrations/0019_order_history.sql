-- TERMINAL 3 — Order history and payment tracking
-- Adds immutable order notes, order status history and completes the
-- payment-status workflow. Non-destructive and additive.

begin;

-- ============================================================
-- 1. ORDER INTERNAL NOTES
-- ============================================================

create table if not exists order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  note text not null,
  author_id uuid references profiles(id) on delete set null,
  author_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_notes_order on order_notes (order_id);
create index if not exists idx_order_notes_created on order_notes (created_at desc);

alter table order_notes enable row level security;

drop policy if exists "order_notes_admin_all" on order_notes;
create policy "order_notes_admin_all"
  on order_notes for all
  using (is_admin_user())
  with check (is_admin_user());

-- ============================================================
-- 2. ORDER STATUS HISTORY
-- ============================================================

create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references profiles(id) on delete set null,
  changed_by_name text,
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order on order_status_history (order_id);
create index if not exists idx_order_status_history_created on order_status_history (created_at desc);

alter table order_status_history enable row level security;

drop policy if exists "order_status_history_admin_all" on order_status_history;
create policy "order_status_history_admin_all"
  on order_status_history for all
  using (is_admin_user())
  with check (is_admin_user());

-- ============================================================
-- 3. PAYMENT IDEMPOTENCY
-- ============================================================

alter table payments
  add column if not exists idempotency_key text;

create index if not exists idx_payments_idempotency on payments (order_id, idempotency_key);

-- ============================================================
-- 4. PAYMENT TRIGGERS — history mirror
-- ============================================================

create or replace function payment_status_history_trigger()
returns trigger as $$
begin
  insert into payment_status_history (
    payment_id,
    order_id,
    old_status,
    new_status,
    amount_agorot,
    changed_by,
    comment
  )
  values (
    new.id,
    new.order_id,
    old.status,
    new.status,
    new.amount_agorot,
    new.collected_by,
    new.notes
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists payment_status_history_on_change on payments;
create trigger payment_status_history_on_change
  after insert or update of status on payments
  for each row
  execute function payment_status_history_trigger();

-- ============================================================
-- 4. ORDER STATUS TRIGGERS — disabled in favour of explicit calls
-- that record the actual staff user making the change.
-- ============================================================

drop trigger if exists order_status_history_on_update on orders;
drop function if exists order_status_history_trigger();

commit;
