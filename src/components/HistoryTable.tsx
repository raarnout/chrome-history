"use client"; // ✅ Zorgt ervoor dat deze component alleen client-side wordt gerenderd

import { useEffect, useState } from "react";
import { fetchHistory } from "@/lib/getHistory";
import { formatChromeTimestamp } from "@/lib/formatTimestamp";
import FilterControls from "./table/FilterControls";
import TableHeader from "./table/TableHeader";
import TableBody from "./table/TableBody";
import ExportButton from "./table/ExportButton";

interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
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

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-center">Chrome History</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <ExportButton
        filteredHistory={filteredHistory}
        formatTimestamp={formatChromeTimestamp}
      />

      {/* Scrollbare tabelcontainer */}
      <div className="flex-1 overflow-auto border border-gray-300 rounded-lg">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 bg-gray-100 border-b">
            <FilterControls
              titleFilter={titleFilter}
              urlFilter={urlFilter}
              selectedDate={selectedDate}
              onTitleFilterChange={setTitleFilter}
              onUrlFilterChange={setUrlFilter}
              onDateChange={setSelectedDate}
            />
            <TableHeader />
          </thead>
          <TableBody
            filteredHistory={filteredHistory}
            formatTimestamp={formatChromeTimestamp}
          />
        </table>
      </div>
    </div>
  );
}
