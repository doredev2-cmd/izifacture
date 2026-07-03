const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Checking DB schema/policies...");
    const { data: cols, error: colErr } = await supabase.from('invoices').select('*').limit(1);
    console.log("Service role fetch error:", colErr?.message || colErr);
    if (cols && cols.length > 0) {
        console.log("Columns present in first row:", Object.keys(cols[0]).join(', '));
        console.log("userId of first row:", cols[0].userId);
    } else if (cols && cols.length === 0) {
        console.log("No invoices found, but table exists.");
    } else {
        console.log("Table might not exist or access denied.");
    }

    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
    if (authUsers && authUsers.users.length > 0) {
      console.log(`Found ${authUsers.users.length} users. Using first user ID: ${authUsers.users[0]?.id}`);
      
      const anonClient = createClient(supabaseUrl, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      const res = await anonClient.from('invoices').upsert({
          id: 'test-inv-1',
          userId: authUsers.users[0]?.id,
          companyId: 'co-1',
          invoiceNumber: 'TEST-123',
          clientId: 'test-client',
          clientName: 'Test Client',
          clientEmail: 'test@test.com',
          issueDate: '01/01/2026',
          dueDate: '01/01/2026',
          items: [],
          subtotal: 0,
          taxAmount: 0,
          amount: 0,
          status: 'draft'
      });
      console.log("Anon insert error with userId:", res.error?.message || res.error);

      const res2 = await anonClient.from('invoices').upsert({
        id: 'test-inv-2',
        // OMIT userId
        companyId: 'co-1',
        invoiceNumber: 'TEST-124',
        clientId: 'test-client',
        clientName: 'Test Client',
        clientEmail: 'test@test.com',
        issueDate: '01/01/2026',
        dueDate: '01/01/2026',
        items: [],
        subtotal: 0,
        taxAmount: 0,
        amount: 0,
        status: 'draft'
    });
    console.log("Anon insert error WITHOUT userId:", res2.error?.message || res2.error);
    }
}
run();
