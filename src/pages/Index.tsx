import { useState, useRef } from "react";
import { Machine, PlacedMachine,Accessory,Software } from "@/types/machine";
import { MachineCatalog } from "@/components/factory/MachineCatalog";
import { FactoryCanvas } from "@/components/factory/FactoryCanvas";
import { ProductivityMetrics } from "@/components/factory/ProductivityMetrics";
import { generateReport } from "@/components/factory/ReportGenerator";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";



const Index = () => {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [placedMachines, setPlacedMachines] = useState<PlacedMachine[]>([]);
  const [layoutDimensions] = useState({ width: 30, height: 20 });
  const [catalogCollapsed, setCatalogCollapsed] = useState(false);
  const [metricsCollapsed, setMetricsCollapsed] = useState(false);
  const [globalAccessories, setGlobalAccessories] = useState<Accessory[]>([]);
  const [globalSoftwares, setGlobalSoftwares] = useState<Software[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate(); // <-- must be inside the component



  const handleMachineSelect = (machine: Machine) => {
    setSelectedMachine(machine);
    setTimeout(() => setSelectedMachine(null), 100);
  };

// Inside Index.tsx
const handleGenerateReport = (userInfo: {
  name: string;
  company: string;
  phone: string;
  email: string;
}) => {
  const canvas = document.querySelector("canvas");
  if (canvas) {
    generateReport(
      canvas,
      placedMachines,
      layoutDimensions,
      globalAccessories,
      globalSoftwares,
      userInfo// wrap in array
    );
  }
};



  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      {/* === HEADER === */}
<header
  className="bg-white shadow-md border-b border-slate-200 flex items-center justify-between px-8 py-0.5"
  style={{ backgroundColor: "#001942" }}
>
  {/* Logo on Left */}
  <img
    src="/homag_logo.jpg"
    alt="Homag India"
    className="h-16 md:h-16 lg:h-16 w-auto object-contain ml-4"
  />

  {/* Centered Title Section */}
  <div className="flex-1 flex flex-col items-center text-center">
    <h1 className="text-2xl font-bold text-white">Factory Layout Planner</h1>
    <p className="text-sm text-white/80">
      Smart planning & productivity simulation by Homag India
    </p>
  </div>

  {/* Right Section — Logged-in User */}
<div className="relative flex items-center gap-3 mr-4">
  {/* User Avatar (placeholder circle) */}
  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold text-slate-700 shadow-inner">
    ad
  </div>
  <div className="flex flex-col text-right leading-tight cursor-pointer" onClick={() => setUserMenuOpen(!userMenuOpen)}>
    <span className="text-sm font-medium text-white flex items-center justify-end gap-1">
      admin <ChevronDown className={`h-3 w-3 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
    </span>
    <span className="text-[10px] text-slate-300">ID: HMG-1423</span>
  </div>

  {/* Dropdown Menu */}
  {userMenuOpen && (
    <div className="absolute right-0 mt-10 w-32 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
      <button
        className="flex items-center gap-2 px-4 py-2 w-full text-left text-slate-700 hover:bg-slate-100"
        onClick={() => {
          console.log("Logging out...");
          // Clear session and redirect
          localStorage.removeItem("isAuthenticated");
          navigate("/", { replace: true });        }}
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  )}
</div>
</header>



      {/* === MAIN LAYOUT === */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL — Machine Catalog */}
        <motion.div
          animate={{ width: catalogCollapsed ? "64px" : "320px" }}
          transition={{ duration: 0.3 }}
          className="relative flex-shrink-0 border-r border-slate-200 bg-white/80 backdrop-blur-md shadow-inner"
        >
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-20 bg-white border border-slate-300 rounded-full shadow-sm hover:bg-slate-100 z-10"
            onClick={() => setCatalogCollapsed(!catalogCollapsed)}
          >
            {catalogCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Content (hidden when collapsed) */}
          {!catalogCollapsed && (
            <div className="p-3 h-full">
              <h2 className="text-m font-semibold text-slate-700 mb-0">
                Machine Catalog
              </h2>
<MachineCatalog
  onMachineSelect={handleMachineSelect}
  onGlobalAccessoriesChange={setGlobalAccessories}
  onGlobalSoftwaresChange={setGlobalSoftwares}  // <-- new
/>

            </div>
          )}

          {/* Collapsed Icon Placeholder */}
          {catalogCollapsed && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <ChevronRight className="h-6 w-6" />
              <span className="rotate-90 mt-2 text-xs font-medium text-slate-600">
                Catalog
              </span>
            </div>
          )}
        </motion.div>

{/* CENTER — Canvas Area */}
<motion.div
  layout
  transition={{ duration: 0.4 }}
  className="flex-1 flex flex-col min-w-0 p-3 overflow-hidden"
>
  <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-auto">
    <div className="inline-block min-w-max min-h-max p-3">
      <FactoryCanvas
        selectedMachine={selectedMachine}
        onMachinesUpdate={setPlacedMachines}
        placedMachines={placedMachines}
      />
    </div>
  </div>
</motion.div>



        {/* RIGHT PANEL — Productivity Metrics */}
        <motion.div
          animate={{ width: metricsCollapsed ? "64px" : "320px" }}
          transition={{ duration: 0.3 }}
          className="relative flex-shrink-0 border-l border-slate-200 bg-white/80 backdrop-blur-md shadow-inner"
        >
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-3 top-20 bg-white border border-slate-300 rounded-full shadow-sm hover:bg-slate-100 z-10"
            onClick={() => setMetricsCollapsed(!metricsCollapsed)}
          >
            {metricsCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Content (hidden when collapsed) */}
          {!metricsCollapsed && (
            <div className="p-4 h-full">
              <h2 className="text-lg font-semibold text-slate-700 mb-3">
                Productivity Insights
              </h2>
<ProductivityMetrics
  placedMachines={placedMachines}
  globalAccessories={globalAccessories}
  globalSoftwares={globalSoftwares}
  layoutDimensions={layoutDimensions}
  onGenerateReport={handleGenerateReport} // pass callback here
/>

            </div>
          )}

          {/* Collapsed Icon Placeholder */}
          {metricsCollapsed && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <ChevronLeft className="h-6 w-6" />
              <span className="rotate-90 mt-2 text-xs font-medium text-slate-600">
                Metrics
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* === FOOTER === */}
      <footer className="bg-white text-center py-2 text-xs text-slate-500 border-t border-slate-200">
        © {new Date().getFullYear()} Homag India | Woodworking Industry
        Solutions
      </footer>
    </div>
  );
};

export default Index;
