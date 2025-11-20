export interface Machine {
  id: number;
  machine_name: string | null;

  type: string | null;
  optionals: string | null;

  // Converted to numbers
  length_mm: number | null;
  width_mm: number | null;

  price_capex: number | null;
  price_opex: number | null;

  roi_breakeven: number | null;

  productivity_components: number | null;
  productivity_boards: number | null;

  connected_load_kw: number | null;
  air_consumption_m3hr: number | null;

  operator_count: number | null;
  helper_count: number | null;

  machine_spec: string | null;
  youtube_link: string | null;

  // Derived fields (these are already numbers 👍)
  productivity?: number;
  machineOperator?: number;
  connectedLoad?: number;
  airConsumption?: number;
  capex?: number;
  ROI?: number;
}

export interface PlacedMachine extends Machine {
  x: number;
  y: number;
  rotation: number;
}
