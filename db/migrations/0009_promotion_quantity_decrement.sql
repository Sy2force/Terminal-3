-- Atomic decrement of promotion remaining_quantity
-- This function safely decrements the remaining_quantity of a promotion
-- only if there's enough stock, preventing race conditions

create or replace function decrement_promotion_quantity(
  promotion_id uuid,
  decrement_by integer
)
returns boolean
language plpgsql
as $$
declare
  current_remaining integer;
begin
  -- Get current remaining_quantity with lock
  select remaining_quantity into current_remaining
  from promotions
  where id = promotion_id
  and remaining_quantity is not null
  for update;

  -- If promotion doesn't exist or has no quantity limit, return false
  if current_remaining is null then
    return false;
  end if;

  -- Check if enough stock
  if current_remaining < decrement_by then
    return false;
  end if;

  -- Decrement atomically
  update promotions
  set remaining_quantity = remaining_quantity - decrement_by,
      updated_at = now()
  where id = promotion_id;

  return true;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function decrement_promotion_quantity to authenticated;
