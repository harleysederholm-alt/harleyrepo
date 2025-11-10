-- FILE: supabase-schema.sql

-- 1. Profiles-taulu (liitetty auth.users:iin)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Projects-taulu (käyttäjän analyysiprojektit)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text not null, -- 'restaurant', 'cafe', 'gym', 'retail', 'real_estate'
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Analyses-taulu (yksittäiset sijaintianalyysit)
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  address text not null,
  latitude numeric not null,
  longitude numeric not null,
  score numeric not null, -- 0-10
  summary text,
  pros text[], -- Array of strings
  cons text[], -- Array of strings
  raw_data jsonb, -- Raakadata (demographics, competition, traffic)
  created_at timestamp with time zone default now()
);

-- 4. RLS-käytännöt (Row Level Security)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.analyses enable row level security;

-- Profiles: Käyttäjä voi nähdä vain oman profiilinsa
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Projects: Käyttäjä voi nähdä vain omat projektinsa
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Analyses: Käyttäjä voi nähdä analyysit omista projekteistaan
create policy "Users can view own analyses"
  on public.analyses for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = analyses.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can create analyses"
  on public.analyses for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_id
      and projects.user_id = auth.uid()
    )
  );

-- Trigger: Luo automaattinen profile kun käyttäjä rekisteröityy
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
