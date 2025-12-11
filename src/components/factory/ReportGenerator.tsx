import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlacedMachine } from "@/types/machine";
import { toast } from "sonner";
import { parsePhoneNumberFromString } from "libphonenumber-js";


interface UserInfo {
  name: string;
  company: string;
  phone: string;
  email: string;
}

export const generateReport = async (
  canvasElement: HTMLCanvasElement,
  placedMachines: PlacedMachine[],
  layoutDimensions: { width: number; height: number },
  globalAccessories: any[],
  globalSoftwares: any[],
  userInfo: UserInfo, // ✅ Use as object
) => {
  try {
    toast.loading("Generating professional report...");

    // === Screenshot of layout ===
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: "#ffffff",
      scale: 2,
    });

const formatPhoneForPDF = (phone: string) => {
  if (!phone) return "";

  let fixedPhone = phone;

  // If no + prefix, auto-add
  if (!fixedPhone.startsWith("+")) {
    // If 10 digits → assume India
    if (/^\d{10}$/.test(fixedPhone)) {
      fixedPhone = "+91" + fixedPhone;
    } else {
      // fallback: just add +
      fixedPhone = "+" + fixedPhone;
    }
  }

  const parsed = parsePhoneNumberFromString(fixedPhone);
  if (!parsed) return phone;

  return `${parsed.country} (+${parsed.countryCallingCode}) ${parsed.nationalNumber}`;
};



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

// === USER DETAILS ===
pdf.setTextColor(...primaryColor);
pdf.setFontSize(12);
pdf.setFont("helvetica", "bold");
pdf.text("CUSTOMER DETAILS", 10, y);
pdf.setLineWidth(0.5);
pdf.setDrawColor(...accentColor);
pdf.line(10, y + 2, 200, y + 2);
y += 8;

pdf.setFont("helvetica", "normal");
pdf.setFontSize(10);
pdf.setTextColor(...textGray);

pdf.text(`Name: ${userInfo.name}`, 10, y);
y += 5;
pdf.text(`Company: ${userInfo.company}`, 10, y);
y += 5;
pdf.text(`Email: ${userInfo.email}`, 10, y);
y += 5;
if (userInfo.phone) {
  const formattedPhone = formatPhoneForPDF(userInfo.phone);
  pdf.text(`Phone: ${formattedPhone}`, 10, y);
  y += 5;
}


// Add some spacing before the next section
y += 5;

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
// CAPEX / OPEX
const totalMachineCapex = placedMachines.reduce((s, m) => s + (m.price_capex ?? 0), 0);
const totalMachineOpex = placedMachines.reduce((s, m) => s + (m.price_opex ?? 0), 0);
const totalOptionals = placedMachines.reduce((s, m) => s + (m.optionalsCost ?? 0), 0);

// ACCESSORIES & SOFTWARE (supporting qty)
const totalAccessories = globalAccessories.reduce(
  (s, a) => s + (a.price * (a.qty ?? 1)),
  0
);

const totalSoftwares = globalSoftwares.reduce(
  (s, sw) => s + (sw.price * (sw.qty ?? 1)),
  0
);

// === TOTAL MACHINE AREA ===
// Area = (length_mm / 1000) * (width_mm / 1000)
const totalMachineArea = placedMachines.reduce((s, m) => {
  const L = (m.length_mm ?? 0) / 1000;
  const W = (m.width_mm ?? 0) / 1000;
  return s + (L * W);
}, 0);

// === ROI (Years) ===
const roiPeriodYears =
  placedMachines.length > 0
    ? Math.round(
        (placedMachines.reduce((sum, m) => sum + (m.roi_breakeven ?? 0), 0) /
          (placedMachines.length + 300)) *
          10
      ) / 10
    : 0;



// === GRAND TOTAL ===
const grandTotalCost =
  totalMachineCapex + totalMachineOpex + totalOptionals + totalAccessories + totalSoftwares;



