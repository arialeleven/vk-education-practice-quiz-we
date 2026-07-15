-- =====================================================================
--  Quiz app — database model (run in Supabase SQL editor)
--  Splits "quiz template" (quizzes/questions) from "game session"
--  (game_sessions/session_players) — the key modelling decision.
-- =====================================================================

-- profiles: 1-1 with auth.users, holds role (organizer | participant)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  role text not null default 'participant' check (role in ('organizer','participant')),
  created_at timestamptz not null default now()
);

-- auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- quiz TEMPLATE ---------------------------------------------------
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  position int not null default 0,
  text text not null,
  image_url text,
  type text not null default 'single' check (type in ('single','multiple')),
  options jsonb not null,          -- string[]
  correct jsonb not null,          -- number[] (indices into options)
  time_limit int not null default 20
);

-- ---- game SESSION ----------------------------------------------------
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete set null,
  host uuid not null references auth.users(id) on delete cascade,
  code text not null,
  status text not null default 'lobby' check (status in ('lobby','running','finished')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.session_players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,   -- null = anonymous guest
  name text not null,
  score int not null default 0
);

-- =====================================================================
--  Row Level Security
-- =====================================================================
alter table public.profiles        enable row level security;
alter table public.quizzes         enable row level security;
alter table public.questions       enable row level security;
alter table public.game_sessions   enable row level security;
alter table public.session_players enable row level security;

-- profiles: read any (for leaderboards), write only your own
create policy "profiles read"   on public.profiles for select using (true);
create policy "profiles update" on public.profiles for update using (auth.uid() = id);

-- quizzes: owner has full control
create policy "quiz owner all" on public.quizzes
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

-- questions: access via owning quiz
create policy "questions via owner" on public.questions
  for all using (exists (select 1 from public.quizzes q where q.id = quiz_id and q.owner = auth.uid()))
  with check (exists (select 1 from public.quizzes q where q.id = quiz_id and q.owner = auth.uid()));

-- game_sessions: any authenticated user can look up a session (to join by code);
-- only the host can create/update
create policy "session read"   on public.game_sessions for select using (auth.role() = 'authenticated');
create policy "session insert" on public.game_sessions for insert with check (auth.uid() = host);
create policy "session update" on public.game_sessions for update using (auth.uid() = host);

-- session_players: read your own rows OR rows of sessions you hosted
create policy "players read own" on public.session_players for select using (
  user_id = auth.uid()
  or exists (select 1 from public.game_sessions s where s.id = session_id and s.host = auth.uid())
);
-- writes normally happen from the party server via the service role (bypasses RLS).
-- allow a signed-in participant to insert their own row as a fallback:
create policy "players insert self" on public.session_players
  for insert with check (user_id = auth.uid());
