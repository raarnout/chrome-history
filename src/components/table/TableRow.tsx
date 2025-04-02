interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
}

interface TableRowProps {
  item: HistoryItem;
  formatTimestamp: (timestamp: number) => string;
}

export default function TableRow({ item, formatTimestamp }: TableRowProps) {
  return (
    <tr className="border-t hover:bg-gray-50">
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
        {formatTimestamp(item.last_visit_time)}
      </td>
    </tr>
  );
} 