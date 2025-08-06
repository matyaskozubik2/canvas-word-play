-- Create admin invite codes table
CREATE TABLE public.admin_invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT false,
  used_by_email TEXT,
  created_by_admin UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admin_invite_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can view invite codes" 
ON public.admin_invite_codes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_users au 
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Admins can create invite codes" 
ON public.admin_invite_codes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM admin_users au 
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Admins can update invite codes" 
ON public.admin_invite_codes 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM admin_users au 
  WHERE au.user_id = auth.uid()
));

-- Add trigger for updated_at column
CREATE TRIGGER update_admin_invite_codes_updated_at
  BEFORE UPDATE ON public.admin_invite_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate random invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$;