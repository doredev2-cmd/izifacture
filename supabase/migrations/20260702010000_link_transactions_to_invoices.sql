-- Migration: Link public.transactions to public.invoices to handle deletes in cascade
-- In invoices table, the id is of type TEXT. So invoiceId must also be TEXT.
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "invoiceId" TEXT REFERENCES public.invoices(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT;
