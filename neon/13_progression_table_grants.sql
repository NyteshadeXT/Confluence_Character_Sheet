-- MVP RC4: progression tables are read-only via direct Data API table routes.
-- All mutations use SECURITY DEFINER RPCs with explicit authorization.
revoke insert, update, delete on
 public.characters, public.character_essences, public.character_powers, public.character_xp_ledger
 from authenticated, anonymous;
