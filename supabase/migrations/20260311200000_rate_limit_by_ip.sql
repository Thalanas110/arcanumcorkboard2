-- Rate limiting using the real client IP (resolved server-side via inet_client_addr).
-- This replaces the broken approach of trusting a client-supplied 'anonymous' key.

-- Function: check whether the calling IP is currently rate-limited.
-- Returns the number of minutes remaining, or NULL if the user may post freely.
CREATE OR REPLACE FUNCTION public.get_rate_limit_status()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip          TEXT;
  v_last_post   TIMESTAMPTZ;
  v_diff_min    NUMERIC;
  v_limit_min   CONSTANT INTEGER := 5;
BEGIN
  -- Resolve client IP from the Postgres connection (cannot be spoofed by the client).
  v_ip := inet_client_addr()::TEXT;

  -- If we cannot resolve an IP (e.g. local socket), treat as not rate-limited.
  IF v_ip IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT last_post_at
    INTO v_last_post
    FROM public.rate_limits
   WHERE ip_address = v_ip;

  IF v_last_post IS NULL THEN
    RETURN NULL;
  END IF;

  v_diff_min := EXTRACT(EPOCH FROM (now() - v_last_post)) / 60.0;

  IF v_diff_min < v_limit_min THEN
    RETURN CEIL(v_limit_min - v_diff_min)::INTEGER;
  END IF;

  RETURN NULL;
END;
$$;

-- Function: record that the calling IP just posted (upsert).
CREATE OR REPLACE FUNCTION public.record_rate_limit_post()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip TEXT;
BEGIN
  v_ip := inet_client_addr()::TEXT;

  IF v_ip IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.rate_limits (ip_address, last_post_at)
       VALUES (v_ip, now())
  ON CONFLICT (ip_address)
    DO UPDATE SET last_post_at = now();
END;
$$;

-- Add UNIQUE constraint on ip_address so ON CONFLICT works correctly.
-- (Safe to run repeatedly thanks to IF NOT EXISTS on the index.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'rate_limits_ip_address_key'
       AND conrelid = 'public.rate_limits'::regclass
  ) THEN
    ALTER TABLE public.rate_limits ADD CONSTRAINT rate_limits_ip_address_key UNIQUE (ip_address);
  END IF;
END;
$$;

-- Tighten rate_limits RLS: reading and updating rate limits should be server-only
-- (done via SECURITY DEFINER functions, not direct table access).
DROP POLICY IF EXISTS "Anyone can view their rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can insert rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can update rate limit" ON public.rate_limits;

-- No public SELECT/INSERT/UPDATE — the SECURITY DEFINER functions handle everything.
-- Admins can still read rate_limits directly for debugging.
CREATE POLICY "Admins can view rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
