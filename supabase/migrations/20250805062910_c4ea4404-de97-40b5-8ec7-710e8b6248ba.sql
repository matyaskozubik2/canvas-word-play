-- Create moderation_logs table for tracking admin actions
CREATE TABLE public.moderation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'player' or 'game'
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for moderation_logs
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view and insert moderation logs
CREATE POLICY "Admins can view moderation logs" 
ON public.moderation_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_users au 
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Admins can create moderation logs" 
ON public.moderation_logs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM admin_users au 
  WHERE au.user_id = auth.uid()
));