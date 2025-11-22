import supabase from "./server";

// ----------------------------------------
// TYPE
// ----------------------------------------
export interface Software {
  id: number;
  software_name: string;
  price: number | null;
  created_at: string;
}

// ----------------------------------------
// FETCH: All Softwares
// ----------------------------------------
export async function getAllSoftwares(): Promise<Software[]> {
  const { data, error } = await supabase
    .from("softwares")
    .select("*")
    .order("software_name", { ascending: true });

  if (error) {
    console.error("Error fetching softwares:", error);
    return [];
  }

  return data || [];
}
