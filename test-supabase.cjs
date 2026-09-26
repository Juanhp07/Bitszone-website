const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oxloqoggjldbjjratwoh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o'
);

async function check() {
  const { data: d1 } = await supabase.storage.from('songs').list('Meteoro', { limit: 100, search: '' });
  console.log('Meteoro files:', d1);
  const { data: d2 } = await supabase.storage.from('songs').list("Hollywood's Bleeding", { limit: 100, search: '' });
  console.log("Hollywood's Bleeding files:", d2);
  const { data: d3 } = await supabase.storage.from('songs').list("Meteora", { limit: 100, search: '' });
  console.log("Meteora files:", d3);
}

check();
