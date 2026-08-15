-- Adds new admin role values. Must run alone: PostgreSQL forbids using a
-- new enum value in the same transaction that added it (see
-- 0007b_courier_role_enum.sql for the same constraint).

alter type admin_role_type add value if not exists 'ORDER_MANAGER';
alter type admin_role_type add value if not exists 'DELIVERY_MANAGER';
alter type admin_role_type add value if not exists 'CUSTOMER_SUPPORT';
