"use client"; // ✅ Zorgt ervoor dat deze component alleen client-side wordt gerenderd

import { useEffect, useState } from "react";
import { fetchHistory } from "@/lib/getHistory";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
}

// Functie om de Chrome WebKit timestamp om te zetten naar "DD/MM/YYYY HH:MM:SS"
function formatChromeTimestamp(timestamp: number | null | undefined): string {
  if (!timestamp || timestamp <= 0) {
    console.warn(`⚠️ Unknown timestamp detected:`, timestamp);
    return "Unknown";
  }

  const epochStart = new Date(1601, 0, 1).getTime();
  const timestampMs = timestamp / 1000;
  const date = new Date(epochStart + timestampMs);

  if (isNaN(date.getTime())) {
    console.warn(`⚠️ Invalid timestamp conversion detected:`, timestamp);
    return "Unknown";
  }

  // ✅ Los hydration issues op door datum consistent te formatteren
  return new Intl.DateTimeFormat("nl-NL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export default function HistoryTable() {
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [urlFilter, setUrlFilter] = useState<string>("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchHistory(selectedDate);
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to load history.");
      }
    }
    loadHistory();
  }, [selectedDate]);

  // ✅ Zorgt ervoor dat er pas iets gerenderd wordt als de data beschikbaar is
  if (history === null) {
    return <p className="text-center text-gray-500">Loading history...</p>;
  }

  // ✅ Filteren op titel en URL (case-insensitive)
  const filteredHistory = history.filter(
    (item) =>
      item.title.toLowerCase().includes(titleFilter.toLowerCase()) &&
      item.url.toLowerCase().includes(urlFilter.toLowerCase())
  );

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
        formatChromeTimestamp(item.last_visit_time),
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
    <div className="w-full h-[calc(100vh-100px)] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-center">Chrome History</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="mb-4 text-right px-2">
  <button
    onClick={downloadPDF}
    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
  >
    Download PDF
  </button>
</div>

      {/* Scrollbare tabelcontainer */}
      <div className="flex-1 overflow-auto border border-gray-300 rounded-lg">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 bg-gray-100 border-b">
            <tr>
              <th className="border p-3 text-left w-1/3">
                <input
                  type="text"
                  placeholder="Filter op titel..."
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </th>
              <th className="border p-3 text-left w-1/3">
                <input
                  type="text"
                  placeholder="Filter op URL..."
                  value={urlFilter}
                  onChange={(e) => setUrlFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </th>
              <th className="border p-3 text-left w-1/5">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </th>
            </tr>
            <tr>
              <th className="border p-3 text-left">Title</th>
              <th className="border p-3 text-left">URL</th>
              <th className="border p-3 text-left">Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="border p-3 w-1/3 whitespace-normal break-words">
                    {item.title || "No title"}
                  </td>
                  <td className="border p-3 w-1/3 whitespace-normal break-words">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {item.url}
                    </a>
                  </td>
                  <td className="border p-3 w-1/5 whitespace-nowrap">
                    {formatChromeTimestamp(item.last_visit_time)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-3 text-center text-gray-500">
                  Geen resultaten gevonden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
