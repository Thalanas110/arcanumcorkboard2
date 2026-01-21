-- Create website_visits table
CREATE TABLE public.website_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for website_visits
ALTER TABLE public.website_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert visits (for tracking)
CREATE POLICY "Anyone can record visits"
ON public.website_visits
FOR INSERT
WITH CHECK (true);

-- Allow admins to view visits
CREATE POLICY "Admins can view visits"
ON public.website_visits
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create system_logs table
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert logs (e.g. client-side errors)
CREATE POLICY "Anyone can submit logs"
ON public.system_logs
FOR INSERT
WITH CHECK (true);

-- Allow admins to view logs
CREATE POLICY "Admins can view logs"
ON public.system_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_website_visits_created_at ON public.website_visits(created_at DESC);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
