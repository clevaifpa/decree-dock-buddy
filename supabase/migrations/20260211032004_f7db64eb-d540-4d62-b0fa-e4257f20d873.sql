
-- Profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Contract categories
CREATE TYPE public.contract_category AS ENUM ('partner', 'office', 'service', 'hr', 'procurement');
CREATE TYPE public.contract_status AS ENUM ('draft', 'pending_review', 'in_review', 'approved', 'rejected', 'signed', 'active', 'expired', 'liquidated');
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.obligation_type AS ENUM ('payment', 'delivery', 'reporting', 'renewal', 'compliance', 'other');
CREATE TYPE public.obligation_status AS ENUM ('pending', 'completed', 'overdue');

-- Contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  partner TEXT NOT NULL,
  department TEXT NOT NULL,
  requester TEXT NOT NULL,
  requester_user_id UUID REFERENCES auth.users(id),
  status public.contract_status NOT NULL DEFAULT 'draft',
  priority public.priority_level NOT NULL DEFAULT 'medium',
  category public.contract_category,
  value BIGINT,
  description TEXT,
  doc_link TEXT,
  review_deadline DATE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view all contracts" ON public.contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contracts" ON public.contracts FOR UPDATE TO authenticated USING (true);

-- Obligations table
CREATE TABLE public.obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  type public.obligation_type NOT NULL DEFAULT 'other',
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status public.obligation_status NOT NULL DEFAULT 'pending',
  amount BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view obligations" ON public.obligations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert obligations" ON public.obligations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update obligations" ON public.obligations FOR UPDATE TO authenticated USING (true);

-- Contract files table
CREATE TABLE public.contract_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  is_liquidation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view files" ON public.contract_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert files" ON public.contract_files FOR INSERT TO authenticated WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for contract files
INSERT INTO storage.buckets (id, name, public) VALUES ('contract-files', 'contract-files', false);
CREATE POLICY "Authenticated users can upload contract files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'contract-files');
CREATE POLICY "Authenticated users can view contract files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'contract-files');
