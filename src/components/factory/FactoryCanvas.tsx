import { useEffect, useRef, useState } from "react";
import {
  Canvas as FabricCanvas,
  Rect,
  Text,
  FabricObject,
  Group,
  Line,
  Point,
  Textbox,
} from "fabric";
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
  FileDown,
} from "lucide-react";
import { toast } from "sonner";

  const isGroup = (obj: FabricObject): obj is Group => {
  return obj.type === "group";
  };
declare module "fabric" {
  interface FabricObject {
    isGrid?: boolean;
    isDistanceLine?: boolean;
    isCollisionText?: boolean;
    machineData?: any;

    // ✅ NEW
    isCustomWorkingArea?: boolean;
  }
}

function autoScaleText(textObj:Textbox | Text, maxWidth: number) {
  const bounding = textObj.getBoundingRect().width;

  if (bounding > maxWidth) {
    const scale = maxWidth / bounding;
    textObj.scaleX = scale;
  } else {
    textObj.scaleX = 1; // reset if smaller than maxWidth
  }
}



interface FactoryCanvasProps {
  selectedMachine: Machine | null;
  onMachinesUpdate: (machines: PlacedMachine[]) => void;
  placedMachines: PlacedMachine[];
}

export const FactoryCanvas = ({
  selectedMachine,
  onMachinesUpdate,
  placedMachines,
}: FactoryCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const PIXELS_PER_METER = 40;
  const COLOR = "#d4c7c7ff";
  

  const [useMeters, setUseMeters] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 30, height: 20 });
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
    null
  );

  // Cartesian coords stored in meters
  const [machineX, setMachineX] = useState<number>(0);
  const [machineY, setMachineY] = useState<number>(0);

  const convertToMeters = (value: number) =>
    useMeters ? value : value / 3.28084;
  const convertFromMeters = (value: number) =>
    useMeters ? value : value * 3.28084;

  // Type guard for Fabric Group
  function isFabricGroup(obj: FabricObject | null | undefined): obj is Group {
    return !!obj && obj.type === "group";
  }

  //
  // Helpers: convert between Fabric canvas coords and user Cartesian (bottom-left origin)
  //


  const useMetersRef = useRef(useMeters);
  

  const getBoundingEdges = (obj: Group) => {
  const rect = obj.getBoundingRect();
  return {
    left: rect.left,
    right: rect.left + rect.width,
    top: rect.top,
    bottom: rect.top + rect.height,
  };
};
const getEdgeDistance = (a: Group, b: Group) => {
  const eA = getBoundingEdges(a);
  const eB = getBoundingEdges(b);

  // Horizontal distance
  let dx = 0;
  if (eA.right < eB.left) dx = eB.left - eA.right;       // A is left of B
  else if (eB.right < eA.left) dx = eA.left - eB.right;  // B is left of A
  else dx = 0; // overlapping horizontally

  // Vertical distance
  let dy = 0;
  if (eA.bottom < eB.top) dy = eB.top - eA.bottom;       // A is above B
  else if (eB.bottom < eA.top) dy = eA.top - eB.bottom;  // B is above A
  else dy = 0; // overlapping vertically

  return { dx, dy };
};
const drawEdgeDistanceLines = (canvas: FabricCanvas) => {
  canvas.getObjects()
    .filter((obj: any) => obj.isDistanceLine)
    .forEach(obj => canvas.remove(obj));

  const objects = canvas.getObjects().filter(
    (o: any) => o.machineData && !o.isCustomWorkingArea
  ) as Group[];

  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const objA = objects[i];
      const objB = objects[j];

      const { dx, dy } = getEdgeDistance(objA, objB);

      if (dx === 0 && dy === 0) continue; // overlapping, no distance line needed

      // Determine line start/end: horizontal, vertical, or diagonal
      const eA = getBoundingEdges(objA);
      const eB = getBoundingEdges(objB);

      let startX = 0, startY = 0, endX = 0, endY = 0;

      if (dx === 0) { // vertical line
        startX = (Math.max(eA.left, eB.left) + Math.min(eA.right, eB.right)) / 2;
        startY = eA.bottom < eB.top ? eA.bottom : eA.top;
        endX = startX;
        endY = eA.bottom < eB.top ? eB.top : eB.bottom;
      } else if (dy === 0) { // horizontal line
        startY = (Math.max(eA.top, eB.top) + Math.min(eA.bottom, eB.bottom)) / 2;
        startX = eA.right < eB.left ? eA.right : eA.left;
        endY = startY;
        endX = eA.right < eB.left ? eB.left : eB.right;
      } 

      const distanceMeters = Math.sqrt(dx * dx + dy * dy) / PIXELS_PER_METER;
const unitIsMeters = useMetersRef.current;
const displayDistance = unitIsMeters ? distanceMeters : distanceMeters * 3.28084;


      const line = new Line([startX, startY, endX, endY], {
        stroke: "red",
        strokeWidth: 2,
        selectable: false,
        evented: false,
      });
      (line as any).isDistanceLine = true;
      canvas.add(line);

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      const text = new Text(displayDistance.toFixed(2) + (unitIsMeters ? "m" : "ft"), {
        left: midX,
        top: midY-10,
        fontSize: 14,
        fill: "black",
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      });
      (text as any).isDistanceLine = true;
      canvas.add(text);
    }
  }

  canvas.requestRenderAll();
};


  // Fabric Group -> Cartesian bottom-left (returns in meters)
  const fabricToCartesian = (obj: Group) => {
    // getBoundingRect returns axis-aligned bounding box in canvas px
    const rect = obj.getBoundingRect(); // no args for Fabric v6
    const canvasHeightPx = dimensions.height * PIXELS_PER_METER;

    const xMeters = rect.left / PIXELS_PER_METER;
    const yMeters = (canvasHeightPx - (rect.top + rect.height)) / PIXELS_PER_METER;

    return { x: Number(xMeters.toFixed(4)), y: Number(yMeters.toFixed(4)) };
  };

  // Cartesian bottom-left (meters) -> Fabric left/top values for the group's position
  // Note: this uses the group's current bounding box height (transformed) so placement is correct
 // (xMeters, yMeters) represent the CENTER of the machine
