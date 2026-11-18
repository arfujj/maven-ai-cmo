-- Maven: run once in Supabase (SQL Editor -> New query -> paste -> Run).
create table if not exists public.analyses (
  id uuid primary key,
  user_id uuid references auth.users (id) on delete cascade,
  status text not null default 'queued',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analyses_user_created on public.analyses (user_id, created_at desc);

-- The server writes with the secret key (bypasses RLS). Signed-in users may read only their own rows.
alter table public.analyses enable row level security;

drop policy if exists "read own analyses" on public.analyses;
create policy "read own analyses" on public.analyses
  for select using (auth.uid() = user_id);
