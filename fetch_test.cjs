const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxloqoggjldbjjratwoh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bG9xb2dnamxkYmpqcmF0d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAzMzEsImV4cCI6MjEwNTUzNjMzMX0.jgYh-GP25f4krR5CJw8bHzGS9XNnlg9_4TnZQVcj84o';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('tracks').select('*');
  console.log(data, error);
}
test();
