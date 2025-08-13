-- Security hardening for game data exposure
-- 1) Add user_id to players for linking to auth users
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_players_user ON public.players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_game_user ON public.players(game_id, user_id);

-- 2) Helper function to check if current user is a player in a game
CREATE OR REPLACE FUNCTION public.is_player_in_game(_game_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.players
    WHERE game_id = _game_id AND user_id = auth.uid()
  );
$$;

-- 3) Tighten RLS policies
-- GAMES: drop permissive policies
DROP POLICY IF EXISTS "Anyone can view games" ON public.games;
DROP POLICY IF EXISTS "Anyone can update games" ON public.games;
DROP POLICY IF EXISTS "Anyone can create games" ON public.games;

-- GAMES: restrictive policies
CREATE POLICY "Players can view their game"
ON public.games
FOR SELECT
USING (public.is_player_in_game(id));

CREATE POLICY "Authenticated can create games"
ON public.games
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Players can update their game"
ON public.games
FOR UPDATE
USING (public.is_player_in_game(id));

-- PLAYERS: drop permissive policies
DROP POLICY IF EXISTS "Anyone can create players" ON public.players;
DROP POLICY IF EXISTS "Anyone can delete players" ON public.players;
DROP POLICY IF EXISTS "Anyone can update players" ON public.players;
DROP POLICY IF EXISTS "Anyone can view players" ON public.players;

-- PLAYERS: restrictive policies
CREATE POLICY "Players: insert own record"
ON public.players
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Players: view same game"
ON public.players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players p2
    WHERE p2.game_id = players.game_id AND p2.user_id = auth.uid()
  )
);

CREATE POLICY "Players: update own record"
ON public.players
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Players: delete own record"
ON public.players
FOR DELETE
USING (user_id = auth.uid());

-- CHAT MESSAGES: drop permissive policies
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;

-- CHAT MESSAGES: restrictive policies
CREATE POLICY "Players can create messages in their game"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.id = chat_messages.player_id
      AND p.game_id = chat_messages.game_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Players can view messages in their game"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.game_id = chat_messages.game_id
      AND p.user_id = auth.uid()
  )
);

-- DRAWING STROKES: drop permissive policies
DROP POLICY IF EXISTS "Anyone can create strokes" ON public.drawing_strokes;
DROP POLICY IF EXISTS "Anyone can delete strokes" ON public.drawing_strokes;
DROP POLICY IF EXISTS "Anyone can view strokes" ON public.drawing_strokes;

-- DRAWING STROKES: restrictive policies
CREATE POLICY "Players can insert strokes in their game"
ON public.drawing_strokes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.game_id = drawing_strokes.game_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Players can delete strokes in their game"
ON public.drawing_strokes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.game_id = drawing_strokes.game_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Players can view strokes in their game"
ON public.drawing_strokes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.game_id = drawing_strokes.game_id
      AND p.user_id = auth.uid()
  )
);

-- 4) RPC to safely join a game without exposing all games
CREATE OR REPLACE FUNCTION public.join_game(p_room_code text, p_player_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g public.games%ROWTYPE;
  p public.players%ROWTYPE;
  current_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO g FROM public.games WHERE room_code = p_room_code LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found';
  END IF;

  SELECT count(*) INTO current_count FROM public.players WHERE game_id = g.id;
  IF current_count >= COALESCE(g.max_players, 8) THEN
    RAISE EXCEPTION 'Game is full';
  END IF;

  -- Reuse existing player if already joined from this device/user
  SELECT * INTO p FROM public.players WHERE game_id = g.id AND user_id = auth.uid() LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.players (game_id, name, is_host, is_ready, user_id, avatar_color)
    VALUES (g.id, COALESCE(NULLIF(trim(p_player_name), ''), 'Hráč'), false, false, auth.uid(), 'bg-blue-500')
    RETURNING * INTO p;
  ELSE
    -- Optionally update name
    IF p_player_name IS NOT NULL AND length(trim(p_player_name)) > 0 AND p.name <> p_player_name THEN
      UPDATE public.players SET name = p_player_name WHERE id = p.id;
      SELECT * INTO p FROM public.players WHERE id = p.id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'game', to_jsonb(g),
    'player', to_jsonb(p)
  );
END;
$$;