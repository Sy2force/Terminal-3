-- ============================================================
-- 0028_order_idempotency.sql
-- Idempotency keys for orders and event orders
-- Prevents duplicate submissions caused by double-clicks, retries or
-- network replays without requiring a separate idempotency table.
-- ============================================================

begin;

alter table if exists orders
  add column if not exists idempotency_key text unique;

create index if not exists idx_orders_idempotency_key
  on orders(idempotency_key)
  where idempotency_key is not null;

alter table if exists event_orders
  add column if not exists idempotency_key text unique;

create index if not exists idx_event_orders_idempotency_key
  on event_orders(idempotency_key)
  where idempotency_key is not null;

commit;
