-- Migration: Replace foreign keys to enable ON DELETE CASCADE
-- This ensures that when a company or client is deleted, all their child records (invoices, clients) are deleted.

DO $$ 
DECLARE
  fk_name text;
BEGIN
  -----------------------------------------------------------------------------
  -- 1. invoices -> clients (ON DELETE CASCADE)
  -----------------------------------------------------------------------------
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'invoices'
    AND kcu.column_name = 'clientId';

  IF fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.invoices DROP CONSTRAINT ' || quote_ident(fk_name);
  END IF;

  ALTER TABLE public.invoices 
    ADD CONSTRAINT invoices_clientId_fkey 
    FOREIGN KEY ("clientId") 
    REFERENCES public.clients(id) 
    ON DELETE CASCADE;

  -----------------------------------------------------------------------------
  -- 2. invoices -> companies (ON DELETE CASCADE)
  -----------------------------------------------------------------------------
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'invoices'
    AND kcu.column_name = 'companyId';

  IF fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.invoices DROP CONSTRAINT ' || quote_ident(fk_name);
  END IF;

  ALTER TABLE public.invoices 
    ADD CONSTRAINT invoices_companyId_fkey 
    FOREIGN KEY ("companyId") 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;
    
  -----------------------------------------------------------------------------
  -- 3. clients -> companies (ON DELETE CASCADE)
  -----------------------------------------------------------------------------
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'clients'
    AND kcu.column_name = 'companyId';

  IF fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.clients DROP CONSTRAINT ' || quote_ident(fk_name);
  END IF;

  -- Verify if clients has companyId, add it safely
  BEGIN
    ALTER TABLE public.clients 
      ADD CONSTRAINT clients_companyId_fkey 
      FOREIGN KEY ("companyId") 
      REFERENCES public.companies(id) 
      ON DELETE CASCADE;
  EXCEPTION WHEN undefined_column THEN
    -- If companyId doesn't exist on clients, ignore
    NULL;
  END;
END $$;
