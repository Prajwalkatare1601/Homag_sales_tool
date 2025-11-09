import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Text, FabricObject } from "fabric";
import { Machine, PlacedMachine } from "@/types/machine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCw, 
  Trash2,
  FileDown
} from "lucide-react";
import { toast } from "sonner";
import { Group } from "fabric";
import { generateReport } from "./ReportGenerator.tsx"; // ✅ import the report generator

interface FactoryCanvasProps {
  selectedMachine: Machine | null;
  onMachinesUpdate: (machines: PlacedMachine[]) => void;
  placedMachines: PlacedMachine[];
}

export const FactoryCanvas = ({ 
  selectedMachine, 
  onMachinesUpdate,
  placedMachines 
}: FactoryCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [dimensions, setDimensions] = useState({ width: 30, height: 20 });
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const PIXELS_PER_METER = 40;
  const COLOR = "#d4c7c7ff";

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: dimensions.width * PIXELS_PER_METER,
      height: dimensions.height * PIXELS_PER_METER,
      backgroundColor: COLOR,
      selection: true,
    });

    drawGrid(canvas);
    setFabricCanvas(canvas);

    canvas.on("selection:created", (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on("selection:updated", (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on("selection:cleared", () => setSelectedObject(null));

    return () => {
      canvas.dispose();
    };
  }, [dimensions]);

  useEffect(() => {
    if (selectedMachine && fabricCanvas) {
      addMachineToCanvas(selectedMachine);
    }
  }, [selectedMachine, fabricCanvas]);

  const drawGrid = (canvas: FabricCanvas) => {
    const gridSize = PIXELS_PER_METER;
    for (let i = 0; i <= dimensions.width; i++) {
      const line = new Rect({
        left: i * gridSize,
        top: 0,
        width: 1,
        height: dimensions.height * gridSize,
        fill: "#ccc",
        selectable: false,
        evented: false,
      });
      canvas.add(line);
    }
    for (let i = 0; i <= dimensions.height; i++) {
      const line = new Rect({
        left: 0,
        top: i * gridSize,
        width: dimensions.width * gridSize,
        height: 1,
        fill: "#ccc",
        selectable: false,
        evented: false,
      });
      canvas.add(line);
    }
  };

  const addMachineToCanvas = (machine: Machine) => {
    if (!fabricCanvas) return;

    const rectWidth = machine.width * PIXELS_PER_METER;
    const rectHeight = machine.height * PIXELS_PER_METER;

    const machineRect = new Rect({
      width: rectWidth,
      height: rectHeight,
      fill: "#3B82F6",
      opacity: 0.7,
      stroke: "#1D4ED8",
      strokeWidth: 2,
      rx: 4,
      ry: 4,
      originX: "center",
      originY: "center",
    });

    const label = new Text(machine.name, {
      fontSize: 12,
      fill: "#ffffff",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
    });

    const group = new Group([machineRect, label], {
      left: 100,
      top: 100,
      originX: "center",
      originY: "center",
      hasControls: true,
      hasBorders: true,
      lockScalingFlip: true,
    });

    (group as any).machineData = machine;

    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.renderAll();

    updatePlacedMachines();
    toast.success(`${machine.name} added to layout`);
  };

  const updatePlacedMachines = () => {
    if (!fabricCanvas) return;

    const machines: PlacedMachine[] = fabricCanvas
      .getObjects()
      .filter((obj) => (obj as any).machineData)
      .map((obj) => {
        const rect = obj as Rect;
        const machineData = (obj as any).machineData;
        return {
          ...machineData,
          x: rect.left || 0,
          y: rect.top || 0,
          rotation: rect.angle || 0,
        };
      });

    onMachinesUpdate(machines);
  };

  const handleZoomIn = () => fabricCanvas && fabricCanvas.setZoom(Math.min(fabricCanvas.getZoom() * 1.2, 3));
  const handleZoomOut = () => fabricCanvas && fabricCanvas.setZoom(Math.max(fabricCanvas.getZoom() / 1.2, 0.5));

  const handleResetView = () => {
    if (fabricCanvas) {
      fabricCanvas.setZoom(1);
      fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      fabricCanvas.renderAll();
    }
  };

  const handleRotate = () => {
    if (selectedObject && fabricCanvas) {
      selectedObject.rotate((selectedObject.angle || 0) + 90);
      fabricCanvas.renderAll();
      updatePlacedMachines();
    }
  };

  const handleDelete = () => {
    if (selectedObject && fabricCanvas) {
      fabricCanvas.remove(selectedObject);
      fabricCanvas.renderAll();
      setSelectedObject(null);
      updatePlacedMachines();
      toast.success("Machine removed");
    }
  };

  const handleDimensionChange = () => {
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.setWidth(dimensions.width * PIXELS_PER_METER);
      fabricCanvas.setHeight(dimensions.height * PIXELS_PER_METER);
      drawGrid(fabricCanvas);
      fabricCanvas.renderAll();
      toast.success("Layout dimensions updated");
    }
  };

  const handleGenerateReport = async () => {
    if (canvasRef.current) {
      await generateReport(canvasRef.current, placedMachines, dimensions);
    }
  };

  return (
<div className="h-full flex flex-col bg-background ">
  {/* === TOP CONTROL BAR === */}
  <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
    {/* Left Section — Factory Dimensions */}
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-sm font-semibold text-slate-700">Factory Floor Dimension</h2>

      <div className="flex items-center gap-2">
        <Label htmlFor="width" className="text-xs font-medium text-slate-600">Width (m):</Label>
        <Input
          id="width"
          type="number"
          value={dimensions.width}
          onChange={(e) => setDimensions((prev) => ({ ...prev, width: Number(e.target.value) }))}
          className="w-20 text-xs py-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="height" className="text-xs font-medium text-slate-600">Height (m):</Label>
        <Input
          id="height"
          type="number"
          value={dimensions.height}
          onChange={(e) => setDimensions((prev) => ({ ...prev, height: Number(e.target.value) }))}
          className="w-20 text-xs py-1"
        />
      </div>

      <Button onClick={handleDimensionChange} size="sm" className="text-xs">Apply</Button>
    </div>

    {/* Right Section — Canvas Controls */}
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button>
      <Button variant="outline" size="icon" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button>
      <Button variant="outline" size="icon" onClick={handleResetView}><Maximize2 className="h-4 w-4" /></Button>

      {selectedObject && (
        <>
          <Button variant="outline" size="icon" onClick={handleRotate}><RotateCw className="h-4 w-4" /></Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
        </>
      )}

      {/* ✅ Generate PDF Report */}
      <Button onClick={handleGenerateReport} variant="outline" size="icon" title="Generate Report">
        <FileDown className="h-4 w-4" />
      </Button>
    </div>
  </div>

  {/* === MAIN CANVAS === */}
  <div className="flex-1 overflow-auto p-4 bg-muted/30">
    <div className="flex items-center justify-center min-h-full">
      <div className="rounded-lg overflow-hidden bg-white border-4 border-black shadow-lg">
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  </div>

  {/* === FOOTER INFO BAR === */}
  <div className="p-2 border-t border-slate-200 bg-slate-50">
    <p className="text-xs text-slate-500 text-center">
      {placedMachines.length} machine(s) placed | Layout: {dimensions.width}m × {dimensions.height}m ({dimensions.width * dimensions.height} m²)
    </p>
  </div>
</div>
  );
};
