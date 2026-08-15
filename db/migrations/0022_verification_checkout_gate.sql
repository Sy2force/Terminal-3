-- ============================================================
-- 0022_verification_checkout_gate.sql
-- Order time estimates, invoices/receipts, and customer-facing read
-- access to their own order status history.
-- ============================================================

begin;

-- ============================================================
-- 1. ORDER TIME ESTIMATES
-- ============================================================

alter table orders
  add column if not exists estimated_ready_at timestamptz,
  add column if not exists estimated_delivery_at timestamptz,
  add column if not exists delivered_at timestamptz;

-- ============================================================
-- 2. INVOICES / RECEIPTS
-- ============================================================

do $$ begin
  create type invoice_kind as enum ('order_summary', 'invoice', 'receipt');
exception
  when duplicate_object then null;
end $$;

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  kind invoice_kind not null default 'order_summary',
  number text not null,
  issued_at timestamptz not null default now(),
  payment_status text,
  order_status text,
  totals jsonb not null default '{}'::jsonb,
  generated_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (order_id, kind)
);

create index if not exists idx_invoices_order on invoices (order_id);

alter table invoices enable row level security;

drop policy if exists "invoices_owner_read" on invoices;
create policy "invoices_owner_read"
  on invoices for select
  using (
    exists (
      select 1 from orders o
      where o.id = invoices.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "invoices_admin_all" on invoices;
create policy "invoices_admin_all"
  on invoices for all
  using (is_admin_user())
  with check (is_admin_user());

-- ============================================================
-- 3. CUSTOMER READ ACCESS TO THEIR OWN ORDER STATUS HISTORY
-- ============================================================

drop policy if exists "order_status_history_owner_read" on order_status_history;
create policy "order_status_history_owner_read"
  on order_status_history for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_status_history.order_id and o.user_id = auth.uid()
    )
  );

commit;
