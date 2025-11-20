import { PlacedMachine } from "@/types/machine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Factory,
  Gauge,
  Users,
  Plug,
  Wind,
  Droplets,
  Package,
  Wallet,
  TrendingUp,
  FileText,
  Coins,
  Building2,
} from "lucide-react";

interface ProductivityMetricsProps {
  placedMachines: PlacedMachine[];
  layoutDimensions: { width: number; height: number };
  onGenerateReport: () => void;
}

export const ProductivityMetrics = ({
  placedMachines,
  layoutDimensions,
  onGenerateReport,
}: ProductivityMetricsProps) => {

  // 🔍 DEBUG
  console.log("PLACED MACHINES FULL DATA:", placedMachines);
  console.log("RAW capex values:", placedMachines.map(m => m.price_capex));

  if (!placedMachines.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
        <Factory className="h-12 w-12 text-slate-400 mb-3" />
        <p className="text-sm font-medium">No machines placed yet</p>
        <p className="text-xs text-slate-400 mt-1">
          Add machines to see productivity and financial insights.
        </p>
      </div>
    );
  }

  // === Core Calculations ===
  const numMachines = placedMachines.length;

  const totalProductivity = placedMachines.reduce(
    (sum, m) => sum + (m.productivity_boards ?? 0),
    0
  );

  const totalOperators = placedMachines.reduce(
    (sum, m) => sum + (m.operator_count ?? 0),
    0
  );

  const totalHelpers = placedMachines.reduce(
    (sum, m) => sum + (m.helper_count ?? 0),
    0
  );

  const totalConnectedLoad = placedMachines.reduce(
    (sum, m) => sum + (m.connected_load_kw ?? 0),
    0
  );

  const totalAirConsumption = placedMachines.reduce(
    (sum, m) => sum + (m.air_consumption_m3hr ?? 0),
    0
  );

  const totalCapex = placedMachines.reduce(
    (sum, m) => sum + (m.price_capex ?? 0),
    0
  );

  const totalOpex = placedMachines.reduce(
    (sum, m) => sum + (m.price_opex ?? 0),
    0
  );

  // === Derived Financials ===
  const avgROI =
    placedMachines.length > 0
      ? placedMachines.reduce((sum, m) => sum + (m.roi_breakeven ?? 0), 0) /
        placedMachines.length
      : 0;

  // === Resource Estimates ===
  const glueConsumption = numMachines * 40;
  const bandConsumption = numMachines * 100;

  // === Helpers ===
  const formatNum = (n: number, unit = "") =>
    `${n.toLocaleString("en-IN")} ${unit}`;

  const formatCurrency = (n: number) =>
    `₹ ${(n / 10000000).toFixed(2)} Cr`;

  // === Card Template ===
  const MetricCard = ({
    title,
    value,
    unit,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    unit?: string;
    icon: any;
    color: string;
  }) => (
    <Card className="flex items-center gap-3 p-3 border border-slate-400 shadow-sm bg-gradient-to-br from-white to-slate-50">
      <div
        className="p-2 rounded-md flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-[10px] text-slate-500">{title}</span>
        <span className="text-sm font-semibold text-slate-800">
          {value}
          {unit && (
            <span className="ml-0.5 text-[10px] text-slate-500">
              {unit}
            </span>
          )}
        </span>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* === Scrollable Metrics === */}
      <div className="overflow-y-auto pr-1 space-y-4 max-h-[70vh]">

        {/* Production Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-blue-600" />
            Production Overview
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              title="Machines Installed"
              value={numMachines}
              icon={Factory}
              color="#2563EB"
            />
            <MetricCard
              title="Productivity"
              value={totalProductivity}
              unit="boards/day"
              icon={TrendingUp}
              color="#0EA5E9"
            />
            <MetricCard
              title="Operators + Helpers"
              value={totalOperators + totalHelpers}
              icon={Users}
              color="#059669"
            />
          </div>
        </div>

        {/* Resource Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
            <Wind className="h-4 w-4 text-emerald-600" />
            Resource Consumption
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard title="Connected Load" value={totalConnectedLoad} unit="kW" icon={Plug} color="#6366F1" />
            <MetricCard title="Air Consumption" value={totalAirConsumption} unit="m³/min" icon={Wind} color="#10B981" />
            <MetricCard title="Glue Consumption" value={glueConsumption} unit="ltr/day" icon={Droplets} color="#06B6D4" />
            <MetricCard title="Band Consumption" value={bandConsumption} unit="m/day" icon={Package} color="#F59E0B" />
          </div>
        </div>

        {/* Financial Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-600" />
            Financial Summary
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard title="CapEx (Capital)" value={(totalCapex)} icon={Wallet} color="#D97706" />
            <MetricCard title="OpEx (Annual)" value={(totalOpex)} icon={Coins} color="#FACC15" />
            <MetricCard title="Total Estimated Budget" value={(totalCapex + totalOpex)} icon={Wallet} color="#EAB308" />
            <MetricCard title="ROI Period" value={`${avgROI.toFixed(1)} years`} icon={TrendingUp} color="#059669" />
          </div>
        </div>

        {/* Finance Partners */}
        <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center gap-3 p-3">
            <div className="p-2 rounded-md bg-blue-50">
              <Building2 className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Finance Partners</span>
              <span className="text-sm font-semibold text-slate-800">
                HDFC / ICICI / AXIS
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* === Button Section === */}
      <div className="flex-shrink-0 flex flex-col">
        <Button
          onClick={onGenerateReport}
          className="w-full text-sm font-medium flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <FileText />
          Generate PDF Report
        </Button>
      </div>
    </div>
  );
};
