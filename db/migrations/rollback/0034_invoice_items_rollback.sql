-- 0034_invoice_items_rollback.sql
-- Rollback for db/migrations/0034_invoice_items.sql

BEGIN;

DROP TABLE IF EXISTS invoice_items;

COMMIT;
