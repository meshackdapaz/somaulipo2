const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ltquntjtywuhgayediym.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cXVudGp0eXd1aGdheWVkaXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwNzM0NywiZXhwIjoyMDkxNjgzMzQ3fQ.dQwgsjok6NEFvgAJK_JUcICqwvTPNJbUmWXjY0KRBO0'
);
async function check() {
  const { data, error } = await supabase.from('messages').select('*').order('created_at', {ascending: false}).limit(5);
  console.log(JSON.stringify(data, null, 2));
}
check();
