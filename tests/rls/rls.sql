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

-- ============================================================
-- 0043_business_b2b.sql RLS tests
-- ============================================================

-- 9. Bar profiles: customer A cannot read customer B's bar profile.
set local "request.jwt.claim.sub" = 'A';
set role authenticated;
select count(*) from bar_profiles where user_id != 'A';
-- expected: 0
reset role;

-- 10. Bar profiles: customer A cannot set their own status
--     (DB trigger `forbid_bar_profile_status_change` should raise).
--     This block is a "should fail" — wrap in EXCEPTION expected.
do $$
begin
  set local "request.jwt.claim.sub" = 'A';
  set role authenticated;
  begin
    update bar_profiles set status = 'approved' where user_id = 'A';
    raise notice 'Test 10 FAILED: customer was allowed to change status';
  exception
    when others then
      raise notice 'Test 10 OK: status change blocked (%)', SQLERRM;
  end;
  reset role;
end $$;

-- 11. Product requests: customer A cannot read customer B's requests.
set local "request.jwt.claim.sub" = 'A';
set role authenticated;
select count(*) from product_requests where user_id != 'A';
-- expected: 0
reset role;

-- 12. Product requests: customer A cannot update a request that already
--     went past the "new"/"reviewing" stage (RLS forbids the row match).
set local "request.jwt.claim.sub" = 'A';
set role authenticated;
update product_requests
  set comment = 'client tries to alter after quote'
  where user_id = 'A' and status = 'quoted';
-- expected: 0 rows affected
reset role;

-- 13. pro_price_history: customer A only sees their own order history.
set local "request.jwt.claim.sub" = 'A';
set role authenticated;
select count(*)
  from pro_price_history pph
  join orders o on o.id = pph.order_id
  where o.user_id != 'A';
-- expected: 0
reset role;
