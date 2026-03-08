create extension if not exists pgcrypto;

create table if not exists professions (
  profession_key text primary key,
  name text not null,
  display_name text not null,
  emoji text not null,
  ticket_channel_prefix text not null,
  role_id text not null default 'PUT_ROLE_ID_HERE',
  enabled boolean not null default true,
  allow_solo boolean not null default true,
  min_team_size integer not null default 1,
  max_team_size integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_professions_solo_only check (min_team_size = 1 and max_team_size = 1)
);

create table if not exists clues (
  id uuid primary key default gen_random_uuid(),
  profession_key text not null references professions(profession_key) on delete cascade,
  clue_no integer not null,
  title text not null,
  clue_text text not null,
  zone_hint text,
  location_name text,
  location_x numeric(12,3),
  location_y numeric(12,3),
  location_z numeric(12,3),
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_clues_profession_step unique (profession_key, clue_no),
  constraint chk_clues_no_positive check (clue_no >= 1)
);

create table if not exists quest_runs (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null,
  channel_id text not null unique,
  user_id text not null,
  username text not null,
  profession_key text not null references professions(profession_key),
  profession_display_name text not null,
  status text not null,
  clue_step integer not null default 1,
  abandoned_counts_as_cancel boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  abandoned_at timestamptz,
  constraint chk_quest_runs_status check (status in ('active', 'completed', 'abandoned', 'cancelled')),
  constraint chk_quest_runs_step_positive check (clue_step >= 1)
);

create unique index if not exists uq_quest_runs_user_profession_lock
  on quest_runs (user_id, profession_key)
  where status in ('active', 'completed');

create index if not exists ix_quest_runs_user_id on quest_runs (user_id);
create index if not exists ix_quest_runs_profession_key on quest_runs (profession_key);
create index if not exists ix_quest_runs_status on quest_runs (status);

create table if not exists quest_logs (
  id uuid primary key default gen_random_uuid(),
  quest_run_id uuid not null references quest_runs(id) on delete cascade,
  guild_id text not null,
  channel_id text,
  user_id text not null,
  profession_key text not null,
  action_type text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists ix_quest_logs_run_id on quest_logs (quest_run_id);
create index if not exists ix_quest_logs_user_id on quest_logs (user_id);
create index if not exists ix_quest_logs_profession_key on quest_logs (profession_key);
