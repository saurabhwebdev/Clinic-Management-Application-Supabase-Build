import { createClient } from '@supabase/supabase-js';

// Using the new project credentials
const supabaseUrl = 'https://pihqzlcmgilqoexcjtrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpaHF6bGNtZ2lscW9leGNqdHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDM0NjEsImV4cCI6MjA2NTExOTQ2MX0.x-pbjy7eIAmfAYH5QyojZ-RjwsjblA14GtGSWNq_zXs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 