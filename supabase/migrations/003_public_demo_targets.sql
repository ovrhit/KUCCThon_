do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'targets'
      and policyname = 'public demo can read targets'
  ) then
    create policy "public demo can read targets"
      on public.targets
      for select
      using (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'targets'
      and policyname = 'public demo can insert targets'
  ) then
    create policy "public demo can insert targets"
      on public.targets
      for insert
      with check (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'targets'
      and policyname = 'public demo can update targets'
  ) then
    create policy "public demo can update targets"
      on public.targets
      for update
      using (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
      with check (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  end if;
end $$;

update public.targets
set name = '나 자신',
    description = '오늘의 나에게 하는 한마디',
    color = 'bg-black'
where id = '00000000-0000-0000-0000-000000000001'
  and user_id = '00000000-0000-0000-0000-000000000000'
  and name = 'Me';

update public.targets
set name = '부모님',
    description = '세상에서 가장 소중한 분들',
    color = 'bg-orange-400'
where id = '00000000-0000-0000-0000-000000000002'
  and user_id = '00000000-0000-0000-0000-000000000000'
  and name = 'Parents';

update public.targets
set name = '민수',
    description = '함께 있으면 즐거운 친구',
    color = 'bg-blue-500'
where id = '00000000-0000-0000-0000-000000000003'
  and user_id = '00000000-0000-0000-0000-000000000000'
  and name = 'Friend';

update public.targets
set name = '연인',
    description = '언제나 내 편인 사람',
    color = 'bg-rose-400'
where id = '00000000-0000-0000-0000-000000000004'
  and user_id = '00000000-0000-0000-0000-000000000000'
  and name = 'Partner';
