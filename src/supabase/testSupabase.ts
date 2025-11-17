import supabase from "./server";

export async function testSupabaseConnection() {
  console.log("🔄 Testing Supabase connection...");

  const { data, error } = await supabase
    .from("machines")
    .select("*");

  if (error) {
    console.error("❌ Supabase connection error:", error.message);
    return []; // <-- ALWAYS return array
  }

  console.log("✅ Supabase connection successful!");
  console.log("Fetched machines:", data);

  return data ?? []; // <-- NEVER return void
}
