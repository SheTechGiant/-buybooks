// Uploads the sample catalog (src/data/books.js) to your Supabase "books" table.
// Run after schema.sql:  npm run seed
// Safe to re-run — existing books are updated, not duplicated.
import { createClient } from '@supabase/supabase-js';
import { BOOKS } from '../src/data/books.js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { error } = await supabase.from('books').upsert(BOOKS);
if (error) {
  console.error('Seeding failed:', error.message);
  process.exit(1);
}
console.log(`✓ ${BOOKS.length} books uploaded to Supabase.`);
