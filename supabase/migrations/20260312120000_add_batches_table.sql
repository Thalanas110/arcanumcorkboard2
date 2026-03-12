-- Create a dedicated batches table so admins can add/remove batches dynamically.
-- Posts reference a batch number via FK; deleting a batch that still has posts
-- will fail with an integrity error (ON DELETE RESTRICT, the PG default).

-- 1. Create batches table
CREATE TABLE public.batches (
  batch_number INTEGER PRIMARY KEY,
  label        TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- 3. Anyone can view batches (needed for the public "post" form)
CREATE POLICY "Anyone can view batches"
ON public.batches
FOR SELECT
USING (true);

-- 4. Only authenticated admins can insert batches
CREATE POLICY "Admins can insert batches"
ON public.batches
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Only authenticated admins can delete batches
CREATE POLICY "Admins can delete batches"
ON public.batches
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Seed the two existing batches
INSERT INTO public.batches (batch_number, label) VALUES
  (1, 'Batch 1'),
  (2, 'Batch 2');

-- 7. Drop the old hardcoded CHECK constraint on posts
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_batch_check;

-- 8. Add FK so posts.batch must reference a valid batch_number
ALTER TABLE public.posts
  ADD CONSTRAINT posts_batch_fkey
  FOREIGN KEY (batch)
  REFERENCES public.batches (batch_number)
  ON DELETE RESTRICT;
