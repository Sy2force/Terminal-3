-- TERMINAL 3 — order fulfillment details
-- Adds the delivery/pickup scheduling details requested at checkout
-- (city, floor, entry code, delivery instructions, desired date, time
-- slot) that `orders` was missing. Purely additive — every column is
-- nullable, no existing data is touched, dropped, or renamed.

begin;

alter table orders
  add column if not exists city text,
  add column if not exists floor text,
  add column if not exists entry_code text,
  add column if not exists delivery_instructions text,
  add column if not exists desired_date date,
  add column if not exists time_slot text;

commit;
