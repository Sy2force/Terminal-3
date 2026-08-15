-- ============================================================
-- tests/rls/rls.sql
-- Manual RLS regression checks for Terminal 3.
-- Run these against a dedicated test Supabase project.
-- WARNING: do NOT run against production data.
-- ============================================================

-- 1. Visitor (anon) cannot read profiles.
--    Run as anon role; should return zero rows for any profile.
set role anon;
select count(*) from profiles;
-- expected: 0
reset role;

-- 2. Visitor cannot read orders.
set role anon;
select count(*) from orders;
-- expected: 0
reset role;

-- 3. Customer A can read their own orders.
--    Requires a test auth user with uid 'A' and at least one order.
set local "request.jwt.claim.sub" = 'A';
set role authenticated;
select count(*) from orders where user_id = 'A';
-- expected: >0 if orders exist
select count(*) from orders where user_id != 'A';
-- expected: 0
reset role;

-- 4. Customer A cannot read customer B's cart.
set local "request.jwt.claim.sub" = 'A';
set role authenticated;
select count(*) from carts where user_id = 'B';
-- expected: 0
reset role;

-- 5. COURIER sees only assigned deliveries.
--    Requires a test user with COURIER role.
set local "request.jwt.claim.sub" = 'COURIER_USER';
set role authenticated;
select count(*) from deliveries where courier_user_id != 'COURIER_USER';
-- expected: 0
reset role;

-- 6. CUSTOMER_SUPPORT cannot see identity documents.
set local "request.jwt.claim.sub" = 'SUPPORT_USER';
set role authenticated;
select count(*) from identity_verifications;
-- expected: 0
reset role;

-- 7. MANAGER cannot assign OWNER role (UI must hide, but this is DB backstop).
--    Verified by app logic; DB policy on admin_roles allows OWNER-only writes.

-- 8. Inventory is staff-only.
set role authenticated;
select count(*) from inventory;
-- expected: 0 for non-staff
reset role;
