// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Grab Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

console.log("Supabase URL:", supabaseUrl);
console.log("Anon key exists:", !!supabaseAnonKey);

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
