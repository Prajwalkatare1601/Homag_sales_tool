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
    toast.loading("Generating professional report...");

    // === Screenshot of layout ===
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: "#ffffff",
      scale: 2,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // === COLORS ===
    const primaryColor: [number, number, number] = [0, 25, 66]; // dark navy
    const accentColor: [number, number, number] = [37, 99, 235]; // Homag blue
    const cardBg: [number, number, number] = [247, 248, 250];
    const textGray: [number, number, number] = [60, 60, 60];

// === HEADER ===
pdf.setFillColor(...primaryColor);
pdf.rect(0, 0, 210, 20, "F");

// Add Homag logo (make sure you have a logo file accessible via public path or import)
const logoImg = "/homag_logo.jpg"; // or use imported base64 if bundling in build

// Left: Logo
pdf.addImage(logoImg, "JPEG", 10, 4, 22, 12);

// Center: Title
pdf.setTextColor(255, 255, 255);
pdf.setFontSize(14);
pdf.text("Factory Layout Planner", 105, 8, { align: "center" });
pdf.setFontSize(9);
pdf.text("Smart Planning & Productivity Simulation by Homag India", 105, 13, {
  align: "center",
});

// Right: Date
pdf.setFontSize(8);
pdf.text(`Date: ${new Date().toLocaleDateString()}`, 200, 8, { align: "right" });


    // === CANVAS SNAPSHOT ===
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 170;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgY = 25;

    // Add border first
pdf.setDrawColor(100, 100, 100); // darker grey border
pdf.setLineWidth(1.2); // increase thickness (default ~0.2)
pdf.roundedRect(20, imgY - 2, imgWidth + 2, Math.min(imgHeight, 75) + 4, 3, 3);


    // Add layout image
    pdf.addImage(imgData, "PNG", 21, imgY, imgWidth, Math.min(imgHeight, 75));

    let y = imgY + Math.min(imgHeight, 75) + 8;

    // === METRICS CALCULATIONS ===
    const numMachines = placedMachines.length;
    const totalProductivity = placedMachines.reduce((s, m) => s + m.productivity, 0);
    const totalOperators = placedMachines.reduce((s, m) => s + m.machineOperator, 0);
    const totalConnectedLoad = placedMachines.reduce((s, m) => s + m.connectedLoad, 0);
    const totalAirConsumption = placedMachines.reduce((s, m) => s + m.airConsumption, 0);
    const totalCapex = placedMachines.reduce((s, m) => s + m.capex, 0);
    const avgROI =
      placedMachines.length > 0
        ? placedMachines.reduce((sum, m) => sum-16 + m.ROI, 0) / placedMachines.length
        : 0;

    const estimatedOpex = totalCapex * 0.15;
    const glueConsumption = numMachines * 40;
    const bandConsumption = numMachines * 100;
    const formatCr = (n: number) => `₹ ${(n / 100).toFixed(2)} Cr`;

    // === SECTION TITLE ===
    const drawSectionTitle = (title: string) => {
      pdf.setFontSize(10);
      pdf.setTextColor(...accentColor);
      pdf.text(title, 20, y);
      y += 3;
      pdf.setDrawColor(...accentColor);
      pdf.setLineWidth(0.2);
      pdf.line(20, y, 190, y);
      y += 3;
    };

    // === CARD ROW ===
    const drawCardRow = (
      labelLeft: string,
      valueLeft: string,
      labelRight?: string,
      valueRight?: string
    ) => {
      const cardHeight = 11;
      pdf.setDrawColor(230, 230, 230);
      pdf.setFillColor(...cardBg);
      pdf.roundedRect(20, y, 80, cardHeight, 2, 2, "FD");
      pdf.roundedRect(110, y, 80, cardHeight, 2, 2, "FD");

      pdf.setFontSize(8);
      pdf.setTextColor(...textGray);
      pdf.text(labelLeft, 23, y + 4);
      pdf.setTextColor(...accentColor);
      pdf.setFontSize(9);
      pdf.text(valueLeft, 23, y + 9);

      if (labelRight && valueRight) {
        pdf.setFontSize(8);
        pdf.setTextColor(...textGray);
        pdf.text(labelRight, 113, y + 4);
        pdf.setTextColor(...accentColor);
        pdf.setFontSize(9);
        pdf.text(valueRight, 113, y + 9);
      }
      y += cardHeight + 3;
    };

    // === PRODUCTION OVERVIEW ===
    drawSectionTitle("Production Overview");
    drawCardRow("Machines Installed", `${numMachines}`, "Operators", `${totalOperators}`);
    drawCardRow("Productivity", `${totalProductivity} boards/day`);

    // === RESOURCE CONSUMPTION ===
    drawSectionTitle("Resource Consumption");
    drawCardRow("Connected Load", `${totalConnectedLoad} kW`, "Air Consumption", `${totalAirConsumption} m³/min`);
    drawCardRow("Glue Consumption", `${glueConsumption} L/day`, "Band Consumption", `${bandConsumption} m/day`);

    // === FINANCIAL SUMMARY ===
    drawSectionTitle("Financial Summary");
    drawCardRow("CapEx (Capital)", `${formatCr(totalCapex)}`, "OpEx (Annual)", `${formatCr(estimatedOpex)}`);
    drawCardRow("Total Budget", `${formatCr(totalCapex + estimatedOpex)}`, "ROI Period", `${avgROI.toFixed(1)} yrs`);

    // === LAYOUT DETAILS ===
    drawSectionTitle("Layout Dimensions");
    pdf.setFontSize(8);
    pdf.setTextColor(...textGray);
    pdf.text(`Width: ${layoutDimensions.width} m`, 20, y);
    pdf.text(`Height: ${layoutDimensions.height} m`, 80, y);
    pdf.text(`Area: ${layoutDimensions.width * layoutDimensions.height} m²`, 140, y);
    y += 7;

    // === FINANCE PARTNERS ===
    drawSectionTitle("Finance Partners");
    pdf.setFontSize(9);
    pdf.setTextColor(...accentColor);
    pdf.text("HDFC / ICICI / AXIS", 25, y);
    y += 6;

    // === FOOTER ===
    pdf.setFontSize(7);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      "© 2025 Homag India Pvt. Ltd. | Confidential Business Proposal",
      105,
      290,
      { align: "center" }
    );
    pdf.text("Page 1 of 1", 190, 290, { align: "right" });

    // === SAVE ===
    pdf.save(`Homag_Factory_Proposal_${Date.now()}.pdf`);
    toast.dismiss();
    toast.success("Professional one-page report generated!");
  } catch (error) {
    console.error("Error generating report:", error);
    toast.dismiss();
    toast.error("Failed to generate report");
  }
};
