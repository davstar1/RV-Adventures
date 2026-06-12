create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('story', 'video', 'destination', 'gear', 'community')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid()
);

alter table public.content_entries enable row level security;

drop policy if exists "Public can read content entries" on public.content_entries;
create policy "Public can read content entries"
on public.content_entries
for select
using (true);

drop policy if exists "Signed in admins can insert content entries" on public.content_entries;
create policy "Signed in admins can insert content entries"
on public.content_entries
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "Signed in admins can delete own content entries" on public.content_entries;
create policy "Signed in admins can delete own content entries"
on public.content_entries
for delete
to authenticated
using (auth.uid() = created_by);

drop policy if exists "Signed in admins can update own content entries" on public.content_entries;
create policy "Signed in admins can update own content entries"
on public.content_entries
for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create index if not exists content_entries_type_created_at_idx
on public.content_entries (type, created_at desc);

grant select on public.content_entries to anon;
grant select, insert, update, delete on public.content_entries to authenticated;

notify pgrst, 'reload schema';
