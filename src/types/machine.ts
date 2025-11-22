// Optional / Add-on machine features
export interface Optional {
  id: number;
  machine_id: number;
  optional_name: string;
  price: number | null;
  features: string | null;
  created_at?: string;
}

// Accessories table (independent of machines)
export interface Accessory {
  id: number;
  accessory_name: string;
  category: string | null;
  price: number | null;
  created_at?: string;
}


// ==========================
// Main Machine Interface
// ==========================
export interface Machine {
  id: number;
  machine_name: string | null;
  type: string | null;

  // Dimensions
  length_mm: number | null;
  width_mm: number | null;

  // Financials
  price_capex: number | null;
  price_opex: number | null;
  roi_breakeven: number | null;

  // Productivity range
  productivity_components_min: number | null;
  productivity_components_max: number | null;

  productivity_boards_min: number | null;
  productivity_boards_max: number | null;

  // Utilities
  connected_load_kw: number | null;
  air_consumption_m3hr: number | null;

  // Manpower
  operator_count: number | null;
  helper_count: number | null;

  // Extra info
  machine_spec: string | null;
  youtube_link: string | null;

  // Relations
  optionals?: Optional[];   // from optionals table

  created_at?: string;

  // ==========================
  // Derived / frontend-calculated fields
  // ==========================
  productivityComponentsAvg?: number;
  productivityBoardsAvg?: number;
  totalManpower?: number;
  capex?: number;
  ROI?: number;
  connectedLoad?: number;
  airConsumption?: number;
}


// ==========================
// Placed Machine (for Canvas)
// ==========================
export interface PlacedMachine extends Machine {
  x: number;
  y: number;
  rotation: number;
  scale?: number;
  optionalsCost?: number
  selectedOptionals?: { price: number }[]
}

