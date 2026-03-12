-- Harden the system_logs INSERT policy to prevent log injection.
-- The table must remain openly insertable (anonymous public app), but we add
-- strict WITH CHECK constraints to limit damage: valid log levels, bounded
-- message length, and bounded ip_address length.

DROP POLICY IF EXISTS "Anyone can submit logs" ON public.system_logs;

CREATE POLICY "Anyone can submit logs"
ON public.system_logs
FOR INSERT
WITH CHECK (
  level IN ('info', 'warn', 'error')
  AND char_length(message) <= 2000
  AND (ip_address IS NULL OR char_length(ip_address) <= 45)
  AND (metadata IS NULL OR octet_length(metadata::TEXT) <= 8192)
);
