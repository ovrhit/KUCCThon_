do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'gratitude_logs'
      and policyname = 'public demo can delete gratitude logs'
  ) then
    create policy "public demo can delete gratitude logs"
      on public.gratitude_logs
      for delete
      using (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'targets'
      and policyname = 'public demo can delete custom targets'
  ) then
    create policy "public demo can delete custom targets"
      on public.targets
      for delete
      using (
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
        and id not in (
          '00000000-0000-0000-0000-000000000001'::uuid,
          '00000000-0000-0000-0000-000000000002'::uuid,
          '00000000-0000-0000-0000-000000000003'::uuid,
          '00000000-0000-0000-0000-000000000004'::uuid
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public demo can delete videos'
  ) then
    create policy "public demo can delete videos"
      on storage.objects
      for delete
      using (
        bucket_id = 'videos'
        and (storage.foldername(name))[1] = '00000000-0000-0000-0000-000000000000'
      );
  end if;
end $$;
