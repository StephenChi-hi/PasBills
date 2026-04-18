import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function exportToPDF(markdownContent: string): Promise<void> {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Split content into lines and process
    const lines = markdownContent.split("\n");

    for (const line of lines) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 10) {
        pdf.addPage();
        yPosition = margin;
      }

      let fontSize = 11;
      let isBold = false;
      let textColor = [0, 0, 0] as [number, number, number];

      // Headers
      if (line.startsWith("# ")) {
        fontSize = 18;
        isBold = true;
        textColor = [79, 39, 131]; // purple
        yPosition += 5;
      } else if (line.startsWith("## ")) {
        fontSize = 14;
        isBold = true;
        textColor = [79, 39, 131];
        yPosition += 3;
      } else if (line.startsWith("### ")) {
        fontSize = 12;
        isBold = true;
        textColor = [55, 65, 81];
        yPosition += 2;
      } else if (line.startsWith("- ")) {
        fontSize = 11;
        // Just regular text for lists, we'll handle formatting in text
      }

      const text = line
        .replace(/^#+\s/, "")
        .replace(/^-\s/, "  • ")
        .replace(/\*\*/g, "");

      if (text.trim()) {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(...textColor);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");

        const wrappedText = pdf.splitTextToSize(text, maxWidth);
        const textHeight = wrappedText.length * (fontSize * 0.35);

        // Check if wrapped text fits on current page
        if (yPosition + textHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.text(wrappedText, margin, yPosition);
        yPosition += textHeight + 2;
      } else {
        yPosition += 3;
      }
    }

    // Add footer with timestamp
    const pageCount = (pdf as any).internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(160, 160, 160);
      pdf.setFontSize(8);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        margin,
        pageHeight - 5,
      );
    }

    pdf.save("financial-insights.pdf");
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    alert("Failed to export PDF. Please try again.");
  }
}
