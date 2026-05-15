create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  color text default 'bg-black',
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.gratitude_logs
  add column if not exists thumbnail_url text;

alter table public.gratitude_logs
  drop constraint if exists check_video_url_format;

alter table public.gratitude_logs
  add constraint check_video_url_format
  check (
    video_url like '%.mp4'
    or video_url like '%.mov'
    or video_url like '%.webm'
  );

insert into public.profiles (id, nickname)
values ('00000000-0000-0000-0000-000000000000', 'Public Demo User')
on conflict (id) do nothing;

insert into public.targets (id, user_id, name, description, color)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'Me',
    'Default demo target',
    'bg-black'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'Parents',
    'Default demo target',
    'bg-orange-400'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'Friend',
    'Default demo target',
    'bg-blue-500'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'Partner',
    'Default demo target',
    'bg-rose-400'
  )
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'gratitude_logs'
      and policyname = 'public demo can read gratitude logs'
  ) then
    create policy "public demo can read gratitude logs"
      on public.gratitude_logs
      for select
      using (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'gratitude_logs'
      and policyname = 'public demo can insert gratitude logs'
  ) then
    create policy "public demo can insert gratitude logs"
      on public.gratitude_logs
      for insert
      with check (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public demo can upload videos'
  ) then
    create policy "public demo can upload videos"
      on storage.objects
      for insert
      with check (
        bucket_id = 'videos'
        and (storage.foldername(name))[1] = '00000000-0000-0000-0000-000000000000'
      );
  end if;
end $$;
