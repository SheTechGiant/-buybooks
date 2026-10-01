// Gives an existing account admin rights.
//   npm run make-admin -- someone@example.com            (add)
//   npm run make-admin -- someone@example.com --remove   (remove)
// The person must have signed up on the website first.
import { createClient } from '@supabase/supabase-js';

const [email, flag] = process.argv.slice(2);
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!email) {
  console.error('Usage: npm run make-admin -- someone@example.com [--remove]');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Find the account by email (checks every page of users).
let user = null;
for (let page = 1; !user; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) { console.error(error.message); process.exit(1); }
  user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (data.users.length < 200) break;
}
if (!user) {
  console.error(`No account found for ${email}. Sign up on the website first, then run this again.`);
  process.exit(1);
}

const { error } = flag === '--remove'
  ? await supabase.from('admins').delete().eq('user_id', user.id)
  : await supabase.from('admins').upsert({ user_id: user.id });
if (error) {
  console.error('Failed:', error.message, error.code === '42P01' ? '\n→ Run supabase/admin.sql in the Supabase SQL Editor first.' : '');
  process.exit(1);
}
console.log(flag === '--remove' ? `✓ ${email} is no longer an admin.` : `✓ ${email} is now an admin. Sign out and in again, then open /admin.`);
