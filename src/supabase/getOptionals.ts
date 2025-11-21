import supabase from "./server";

export interface Optional {
  id: number;
  machine_id: number;
  optional_name: string;
  price: number;
  features: string | null;
  created_at: string;
}

export async function getOptionalsByMachine(machineId: number): Promise<Optional[]> {
  const { data, error } = await supabase
    .from("optionals")
    .select("*")
    .eq("machine_id", machineId)
    .order("optional_name", { ascending: true });

  if (error) {
    console.error("Error fetching optionals:", error);
    return [];
  }

  return data || [];
}
