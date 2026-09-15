-- Confluence Character Sheet v0.4.12.3
-- Run READ-ONLY against the live Supabase database at the start of the cutover window.
-- Returns one JSONB document containing the 15 application tables in deterministic order.
select jsonb_build_object(
  'format', 'confluence-neon-cutover-v1',
  'exported_at', now(),
  'tables', jsonb_build_object(
    'profiles', (select coalesce(jsonb_agg(to_jsonb(t) order by user_id::text), '[]'::jsonb) from public.profiles t),
    'campaigns', (select coalesce(jsonb_agg(to_jsonb(t) order by id::text), '[]'::jsonb) from public.campaigns t),
    'campaign_members', (select coalesce(jsonb_agg(to_jsonb(t) order by campaign_id::text, user_id::text), '[]'::jsonb) from public.campaign_members t),
    'ancestry_definitions', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]'::jsonb) from public.ancestry_definitions t),
    'condition_definitions', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]'::jsonb) from public.condition_definitions t),
    'essence_definitions', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]'::jsonb) from public.essence_definitions t),
    'power_definitions', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]'::jsonb) from public.power_definitions t),
    'essence_power_eligibility', (select coalesce(jsonb_agg(to_jsonb(t) order by essence_id, power_id), '[]'::jsonb) from public.essence_power_eligibility t),
    'characters', (select coalesce(jsonb_agg(to_jsonb(t) order by id::text), '[]'::jsonb) from public.characters t),
    'character_users', (select coalesce(jsonb_agg(to_jsonb(t) order by character_id::text, user_id::text), '[]'::jsonb) from public.character_users t),
    'character_attributes', (select coalesce(jsonb_agg(to_jsonb(t) order by character_id::text), '[]'::jsonb) from public.character_attributes t),
    'character_runtime_state', (select coalesce(jsonb_agg(to_jsonb(t) order by character_id::text), '[]'::jsonb) from public.character_runtime_state t),
    'character_essences', (select coalesce(jsonb_agg(to_jsonb(t) order by id::text), '[]'::jsonb) from public.character_essences t),
    'character_powers', (select coalesce(jsonb_agg(to_jsonb(t) order by id::text), '[]'::jsonb) from public.character_powers t),
    'character_xp_ledger', (select coalesce(jsonb_agg(to_jsonb(t) order by created_at, id::text), '[]'::jsonb) from public.character_xp_ledger t)
  )
) as confluence_snapshot;