// === SUMMARY TABLE ===
const summaryData = [
  [
    "Total Machines",
    `${placedMachines.length}`,
    "Floor Area",
    `${layoutDimensions.width}m x ${layoutDimensions.height}m (${layoutDimensions.width * layoutDimensions.height} m²)`
  ],
    [
    "Total Machine Area",
    `${totalMachineArea.toFixed(2)} m²`,
    "Estimated ROI Period",
    `${roiPeriodYears} Years`
  ],
  [
    "Total CapEx",
    `Rs.${totalMachineCapex.toLocaleString()}`,
    "Est. OpEx (Annual)",
    `Rs.${totalMachineOpex.toLocaleString()}`
  ],

  [
    "Total Optionals Cost",
    `Rs. ${totalOptionals.toLocaleString()}`,
    "Accessories Cost",
    `Rs. ${totalAccessories.toLocaleString()}`
  ],
  [
    "Software Cost",
    `Rs. ${totalSoftwares.toLocaleString()}`,
    "GRAND TOTAL",
    `Rs. ${grandTotalCost.toLocaleString()}`
  ]
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
// === EQUIPMENT SCHEDULE ===
// === EQUIPMENT SCHEDULE ===
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

// Table rows
const equipmentRows: any[] = [];
let serial = 1;

// Helper function for total calculation per row
const calcTotal = (price: number, qty: number) => price * qty;

placedMachines.forEach((m) => {
  const machinePrice = m.price_capex ?? 0;
  const quantity = 1;

  // Main machine row
  equipmentRows.push([
    serial++,
    m.machine_name || "Unknown Machine",
    m.type || "-",
    `${m.length_mm || 0} x ${m.width_mm || 0}`,
    quantity,
    `Rs. ${machinePrice.toLocaleString()}`,             // Unit Price
    `Rs. ${calcTotal(machinePrice, quantity).toLocaleString()}` // Total Price
  ]);

  // Optional items
  (m.selectedOptionals ?? []).forEach((opt) => {
    const optQty = 1;
    const optPrice = opt.price ?? 0;

    equipmentRows.push([
      "",
      "Optional",
      opt.optional_name,
      "",
      optQty,
      `Rs. ${optPrice.toLocaleString()}`,
      `Rs. ${calcTotal(optPrice, optQty).toLocaleString()}`
    ]);
  });
});

// Accessories
globalAccessories.forEach((acc) => {
  const accQty = acc.qty ?? 1;
  const accPrice = acc.price ?? 0;
  equipmentRows.push([
    serial++,
    "Accessory",
    acc.accessory_name,
    "-",
    accQty,
    `Rs. ${accPrice.toLocaleString()}`,
    `Rs. ${calcTotal(accPrice, accQty).toLocaleString()}`
  ]);
});

// Software
globalSoftwares.forEach((sw) => {
  const swQty = sw.qty ?? 1;
  const swPrice = sw.price ?? 0;
  equipmentRows.push([
    serial++,
    "Software",
    sw.software_name,
    "",
    swQty,
    `Rs. ${swPrice.toLocaleString()}`,
    `Rs. ${calcTotal(swPrice, swQty).toLocaleString()}`
  ]);
});

// Divider row
equipmentRows.push(["", "", "", "", "", "", ""]);

// GRAND TOTAL row (from previously calculated grandTotalCost)
equipmentRows.push([
  "",
  "",
  "",
  "",
  "",
  "GRAND TOTAL",
  `Rs. ${grandTotalCost.toLocaleString()}`
]);

// Render table
autoTable(pdf, {
  startY: y,
  head: [["S.No", "Item", "Name", "Dims", "Qty", "Unit Price", "Total Price"]],
  body: equipmentRows,
  theme: "striped",
  headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold" },
  styles: { fontSize: 9, cellPadding: 3 },
  alternateRowStyles: { fillColor: [245, 247, 250] },
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
