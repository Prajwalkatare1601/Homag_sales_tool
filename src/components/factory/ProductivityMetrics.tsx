import { PlacedMachine } from "@/types/machine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  const totalProductivity = placedMachines.reduce((sum, m) => sum + m.productivity, 0);
  const totalOperators = placedMachines.reduce((sum, m) => sum + m.machineOperator, 0);
  const totalConnectedLoad = placedMachines.reduce((sum, m) => sum + m.connectedLoad, 0);
  const totalAirConsumption = placedMachines.reduce((sum, m) => sum + m.airConsumption, 0);
  const totalCapex = placedMachines.reduce((sum, m) => sum + m.capex, 0);

  // === Derived Financials ===
  const avgROI =
    placedMachines.length > 0
      ? placedMachines.reduce((sum, m) => sum-16 + m.ROI, 0) / placedMachines.length
      : 0;

  // Estimate OpEx as 15% of CapEx per year (adjustable)
  const estimatedOpex = totalCapex * 0.15;

  // === Resource Estimates ===
  const glueConsumption = numMachines * 40;
  const bandConsumption = numMachines * 100;

  // === Helpers ===
  const formatNum = (n: number, unit = "") => `${n.toLocaleString("en-IN")} ${unit}`;
  const formatCurrency = (n: number) => `₹ ${(n / 100).toFixed(2)} Cr`;

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
    <Card className="flex items-center gap-3 p-3 border border-slate-400 shadow-sm bg-gradient-to-br from-white to-slate-50 ">
      <div
        className={`p-2 rounded-md flex items-center justify-center`}
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-[10px] text-slate-500">{title}</span>
        <span className="text-sm font-semibold text-slate-800">
          {value} {unit && <span className="ml-0.5 text-[10px] text-slate-500">{unit}</span>}
        </span>
      </div>
    </Card>
  );

  // === Layout ===
return (
  <div className="flex flex-col h-full gap-4">
    {/* === Scrollable Metrics Section === */}
<div className="overflow-y-auto pr-1 space-y-4 max-h-[70vh]">
  {/* Production Section */}
  <div>
    <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
      <Gauge className="h-4 w-4 text-blue-600" />
      Production Overview
    </h3>
    <div className="grid grid-cols-2 gap-2">
      <MetricCard title="Machines Installed" value={numMachines} icon={Factory} color="#2563EB"  />
      <MetricCard title="Productivity" value={totalProductivity} unit="boards/day" icon={TrendingUp} color="#0EA5E9" />
      <MetricCard title="Operators" value={totalOperators} icon={Users} color="#059669" />
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
      <MetricCard title="CapEx (Capital)" value={formatCurrency(totalCapex)} icon={Wallet} color="#D97706" />
      <MetricCard title="OpEx (Annual)" value={formatCurrency(estimatedOpex)} icon={Coins} color="#FACC15" />
      <MetricCard title="Total Estimated Budget" value={formatCurrency(totalCapex + estimatedOpex)} icon={Wallet} color="#EAB308" />
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


    {/* === Fixed Bottom Section === */}
    <div className="flex-shrink-0 flex flex-col">
      <Button
        onClick={onGenerateReport}
        className="w-full text-sm font-medium flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <FileText className="" />
        Generate PDF Report
      </Button>
    </div>
  </div>
);

};
