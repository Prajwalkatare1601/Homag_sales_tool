import { createClient } from "@supabase/supabase-js";

// Load environment variables from Vite
const supabaseUrl = import.meta.env.VITE_HOMAG_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_HOMAG_ANNON_KEY;

// Debug logs to verify
console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey ? "Loaded" : "Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase environment variables! Check .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
