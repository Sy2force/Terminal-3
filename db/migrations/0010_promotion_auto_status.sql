-- Automatic promotion status management
-- This function updates promotion statuses based on their start/end dates
-- It should be called by a scheduled job (cron) periodically

create or replace function update_promotion_statuses()
returns void
language plpgsql
as $$
begin
  -- Activate scheduled promotions whose start time has passed
  update promotions
  set status = 'active',
      updated_at = now()
  where status = 'scheduled'
    and start_at <= now();

  -- Expire active promotions whose end time has passed
  update promotions
  set status = 'expired',
      updated_at = now()
  where status = 'active'
    and end_at <= now();
end;
$$;

-- Grant execute permission to service role (for cron jobs)
grant execute on function update_promotion_statuses to service_role;

-- Create a helper function to get active promotions (for use in queries)
create or replace function get_active_promotions()
returns setof promotions
language sql
stable
as $$
  select *
  from promotions
  where status = 'active'
    and start_at <= now()
    and end_at > now();
$$;

-- Grant execute permission to authenticated users
grant execute on function get_active_promotions to authenticated;
