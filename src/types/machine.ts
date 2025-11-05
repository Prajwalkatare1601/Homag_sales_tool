export interface Machine {
  id: string;
  name: string;
  type: string;
  width: number; // in meters
  height: number; // in meters
  color: string;
  productivity: number; // units per hour
  timeSaving: number; // percentage
  icon: string;
  description: string;
}

export interface PlacedMachine extends Machine {
  x: number;
  y: number;
  rotation: number;
  fabricId?: string;
}

export const MACHINE_CATALOG: Machine[] = [
  {
    id: "cnc-mill-001",
    name: "CNC Milling Machine",
    type: "Milling",
    width: 3,
    height: 2.5,
    color: "#3b82f6",
    productivity: 45,
    timeSaving: 35,
    icon: "⚙️",
    description: "High-precision CNC mill for complex parts"
  },
  {
    id: "laser-cut-002",
    name: "Laser Cutter",
    type: "Cutting",
    width: 4,
    height: 2,
    color: "#ef4444",
    productivity: 60,
    timeSaving: 50,
    icon: "🔴",
    description: "Industrial laser cutting system"
  },
  {
    id: "assembly-003",
    name: "Assembly Station",
    type: "Assembly",
    width: 2.5,
    height: 2,
    color: "#10b981",
    productivity: 30,
    timeSaving: 25,
    icon: "🔧",
    description: "Ergonomic workstation for assembly"
  },
  {
    id: "press-004",
    name: "Hydraulic Press",
    type: "Forming",
    width: 3.5,
    height: 3,
    color: "#f59e0b",
    productivity: 40,
    timeSaving: 30,
    icon: "⬇️",
    description: "Heavy-duty hydraulic pressing"
  },
  {
    id: "robot-005",
    name: "Industrial Robot",
    type: "Automation",
    width: 2,
    height: 2,
    color: "#8b5cf6",
    productivity: 80,
    timeSaving: 60,
    icon: "🤖",
    description: "6-axis robotic arm for automation"
  },
  {
    id: "conveyor-006",
    name: "Conveyor Belt",
    type: "Transport",
    width: 6,
    height: 1,
    color: "#06b6d4",
    productivity: 100,
    timeSaving: 40,
    icon: "➡️",
    description: "Material transport system"
  },
  {
    id: "welder-007",
    name: "Welding Station",
    type: "Welding",
    width: 2.5,
    height: 2,
    color: "#f97316",
    productivity: 35,
    timeSaving: 28,
    icon: "⚡",
    description: "MIG/TIG welding equipment"
  },
  {
    id: "inspect-008",
    name: "Quality Control",
    type: "Inspection",
    width: 2,
    height: 2,
    color: "#ec4899",
    productivity: 50,
    timeSaving: 20,
    icon: "🔍",
    description: "Automated inspection system"
  }
];
