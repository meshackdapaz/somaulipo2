const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ltquntjtywuhgayediym.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cXVudGp0eXd1aGdheWVkaXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwNzM0NywiZXhwIjoyMDkxNjgzMzQ3fQ.dQwgsjok6NEFvgAJK_JUcICqwvTPNJbUmWXjY0KRBO0';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  // 1. Upload the file to storage
  const fs = require('fs');
  const path = require('path');
  
  const filePath = 'C:\\Users\\Joshan\\Downloads\\MY FIRST DAY AT-WPS Office.docx.pdf';
  const fileName = 'MY_FIRST_DAY_AT_University.pdf';
  const storagePath = 'books/' + Date.now() + '_' + fileName;
  
  console.log('Reading file...');
  const fileBuffer = fs.readFileSync(filePath);
  
  console.log('Uploading to storage...');
  const { data: storageData, error: storageErr } = await supabase.storage
    .from('digital-library')
    .upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: false });
  
  if (storageErr) {
    console.error('Storage upload failed:', storageErr.message);
    return;
  }
  console.log('Storage upload OK:', storageData);
  
  // 2. Get public URL
  const { data: { publicUrl } } = supabase.storage.from('digital-library').getPublicUrl(storagePath);
  console.log('Public URL:', publicUrl);
  
  // 3. Test URL is accessible
  const testRes = await fetch(publicUrl);
  console.log('URL test status:', testRes.status, testRes.statusText);
  
  // 4. Insert DB record with all columns
  // First check columns
  const { data: existing, error: selectErr } = await supabase.from('library_books').select('*').limit(1);
  if (existing && existing.length > 0) {
    console.log('Existing columns:', Object.keys(existing[0]));
  }
  
  // Try to add columns via direct insert (service role bypasses RLS)
  const insertPayload = {
    title: 'MY FIRST DAY AT UNIVERSITY',
    file_url: publicUrl
  };
  
  // Try with extra fields (they'll fail gracefully if columns don't exist)
  try {
    const { data: insertData, error: insertErr } = await supabase.from('library_books').insert({
      ...insertPayload,
      category: 'General',
      description: 'First day at university story',
      pages: 1
    }).select('id').single();
    
    if (insertErr && insertErr.code === 'PGRST204') {
      console.log('Extra columns missing, inserting without them...');
      const { data: d2, error: e2 } = await supabase.from('library_books').insert(insertPayload).select('id').single();
      if (e2) console.error('Fallback insert failed:', e2.message);
      else console.log('Inserted OK (without extra cols), id:', d2.id);
    } else if (insertErr) {
      console.error('Insert failed:', insertErr.message);
    } else {
      console.log('Insert OK with all columns, id:', insertData.id);
    }
  } catch(e) {
    console.error('Exception:', e.message);
  }
  
  console.log('\nDone! The book should now appear in the library.');
}

run().catch(console.error);
