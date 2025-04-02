"use client"; // ✅ Zorgt ervoor dat deze component alleen client-side wordt gerenderd

import { useEffect, useState, useMemo } from "react";
import { fetchHistory } from "@/lib/getHistory";
import { formatChromeTimestamp } from "@/lib/formatTimestamp";
import FilterControls from "./table/FilterControls";
import TableHeader from "./table/TableHeader";
import TableBody from "./table/TableBody";
import ExportButton from "./table/ExportButton";
import LoadingState from "./table/LoadingState";

interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
}

const ITEMS_PER_PAGE = 50;

export default function HistoryTable() {
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [urlFilter, setUrlFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchHistory(selectedDate);
        setHistory(data);
        setCurrentPage(1); // Reset pagina bij nieuwe data
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to load history.");
      }
    }
    loadHistory();
  }, [selectedDate]);

  // Memoize filtered history to prevent unnecessary recalculations
  const filteredHistory = useMemo(() => {
    if (!history) return [];
    return history.filter(
      (item) =>
        item.title.toLowerCase().includes(titleFilter.toLowerCase()) &&
        item.url.toLowerCase().includes(urlFilter.toLowerCase())
    );
  }, [history, titleFilter, urlFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (history === null) {
    return <LoadingState />;
  }

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col">
      {error && <p className="text-red-500 text-center">{error}</p>}

      <ExportButton
        filteredHistory={filteredHistory}
        formatTimestamp={formatChromeTimestamp}
      />

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
            filteredHistory={paginatedHistory}
            formatTimestamp={formatChromeTimestamp}
          />
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Vorige
          </button>
          <span className="text-gray-600">
            Pagina {currentPage} van {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Volgende
          </button>
        </div>
      )}
    </div>
  );
}
