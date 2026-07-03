const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function checkData() {
    const srvSupabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("--- COMPANIES ---");
    const { data: allCompanies } = await srvSupabase.from('companies').select('id, name, userId');
    console.log(allCompanies);

    console.log("--- INVOICES ---");
    const { data: allInvoices } = await srvSupabase.from('invoices').select('id, invoiceNumber, userId, companyId');
    console.log(allInvoices);
    
    console.log("--- CLIENTS ---");
    const { data: allClients } = await srvSupabase.from('clients').select('id, name, userId');
    console.log(allClients);
}
checkData();
