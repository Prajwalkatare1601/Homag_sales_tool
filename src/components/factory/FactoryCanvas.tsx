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
  Trash2 
} from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: dimensions.width * PIXELS_PER_METER,
      height: dimensions.height * PIXELS_PER_METER,
      backgroundColor: "#ffffff",
      selection: true,
    });

    drawGrid(canvas);
    setFabricCanvas(canvas);

    canvas.on("selection:created", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

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
        fill: "#e5e7eb",
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
        fill: "#e5e7eb",
        selectable: false,
        evented: false,
      });
      canvas.add(line);
    }
  };

  const addMachineToCanvas = (machine: Machine) => {
    if (!fabricCanvas) return;

    const machineRect = new Rect({
      left: 100,
      top: 100,
      width: machine.width * PIXELS_PER_METER,
      height: machine.height * PIXELS_PER_METER,
      fill: machine.color,
      opacity: 0.7,
      stroke: machine.color,
      strokeWidth: 2,
      cornerColor: machine.color,
      cornerSize: 8,
      transparentCorners: false,
    });

    const label = new Text(machine.name, {
      left: 100 + (machine.width * PIXELS_PER_METER) / 2,
      top: 100 + (machine.height * PIXELS_PER_METER) / 2,
      fontSize: 12,
      fill: "#ffffff",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
      selectable: false,
    });

    (machineRect as any).machineData = machine;
    fabricCanvas.add(machineRect);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(machineRect);
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
          fabricId: rect.id,
        };
      });

    onMachinesUpdate(machines);
  };

  const handleZoomIn = () => {
    if (fabricCanvas) {
      const zoom = fabricCanvas.getZoom();
      fabricCanvas.setZoom(Math.min(zoom * 1.2, 3));
    }
  };

  const handleZoomOut = () => {
    if (fabricCanvas) {
      const zoom = fabricCanvas.getZoom();
      fabricCanvas.setZoom(Math.max(zoom / 1.2, 0.5));
    }
  };

  const handleResetView = () => {
    if (fabricCanvas) {
      fabricCanvas.setZoom(1);
      fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      fabricCanvas.renderAll();
    }
  };

  const handleRotate = () => {
    if (selectedObject && fabricCanvas) {
      const currentAngle = selectedObject.angle || 0;
      selectedObject.rotate(currentAngle + 90);
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

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-panel-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="width" className="text-sm whitespace-nowrap">
              Width (m):
            </Label>
            <Input
              id="width"
              type="number"
              value={dimensions.width}
              onChange={(e) => setDimensions(prev => ({ 
                ...prev, 
                width: Number(e.target.value) 
              }))}
              className="w-20"
              min="10"
              max="100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="height" className="text-sm whitespace-nowrap">
              Height (m):
            </Label>
            <Input
              id="height"
              type="number"
              value={dimensions.height}
              onChange={(e) => setDimensions(prev => ({ 
                ...prev, 
                height: Number(e.target.value) 
              }))}
              className="w-20"
              min="10"
              max="100"
            />
          </div>
          <Button onClick={handleDimensionChange} size="sm">
            Apply
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleResetView}
            title="Reset View"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          {selectedObject && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRotate}
                title="Rotate 90°"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-muted/30">
        <div className="flex items-center justify-center min-h-full">
          <div className="shadow-elevated rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-panel-border bg-panel-bg">
        <p className="text-xs text-muted-foreground text-center">
          {placedMachines.length} machine(s) placed | 
          Layout: {dimensions.width}m × {dimensions.height}m 
          ({dimensions.width * dimensions.height} m²)
        </p>
      </div>
    </div>
  );
};
