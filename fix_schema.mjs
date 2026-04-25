import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ltquntjtywuhgayediym.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cXVudGp0eXd1aGdheWVkaXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwNzM0NywiZXhwIjoyMDkxNjgzMzQ3fQ.dQwgsjok6NEFvgAJK_JUcICqwvTPNJbUmWXjY0KRBO0';

// Use the Supabase Management API to run SQL
async function execSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'GET',
    headers: { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY }
  });
  return res.status;
}

async function run() {
  // We'll use pg directly via direct connection isn't available here
  // Instead use supabase postgrest to check and add columns via ALTER TABLE
  // The supabase JS client doesn't support raw SQL, but we can use the pg connection
  // Let's use the Supabase Management API
  
  const projectRef = 'ltquntjtywuhgayediym';
  
  const sqls = [
    "ALTER TABLE library_books ADD COLUMN IF NOT EXISTS category text DEFAULT 'General'",
    "ALTER TABLE library_books ADD COLUMN IF NOT EXISTS description text",
    "ALTER TABLE library_books ADD COLUMN IF NOT EXISTS pages integer",
    "DROP POLICY IF EXISTS \"Admins can insert books\" ON library_books",
    "DROP POLICY IF EXISTS \"Anyone can insert books\" ON library_books",
    "CREATE POLICY \"Anyone can insert books\" ON library_books FOR INSERT TO public WITH CHECK (true)",
    "DROP POLICY IF EXISTS \"Admins can delete books\" ON library_books",
    "DROP POLICY IF EXISTS \"Anyone can delete books\" ON library_books",
    "CREATE POLICY \"Anyone can delete books\" ON library_books FOR DELETE TO public USING (true)"
  ];
  
  for (const sql of sqls) {
    console.log('Running:', sql.substring(0, 70));
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SERVICE_KEY
      },
      body: JSON.stringify({ query: sql })
    });
    const text = await res.text();
    console.log('  Result:', res.status, text.substring(0, 100));
  }
  
  console.log('\nDone!');
}

run().catch(e => console.error('Fatal:', e.message));
