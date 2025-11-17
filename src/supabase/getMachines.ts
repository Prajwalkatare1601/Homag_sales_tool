import supabase from "./server";

export async function getMachines() {
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .order("machine_name", { ascending: true });

  if (error) {
    console.error("❌ Error fetching machines:", error.message);
    return [];
  }

  return data || [];
}
