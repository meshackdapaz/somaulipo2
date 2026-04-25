import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ltquntjtywuhgayediym.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cXVudGp0eXd1aGdheWVkaXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwNzM0NywiZXhwIjoyMDkxNjgzMzQ3fQ.dQwgsjok6NEFvgAJK_JUcICqwvTPNJbUmWXjY0KRBO0';

async function run() {
  const projectRef = 'ltquntjtywuhgayediym';
  
  const sqls = [
    `CREATE TABLE IF NOT EXISTS public.flashcards (
      id uuid default gen_random_uuid() primary key,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      user_id uuid references public.profiles(id) on delete cascade not null,
      deck_name text not null,
      front text not null,
      back text not null
    );`,
    "ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;",
    "DROP POLICY IF EXISTS \"Users can view their own flashcards\" ON public.flashcards;",
    "CREATE POLICY \"Users can view their own flashcards\" ON public.flashcards FOR SELECT USING (auth.uid() = user_id);",
    "DROP POLICY IF EXISTS \"Users can insert their own flashcards\" ON public.flashcards;",
    "CREATE POLICY \"Users can insert their own flashcards\" ON public.flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);",
    "DROP POLICY IF EXISTS \"Users can update their own flashcards\" ON public.flashcards;",
    "CREATE POLICY \"Users can update their own flashcards\" ON public.flashcards FOR UPDATE USING (auth.uid() = user_id);",
    "DROP POLICY IF EXISTS \"Users can delete their own flashcards\" ON public.flashcards;",
    "CREATE POLICY \"Users can delete their own flashcards\" ON public.flashcards FOR DELETE USING (auth.uid() = user_id);"
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
