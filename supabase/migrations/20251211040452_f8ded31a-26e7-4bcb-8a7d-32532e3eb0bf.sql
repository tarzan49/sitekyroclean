-- Create scratch_card_interactions table
CREATE TABLE public.scratch_card_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  device_type TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_url TEXT DEFAULT '/'
);

-- Enable Row Level Security
ALTER TABLE public.scratch_card_interactions ENABLE ROW LEVEL SECURITY;

-- Create policy for insert (public - anyone can be tracked)
CREATE POLICY "Anyone can record scratch card interaction" 
ON public.scratch_card_interactions 
FOR INSERT 
WITH CHECK (true);

-- Create index for analytics queries
CREATE INDEX idx_scratch_card_completed_at ON public.scratch_card_interactions(completed_at);