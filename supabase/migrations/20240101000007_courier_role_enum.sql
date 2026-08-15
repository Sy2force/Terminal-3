-- Adds the COURIER value to admin_role_type ahead of 0008_platform_upgrade.sql.
-- Must run in its own migration/transaction: PostgreSQL forbids using a new
-- enum value in the same transaction that added it.

alter type admin_role_type add value if not exists 'COURIER';
