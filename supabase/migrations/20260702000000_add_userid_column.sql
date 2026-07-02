-- Migration: Add "userId" column to isolate data by user
-- Table: public.companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table: public.clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table: public.invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table: public.transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;
