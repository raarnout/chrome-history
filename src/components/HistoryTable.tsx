"use client";

import { useEffect, useState } from "react";
import { fetchHistory } from "@/lib/getHistory";

interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
}

// Function to convert Chrome WebKit timestamp to readable format
function formatChromeTimestamp(timestamp: number): string {
  if (!timestamp) return "Unknown";
  const epochStart = new Date(1601, 0, 1).getTime();
  const timestampMs = timestamp / 1000; // Convert microseconds to milliseconds
  return new Date(epochStart + timestampMs).toLocaleString();
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
        console.error("Error fetching history:", err); // ✅ Logs the error
        setError("Failed to load history.");
      }
    }
    loadHistory();
  }, [selectedDate]);  

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Chrome History
      </h2>

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
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-100 border-b">
            <tr>
              <th className="border p-3 text-left">Title</th>
              <th className="border p-3 text-left">URL</th>
              <th className="border p-3 text-left">Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="border p-3 truncate max-w-[300px]">
                  {item.title || "No title"}
                </td>
                <td className="border p-3 truncate max-w-[400px]">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {item.url}
                  </a>
                </td>
                <td className="border p-3 whitespace-nowrap">
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
