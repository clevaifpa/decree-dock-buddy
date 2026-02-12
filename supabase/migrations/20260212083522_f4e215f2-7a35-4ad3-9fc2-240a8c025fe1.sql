
-- 1. User roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Auto-assign role function (called from frontend)
CREATE OR REPLACE FUNCTION public.ensure_user_role()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()) THEN RETURN; END IF;
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email = 'linhnt2@clevai.edu.vn' THEN
    INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'user') ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Assign roles to existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, CASE WHEN email = 'linhnt2@clevai.edu.vn' THEN 'admin'::app_role ELSE 'user'::app_role END
FROM auth.users
ON CONFLICT DO NOTHING;

-- 2. Dynamic contract categories
CREATE TABLE public.contract_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '📄',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.contract_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert categories" ON public.contract_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update categories" ON public.contract_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete categories" ON public.contract_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.contract_categories (name, slug, icon) VALUES
  ('Hợp đồng đối tác', 'partner', '🤝'),
  ('Hợp đồng thuê nhà', 'rental', '🏠'),
  ('Hợp đồng thương mại', 'commercial', '💼'),
  ('Hợp đồng dịch vụ', 'service', '⚙️'),
  ('Hợp đồng nhân sự', 'hr', '👥'),
  ('Hợp đồng mua sắm', 'procurement', '📦');

-- 3. Add category_id FK to contracts
ALTER TABLE public.contracts ADD COLUMN category_id UUID REFERENCES public.contract_categories(id);

-- 4. Contract status history (timeline)
CREATE TABLE public.contract_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_by_name TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view history" ON public.contract_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert history" ON public.contract_status_history FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Auto-record status changes trigger
CREATE OR REPLACE FUNCTION public.record_contract_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.contract_status_history (contract_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status::text, NEW.status::text, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_contract_status_change
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.record_contract_status_change();

-- 6. DELETE policies (admin only)
CREATE POLICY "Admin can delete contracts" ON public.contracts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete obligations" ON public.obligations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete files" ON public.contract_files FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
