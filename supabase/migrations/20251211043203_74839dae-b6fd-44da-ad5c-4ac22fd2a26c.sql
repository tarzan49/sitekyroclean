-- =============================================
-- FIX: Add PERMISSIVE policies that deny public access
-- =============================================

-- Drop the service_role only policies
DROP POLICY IF EXISTS "Only service role can read subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Only service role can read analytics" ON public.scratch_card_interactions;

-- Create PERMISSIVE SELECT policy that denies public access for newsletter_subscribers
CREATE POLICY "Deny public read newsletter"
ON public.newsletter_subscribers
FOR SELECT
USING (false);

-- Create PERMISSIVE SELECT policy that denies public access for scratch_card_interactions
CREATE POLICY "Deny public read analytics"
ON public.scratch_card_interactions
FOR SELECT
USING (false);