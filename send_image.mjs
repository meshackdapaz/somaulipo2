import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase with Service Role Key to bypass RLS for this backend script
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const filePath = "C:\\Users\\Joshan\\Downloads\\csm_john_magufuli_2016_paul_kagame-flickr-com_c8a9b35854.jpg";
  
  const joshId = 'bad86166-3ab7-4b57-9325-a7883edfb314'; // Test User (active user in browser)
  const meshackId = '6c3aeffc-de3a-49f5-b2b5-c532afb88c9d'; // Meshack User

  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    process.exit(1);
  }

  // 1. Get or Create Conversation
  console.log('Fetching/Creating conversation...');
  let convId;
  const { data: convData } = await supabase
    .from('conversations')
    .select('id, participants');
    
  let existingConv = convData?.find(c => c.participants.includes(joshId) && c.participants.includes(meshackId));
  
  if (existingConv) {
    convId = existingConv.id;
  } else {
    const { data: newConv, error: newConvErr } = await supabase
      .from('conversations')
      .insert({ participants: [joshId, meshackId] })
      .select()
      .single();
    if (newConvErr) {
      console.error('Failed to create conversation', newConvErr);
      process.exit(1);
    }
    convId = newConv.id;
  }
  console.log(`Conversation ID: ${convId}`);

  // 2. Upload Image
  console.log('Uploading image...');
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = `${convId}/${Date.now()}_magufuli_kagame.jpg`;
  
  let uploadData, uploadError;
  const uploadAttempt = await supabase.storage
    .from('chat-attachments')
    .upload(fileName, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });
  
  if (uploadAttempt.error && uploadAttempt.error.message.includes('not found')) {
    console.log('Bucket not found, creating it securely...');
    await supabase.storage.createBucket('chat-attachments', { public: true });
    // Try again
    const retroAttempt = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    uploadError = retroAttempt.error;
    uploadData = retroAttempt.data;
  } else {
    uploadError = uploadAttempt.error;
    uploadData = uploadAttempt.data;
  }

  if (uploadError) {
    console.error('Failed to upload image:', uploadError);
    process.exit(1);
  }

  const { data: publicUrlData } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
  const fileUrl = publicUrlData.publicUrl;
  console.log(`Image uploaded successfully: ${fileUrl}`);

  // 3. Insert Message
  console.log('Sending message...');
  const { error: msgErr } = await supabase
    .from('messages')
    .insert({
      conversation_id: convId,
      sender_id: joshId,
      content: fileUrl
    });

  if (msgErr) {
    console.error('Failed to insert message', msgErr);
    process.exit(1);
  }

  await supabase
    .from('conversations')
    .update({ 
      last_message_text: 'Sent an image',
      last_message_at: new Date().toISOString()
    })
    .eq('id', convId);

  console.log('SUCCESS! Image sent to Meshack.');
}

main();
