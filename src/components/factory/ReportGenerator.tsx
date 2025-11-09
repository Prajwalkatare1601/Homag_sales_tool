import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PlacedMachine } from "@/types/machine";
import { toast } from "sonner";

export const generateReport = async (
  canvasElement: HTMLCanvasElement,
  placedMachines: PlacedMachine[],
  layoutDimensions: { width: number; height: number }
) => {
  try {
    toast.loading("Generating report...");

    // Capture the canvas
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: "#ffffff",
      scale: 2,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // === HEADER ===
    pdf.setFontSize(22);
    pdf.setTextColor(33, 150, 243);
    pdf.text("Factory Layout Report", 105, 20, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 27, { align: "center" });

    // === ADD CANVAS SNAPSHOT ===
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 15, 35, imgWidth, Math.min(imgHeight, 100));

    let yPos = 35 + Math.min(imgHeight, 100) + 10;

    // === SUMMARY CALCULATIONS ===
    const numMachines = placedMachines.length;
    const totalProductivityPerHour = placedMachines.reduce((sum, m) => sum + m.productivity, 0);
    const totalProductivityPerDay = totalProductivityPerHour * 8; // assuming 8-hour day
    const totalOperators = placedMachines.reduce((sum, m) => sum + m.machineOperator, 0);
    const totalConnectedLoad = placedMachines.reduce((sum, m) => sum + m.connectedLoad, 0);
    const totalAirConsumption = placedMachines.reduce((sum, m) => sum + m.airConsumption, 0);
    const totalCapex = placedMachines.reduce((sum, m) => sum + m.capex, 0);
    const avgROI = placedMachines.length > 0
      ? placedMachines.reduce((sum, m) => sum + m.ROI, 0) / placedMachines.length
      : 0;

    // Estimated glue & band (fixed assumption)
    const totalGlueConsumption = numMachines * 40 / 3; // base: 3 machines → 40L/day
    const totalBandConsumption = numMachines * 100 / 3; // base: 3 machines → 100m/day

    // === SUMMARY SECTION ===
    pdf.setFontSize(14);
    pdf.setTextColor(33, 150, 243);
    pdf.text("Factory Performance Summary", 15, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    pdf.text(`No. of Machines: ${numMachines}`, 15, yPos);
    pdf.text(`Productivity: ${totalProductivityPerDay} boards/day`, 90, yPos);
    yPos += 6;

    pdf.text(`No. of Operators: ${totalOperators}`, 15, yPos);
    pdf.text(`Connected Load: ${totalConnectedLoad} kW`, 90, yPos);
    yPos += 6;

    pdf.text(`Air Consumption: ${totalAirConsumption} m³/min`, 15, yPos);
    pdf.text(`Glue Consumption: ${totalGlueConsumption.toFixed(1)} L/day`, 90, yPos);
    yPos += 6;

    pdf.text(`Band Consumption: ${totalBandConsumption.toFixed(1)} m/day`, 15, yPos);
    pdf.text(`Estimated Budget: ₹${(totalCapex / 100).toFixed(2)} Cr`, 90, yPos);
    yPos += 6;

    pdf.text(`ROI: ${Math.round(avgROI / 12)} years`, 15, yPos);
    yPos += 10;

    // === LAYOUT INFO ===
    pdf.setFontSize(12);
    pdf.setTextColor(33, 150, 243);
    pdf.text("Layout Dimensions", 15, yPos);
    yPos += 6;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Width: ${layoutDimensions.width}m`, 15, yPos);
    pdf.text(`Height: ${layoutDimensions.height}m`, 70, yPos);
    pdf.text(`Total Area: ${layoutDimensions.width * layoutDimensions.height} m²`, 125, yPos);

    // === SAVE ===
    pdf.save(`factory-layout-${Date.now()}.pdf`);
    toast.dismiss();
    toast.success("Report generated successfully!");
  } catch (error) {
    console.error("Error generating report:", error);
    toast.dismiss();
    toast.error("Failed to generate report");
  }
};
