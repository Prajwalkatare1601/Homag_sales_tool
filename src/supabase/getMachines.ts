import { Machine } from "@/types/machine";
import supabase from "./server";

export async function getMachines(): Promise<Machine[]> {
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .order("machine_name", { ascending: true });

  if (error) {
    console.error("❌ Error fetching machines:", error.message);
    return [];
  }

  const machines: Machine[] = (data || []).map((m: any) => ({
    ...m,

    length_mm: m.length_mm ? parseFloat(m.length_mm) : null,
    width_mm: m.width_mm ? parseFloat(m.width_mm) : null,

    price_capex: m.price_capex ? parseFloat(m.price_capex) : null,
    price_opex: m.price_opex ? parseFloat(m.price_opex) : null,

    roi_breakeven: m.roi_breakeven ? parseFloat(m.roi_breakeven) : null,

    productivity_components: m.productivity_components
      ? parseFloat(m.productivity_components)
      : null,

    productivity_boards: m.productivity_boards
      ? parseFloat(m.productivity_boards)
      : null,

    connected_load_kw: m.connected_load_kw
      ? parseFloat(m.connected_load_kw)
      : null,

    air_consumption_m3hr: m.air_consumption_m3hr
      ? parseFloat(m.air_consumption_m3hr)
      : null,

    operator_count: m.operator_count
      ? parseInt(m.operator_count)
      : null,

    helper_count: m.helper_count
      ? parseInt(m.helper_count)
      : null,
  }));

  return machines;
}

