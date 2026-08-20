import { createClient } from '@supabase/supabase-js';

// Your actual Supabase Project URL and Anon Key
const supabaseUrl = 'https://tqkmxdvgnsqicjuomqgi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxa214ZHZnbnNxaWNqdW9tcWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDkwMjEsImV4cCI6MjEwMjcyNTAyMX0.mCi0C0LIGOYDvNoBKvfJgDDURVXrW8f8rGP6WjV4G5c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);