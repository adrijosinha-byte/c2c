import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

console.log("Checking Supabase configuration...");

console.log("URL loaded:", !!process.env.SUPABASE_URL);
console.log("Publishable key loaded:", !!process.env.SUPABASE_PUBLISHABLE_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

console.log("VYBZ Supabase client created successfully!");