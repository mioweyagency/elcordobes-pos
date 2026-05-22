import { createClient }
from "@supabase/supabase-js";

const supabaseUrl =
"https://phspugzthlbntzzdmsvv.supabase.co";

const supabaseAnonKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3B1Z3p0aGxibnR6emRtc3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDQ5MzUsImV4cCI6MjA5NTAyMDkzNX0.ZwayD5tIP8VW60Hkcw0lE_sRt-wQ1W7Lx26rgiJQlbU"
;

export const supabase =
createClient(
  supabaseUrl,
  supabaseAnonKey
);