const cartesianToFabric = (xMeters: number, yMeters: number) => {
  const centerX = xMeters * PIXELS_PER_METER;

  // Convert bottom-left Cartesian → Fabric (top-left origin)
  const canvasHeightPx = dimensions.height * PIXELS_PER_METER;
  const centerY = canvasHeightPx - yMeters * PIXELS_PER_METER;

  return { centerX, centerY };
};




useEffect(() => {
  useMetersRef.current = useMeters;
  if (fabricCanvas) drawEdgeDistanceLines(fabricCanvas);
}, [useMeters, fabricCanvas]);


  //
  // Canvas lifecycle
  //
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

    // selection handlers
    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0] ?? null;
      setSelectedObject(obj);
      if (isFabricGroup(obj)) {
        const { x, y } = fabricToCartesian(obj);
        setMachineX(x);
        setMachineY(y);
      }
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0] ?? null;
      setSelectedObject(obj);
      if (isFabricGroup(obj)) {
        const { x, y } = fabricToCartesian(obj);
        setMachineX(x);
        setMachineY(y);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    // while moving, update coordinates (live) and collision check
canvas.on("object:moving", (e) => {
  const obj = e.target;
  if (!obj) return;

  // 1. get CENTER
  const center = obj.getCenterPoint();

  // 2. use scaled size (rotation-independent)
  const halfW = obj.getScaledWidth() / 2;
  const halfH = obj.getScaledHeight() / 2;

  // 3. clamp center
  const minX = halfW;
  const minY = halfH;
  const maxX = canvas.getWidth() - halfW;
  const maxY = canvas.getHeight() - halfH;

  center.x = Math.min(Math.max(center.x, minX), maxX);
  center.y = Math.min(Math.max(center.y, minY), maxY);

  // 4. move object based on center
  obj.setPositionByOrigin(center, "center", "center");
  obj.setCoords();

  // 5. your existing logic
  if (isFabricGroup(obj) && obj === selectedObject) {
    const { x, y } = fabricToCartesian(obj);
    setMachineX(x);
    setMachineY(y);
  }

  checkCollisions(canvas);
  drawEdgeDistanceLines(canvas);
});



    canvas.on("object:rotating", () => {checkCollisions(canvas);
      drawEdgeDistanceLines(canvas)
    });
    canvas.on("object:scaling", () => checkCollisions(canvas));

    return () => {
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
  if (!fabricCanvas) return;

  // Resize canvas without recreating it
  fabricCanvas.setWidth(dimensions.width * PIXELS_PER_METER);
  fabricCanvas.setHeight(dimensions.height * PIXELS_PER_METER);

  // Remove old grid lines
  fabricCanvas.getObjects()
    .filter(o => o.isGrid)
    .forEach(o => fabricCanvas.remove(o));

  // Draw a new grid
  drawGrid(fabricCanvas);

  fabricCanvas.requestRenderAll();
}, [dimensions, fabricCanvas]);


