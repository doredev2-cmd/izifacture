const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Fetching users...");
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    if (!authUsers || authUsers.users.length === 0) {
        console.log("No users found.");
        return;
    }
    
    const userId = authUsers.users[0].id;
    console.log(`Using userId: ${userId} for reassignment`);

    // Update companies
    const { data: co, error: e1 } = await supabase.from('companies').update({ userId }).is('userId', null);
    console.log("Updated companies:", e1 || "Success");

    // Update clients
    const { data: cl, error: e2 } = await supabase.from('clients').update({ userId }).is('userId', null);
    console.log("Updated clients:", e2 || "Success");

    // Update invoices
    const { data: inv, error: e3 } = await supabase.from('invoices').update({ userId }).is('userId', null);
    console.log("Updated invoices:", e3 || "Success");

    // Update transactions
    const { data: tr, error: e4 } = await supabase.from('transactions').update({ userId }).is('userId', null);
    console.log("Updated transactions:", e4 || "Success");
}

run();
