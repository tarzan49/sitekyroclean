-- =============================================
-- FIX 1: newsletter_subscribers security
-- =============================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Service role can read subscribers" ON public.newsletter_subscribers;

-- Create secure INSERT policy (public can subscribe but not read)
CREATE POLICY "Public can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create secure SELECT policy (only service_role can read)
CREATE POLICY "Only service role can read subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO service_role
USING (true);

-- Add UNIQUE constraint on email to prevent spam duplicates
ALTER TABLE public.newsletter_subscribers 
ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email);

-- =============================================
-- FIX 2: scratch_card_interactions security
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can record scratch card interaction" ON public.scratch_card_interactions;

-- Create secure INSERT policy with basic validation
CREATE POLICY "Public can record scratch interaction"
ON public.scratch_card_interactions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Basic validation: device_type must be reasonable length
  (device_type IS NULL OR length(device_type) <= 20)
  AND
  -- page_url must be reasonable length
  (page_url IS NULL OR length(page_url) <= 500)
  AND
  -- session_id must be reasonable length
  length(session_id) <= 100
);

-- Create secure SELECT policy (only service_role can read analytics)
CREATE POLICY "Only service role can read analytics"
ON public.scratch_card_interactions
FOR SELECT
TO service_role
USING (true);