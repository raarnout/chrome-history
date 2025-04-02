import TableRow from "./TableRow";

interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
}

interface TableBodyProps {
  filteredHistory: HistoryItem[];
  formatTimestamp: (timestamp: number) => string;
}

export default function TableBody({ filteredHistory, formatTimestamp }: TableBodyProps) {
  return (
    <tbody>
      {filteredHistory.length > 0 ? (
        filteredHistory.map((item, index) => (
          <TableRow
            key={index}
            item={item}
            formatTimestamp={formatTimestamp}
          />
        ))
      ) : (
        <tr>
          <td colSpan={3} className="p-3 text-center text-gray-500">
            Geen resultaten gevonden.
          </td>
        </tr>
      )}
    </tbody>
  );
} 