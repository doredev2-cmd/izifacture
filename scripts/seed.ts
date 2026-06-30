import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { mockCompanies, mockClients, mockInvoices, mockTransactions } from '../lib/data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding Companies...');
  for (const company of mockCompanies) {
    await supabase.from('companies').upsert({
      id: company.id,
      name: company.name,
      email: company.email,
      logo: company.logo,
      currency: company.currency,
      address: company.address,
      rccm: company.rccm,
      nif: company.nif
    });
  }

  console.log('Seeding Clients...');
  for (const client of mockClients) {
    await supabase.from('clients').upsert({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    });
  }

  console.log('Seeding Invoices...');
  for (const invoice of mockInvoices) {
    await supabase.from('invoices').upsert({
      id: invoice.id,
      companyId: invoice.companyId || 'co-1',
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount || 0,
      amount: invoice.amount,
      status: invoice.status,
      paymentMethod: invoice.paymentMethod
    });
  }

  console.log('Seeding Transactions...');
  for (const transaction of mockTransactions) {
    await supabase.from('transactions').upsert({
      id: transaction.id,
      date: transaction.date,
      description: transaction.description,
      type: transaction.type,
      method: transaction.method,
      amount: transaction.amount,
      status: transaction.status
    });
  }

  console.log('Seed complete!');
}

seed().catch(console.error);
