import { createClient } from "@supabase/supabase-js";

// Load environment variables from Vite
const supabaseUrl = import.meta.env.VITE_HOMAG_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_HOMAG_ANNON_KEY;

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey ? "Loaded" : "Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase environment variables! Check .env file.");
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================
// Fetch MACHINES
// ==========================
export async function getMachines() {
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("❌ Error fetching machines:", error.message);
    throw error;
  }

  return data;
}

// ==========================
// Fetch OPTIONALS
// ==========================
export async function getOptionals() {
  const { data, error } = await supabase
    .from("optionals")
    .select("*")
    .order("machine_id", { ascending: true });

  if (error) {
    console.error("❌ Error fetching optionals:", error.message);
    throw error;
  }

  return data;
}

// ==========================
// Fetch ACCESSORIES
// ==========================
export async function getAccessories() {
  const { data, error } = await supabase
    .from("accessories")
    .select("*")
    .order("machine_id", { ascending: true });

  if (error) {
    console.error("❌ Error fetching accessories:", error.message);
    throw error;
  }

  return data;
}

// ==========================
// Fetch EVERYTHING TOGETHER
// ==========================
export async function getAllMachineData() {
  const [machines, optionals, accessories] = await Promise.all([
    getMachines(),
    getOptionals(),
    getAccessories(),
  ]);

  return {
    machines,
    optionals,
    accessories,
  };
}

// Export Supabase for custom use if needed
export default supabase;
