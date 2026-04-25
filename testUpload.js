import { createClient } from '@supabase/supabase-js';

// read environment variables for supabase url and key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://g76b2t5b.eu-central.insforge.app';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // replace with actual env variable or pass it
if (!supabaseKey) {
  console.log('Error: missing token. You can pass it as a parameter.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log("Starting DB insert test");
  
  // authenticate
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'joshan@example.com', // replace or somehow get a valid session
    password: 'password123' 
  });
  
  if (authError) {
     console.log("Auth error, try without or create a user:", authError.message);
  } else {
     console.log("Authenticated as:", authData.user.id);
  }
}
testUpload();
