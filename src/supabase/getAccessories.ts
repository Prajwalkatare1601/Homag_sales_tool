import supabase from "./server";

// ----------------------------------------
// TYPE
// ----------------------------------------
export interface Accessory {
  id: number;
  accessory_name: string;
  category: string | null;
  price: number | null;
  created_at: string;
}

// ----------------------------------------
// FETCH: All Accessories
// ----------------------------------------
export async function getAllAccessories(): Promise<Accessory[]> {
  const { data, error } = await supabase
    .from("accessories")
    .select("*")
    .order("accessory_name", { ascending: true });

  if (error) {
    console.error("Error fetching accessories:", error);
    return [];
  }

  return data || [];
}

