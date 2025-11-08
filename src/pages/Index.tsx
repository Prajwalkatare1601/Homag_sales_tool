import { useState, useRef } from "react";
import { Machine, PlacedMachine } from "@/types/machine";
import { MachineCatalog } from "@/components/factory/MachineCatalog";
import { FactoryCanvas } from "@/components/factory/FactoryCanvas";
import { ProductivityMetrics } from "@/components/factory/ProductivityMetrics";
import { generateReport } from "@/components/factory/ReportGenerator";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Index = () => {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [placedMachines, setPlacedMachines] = useState<PlacedMachine[]>([]);
  const [layoutDimensions] = useState({ width: 30, height: 20 });
  const [catalogCollapsed, setCatalogCollapsed] = useState(false);
  const [metricsCollapsed, setMetricsCollapsed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMachineSelect = (machine: Machine) => {
    setSelectedMachine(machine);
    setTimeout(() => setSelectedMachine(null), 100);
  };

  const handleGenerateReport = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      generateReport(canvas, placedMachines, layoutDimensions);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      {/* === HEADER === */}
<header className="bg-white shadow-md border-b border-slate-200 flex items-center justify-between px-8 py-4">
  {/* Centered Title Section */}
  <div className="flex-1 flex flex-col items-center text-center">
    <h1 className="text-2xl font-bold text-slate-800">
      Factory Layout Planner
    </h1>
    <p className="text-sm text-slate-500">
      Smart planning & productivity simulation by Homag India
    </p>
  </div>

  {/* Logo on Right */}
  <img
    src="/homag_logo.jpg"
    alt="Homag India"
    className="h-16 w-auto object-contain ml-4"
  />
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
              <MachineCatalog onMachineSelect={handleMachineSelect} />
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
          className="flex-1 min-w-0 p-4 flex flex-col"
        >
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-3 border border-slate-200">
            <FactoryCanvas
              selectedMachine={selectedMachine}
              onMachinesUpdate={setPlacedMachines}
              placedMachines={placedMachines}
            />
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">
            Drag and drop machines to visualize your layout
          </p>
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
                layoutDimensions={layoutDimensions}
                onGenerateReport={handleGenerateReport}
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
