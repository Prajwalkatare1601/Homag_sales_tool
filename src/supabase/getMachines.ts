import { Machine } from "@/types/machine";
import supabase from "./server";

export async function getMachines(): Promise<Machine[]> {
  const { data, error } = await supabase
    .from("machines2") // ✅ NEW TABLE
    .select("*")
    .order("machine_name", { ascending: true });

  if (error) {
    console.error("❌ Error fetching machines:", error.message);
    return [];
  }

  const machines: Machine[] = (data || []).map((m: any) => ({
    ...m,

    // Dimensions
    length_mm: m.length_mm ? parseInt(m.length_mm) : null,
    width_mm: m.width_mm ? parseInt(m.width_mm) : null,

    // Financials
    price_capex: m.price_capex ? parseFloat(m.price_capex) : null,
    price_opex: m.price_opex ? parseFloat(m.price_opex) : null,
    roi_breakeven: m.roi_breakeven ? parseFloat(m.roi_breakeven) : null,

    // ✅ FIXED: Productivity fields
    productivity_components_min: m.productivity_components_min
      ? parseInt(m.productivity_components_min)
      : null,

    productivity_components_max: m.productivity_components_max
      ? parseInt(m.productivity_components_max)
      : null,

    productivity_boards_min: m.productivity_boards_min
      ? parseInt(m.productivity_boards_min)
      : null,

    productivity_boards_max: m.productivity_boards_max
      ? parseInt(m.productivity_boards_max)
      : null,

    // Utilities
    connected_load_kw: m.connected_load_kw
      ? parseFloat(m.connected_load_kw)
      : null,

    air_consumption_m3hr: m.air_consumption_m3hr
      ? parseFloat(m.air_consumption_m3hr)
      : null,

    // Manpower
    operator_count: m.operator_count
      ? parseInt(m.operator_count)
      : null,

    helper_count: m.helper_count
      ? parseInt(m.helper_count)
      : null,
  }));

  return machines;
}
