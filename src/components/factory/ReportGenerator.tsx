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

    // Add header
    pdf.setFontSize(24);
    pdf.setTextColor(33, 150, 243);
    pdf.text("Factory Layout Report", 105, 20, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 27, { align: "center" });

    // Add layout image
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 15, 35, imgWidth, Math.min(imgHeight, 120));

    let yPos = 35 + Math.min(imgHeight, 120) + 10;

    // Layout Info
    pdf.setFontSize(14);
    pdf.setTextColor(33, 150, 243);
    pdf.text("Layout Dimensions", 15, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Width: ${layoutDimensions.width}m`, 15, yPos);
    pdf.text(`Height: ${layoutDimensions.height}m`, 80, yPos);
    pdf.text(`Total Area: ${layoutDimensions.width * layoutDimensions.height}m²`, 145, yPos);
    yPos += 10;

    // Productivity Summary
    const totalProductivity = placedMachines.reduce((sum, m) => sum + m.productivity, 0);
    const avgTimeSaving = placedMachines.length > 0
      ? Math.round(placedMachines.reduce((sum, m) => sum + m.timeSaving, 0) / placedMachines.length)
      : 0;

    pdf.setFontSize(14);
    pdf.setTextColor(33, 150, 243);
    pdf.text("Productivity Summary", 15, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Total Machines: ${placedMachines.length}`, 15, yPos);
    pdf.text(`Total Output: ${totalProductivity} units/hour`, 80, yPos);
    pdf.text(`Avg Time Savings: ${avgTimeSaving}%`, 145, yPos);
    yPos += 10;

    // Machine Details
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setTextColor(33, 150, 243);
    pdf.text("Machine Details", 15, yPos);
    yPos += 7;

    pdf.setFontSize(9);
    placedMachines.forEach((machine, index) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setTextColor(0, 0, 0);
      pdf.text(`${index + 1}. ${machine.name}`, 15, yPos);
      yPos += 5;
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Type: ${machine.type} | Size: ${machine.width}m × ${machine.height}m`, 20, yPos);
      yPos += 5;
      pdf.text(`Productivity: ${machine.productivity} u/h | Time Saving: ${machine.timeSaving}%`, 20, yPos);
      yPos += 7;
    });

    // Save PDF
    pdf.save(`factory-layout-${Date.now()}.pdf`);
    
    toast.dismiss();
    toast.success("Report generated successfully!");
  } catch (error) {
    console.error("Error generating report:", error);
    toast.dismiss();
    toast.error("Failed to generate report");
  }
};
