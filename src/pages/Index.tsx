import { useState, useRef } from "react";
import { Machine, PlacedMachine } from "@/types/machine";
import { MachineCatalog } from "@/components/factory/MachineCatalog";
import { FactoryCanvas } from "@/components/factory/FactoryCanvas";
import { ProductivityMetrics } from "@/components/factory/ProductivityMetrics";
import { generateReport } from "@/components/factory/ReportGenerator";

const Index = () => {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [placedMachines, setPlacedMachines] = useState<PlacedMachine[]>([]);
  const [layoutDimensions] = useState({ width: 30, height: 20 });
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary text-white px-6 py-4 shadow-elevated">
        <h1 className="text-2xl font-bold">Factory Layout Planner</h1>
        <p className="text-sm opacity-90 mt-1">
          Design, simulate, and optimize your factory floor
        </p>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Machine Catalog */}
        <div className="w-80 flex-shrink-0">
          <MachineCatalog onMachineSelect={handleMachineSelect} />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 min-w-0">
          <FactoryCanvas
            selectedMachine={selectedMachine}
            onMachinesUpdate={setPlacedMachines}
            placedMachines={placedMachines}
          />
        </div>

        {/* Right Panel - Metrics */}
        <div className="w-80 flex-shrink-0">
          <ProductivityMetrics
            placedMachines={placedMachines}
            layoutDimensions={layoutDimensions}
            onGenerateReport={handleGenerateReport}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
