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
import { useState } from "react";
import { generateReport } from "@/components/factory/ReportGenerator";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";



interface UserInfo {
  name: string;
  company: string;
  phone: string;
  email: string;
}

interface ProductivityMetricsProps {
  placedMachines: PlacedMachine[];
  globalAccessories?: any[];              // ADD THIS
  globalSoftwares?: any[];      // ✅ add optional

  layoutDimensions: { width: number; height: number };
  onGenerateReport: (userInfo: UserInfo) => void; // ✅ Accepts one argument
}


export const ProductivityMetrics = ({
  placedMachines,
  globalAccessories = [],
  globalSoftwares = [],
  layoutDimensions,
  onGenerateReport,
}: ProductivityMetricsProps) => {

const [showUserForm, setShowUserForm] = useState(false);
const [userInfo, setUserInfo] = useState({
  name: "",
  company: "",
  phone: "",
  email: "",
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setUserInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

const handleSubmit = () => {
  if (!userInfo.name || !userInfo.company || !userInfo.email) {
    alert("Please fill in Name and Email");
    return;
  }

  // === Email Validation ===  
  if (!userInfo.email.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
    alert("Please enter a valid email address");
    return;
  }

  // Pass data to parent
  onGenerateReport(userInfo);

  setShowUserForm(false);
};



  // 🔍 DEBUG
  console.log("PLACED MACHINES FULL DATA:", placedMachines);
  console.log("RAW capex values:", placedMachines.map(m => m.price_capex));

if (placedMachines.length === 0 && globalAccessories.length === 0 && globalSoftwares.length === 0) {
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

const totalProductivity =
  numMachines > 0
    ? placedMachines.reduce(
        (sum, m) => sum + (m.productivity_components_min ?? 0),
        0
      ) / numMachines
    : 0;


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

  // === Total Optionals Cost ===
const totalOptionalsCost = placedMachines.reduce((sum, m) => {
  // If you stored optionalsCost directly
  if (m.optionalsCost) return sum + Number(m.optionalsCost);

  // If you only stored selectedOptionals[]
  if (m.selectedOptionals && Array.isArray(m.selectedOptionals)) {
    const optCost = m.selectedOptionals.reduce(
      (s: number, o: any) => s + Number(o.price ?? 0),
      0
    );
    return sum + optCost;
  }

  return sum;
}, 0);

const totalMachineArea = placedMachines.reduce((sum, m) => {
  const length = m.length_mm ?? 0;
  const width = m.width_mm ?? 0;
  return sum + length * width;
}, 0);



  

  // === Derived Financials ===
const avgROI =
  placedMachines.length > 0
    ? Math.round(
        (placedMachines.reduce((sum, m) => sum + (m.roi_breakeven ?? 0), 0) /
          (placedMachines.length + 300)) *
          10
      ) / 10
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
        <Icon className="h-3 w-3" style={{ color }} />
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
              title="Productivity Avg "
              value={totalProductivity}
              unit="boards/day"
              icon={TrendingUp}
              color="#0EA5E9"
            />
<MetricCard
  title="Operators"
  value={totalOperators}
  icon={Users}
  color="#059669"
/>

<MetricCard
  title="Helpers"
  value={totalHelpers}
  icon={Users}
  color="#0F766E"
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
            <MetricCard
  title="Total Machine Area"
  value={(totalMachineArea / 1_000_000).toFixed(2)}
  unit="m²"
  icon={Package}
  color="#EF4444"
/>

</div>
        </div>

        {/* Financial Section */}
<div>
  <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
    <Wallet className="h-4 w-4 text-amber-600" />
    Financial Summary
  </h3>

  <div className="grid grid-cols-2 gap-2">

    <MetricCard 
      title="CapEx (Capital)" 
      value={totalCapex} 
      icon={Wallet} 
      color="#D97706" 
    />

    <MetricCard 
      title="Optionals Cost" 
      value={totalOptionalsCost} 
      icon={Coins} 
      color="#9333EA" 
    />

    <MetricCard 
      title="OpEx (Annual)" 
      value={totalOpex} 
      icon={Coins} 
      color="#FACC15" 
    />

    <MetricCard 
      title="Total Estimated Budget" 
      value={totalCapex + totalOpex + totalOptionalsCost} 
      icon={Wallet} 
      color="#EAB308" 
    />

    <MetricCard 
      title="Estimated ROI Period" 
      value={`${avgROI.toFixed(1)} years`} 
      icon={TrendingUp} 
      color="#059669" 
    />

  </div>
</div>

{/* ===== Selections Summary Card ===== */}
<Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50">
  <div className="p-3">
    <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
      <Package className="h-4 w-4 text-indigo-600" />
      Selected Configuration Summary
    </h3>

    <div className="max-h-[220px] overflow-y-auto pr-1 space-y-3 text-[12px]">

      {/* === MACHINES === */}
      <div>
        <p className="font-medium text-slate-700 mb-1">Machines</p>
        <ul className="space-y-1">
          {placedMachines.map((m, idx) => (
            <li
              key={idx}
              className="bg-slate-100 rounded-md px-2 py-1 text-slate-700"
            >
              {m.machine_name}
            </li>
          ))}
        </ul>
      </div>

      {/* === OPTIONALS === */}
      <div>
        <p className="font-medium text-slate-700 mb-1">Optionals</p>
        <ul className="space-y-1">
          {placedMachines.some(m => m.selectedOptionals?.length) ? (
            placedMachines.flatMap(m => m.selectedOptionals || []).map((opt, idx) => (
              <li
                key={idx}
                className="bg-indigo-50 text-indigo-700 rounded-md px-2 py-1"
              >
                {opt.optional_name} – ₹{opt.price}
              </li>
            ))
          ) : (
            <li className="text-slate-400 italic">No optionals selected</li>
          )}
        </ul>
      </div>

{/* === ACCESSORIES (GLOBAL) === */}
<div>
  <h3 className="text-sm font-semibold">Accessories</h3>
  {globalAccessories.length === 0 ? (
    <p className="text-xs text-slate-500">No accessories selected</p>
  ) : (
    <ul className="text-xs list-disc ml-4">
      {globalAccessories.map((acc) => (
  <li key={acc.id}>
    {acc.accessory_name} 
    {acc.qty ? ` (x${acc.qty})` : " (x1)"} – 
    ₹{(acc.price * (acc.qty ?? 1)).toLocaleString()}
  </li>
))}
    </ul>
  )}
</div>


      {/* === SOFTWARES === */}
{/* === SOFTWARES === */}
<div>
  <h3 className="text-sm font-semibold">Softwares</h3>

  {globalSoftwares.length === 0 ? (
    <p className="text-xs text-slate-500">No softwares selected</p>
  ) : (
    <ul className="text-xs list-disc ml-4">
      {globalSoftwares.map((sw) => (
        <li key={sw.id}>
          {sw.software_name}
          {sw.qty ? ` (x${sw.qty})` : " (x1)"} – 
          ₹{(sw.price * (sw.qty ?? 1)).toLocaleString()}
        </li>
      ))}
    </ul>
  )}
</div>


    </div>
  </div>
</Card>





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
  onClick={() => setShowUserForm(true)}
  className="w-full text-sm font-medium flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
>
  <FileText />
  Generate PDF Report
</Button>
{showUserForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
      <h2 className="text-lg font-semibold mb-4">Enter Your Details</h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={userInfo.name}
          onChange={handleChange}
          className="border rounded-md px-3 py-2"
        />
        <input
          type="text"
          name="company"
          placeholder="Company Name"
          value={userInfo.company}
          onChange={handleChange}
          className="border rounded-md px-3 py-2"
        />
<PhoneInput
  country={"in"}
  enableSearch={true}
  value={userInfo.phone}
  onChange={(value) => {
    // Remove spaces, hyphens, parentheses, etc
    const cleaned = value.replace(/[^\d+]/g, "");
    setUserInfo({ ...userInfo, phone: cleaned });
  }}
  inputClass="!w-full !py-2 !px-3 !text-sm !rounded-md !border !border-slate-300"
  buttonClass="!border !border-slate-300 !rounded-l-md"
  containerClass="!w-full"
  dropdownClass="!z-[9999]"
/>


        <input
          type="email"
          name="email"
          placeholder="Business Email"
          value={userInfo.email}
          onChange={handleChange}
          className="border rounded-md px-3 py-2"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="ghost" onClick={() => setShowUserForm(false)}>Cancel</Button>
        <Button onClick={handleSubmit}>Generate PDF</Button>
      </div>
    </div>
  </div>
)}


      </div>
    </div>
  );
};
