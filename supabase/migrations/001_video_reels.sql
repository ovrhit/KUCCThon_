create extension if not exists "pgcrypto";

create table if not exists public.gratitude_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  target_id uuid not null,
  video_url text not null,
  message text not null default '',
  recorded_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists gratitude_logs_target_date_idx
  on public.gratitude_logs (target_id, recorded_date asc);

create index if not exists gratitude_logs_user_target_idx
  on public.gratitude_logs (user_id, target_id);

create table if not exists public.shared_reels (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null,
  target_id uuid not null,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists shared_reels_active_target_idx
  on public.shared_reels (id, target_id)
  where is_active = true;

alter table public.gratitude_logs enable row level security;
alter table public.shared_reels enable row level security;

create policy "users can read own gratitude logs"
  on public.gratitude_logs
  for select
  using (auth.uid() = user_id);

create policy "users can insert own gratitude logs"
  on public.gratitude_logs
  for insert
  with check (auth.uid() = user_id);

create policy "users can update own gratitude logs"
  on public.gratitude_logs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own gratitude logs"
  on public.gratitude_logs
  for delete
  using (auth.uid() = user_id);

create policy "users can read own shared reels"
  on public.shared_reels
  for select
  using (auth.uid() = creator_id);

create policy "public can read active shared reels"
  on public.shared_reels
  for select
  using (is_active = true);

create policy "users can create own shared reels"
  on public.shared_reels
  for insert
  with check (auth.uid() = creator_id);

create policy "users can update own shared reels"
  on public.shared_reels
  for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

create policy "users can delete own shared reels"
  on public.shared_reels
  for delete
  using (auth.uid() = creator_id);

insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

create policy "users can upload videos under their folder"
  on storage.objects
  for insert
  with check (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users can update videos under their folder"
  on storage.objects
  for update
  using (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users can delete videos under their folder"
  on storage.objects
  for delete
  using (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "public can read videos"
  on storage.objects
  for select
  using (bucket_id = 'videos');

create or replace function public.get_target_reel_logs(p_target_id uuid)
returns setof public.gratitude_logs
language sql
stable
security invoker
as $$
  select *
  from public.gratitude_logs
  where target_id = p_target_id
  order by recorded_date asc, created_at asc;
$$;

create or replace function public.get_shared_reel_logs(p_share_id uuid)
returns setof public.gratitude_logs
language sql
stable
security definer
set search_path = public
as $$
  select gl.*
  from public.shared_reels sr
  join public.gratitude_logs gl
    on gl.user_id = sr.creator_id
   and gl.target_id = sr.target_id
  where sr.id = p_share_id
    and sr.is_active = true
  order by gl.recorded_date asc, gl.created_at asc;
$$;

grant execute on function public.get_shared_reel_logs(uuid) to anon, authenticated;
