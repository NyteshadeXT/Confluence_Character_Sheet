-- Hosted Connected Prototype v0.4.1 — GM Content Studio
-- This migration has already been applied to the live Confluence Character Supabase project.
-- Canonical definitions are reproduced here for repository history.

create or replace function public.is_system_gm()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.campaign_members cm where cm.user_id=auth.uid() and cm.role='GM');
$$;

-- Protected authoring RPCs in production:
--   gm_upsert_essence_definition(text,text,text,jsonb,boolean)
--   gm_upsert_power_definition(text,text,integer,jsonb,text[],boolean)
--   gm_set_definition_active(text,text,boolean)
--
-- See docs/HOSTED-V0.4.1.md for behavior and security model.
