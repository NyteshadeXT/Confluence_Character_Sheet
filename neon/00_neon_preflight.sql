-- 00_neon_preflight.sql
-- Run only after Neon Auth is enabled for the branch.
DO $$
BEGIN
  IF to_regclass('neon_auth."user"') IS NULL THEN
    RAISE EXCEPTION 'Neon Auth schema is not initialized. Enable Neon Auth before applying Confluence schema.';
  END IF;
  IF to_regprocedure('auth.user_id()') IS NULL THEN
    RAISE EXCEPTION 'auth.user_id() is unavailable. Enable the Neon Data API/RLS JWT integration before applying RLS policies.';
  END IF;
END $$;
