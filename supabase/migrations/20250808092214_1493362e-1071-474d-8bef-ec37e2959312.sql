-- Helper functions to avoid recursive RLS lookups
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = uid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_main_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = uid AND au.is_main_admin = true
  );
$$;

-- Fix recursive policies by switching to helper functions
DROP POLICY IF EXISTS "Admins can create invite codes" ON public.admin_invite_codes;
DROP POLICY IF EXISTS "Admins can update invite codes" ON public.admin_invite_codes;
DROP POLICY IF EXISTS "Admins can view invite codes" ON public.admin_invite_codes;

CREATE POLICY "Admins can create invite codes"
ON public.admin_invite_codes
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update invite codes"
ON public.admin_invite_codes
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view invite codes"
ON public.admin_invite_codes
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admin users policies
DROP POLICY IF EXISTS "Admin users can view admin table" ON public.admin_users;
DROP POLICY IF EXISTS "Only main admin can modify admin users" ON public.admin_users;

CREATE POLICY "Admin users can view admin table"
ON public.admin_users
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only main admin can modify admin users"
ON public.admin_users
FOR ALL
USING (public.is_main_admin(auth.uid()))
WITH CHECK (public.is_main_admin(auth.uid()));

-- Moderation logs policies
DROP POLICY IF EXISTS "Admins can create moderation logs" ON public.moderation_logs;
DROP POLICY IF EXISTS "Admins can view moderation logs" ON public.moderation_logs;

CREATE POLICY "Admins can create moderation logs"
ON public.moderation_logs
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view moderation logs"
ON public.moderation_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Create player_activity table for admin analytics
CREATE TABLE IF NOT EXISTS public.player_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid,
  game_id uuid,
  player_name text NOT NULL,
  room_code text NOT NULL,
  device text NOT NULL,
  country text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.player_activity ENABLE ROW LEVEL SECURITY;

-- RLS for activity
DROP POLICY IF EXISTS "Anyone can insert activity" ON public.player_activity;
DROP POLICY IF EXISTS "Admins can view activity" ON public.player_activity;
DROP POLICY IF EXISTS "Admins can delete activity" ON public.player_activity;

CREATE POLICY "Anyone can insert activity"
ON public.player_activity
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view activity"
ON public.player_activity
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete activity"
ON public.player_activity
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_player_activity_created_at ON public.player_activity (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_activity_room_code ON public.player_activity (room_code);
