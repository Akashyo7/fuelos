-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  goal          text not null default 'maintain',
  protein_target integer not null default 150,
  diet_type     text not null default 'non_veg',
  weight_kg     numeric,
  height_cm     numeric,
  activity_level text not null default 'medium',
  age           integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Food items (seeded, managed by admins)
create table if not exists public.food_items (
  id            text primary key,
  name          text not null,
  restaurant    text not null,
  protein_g     numeric not null,
  calories      integer not null,
  price_inr     integer not null,
  diet_type     text not null,
  swiggy_query  text not null,
  confidence    numeric not null default 0.7,
  why           jsonb not null default '[]',
  tags          jsonb not null default '[]',
  active        boolean not null default true
);

-- Meal logs (one row per meal logged)
create table if not exists public.meal_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  food_item_id  text not null references public.food_items(id),
  log_date      date not null default current_date,
  protein_g     numeric not null,
  calories      integer not null,
  logged_at     timestamptz not null default now()
);

-- Daily logs (one row per user per day, upserted on each meal or open)
create table if not exists public.daily_logs (
  user_id           uuid not null references public.users(id) on delete cascade,
  log_date          date not null default current_date,
  protein_consumed  numeric not null default 0,
  calories_consumed integer not null default 0,
  meals_logged      integer not null default 0,
  opened_app        boolean not null default false,
  nudge_required    boolean not null default false,
  primary key (user_id, log_date)
);

-- Indexes
create index if not exists meal_logs_user_date on public.meal_logs(user_id, log_date);
create index if not exists daily_logs_user_date on public.daily_logs(user_id, log_date);

-- Row-level security
alter table public.users      enable row level security;
alter table public.food_items enable row level security;
alter table public.meal_logs  enable row level security;
alter table public.daily_logs enable row level security;

-- Users: own row only
create policy "users_self" on public.users
  for all using (auth.uid() = id);

-- Food items: read-only for all authenticated users
create policy "food_items_read" on public.food_items
  for select using (auth.role() = 'authenticated');

-- Meal logs: own rows only
create policy "meal_logs_self" on public.meal_logs
  for all using (auth.uid() = user_id);

-- Daily logs: own rows only
create policy "daily_logs_self" on public.daily_logs
  for all using (auth.uid() = user_id);

-- Auto-update updated_at on users
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();
