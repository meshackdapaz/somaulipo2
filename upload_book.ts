import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://ltquntjtywuhgayediym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cXVudGp0eXd1aGdheWVkaXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwNzM0NywiZXhwIjoyMDkxNjgzMzQ3fQ.dQwgsjok6NEFvgAJK_JUcICqwvTPNJbUmWXjY0KRBO0';
const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = process.argv[2];
const fileName = path.basename(filePath);

async function run() {
  // Try to create bucket
  await supabase.storage.createBucket('digital-library', { public: true });
  
  const fileBuffer = fs.readFileSync(filePath);
  const uploadPath = `books/${Date.now()}_${fileName}`;
  
  console.log(`Uploading ${fileName} to storage...`);
  const { data, error } = await supabase.storage.from('digital-library').upload(uploadPath, fileBuffer, {
    contentType: 'application/pdf',
  });
  
  if (error) {
    console.error("Upload error:", error);
    process.exit(1);
  }
  
  const { data: { publicUrl } } = supabase.storage.from('digital-library').getPublicUrl(uploadPath);
  
  console.log(`Inserting DB record for URL: ${publicUrl}`);
  
  const { data: users, error: userError } = await supabase.from('profiles').select('id').eq('is_admin', true).limit(1);
  let adminId = users && users.length > 0 ? users[0].id : null;
  
  if (!adminId) {
     const { data: backupUsers } = await supabase.from('profiles').select('id').limit(1);
     if (backupUsers && backupUsers.length > 0) adminId = backupUsers[0].id;
  }
  
  const insertData: any = { title: fileName, file_url: publicUrl };
  if (adminId) insertData.uploaded_by = adminId;
  
  const { error: dbError } = await supabase.from('library_books').insert(insertData);
  
  if (dbError) {
    console.error("DB Insert error:", dbError);
    process.exit(1);
  }
  
  console.log("Successfully uploaded and inserted!");
}

run();
