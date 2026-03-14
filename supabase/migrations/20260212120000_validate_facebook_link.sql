-- Create function to validate Facebook links
CREATE OR REPLACE FUNCTION public.is_valid_facebook_link(link TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Reject NULL or empty strings
  IF link IS NULL OR link = '' THEN
    RETURN false;
  END IF;
  
  -- Check if the link matches valid Facebook URL patterns
  -- Valid patterns include:
  -- - https://www.facebook.com/...
  -- - https://facebook.com/...
  -- - https://m.facebook.com/...
  -- - https://fb.com/...
  -- - https://www.fb.com/...
  RETURN link ~* '^https?://(www\.|m\.)?facebook\.com/.*$' 
      OR link ~* '^https?://(www\.)?fb\.com/.*$';
END;
$$;

-- Remove the default empty string since we require valid links
ALTER TABLE public.posts 
  ALTER COLUMN facebook_link DROP DEFAULT;

-- Add CHECK constraint to posts table to validate facebook_link
ALTER TABLE public.posts 
  ADD CONSTRAINT valid_facebook_link 
  CHECK (public.is_valid_facebook_link(facebook_link));

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT valid_facebook_link ON public.posts IS 
  'Ensures facebook_link is a valid, non-empty Facebook URL (facebook.com, fb.com, or m.facebook.com)';
