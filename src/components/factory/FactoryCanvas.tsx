import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Text, Group, Line } from "fabric";
import { Machine, PlacedMachine } from "@/types/machine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, Maximize2, RotateCw, Trash2, FileDown } from "lucide-react";
import { toast } from "sonner";
import { generateReport } from "./ReportGenerator";

interface FactoryCanvasProps {
  selectedMachine: Machine | null;
  onMachinesUpdate: (machines: PlacedMachine[]) => void;
  placedMachines: PlacedMachine[];
}

export const FactoryCanvas = ({ selectedMachine, onMachinesUpdate, placedMachines }: FactoryCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  const [useMeters, setUseMeters] = useState(true);
  const convertToMeters = (value: number) => (useMeters ? value : value / 3.28084);
  const convertFromMeters = (value: number) => (useMeters ? value : value * 3.28084);

  // factory dims in meters (world-space)
  const [dimensions, setDimensions] = useState({ width: 30, height: 20 });

  // Fixed on-screen pixel size
  const DISPLAY_WIDTH = 1200;
  const DISPLAY_HEIGHT = 800;

  const COLOR = "#ffffff";
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  // ---- scale & offsets (world meters -> screen pixels) ----
  const getScale = () => {
    // how many screen pixels per meter
    const sx = DISPLAY_WIDTH / dimensions.width;
    const sy = DISPLAY_HEIGHT / dimensions.height;
    return Math.min(sx, sy);
  };

  const getOffsets = (scale: number) => {
    // center the world inside the display area
    const worldWidthPx = dimensions.width * scale;
    const worldHeightPx = dimensions.height * scale;

    const offsetX = Math.round((DISPLAY_WIDTH - worldWidthPx) / 2);
    const offsetY = Math.round((DISPLAY_HEIGHT - worldHeightPx) / 2);

    return { offsetX, offsetY };
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: DISPLAY_WIDTH,
      height: DISPLAY_HEIGHT,
      backgroundColor: COLOR,
      selection: true,
      // optional: make object coordinates not snap to pixel grid (keeps meter precision)
      enableRetinaScaling: false,
    });

    setFabricCanvas(canvas);

    canvas.on("selection:created", (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on("selection:updated", (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on("selection:cleared", () => setSelectedObject(null));

    // keep world-origin (0,0) pinned to the top-left of the *world rectangle* by default.
    // then we translate world->screen using viewport transform offsets.

    return () => {
      canvas.dispose();
    };
  }, []);

  // Apply viewport scaling + offset whenever dimensions change
  useEffect(() => {
    if (!fabricCanvas) return;
    applyViewportScaling();
    drawGrid();
    fabricCanvas.renderAll();
  }, [dimensions, fabricCanvas]);

  // Add machine when user selects one
  useEffect(() => {
    if (selectedMachine && fabricCanvas) addMachine(selectedMachine);
  }, [selectedMachine, fabricCanvas]);

  const applyViewportScaling = () => {
    if (!fabricCanvas) return;
    const scale = getScale();
    const { offsetX, offsetY } = getOffsets(scale);

    // setViewportTransform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
    // translateX/Y are in pixels after scale is applied.
    fabricCanvas.setViewportTransform([scale, 0, 0, scale, offsetX, offsetY]);
  };

  const clearOldGrid = () => {
    if (!fabricCanvas) return;
    // remove objects marked as grid
    fabricCanvas.getObjects().forEach((o) => {
      if ((o as any).isGrid) fabricCanvas.remove(o);
    });
  };

  const drawGrid = () => {
    if (!fabricCanvas) return;

    clearOldGrid();

    // Draw vertical & horizontal meter lines using Line objects
    for (let x = 0; x <= dimensions.width; x++) {
      const xPos = x; // in meters (world units)
      const line = new Line([xPos, 0, xPos, dimensions.height], {
        strokeWidth: 0.02,
        stroke: "#d0d0d0",
        selectable: false,
        evented: false,
      }) as any;
      line.isGrid = true;
      fabricCanvas.add(line);
    }

    for (let y = 0; y <= dimensions.height; y++) {
      const yPos = y; // in meters (world units)
      const line = new Line([0, yPos, dimensions.width, yPos], {
        strokeWidth: 0.02,
        stroke: "#d0d0d0",
        selectable: false,
        evented: false,
      }) as any;
      line.isGrid = true;
      fabricCanvas.add(line);
    }

    // draw bounding box (world rectangle) to help visual alignment
    const bbox = new Rect({
      left: 0,
      top: 0,
      width: dimensions.width,
      height: dimensions.height,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 0.05,
      selectable: false,
      evented: false,
    }) as any;
    bbox.isGrid = true;
    fabricCanvas.add(bbox);
  };

  const addMachine = (machine: Machine | PlacedMachine) => {
    if (!fabricCanvas) return;

    // Ensure your Machine type fields are width_mm and length_mm (width = x-axis, length = y-axis).
    // If your domain uses different naming (length = x), swap accordingly.
    const width_m = (machine as any).width_mm / 1000;
    const height_m = (machine as any).length_mm / 1000;

    const rect = new Rect({
      width: width_m,
      height: height_m,
      fill: "#3B82F6",
      opacity: 0.85,
      stroke: "#1D4ED8",
      strokeWidth: 0.05,
      rx: 0.05,
      ry: 0.05,
      originX: "center",
      originY: "center",
      selectable: true,
    });

    const label = new Text((machine as any).machine_name || "Machine", {
      fontSize: 0.4,
      fill: "#ffffff",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    const left = (machine as PlacedMachine).x ?? dimensions.width / 2;
    const top = (machine as PlacedMachine).y ?? dimensions.height / 2;

    const group = new Group([rect, label], {
      left,
      top,
      originX: "center",
      originY: "center",
      angle: (machine as PlacedMachine).rotation ?? 0,
      hasControls: true,
      hasBorders: true,
    }) as any;

    group.machineData = machine;

    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.requestRenderAll();

    updatePlacedMachines();
  };

  const updatePlacedMachines = () => {
    if (!fabricCanvas) return;
    const machines: PlacedMachine[] = fabricCanvas
      .getObjects()
      .filter((o: any) => o.machineData)
      .map((group: any) => ({
        ...group.machineData,
        x: group.left,        // left/top are in world meters (because we used viewport transform)
        y: group.top,
        rotation: group.angle ?? 0,
      }));

    onMachinesUpdate(machines);
  };

  const handleRotate = () => {
    if (!selectedObject || !fabricCanvas) return;
    selectedObject.rotate((selectedObject.angle || 0) + 90);
    fabricCanvas.requestRenderAll();
    updatePlacedMachines();
  };

  const handleDelete = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.requestRenderAll();
    setSelectedObject(null);
    updatePlacedMachines();
    toast.success("Machine removed");
  };

  const handleGenerateReport = async () => {
    if (canvasRef.current) await generateReport(canvasRef.current, placedMachines, dimensions);
  };

  // ensure placedMachines reflect changes to object movement/scale/rotations
useEffect(() => {
  if (!fabricCanvas) return;

  const handleUpdate = () => updatePlacedMachines();

  fabricCanvas.on("object:moving", handleUpdate);
  fabricCanvas.on("object:rotating", handleUpdate);
  fabricCanvas.on("object:scaling", handleUpdate);

  // optional: still fires in Fabric but not typed, so cast it
  fabricCanvas.on("object:modified" as any, handleUpdate);

  return () => {
    fabricCanvas.off("object:moving", handleUpdate);
    fabricCanvas.off("object:rotating", handleUpdate);
    fabricCanvas.off("object:scaling", handleUpdate);
    fabricCanvas.off("object:modified" as any, handleUpdate);
  };
}, [fabricCanvas]);


  return (
    <div className="flex flex-col h-full bg-background overflow-x-scroll">
      <div className="px-4 py-2 border-b bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-700">Factory Floor Dimension</h2>

          <div className="flex items-center gap-2">
            <Label htmlFor="width" className="text-xs">Width ({useMeters ? "m" : "ft"}):</Label>
            <Input
              id="width"
              type="number"
              value={convertFromMeters(dimensions.width)}
              onChange={(e) => setDimensions((p) => ({ ...p, width: convertToMeters(Number(e.target.value)) }))}
              className="w-20 text-xs py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="height" className="text-xs">Height ({useMeters ? "m" : "ft"}):</Label>
            <Input
              id="height"
              type="number"
              value={convertFromMeters(dimensions.height)}
              onChange={(e) => setDimensions((p) => ({ ...p, height: convertToMeters(Number(e.target.value)) }))}
              className="w-20 text-xs py-1"
            />
          </div>

          <p className="text-xs text-slate-500">(
            {Math.round(dimensions.width * dimensions.height)} m² /
            {Math.round(dimensions.width * dimensions.height * 10.7639)} ft²
          )</p>

          <Button onClick={() => setUseMeters((prev) => !prev)} size="sm" variant="secondary" className="text-xs">
            {useMeters ? "Switch to Feet" : "Switch to Meters"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => fabricCanvas?.setZoom((fabricCanvas.getZoom() || getScale()) * 1.2)}><ZoomIn className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => fabricCanvas?.setZoom((fabricCanvas.getZoom() || getScale()) / 1.2)}><ZoomOut className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => applyViewportScaling()}><Maximize2 className="h-4 w-4" /></Button>

          {selectedObject && (
            <>
              <Button variant="outline" size="icon" onClick={handleRotate}><RotateCw className="h-4 w-4" /></Button>
              <Button variant="destructive" size="icon" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
            </>
          )}

          <Button onClick={handleGenerateReport} variant="outline" size="icon"><FileDown className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-muted/30 flex items-center justify-center">
        <div className="rounded-lg overflow-hidden bg-white border-4 border-black shadow-lg">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};
