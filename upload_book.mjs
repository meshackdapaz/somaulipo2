import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://ltquntjtywuhgayediym.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cXVudGp0eXd1aGdheWVkaXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwNzM0NywiZXhwIjoyMDkxNjgzMzQ3fQ.dQwgsjok6NEFvgAJK_JUcICqwvTPNJbUmWXjY0KRBO0';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  const filePath = 'C:/Users/Joshan/Downloads/MY FIRST DAY AT-WPS Office.docx.pdf';
  const storagePath = `books/${Date.now()}_MY_FIRST_DAY_AT_University.pdf`;

  console.log('Reading file...');
  const fileBuffer = readFileSync(filePath);
  
  console.log('Uploading to Supabase storage...');
  const { data: storageData, error: storageErr } = await supabase.storage
    .from('digital-library')
    .upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: false });

  if (storageErr) {
    console.error('STORAGE ERROR:', storageErr.message);
    return;
  }
  console.log('Storage: OK', storageData.path);

  const { data: { publicUrl } } = supabase.storage.from('digital-library').getPublicUrl(storagePath);
  console.log('Public URL:', publicUrl);

  // Verify URL is accessible
  const testRes = await fetch(publicUrl);
  console.log('URL fetch status:', testRes.status);

  // Check existing columns
  const { data: row } = await supabase.from('library_books').select('*').limit(1).single();
  const existingCols = row ? Object.keys(row) : [];
  console.log('Existing columns:', existingCols);

  // Build insert payload based on available columns
  const payload = { title: 'MY FIRST DAY AT UNIVERSITY', file_url: publicUrl };
  if (existingCols.includes('category')) payload.category = 'General';
  if (existingCols.includes('description')) payload.description = 'First day experience at university';
  if (existingCols.includes('pages')) payload.pages = 1;

  const { data: insertData, error: insertErr } = await supabase.from('library_books').insert(payload).select('id').single();
  if (insertErr) console.error('INSERT ERROR:', insertErr.message, insertErr.code);
  else console.log('INSERT OK, id:', insertData.id);

  console.log('\nRefresh the Digital Library in the app to see the new book!');
}

run().catch(e => console.error('Fatal:', e.message));
