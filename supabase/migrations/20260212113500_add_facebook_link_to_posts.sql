-- Add facebook_link column to posts table
ALTER TABLE public.posts ADD COLUMN facebook_link TEXT DEFAULT '' NOT NULL;
