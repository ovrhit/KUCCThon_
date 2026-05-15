do $$
begin
  if exists (
    select 1
    from public.gratitude_logs
    group by user_id, target_id, recorded_date
    having count(*) > 1
  ) then
    raise exception 'Duplicate gratitude logs exist for the same user, target, and recorded_date. Remove duplicates before applying the daily target limit.';
  end if;
end $$;

create unique index if not exists gratitude_logs_one_per_target_day_idx
  on public.gratitude_logs (user_id, target_id, recorded_date);
