-- Add ip_address column to system_logs for client IP tracking
ALTER TABLE public.system_logs ADD COLUMN ip_address TEXT;

-- Index for filtering/searching by IP
CREATE INDEX idx_system_logs_ip ON public.system_logs(ip_address);