useEffect(() => {
  if (!selectedMachine || !fabricCanvas) return;

  if (selectedMachine.type === "WORKING_AREA") {
    addCustomWorkingArea(
      (selectedMachine.width_mm ?? 4000) / 1000,
      (selectedMachine.length_mm ?? 3000) / 1000,
      selectedMachine.machine_name ?? "Working Area"
    );
  } else {
    addMachineToCanvas(selectedMachine);
  }
}, [selectedMachine, fabricCanvas]);


  //
  // Draw grid
  //
  
const drawGrid = (canvas: FabricCanvas) => {
  const gridSize = PIXELS_PER_METER;

  for (let i = 0; i <= dimensions.width; i++) {
    const line = new Rect({
      left: i * gridSize,
      top: 0,
      width: 1,
      height: dimensions.height * gridSize,
      fill: "#eee",
      selectable: false,
      evented: false,
    });
    line.isGrid = true;
    canvas.add(line);
  }

  for (let i = 0; i <= dimensions.height; i++) {
    const line = new Rect({
      left: 0,
      top: i * gridSize,
      width: dimensions.width * gridSize,
      height: 1,
      fill: "#eee",
      selectable: false,
      evented: false,
    });
    line.isGrid = true;
    canvas.add(line);
  }
};


  //
  // Add a machine group to canvas. IMPORTANT: group origin set to left/top so left/top match bounding rect top-left.
  //


