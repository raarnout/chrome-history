"use client";

import { useEffect, useState } from "react";
import { fetchHistory } from "@/lib/getHistory";

interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
}

// Function to convert Chrome WebKit timestamp to formatted "DD/MM/YYYY HH:MM:SS"
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

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-center">Chrome History</h2>

      {/* Date Picker */}
      <div className="mb-4 text-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 p-2 rounded-md"
        />
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto border border-gray-300 rounded-lg">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 bg-gray-100 border-b">
            <tr>
              <th className="border p-3 text-left w-1/3">Title</th>
              <th className="border p-3 text-left w-1/3">URL</th>
              <th className="border p-3 text-left w-1/5">Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
