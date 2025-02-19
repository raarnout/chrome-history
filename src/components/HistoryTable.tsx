"use client";

import { useEffect, useState } from "react";
import { fetchHistory } from "@/lib/getHistory";

interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
}

// Functie om de Chrome WebKit timestamp om te zetten naar "DD/MM/YYYY HH:MM:SS"
function formatChromeTimestamp(timestamp: number | null | undefined): string {
  if (!timestamp || timestamp <= 0) {
    console.warn(`Unknown timestamp detected:`, timestamp);
    return "Unknown";
  }

  const epochStart = new Date(1601, 0, 1).getTime();
  const timestampMs = timestamp / 1000;
  const date = new Date(epochStart + timestampMs);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid timestamp conversion detected:`, timestamp);
    return "Unknown";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export default function HistoryTable() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
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

  // Filteren op titel en URL (case-insensitive)
  const filteredHistory = history.filter(
    (item) =>
      item.title.toLowerCase().includes(titleFilter.toLowerCase()) &&
      item.url.toLowerCase().includes(urlFilter.toLowerCase())
  );

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-center">Chrome History</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

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
