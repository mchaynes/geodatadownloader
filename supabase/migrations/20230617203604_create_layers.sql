create extension postgis;

create table public.layers (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users,
  created_at timestamp with time zone null default now(),
  name text not null,
  url text not null,
  description text not null,
  fields jsonb not null,
  spatial_ref text not null,
  extent geometry not null,
  geometry_type text not null,
  query_formats text[] not null default array[]::text[]
);

alter table public.layers
  enable row level security;

create policy "users can access their layers"
  on layers for all
  using ( auth.uid() = owner);

create type day as enum ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
create type frequency as enum ('daily', 'weekly', 'monthly', 'hourly');
create type status as enum ('pending', 'started', 'successful', 'failed');
create type format as enum ('pmtiles', 'gpkg', 'geojson', 'shp', 'csv');


create table public.scheduled_downloads (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null default '',
  layer_url text not null,
  format format not null default 'gpkg',
  access_key_id text not null,
  secret_key text not null,
  destination text not null,
  frequency frequency not null default 'weekly',
  column_mapping jsonb not null default '{}',
  boundary jsonb not null default '{}',
  where_clause text not null default '',
  active boolean not null,
  day_of_month int not null default 1,
  days_of_week day[] not null default array[]::day[],
  time_of_day time not null default '00:00'
);

alter table public.scheduled_downloads
  enable row level security;

create policy "users can access their scheduled_downloads"
  on scheduled_downloads for all
  using ( auth.uid() = owner);

create table public.downloads (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users,
  download_schedule_id uuid references scheduled_downloads(id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  messages text[] not null default array[]::text[]
);

alter table public.downloads
  enable row level security;

create policy "users can access their downloads"
  on downloads for all
  using ( auth.uid() = owner);

create or replace function update_modified_column()
returns trigger
as $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$
language 'plpgsql'
;

CREATE TRIGGER scheduled_download_set_updated_at
  BEFORE UPDATE ON public.scheduled_downloads 
  FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();

CREATE TRIGGER downloads_set_updated_at
  BEFORE UPDATE ON public.scheduled_downloads 
  FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();
