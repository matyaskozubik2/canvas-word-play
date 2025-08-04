-- Vytvoření admin uživatele
-- Poznámka: Uživatel se musí nejdřív zaregistrovat přes aplikaci s emailem matyaskozubik2@icloud.com

-- Vytvoření tabulky pro admin oprávnění
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_main_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Povolit RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Vytvořit policies
CREATE POLICY "Admin users can view admin table" 
ON public.admin_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  )
);

CREATE POLICY "Only main admin can modify admin users" 
ON public.admin_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_main_admin = true
  )
);

-- Vytvořit funkci pro automatické přidání hlavního admina
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vytvořit trigger pro automatické přidání admina při registraci
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vytvořit funkci pro aktualizaci timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vytvořit trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();