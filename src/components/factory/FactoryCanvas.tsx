import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Text, FabricObject, Group } from "fabric";
import { Machine, PlacedMachine } from "@/types/machine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ZoomIn, ZoomOut, Maximize2, RotateCw, Trash2, FileDown
} from "lucide-react";
import { toast } from "sonner";
import { generateReport } from "./ReportGenerator.tsx";


interface FactoryCanvasProps {
  selectedMachine: Machine | null;
  onMachinesUpdate: (machines: PlacedMachine[]) => void;
  placedMachines: PlacedMachine[];
}

export const FactoryCanvas = ({ selectedMachine, onMachinesUpdate, placedMachines }: FactoryCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  const [useMeters, setUseMeters] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 30, height: 20 });
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);

  const PIXELS_PER_METER = 40;
  const COLOR = "#d4c7c7ff";
  

  const convertToMeters = (value: number) => (useMeters ? value : value / 3.28084);
  const convertFromMeters = (value: number) => (useMeters ? value : value * 3.28084);

  const isGroup = (obj: FabricObject): obj is Group => {
  return obj.type === "group";
  };
  
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

    // Collision check events
    canvas.on("object:moving", () => checkCollisions(canvas));
    canvas.on("object:rotating", () => checkCollisions(canvas));
    canvas.on("object:scaling", () => checkCollisions(canvas));

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
      canvas.add(new Rect({
        left: i * gridSize,
        top: 0,
        width: 1,
        height: dimensions.height * gridSize,
        fill: "#ccc",
        selectable: false,
        evented: false,
      }));
    }
    for (let i = 0; i <= dimensions.height; i++) {
      canvas.add(new Rect({
        left: 0,
        top: i * gridSize,
        width: dimensions.width * gridSize,
        height: 1,
        fill: "#ccc",
        selectable: false,
        evented: false,
      }));
    }
  };

  const addMachineToCanvas = (machine: Machine) => {
    if (!fabricCanvas) return;

    const rectWidth = machine.width_mm * PIXELS_PER_METER / 1000;
    const rectHeight = machine.length_mm * PIXELS_PER_METER / 1000;

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

    const nameLabel = new Text(machine.machine_name, {
      fontSize: 16,
      fill: "#ffffff",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
      textAlign: "center",
    });

    const dimensionLabel = new Text(
      `${machine.width_mm / 1000}m × ${machine.length_mm / 1000}m`,
      {
        fontSize: 14,
        fill: "#ffffff",
        originX: "center",
        originY: "center",
        textAlign: "center",
        top: 20,
      }
    );

    const group = new Group([machineRect, nameLabel, dimensionLabel], {
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

    checkCollisions(fabricCanvas);
    updatePlacedMachines();

    toast.success(`${machine.machine_name} added to layout`);
  };

const checkCollisions = (canvas: FabricCanvas) => {
  const objects = canvas.getObjects().filter(obj => (obj as any).machineData);

  // Remove any existing collision text
  canvas.getObjects()
    .filter(obj => (obj as any).isCollisionText)
    .forEach(obj => canvas.remove(obj));

  let collisionDetected = false;

  // Reset all machine colors
  objects.forEach((obj) => {
    if (isGroup(obj)) {
      obj.item(0).set({ stroke: "#1D4ED8", fill: "#3B82F6" });
    }
  });

  // Detect overlaps
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const objA = objects[i];
      const objB = objects[j];

      const rA = objA.getBoundingRect();
      const rB = objB.getBoundingRect();

      const isOverlap = !(
        rA.left + rA.width < rB.left ||
        rA.left > rB.left + rB.width ||
        rA.top + rA.height < rB.top ||
        rA.top > rB.top + rB.height
      );

      if (isOverlap) {
        collisionDetected = true;
        if (isGroup(objA)) objA.item(0).set({ stroke: "red", fill: "rgba(255,0,0,0.5)" });
        if (isGroup(objB)) objB.item(0).set({ stroke: "red", fill: "rgba(255,0,0,0.5)" });
      }
    }
  }

  // Show collision text if any collision is detected
  if (collisionDetected) {
    const collisionText = new Text("Collision Detected!", {
      left: canvas.getWidth() / 2,
      top: 10,
      fontSize: 24,
      fill: "red",
      fontWeight: "bold",
      originX: "center",
      selectable: false,
      evented: false,
    });
    (collisionText as any).isCollisionText = true;
    canvas.add(collisionText);
  }

  canvas.renderAll();
};




  const updatePlacedMachines = () => {
    if (!fabricCanvas) return;

    const machines: PlacedMachine[] = fabricCanvas
      .getObjects()
      .filter(obj => (obj as any).machineData)
      .map(obj => {
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
      checkCollisions(fabricCanvas);
      updatePlacedMachines();
    }
  };

  const handleDelete = () => {
    if (selectedObject && fabricCanvas) {
      fabricCanvas.remove(selectedObject);
      fabricCanvas.renderAll();
      setSelectedObject(null);
      checkCollisions(fabricCanvas);
      updatePlacedMachines();
      toast.success("Machine removed");
    }
  };

  const handleGenerateReport = async () => {
    if (canvasRef.current) {
      await generateReport(canvasRef.current, placedMachines, dimensions);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-x-scroll">
      {/* === TOP CONTROL BAR === */}
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">

        {/* DIMENSIONS SECTION */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-700">Factory Floor Dimension</h2>
          <div className="flex items-center gap-2">
            <Label htmlFor="width" className="text-xs font-medium text-slate-600">
              Width ({useMeters ? "m" : "ft"}):
            </Label>
            <Input
              id="width"
              type="number"
              value={convertFromMeters(dimensions.width)}
              onChange={(e) =>
                setDimensions((prev) => ({
                  ...prev,
                  width: convertToMeters(Number(e.target.value)),
                }))
              }
              className="w-20 text-xs py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="height" className="text-xs font-medium text-slate-600">
              Height ({useMeters ? "m" : "ft"}):
            </Label>
            <Input
              id="height"
              type="number"
              value={convertFromMeters(dimensions.height)}
              onChange={(e) =>
                setDimensions((prev) => ({
                  ...prev,
                  height: convertToMeters(Number(e.target.value)),
                }))
              }
              className="w-20 text-xs py-1"
            />
          </div>
          <p className="text-xs text-slate-500 text-center">
            ({Math.round(dimensions.width * dimensions.height)} m² /
            {Math.round(dimensions.width * dimensions.height * 10.7639)} ft²)
          </p>
          <Button
            onClick={() => setUseMeters((prev) => !prev)}
            size="sm"
            variant="secondary"
            className="text-xs"
          >
            {useMeters ? "Switch to Feet" : "Switch to Meters"}
          </Button>
        </div>

        {/* CANVAS CONTROLS */}
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
          <Button onClick={handleGenerateReport} variant="outline" size="icon" title="Generate Report">
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* MAIN CANVAS */}
      <div className="flex-1 overflow-auto p-4 bg-muted/30">
        <div className="flex items-center justify-center min-h-full">
          <div className="rounded-lg overflow-hidden bg-white border-4 border-black shadow-lg">
            <canvas ref={canvasRef} className="block" />
          </div>
        </div>
      </div>
    </div>
  );
};
