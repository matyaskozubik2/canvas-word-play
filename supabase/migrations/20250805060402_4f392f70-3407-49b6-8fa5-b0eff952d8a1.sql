-- Oprava bezpečnostních varování - přidání search_path do funkcí

-- Oprava funkce handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Pokud se registruje hlavní admin email, přidej ho jako hlavního admina
  IF NEW.email = 'matyaskozubik2@icloud.com' THEN
    INSERT INTO public.admin_users (user_id, email, is_main_admin)
    VALUES (NEW.id, NEW.email, true);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Oprava funkce update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Oprava funkce generate_room_code
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$;

-- Oprava funkce increment_player_score
CREATE OR REPLACE FUNCTION public.increment_player_score(player_id uuid, points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.players 
  SET score = COALESCE(score, 0) + points 
  WHERE id = player_id;
END;
$$;