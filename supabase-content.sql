create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('story', 'video', 'destination', 'gear', 'community', 'about', 'slide')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid()
);

alter table public.content_entries
drop constraint if exists content_entries_type_check;

alter table public.content_entries
add constraint content_entries_type_check
check (type in ('story', 'video', 'destination', 'gear', 'community', 'about', 'slide'));

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

drop policy if exists "Public can add community notes" on public.content_entries;
create policy "Public can add community notes"
on public.content_entries
for insert
to anon
with check (type = 'community');

drop policy if exists "Signed in admins can delete own content entries" on public.content_entries;
drop policy if exists "Signed in admins can delete content entries" on public.content_entries;
create policy "Signed in admins can delete content entries"
on public.content_entries
for delete
to authenticated
using (true);

drop policy if exists "Signed in admins can update own content entries" on public.content_entries;
drop policy if exists "Signed in admins can update content entries" on public.content_entries;
create policy "Signed in admins can update content entries"
on public.content_entries
for update
to authenticated
using (true)
with check (true);

create index if not exists content_entries_type_created_at_idx
on public.content_entries (type, created_at desc);

grant select on public.content_entries to anon;
grant insert on public.content_entries to anon;
grant select, insert, update, delete on public.content_entries to authenticated;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'website',
  subscribed_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Public can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Public can subscribe to newsletter"
on public.newsletter_subscribers
for insert
to anon
with check (true);

drop policy if exists "Signed in admins can read newsletter subscribers" on public.newsletter_subscribers;
create policy "Signed in admins can read newsletter subscribers"
on public.newsletter_subscribers
for select
to authenticated
using (true);

grant insert on public.newsletter_subscribers to anon;
grant select, insert on public.newsletter_subscribers to authenticated;

notify pgrst, 'reload schema';
