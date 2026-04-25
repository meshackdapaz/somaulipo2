const { createClient } = require('@supabase/supabase-js');
// Use SERVICE ROLE key to bypass RLS and see ALL data
const supabase = createClient(
  'https://ltquntjtywuhgayediym.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cXVudGp0eXd1aGdheWVkaXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwNzM0NywiZXhwIjoyMDkxNjgzMzQ3fQ.dQwgsjok6NEFvgAJK_JUcICqwvTPNJbUmWXjY0KRBO0'
);

async function check() {
  // Check latest 5 messages
  const { data: msgs, error: e1 } = await supabase.from('messages').select('id, sender_id, content, file_url, created_at').order('created_at', { ascending: false }).limit(5);
  console.log('Latest messages:', JSON.stringify(msgs, null, 2));
  
  // Check the profiles to get the admin user ID
  const { data: profiles, error: e2 } = await supabase.from('profiles').select('id, full_name, email').limit(5);
  console.log('Profiles:', JSON.stringify(profiles, null, 2));
}

check();
