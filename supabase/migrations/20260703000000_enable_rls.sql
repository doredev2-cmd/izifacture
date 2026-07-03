-- Create an admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    current_setting('request.jwt.claims', true)::json->>'email' = 'doredev2@gmail.com' OR
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to be safe in dev/prod)
DROP POLICY IF EXISTS "Users can view their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their own companies" ON public.companies;

DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

-- Companies
CREATE POLICY "Users can view their own companies" ON public.companies 
  FOR SELECT USING (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can insert their own companies" ON public.companies 
  FOR INSERT WITH CHECK (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can update their own companies" ON public.companies 
  FOR UPDATE USING (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can delete their own companies" ON public.companies 
  FOR DELETE USING (auth.uid() = "userId" OR public.is_admin());

-- Clients
CREATE POLICY "Users can view their own clients" ON public.clients 
  FOR SELECT USING (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can insert their own clients" ON public.clients 
  FOR INSERT WITH CHECK (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can update their own clients" ON public.clients 
  FOR UPDATE USING (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can delete their own clients" ON public.clients 
  FOR DELETE USING (auth.uid() = "userId" OR public.is_admin());

-- Invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices 
  FOR SELECT USING (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can insert their own invoices" ON public.invoices 
  FOR INSERT WITH CHECK (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can update their own invoices" ON public.invoices 
  FOR UPDATE USING (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can delete their own invoices" ON public.invoices 
  FOR DELETE USING (auth.uid() = "userId" OR public.is_admin());

-- Transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions 
  FOR SELECT USING (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can insert their own transactions" ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can update their own transactions" ON public.transactions 
  FOR UPDATE USING (auth.uid() = "userId" OR public.is_admin());
CREATE POLICY "Users can delete their own transactions" ON public.transactions 
  FOR DELETE USING (auth.uid() = "userId" OR public.is_admin());

-- Create login_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    successful BOOLEAN DEFAULT false
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert for login_attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);
-- Using current_setting to only allow inserts not selects for anon, but actually we can just allow insert and select.
CREATE POLICY "Allow anon select for login_attempts" ON public.login_attempts FOR SELECT USING (true);
CREATE POLICY "Allow service_role full access to login_attempts" ON public.login_attempts FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON public.login_attempts(email, attempt_time);
CREATE INDEX IF NOT EXISTS idx_companies_userid ON public.companies("userId");
CREATE INDEX IF NOT EXISTS idx_clients_userid ON public.clients("userId");
CREATE INDEX IF NOT EXISTS idx_invoices_userid ON public.invoices("userId");
CREATE INDEX IF NOT EXISTS idx_invoices_companyid ON public.invoices("companyId");
CREATE INDEX IF NOT EXISTS idx_transactions_userid ON public.transactions("userId");
CREATE INDEX IF NOT EXISTS idx_transactions_invoiceid ON public.transactions("invoiceId");