const addMachineToCanvas = (machine: Machine) => {
  const machineType = machine.type?.toLowerCase() ?? "";

  console.log("ADDING MACHINE:", machine.machine_name, machine.isCustom);

  const isCustomMachine = machine.isCustom === true;

// 🎨 Color palette
const MACHINE_COLOR = isCustomMachine ? "#9333EA" : "#3B82F6"; // purple : blue
const MACHINE_STROKE = isCustomMachine ? "#7E22CE" : "#1D4ED8";

const WORKING_FILL = isCustomMachine
  ? "rgba(168,85,247,0.15)"   // purple tint
  : "rgba(34,197,94,0.15)";   // green (existing)

const WORKING_STROKE = isCustomMachine ? "#A855F7" : "#22c55e";


  if (!fabricCanvas) return;

  const rectWidth = (machine.width_mm * PIXELS_PER_METER) / 1000;
  const rectHeight = (machine.length_mm * PIXELS_PER_METER) / 1000;

  const machineRect = new Rect({
    left: 0,
    top: 0,
    width: rectWidth,
    height: rectHeight,
    fill: MACHINE_COLOR,
    opacity: 0.85,
    stroke: MACHINE_STROKE,
    strokeWidth: 2,
    rx: 4,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

// ===============================
// Working area margins (meters)
// ===============================
let marginTop = 0.5;
let marginBottom = 0.5;
let marginLeft = 0.5;
let marginRight = 0.5;

// Special rule: Panel Dividing machines
if (machineType === "panel dividing") {
  marginTop = 0.5;
  marginLeft = 0.5;
  marginRight = 0.5;
  marginBottom = 3.0; // 👈 IMPORTANT
}

// Edge Bander rule
if (machineType === "edgeband") {
  marginTop = 3.0;
  marginBottom = 3.0;
  marginRight = 3.0;
  marginLeft = 0.5;
}

if (
  machineType === "cnc drilling"
) {
  marginTop = 0.5;
  marginBottom = 0.5;
  marginLeft = 0.5;
  marginRight = 2; // 👈 key requirement
}


// Convert to pixels
const topPx = marginTop * PIXELS_PER_METER;
const bottomPx = marginBottom * PIXELS_PER_METER;
const leftPx = marginLeft * PIXELS_PER_METER;
const rightPx = marginRight * PIXELS_PER_METER;

// Working area dimensions
const workingWidth = rectWidth + leftPx + rightPx;
const workingHeight = rectHeight + topPx + bottomPx;

const workingAreaRect = new Rect({
  left: -leftPx,          // 👈 left buffer
  top: -topPx,            // 👈 top buffer
  width: workingWidth,
  height: workingHeight,
  fill: WORKING_FILL,
  stroke: WORKING_STROKE,
  strokeDashArray: [8, 6],
  strokeWidth: 2,
  rx: 8,
  ry: 8,
  originX: "left",
  originY: "top",
  selectable: false,
  evented: false,
});

// --- Working space label ---
const workingSpaceLabel = new Textbox(
  "Working Space",
  {
    left: rectWidth / 2,

    // 👇 Position near bottom of working area
    top: rectHeight + bottomPx - 15,    width: rectWidth,
    fontSize: 12,
    fill: "#166534",
    fontWeight: "bold",
    textAlign: "center",
    originX: "center",
    originY: "top",
    selectable: false,
    evented: false,
  }
);

// Optional: auto-scale to fit width
autoScaleText(workingSpaceLabel, rectWidth);




  const nameLabel = new Textbox(machine.machine_name, {
    left: 6,
    top: 6,
    fontSize: 14,
    fill: isCustomMachine ? "#FDF4FF" : "#fff",
    fontWeight: "bold",
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  // Auto-scale name text to fit width
  autoScaleText(nameLabel, rectWidth - 12);



const avgBoardsPerShift =
  Number.isFinite(machine.productivity_boards_min)
    ? Math.round(
        (Number(machine.productivity_boards_min ?? 0) +
          Number(
            machine.productivity_boards_max ??
              machine.productivity_boards_min ??
              0
          )) / 2
      )
    : null;

const nameLabelHeight = nameLabel.getScaledHeight();

const productivityLabel =
  avgBoardsPerShift !== null
    ? new Text(`${avgBoardsPerShift} boards / shift`, {
        left: 6,
        top: 6 + nameLabelHeight + 4, // ⬅ dynamic spacing
        fontSize: 11,
        fill: "#E5F0FF",
        fontWeight: "normal",
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
      })
    : null;

if (productivityLabel) {
  autoScaleText(productivityLabel, rectWidth - 12);
}



  const dimensionLabel = new Text(
    `${(machine.width_mm / 1000).toFixed(2)}m × ${(machine.length_mm / 1000).toFixed(2)}m`,
    {
      left: 6,
      top: rectHeight - 18,
      fontSize: 12,
      fill: "#fff",
      originX: "left",
      originY: "top",
      selectable: false,
      evented: false,
    }
  );

  // Auto-scale dimensions text as well
  autoScaleText(dimensionLabel, rectWidth - 12);

  
const group = new Group(
  [
    workingAreaRect,
    workingSpaceLabel, // 👈 ADD HERE
    machineRect,
    nameLabel,
    ...(productivityLabel ? [productivityLabel] : []),
    dimensionLabel,
  ],
  {
    left: 50,
    top: 50,
    originX: "left",
    originY: "top",
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true,
    lockScalingX: true,
    lockScalingY: true,
  }
);

(group as any).machineData = machine;
(group as any).isCustomMachine = isCustomMachine; // ⭐ THIS WAS MISSING

(machineRect as any).isMachineBody = true;
(workingAreaRect as any).isWorkingArea = true;



  fabricCanvas.add(group);
  fabricCanvas.setActiveObject(group);
  fabricCanvas.requestRenderAll();

  // Update coordinates after adding
  if (isFabricGroup(group)) {
    const { x, y } = fabricToCartesian(group);
    setMachineX(x);
    setMachineY(y);
  }

  checkCollisions(fabricCanvas);
  updatePlacedMachines();
  drawEdgeDistanceLines(fabricCanvas);
  toast.success(`${machine.machine_name} added to layout`);
};

const addCustomWorkingArea = (
  widthMeters = 4,
  heightMeters = 3,
  label = "Working Area"
) => {
  if (!fabricCanvas) return;

  const widthPx = widthMeters * PIXELS_PER_METER;
  const heightPx = heightMeters * PIXELS_PER_METER;

  // --- Working Area Rect ---
  const areaRect = new Rect({
    left: 0,
    top: 0,
    width: widthPx,
    height: heightPx,
    fill: "rgba(0, 213, 255, 0.12)",
    stroke: "#091d20ff",
    strokeDashArray: [10, 6],
    strokeWidth: 2,
    rx: 10,
    ry: 10,
    selectable: false,
    evented: false,
  });

  

  // --- Label Text ---
  const areaLabel = new Text(label, {
    left: widthPx / 2,
    top: heightPx / 2,
    originX: "center",
    originY: "center",
    fontSize: 16,
    fontWeight: "bold",
    fill: "#166534", // dark green
    selectable: false,
    evented: false,
  });

  // --- Group ---
  const group = new Group([areaRect, areaLabel], {
    left: 80,
    top: 80,
    hasControls: true,
    hasBorders: true,
    lockRotation: true,
  });

  // ✅ IMPORTANT FLAGS
  (group as any).isCustomWorkingArea = true;

  fabricCanvas.add(group);
  fabricCanvas.setActiveObject(group);
  fabricCanvas.requestRenderAll();

  toast.success("Working area added");
};



  //
  // Collision detection (uses bounding boxes)
  //
const checkCollisions = (canvas: FabricCanvas) => {
  const objects = canvas.getObjects().filter(
    (obj) =>
      (obj as any).machineData && !(obj as any).isCustomWorkingArea
  );



  // Remove any existing collision text
  canvas.getObjects()
    .filter(obj => (obj as any).isCollisionText)
    .forEach(obj => canvas.remove(obj));

  let collisionDetected = false;

  // Reset all machine colors
objects.forEach((obj) => {
  if (!isGroup(obj)) return;

  const isCustom = (obj as any).isCustomMachine === true;

  const MACHINE_COLOR = isCustom ? "#9333EA" : "#3B82F6";
  const MACHINE_STROKE = isCustom ? "#7E22CE" : "#1D4ED8";

  const WORKING_FILL = isCustom
    ? "rgba(168,85,247,0.15)"
    : "rgba(34,197,94,0.15)";

  const WORKING_STROKE = isCustom ? "#A855F7" : "#22c55e";

  obj.getObjects().forEach((child) => {
    if ((child as any).isWorkingArea) {
      child.set({
        stroke: WORKING_STROKE,
        fill: WORKING_FILL,
      });
    }

    if ((child as any).isMachineBody) {
      child.set({
        stroke: MACHINE_STROKE,
        fill: MACHINE_COLOR,
      });
    }
  });
});


  // Detect overlaps
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
    const objA = objects[i];
    const objB = objects[j];

    // ✅ SAFETY CHECK
    if ((objA as any).isCustomWorkingArea || (objB as any).isCustomWorkingArea) {
      continue;
    }

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

  //
  // When inputs change: place group so its bottom-left matches user coords.
  //
const handleCartesianMove = (axis: "x" | "y", inputValue: number) => {
  if (!selectedObject || !fabricCanvas || !isFabricGroup(selectedObject)) return;

  const metersValue = convertToMeters(inputValue);

  // -------------------------
  // 1. Compute target position
  // -------------------------
  const targetX = axis === "x" ? metersValue : machineX;
  const targetY = axis === "y" ? metersValue : machineY;

  // -------------------------
  // 2. Clamp to factory bounds
  // -------------------------
  const halfW = selectedObject.getScaledWidth() / PIXELS_PER_METER / 2;
  const halfH = selectedObject.getScaledHeight() / PIXELS_PER_METER / 2;

  const maxX = dimensions.width - halfW;
  const maxY = dimensions.height - halfH;

  const clampedX = Math.min(Math.max(targetX, halfW), maxX);
  const clampedY = Math.min(Math.max(targetY, halfH), maxY);

  const isClamped = clampedX !== targetX || clampedY !== targetY;

  if (isClamped) {
    toast.error("Out of bounds — machine center must stay inside factory.");
  }

  // -------------------------
  // 3. Convert Cart → Fabric
  // -------------------------
  const { centerX, centerY } = cartesianToFabric(clampedX, clampedY);

  // Only move if changed
  const prev = selectedObject.getCenterPoint();
  if (prev.x !== centerX || prev.y !== centerY) {
    selectedObject.setPositionByOrigin(
      new Point(centerX, centerY),
      "center",
      "center"
    );
    selectedObject.setCoords();
    fabricCanvas.requestRenderAll();
  }

  // -------------------------
  // 4. Update state + run checks
  // -------------------------
  setMachineX(clampedX);
  setMachineY(clampedY);

  checkCollisions(fabricCanvas);
  updatePlacedMachines();

  return { x: clampedX, y: clampedY, clamped: isClamped };
};



  //
  // Update placed machines list (reporting coordinates as bottom-left meters)
  //
  const updatePlacedMachines = () => {
    if (!fabricCanvas) return;

    const machines: PlacedMachine[] = fabricCanvas
      .getObjects()
      .filter((o) => (o as any).machineData)
      .map((o) => {
        const group = o as Group;
        const machineData = (o as any).machineData;
        let x = 0;
        let y = 0;
        if (isFabricGroup(group)) {
          const coords = fabricToCartesian(group);
          x = coords.x;
          y = coords.y;
        }
        return {
          ...machineData,
          x,
          y,
          rotation: (o as any).angle || 0,
        } as PlacedMachine;
      });

    onMachinesUpdate(machines);
  };

  //
  // Zoom / view / rotate / delete / report handlers
  //
  const handleZoomIn = () =>
    fabricCanvas && fabricCanvas.setZoom(Math.min(fabricCanvas.getZoom() * 1.2, 3));
  const handleZoomOut = () =>
    fabricCanvas && fabricCanvas.setZoom(Math.max(fabricCanvas.getZoom() / 1.2, 0.5));
  const handleResetView = () => {
    if (!fabricCanvas) return;
    fabricCanvas.setZoom(1);
    fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    fabricCanvas.requestRenderAll();
  };

  const handleRotate = () => {
    if (selectedObject && fabricCanvas && isFabricGroup(selectedObject)) {
      selectedObject.rotate((selectedObject.angle || 0) + 90);
      selectedObject.setCoords();
      fabricCanvas.requestRenderAll();
      // update coords after rotation
      const { x, y } = fabricToCartesian(selectedObject);
      setMachineX(x);
      setMachineY(y);
      checkCollisions(fabricCanvas);
      updatePlacedMachines();
    }
  };

  const handleDelete = () => {
    if (selectedObject && fabricCanvas) {
      fabricCanvas.remove(selectedObject);
    setSelectedObject(null);
      fabricCanvas.requestRenderAll();
      checkCollisions(fabricCanvas);
      updatePlacedMachines();
      toast.success("Machine removed");
      drawEdgeDistanceLines(fabricCanvas);
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

          {/* Cartesian inputs (visible when object selected) */}
          {selectedObject && isFabricGroup(selectedObject) && (
            <div className="flex items-center gap-2 ml-4">
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={convertFromMeters(machineX)}
                onChange={(e) => handleCartesianMove("x", Number(e.target.value))}
                className="w-20 text-xs py-1"
              />

              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={convertFromMeters(machineY)}
                onChange={(e) => handleCartesianMove("y", Number(e.target.value))}
                className="w-20 text-xs py-1"
              />
            </div>
          )}
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
        </div>
      </div>

      {/* MAIN CANVAS */}
      <div className="flex-1 overflow-auto p-4 bg-muted/30">
        <div className="flex items-center justify-center min-h-full">
          <div className="rounded-lg overflow-hidden bg-white border-4 border-black shadow-lg">
            <canvas ref={(el) => (canvasRef.current = el)} className="block" />
          </div>
        </div>
      </div>
    </div>
  );
};
