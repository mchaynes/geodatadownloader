create extension postgis;


create type day as enum ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
create type frequency as enum ('manual', 'daily', 'weekly', 'monthly', 'hourly');
create type status as enum ('pending', 'started', 'successful', 'failed');
create type format as enum ('pmtiles', 'gpkg', 'geojson', 'shp', 'csv');


create table public.layer (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  public boolean default true,
  name text not null,
  url text not null,
  description text not null,
  fields jsonb not null,
  spatial_ref text not null,
  extent geometry not null,
  geometry_type text not null,
  query_formats text[] not null default array[]::text[],
  search_col tsvector
               GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || url)) STORED
);

CREATE INDEX layers_lower_case_url ON layer ((lower(url)));

CREATE INDEX search_col ON layer USING gin(search_col);

alter table public.layer
  enable row level security;

create policy "users can read public layers"
  on layer for select
  using ( public);

create policy "users can update their layers"
  on layer for all
  using (auth.uid() = owner);


create table public.layer_download_config(
  id uuid primary key default uuid_generate_v4(),
  layer_id uuid references layer(id),
  column_mapping jsonb
);

alter table public.layer_download_config
  enable row level security;

create policy "users can read public layer download configs"
  on layer_download_config for select
  using (
    exists (
      select 1
      from layer where layer_download_config.layer_id = layer.id
    )
  );

create policy "users can update their layer configs"
  on layer_download_config for all
  using (auth.uid() in (
      select owner from layer
      where layer.id = layer_download_config.layer_id
  ));

create table public.map(
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  public boolean default true,
  name text not null,
  boundary jsonb not null default '{}',
  description text
);

alter table public.map
  enable row level security;

create policy "users read public maps"
  on map for select
  using ( public );

create policy "users can update their maps"
  on map for all
  using ( auth.uid() = owner );


create table public.map_layer(
  map_id uuid references map(id),
  layer_id uuid references layer(id)
);

alter table public.map_layer
  enable row level security;

create policy "users can access their map layers"
  on map_layer
  for all using ( 
    exists (
      select 1 from map
      where map_layer.map_id = map.id
    )
  );

create table public.map_dl_config (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users on delete cascade default auth.uid(),
  map_id uuid references map(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null default '',
  format format not null default 'gpkg',
  access_key_id text not null,
  secret_key text not null,
  destination text not null,
  frequency frequency not null default 'weekly',
  where_clause text not null default '',
  active boolean not null,
  day_of_month int not null default 1,
  days_of_week day[] not null default array[]::day[],
  time_of_day time not null default '00:00'
);

alter table public.map_dl_config
  enable row level security;

create policy "users can access their map download configs"
  on map_dl_config for all
  using ( auth.uid() = owner );

create table public.downloads (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users,
  map_dl_config uuid references map_dl_config(id)
                              on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz,
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

CREATE TRIGGER map_dl_config_auto_update_modified
  BEFORE UPDATE ON public.map_dl_config
  FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();

CREATE TRIGGER layer_auto_update_modified
  BEFORE UPDATE ON public.layer
  FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();
