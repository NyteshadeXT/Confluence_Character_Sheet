-- 01_neon_schema.sql
-- Confluence Character Sheet v0.4.11.2
-- Neon-compatible clean schema built from the canonical live Supabase snapshot.
-- Neon Auth user IDs are TEXT, matching neon_auth.user.id.

create extension if not exists pgcrypto;

do $$ begin create type public.campaign_role as enum ('GM','PLAYER');
exception when duplicate_object then null; end $$;
do $$ begin create type public.character_access_role as enum ('OWNER','VIEWER');
exception when duplicate_object then null; end $$;
do $$ begin create type public.xp_transaction_type as enum
 ('GM_GRANT','GM_ADJUSTMENT','POWER_RANK_PURCHASE','REFUND','SYSTEM_ADJUSTMENT','SKILL_RANK_PURCHASE');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles(
 user_id uuid primary key references neon_auth."user"(id) on delete cascade,
 display_name text,email text,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.campaigns(
 id uuid primary key default gen_random_uuid(),name text not null,
 created_by uuid not null references neon_auth."user"(id),
 ruleset_version text not null default 'v0.4',created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.campaign_members(
 campaign_id uuid not null references public.campaigns(id) on delete cascade,
 user_id uuid not null references neon_auth."user"(id) on delete cascade,
 role public.campaign_role not null,joined_at timestamptz not null default now(),
 primary key(campaign_id,user_id)
);
create table if not exists public.ancestry_definitions(
 id text primary key,name text not null unique,definition jsonb not null default '{}'::jsonb,
 is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.essence_definitions(
 id text primary key,name text not null unique,associated_ability text not null,definition jsonb not null,is_active boolean not null default true
);
create table if not exists public.power_definitions(
 id text primary key,name text not null,slot_index integer not null check(slot_index between 1 and 5),
 definition jsonb not null,is_active boolean not null default true
);
create table if not exists public.condition_definitions(
 id text primary key,name text not null unique,definition jsonb not null default '{}'::jsonb,
 is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.essence_power_eligibility(
 essence_id text not null references public.essence_definitions(id) on delete cascade,
 power_id text not null references public.power_definitions(id) on delete cascade,
 primary key(essence_id,power_id)
);
create table if not exists public.characters(
 id uuid primary key default gen_random_uuid(),campaign_id uuid not null references public.campaigns(id) on delete cascade,
 name text not null,ancestry_definition_id text,available_xp integer not null default 0 check(available_xp>=0),
 training_json jsonb not null default '{}'::jsonb,equipment_json jsonb not null default '[]'::jsonb,
 loadout_json jsonb not null default '{}'::jsonb,essence_choices_json jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.character_users(
 character_id uuid not null references public.characters(id) on delete cascade,
 user_id uuid not null references neon_auth."user"(id) on delete cascade,
 access_role public.character_access_role not null default 'OWNER',created_at timestamptz not null default now(),
 primary key(character_id,user_id)
);
create table if not exists public.character_attributes(
 character_id uuid primary key references public.characters(id) on delete cascade,
 strength integer not null default 10,dexterity integer not null default 10,constitution integer not null default 10,
 intelligence integer not null default 10,wisdom integer not null default 10,charisma integer not null default 10
);
create table if not exists public.character_runtime_state(
 character_id uuid primary key references public.characters(id) on delete cascade,
 current_hp integer not null default 10,current_mana integer not null default 0,current_stamina integer not null default 0,
 current_healing_surges integer not null default 0,temporary_hp integer not null default 0,barrier integer not null default 0,
 combat_active boolean not null default false,round_number integer not null default 1 check(round_number>=1),
 short_rest_recovery_available boolean not null default true,loadout_unlocked boolean not null default false,
 conditions_json jsonb not null default '[]'::jsonb,modifiers_json jsonb not null default '[]'::jsonb,
 daily_expended_json jsonb not null default '{}'::jsonb,updated_at timestamptz not null default now()
);
create table if not exists public.character_essences(
 id uuid primary key default gen_random_uuid(),character_id uuid not null references public.characters(id) on delete cascade,
 essence_id text not null references public.essence_definitions(id),slot_index integer not null check(slot_index between 1 and 4),
 current_tier text not null default 'Iron',current_rank integer not null default 1 check(current_rank between 0 and 9),
 assigned_by uuid references neon_auth."user"(id),assigned_at timestamptz not null default now(),
 unique(character_id,essence_id),unique(character_id,slot_index)
);
create table if not exists public.character_powers(
 id uuid primary key default gen_random_uuid(),character_id uuid not null references public.characters(id) on delete cascade,
 character_essence_id uuid not null references public.character_essences(id) on delete cascade,
 power_id text not null references public.power_definitions(id),slot_index integer not null check(slot_index between 1 and 5),
 tier text not null default 'Iron',rank integer not null default 1 check(rank between 0 and 9),
 assigned_by uuid references neon_auth."user"(id),assigned_at timestamptz not null default now(),
 unique(character_essence_id,slot_index)
);
create table if not exists public.character_xp_ledger(
 id uuid primary key default gen_random_uuid(),character_id uuid not null references public.characters(id) on delete cascade,
 amount integer not null,transaction_type public.xp_transaction_type not null,note text,
 actor_user_id uuid references neon_auth."user"(id),created_at timestamptz not null default now()
);

create index if not exists idx_campaign_members_user on public.campaign_members(user_id);
create index if not exists idx_character_users_user on public.character_users(user_id);
create index if not exists idx_characters_campaign on public.characters(campaign_id);
create index if not exists idx_character_essences_character on public.character_essences(character_id);
create index if not exists idx_character_powers_character on public.character_powers(character_id);
create index if not exists idx_xp_ledger_character_created on public.character_xp_ledger(character_id,created_at desc);
