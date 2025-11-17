// types/machine.ts

export interface Machine {
  id: number;
  machine_name: string;
  type: string | null;
  segment: string | null;

  dimension_length_mm: number | null;
  dimension_width_mm: number | null;
  dimension_height_mm?: number | null;

  automation_level?: string | null;
  capacity_per_shift?: string | null;

  image_url?: string | null;
  description?: string | null;

  // === Productivity Metrics ===
  productivity: number;        // boards/day
  machineOperator: number;     // operators required
  connectedLoad: number;       // kW
  airConsumption: number;      // m²/min
  capex: number;               // ₹ amount
  ROI: number;                 // years
}

export interface PlacedMachine extends Machine {
  x: number;
  y: number;
  rotation: number;
}
