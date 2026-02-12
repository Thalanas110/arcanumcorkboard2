-- Create function to validate Facebook links
CREATE OR REPLACE FUNCTION public.is_valid_facebook_link(link TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Allow NULL values (for optional field)
  IF link IS NULL THEN
    RETURN true;
  END IF;

  -- Reject empty strings if they somehow bypass other checks, though strictly they should be NULL if empty
  IF link = '' THEN
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

-- First, make the column nullable so we can store NULLs
ALTER TABLE public.posts 
  ALTER COLUMN facebook_link DROP NOT NULL;

-- Remove the default empty string
ALTER TABLE public.posts 
  ALTER COLUMN facebook_link DROP DEFAULT;

-- Now convert empty strings to NULL (this is allowed now that the column is nullable)
UPDATE public.posts SET facebook_link = NULL WHERE facebook_link = '';

-- Add CHECK constraint to posts table to validate facebook_link
ALTER TABLE public.posts 
  ADD CONSTRAINT valid_facebook_link 
  CHECK (public.is_valid_facebook_link(facebook_link));

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT valid_facebook_link ON public.posts IS 
  'Ensures facebook_link is a valid Facebook URL or NULL';
