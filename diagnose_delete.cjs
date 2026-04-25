const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ltquntjtywuhgayediym.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cXVudGp0eXd1aGdheWVkaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDczNDcsImV4cCI6MjA5MTY4MzM0N30.bxnQOweQJ1WiRUr6UG1G1GKOBZECB6RBTXPwgG2GefQ';

const anonSupabase = createClient(SUPABASE_URL, ANON_KEY);

async function diagnose() {
  console.log('--- Diagnosing Delete Issue ---');
  
  // Sign in as meshack
  const { data: signInData, error: signInErr } = await anonSupabase.auth.signInWithPassword({
    email: 'meshackurassa2@gmail.com',
    password: 'Meshack@2026'
  });
  
  if (signInErr) {
    console.error('Sign in failed:', signInErr.message);
    return;
  }
  
  const userId = signInData.user.id;
  console.log('Signed in as:', userId);

  // 1. Get an existing conversation ID
  const { data: convs, error: convErr } = await anonSupabase.from('conversations').select('id').limit(1);
  if (convErr || !convs || convs.length === 0) {
    console.error('Could not get conversation:', convErr);
    return;
  }
  const convId = convs[0].id;

  // 2. Insert a temporary message
  console.log('Inserting a temporary message...');
  const { data: inserted, error: insertErr } = await anonSupabase.from('messages').insert({
    conversation_id: convId,
    sender_id: userId,
    content: 'Testing delete functionality'
  }).select().single();

  if (insertErr) {
    console.error('Failed to insert message:', insertErr);
    return;
  }

  console.log('Message inserted successfully:', inserted.id);

  // 3. Try to delete the message
  console.log('Attempting to delete the message via anon client (simulating user app)...');
  const { error: deleteErr } = await anonSupabase.from('messages').delete().eq('id', inserted.id);
  
  if (deleteErr) {
    console.error('DELETE FAILED:', deleteErr);
  } else {
    console.log('DELETE SUCCESS! Message deleted from DB.');
  }

  // 4. Verify it's really gone by selecting it again
  const { data: checkData, error: checkErr } = await anonSupabase.from('messages').select('id').eq('id', inserted.id);
  if (checkErr) {
    console.error('Check failed:', checkErr);
  } else if (checkData && checkData.length > 0) {
    console.error('Message STILL EXISTS in DB despite no error from delete!');
  } else {
    console.log('Verified: Message is no longer in DB.');
  }
}

diagnose();
