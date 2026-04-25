const { createClient } = require('@supabase/supabase-js');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cXVudGp0eXd1aGdheWVkaXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwNzM0NywiZXhwIjoyMDkxNjgzMzQ3fQ.dQwgsjok6NEFvgAJK_JUcICqwvTPNJbUmWXjY0KRBO0';
const supabase = createClient('https://ltquntjtywuhgayediym.supabase.co', SERVICE_KEY);

async function fixAndTest() {
  // 1. Delete all the test messages from the browser test
  const testMsgIds = [
    '1174e821-eac8-4395-bc31-d6424207d635', // "Test text from Antigravity"
    'c857a6bb-cf0f-4ac8-b323-49885d57da0e', // "Test image from"
    '875fdeec-d1f0-4dba-8e6b-4d1ecf0f36ec', // "hey"
  ];
  
  console.log('Deleting test messages from DB...');
  const { error: deleteErr } = await supabase.from('messages').delete().in('id', testMsgIds);
  if (deleteErr) {
    console.error('Delete failed:', deleteErr.message);
  } else {
    console.log('Success! Test messages deleted.');
  }
  
  // 2. Verify
  const { data } = await supabase.from('messages').select('id, content').order('created_at', { ascending: false }).limit(5);
  console.log('Remaining messages:', JSON.stringify(data, null, 2));
}

fixAndTest();
