interface FilterControlsProps {
  titleFilter: string;
  urlFilter: string;
  selectedDate: string;
  onTitleFilterChange: (value: string) => void;
  onUrlFilterChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

export default function FilterControls({
  titleFilter,
  urlFilter,
  selectedDate,
  onTitleFilterChange,
  onUrlFilterChange,
  onDateChange,
}: FilterControlsProps) {
  return (
    <tr>
      <th className="border p-3 text-left w-1/3">
        <input
          type="text"
          placeholder="Filter op titel..."
          value={titleFilter}
          onChange={(e) => onTitleFilterChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </th>
      <th className="border p-3 text-left w-1/3">
        <input
          type="text"
          placeholder="Filter op URL..."
          value={urlFilter}
          onChange={(e) => onUrlFilterChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </th>
      <th className="border p-3 text-left w-1/5">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </th>
    </tr>
  );
} 