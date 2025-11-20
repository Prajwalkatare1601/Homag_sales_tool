import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
    const primaryColor: [number, number, number] = [0, 51, 102]; // Deep Navy
    const accentColor: [number, number, number] = [0, 102, 204]; // Homag Blue
    const textGray: [number, number, number] = [60, 60, 60];

    // === HEADER ===
    // Blue strip
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 25, "F");

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("FACTORY LAYOUT PROPOSAL", 10, 16);

    // Subtitle / Date
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 200, 16, { align: "right" });

    let y = 35;

    // === PROJECT SUMMARY ===
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("PROJECT SUMMARY", 10, y);

    // Line under title
    pdf.setDrawColor(...accentColor);
    pdf.setLineWidth(0.5);
    pdf.line(10, y + 2, 200, y + 2);

    y += 10;

    // Summary Grid
    const summaryData = [
      ["Total Machines", `${placedMachines.length}`, "Floor Area", `${layoutDimensions.width}m x ${layoutDimensions.height}m (${layoutDimensions.width * layoutDimensions.height} m²)`],
      ["Total CapEx", `₹ ${(placedMachines.reduce((s, m) => s + (m.price_capex ?? 0), 0) / 10000000).toFixed(2)} Cr`, "Est. OpEx (Annual)", `₹ ${(placedMachines.reduce((s, m) => s + (m.price_opex ?? 0), 0) / 10000000).toFixed(2)} Cr`],
      ["Total Power Load", `${placedMachines.reduce((s, m) => s + (m.connected_load_kw ?? 0), 0).toFixed(1)} kW`, "Air Consumption", `${placedMachines.reduce((s, m) => s + (m.air_consumption_m3hr ?? 0), 0).toFixed(1)} m³/hr`]
    ];

    autoTable(pdf, {
      startY: y,
      head: [],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, lineColor: [200, 200, 200] },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [245, 247, 250], textColor: textGray, cellWidth: 40 },
        1: { textColor: [0, 0, 0], cellWidth: 55 },
        2: { fontStyle: 'bold', fillColor: [245, 247, 250], textColor: textGray, cellWidth: 40 },
        3: { textColor: [0, 0, 0], cellWidth: 55 }
      }
    });

    y = (pdf as any).lastAutoTable.finalY + 15;

    // === LAYOUT VISUALIZATION ===
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("LAYOUT VISUALIZATION", 10, y);
    pdf.line(10, y + 2, 200, y + 2);
    y += 10;

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Limit height if too tall
    const maxImgHeight = 100;
    const finalImgHeight = Math.min(imgHeight, maxImgHeight);

    pdf.addImage(imgData, "PNG", 10, y, imgWidth, finalImgHeight);
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(10, y, imgWidth, finalImgHeight); // Border around image

    y += finalImgHeight + 15;

    // === EQUIPMENT LIST ===
    // Check if we need a new page
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }

    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("EQUIPMENT SCHEDULE", 10, y);
    pdf.line(10, y + 2, 200, y + 2);
    y += 10;

    const machineData = placedMachines.map((m, i) => [
      i + 1,
      m.machine_name || "Unknown Machine",
      m.type || "-",
      `${m.length_mm || 0} x ${m.width_mm || 0}`,
      m.connected_load_kw || "0",
      m.air_consumption_m3hr || "0"
    ]);

    autoTable(pdf, {
      startY: y,
      head: [["#", "Machine Name", "Type", "Dims (mm)", "Power (kW)", "Air (m³/hr)"]],
      body: machineData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    // === FOOTER ===
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text("Confidential - Homag India Pvt. Ltd.", 10, 290);
      pdf.text(`Page ${i} of ${pageCount}`, 200, 290, { align: "right" });
    }

    // === SAVE ===
    pdf.save(`Homag_Layout_Proposal_${Date.now()}.pdf`);
    toast.dismiss();
    toast.success("Report generated successfully!");
  } catch (error) {
    console.error("Error generating report:", error);
    toast.dismiss();
    toast.error("Failed to generate report");
  }
};
