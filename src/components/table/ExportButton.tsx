import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
}

interface ExportButtonProps {
  filteredHistory: HistoryItem[];
  formatTimestamp: (timestamp: number) => string;
}

export default function ExportButton({ filteredHistory, formatTimestamp }: ExportButtonProps) {
  function downloadPDF() {
    const doc = new jsPDF();
  
    doc.setFontSize(16);
    doc.text("Filtered Chrome History", 14, 18);
  
    autoTable(doc, {
      startY: 24,
      head: [["Title", "URL", "Date & Time"]],
      body: filteredHistory.map((item) => [
        item.title || "No title",
        item.url,
        formatTimestamp(item.last_visit_time),
      ]),
      styles: {
        cellWidth: 'wrap',
      },
      headStyles: {
        fillColor: [52, 152, 219],
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40 },
      },
    });
  
    doc.save("chrome-history.pdf");
  }

  return (
    <div className="mb-4 text-right px-2">
      <button
        onClick={downloadPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        Download PDF
      </button>
    </div>
  );
} 