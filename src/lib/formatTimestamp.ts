export function formatChromeTimestamp(
  timestamp: number | null | undefined
): string {
  if (!timestamp || timestamp <= 0) {
    console.warn(`⚠️ Unknown timestamp detected:`, timestamp);
    return 'Unknown';
  }

  const epochStart = new Date(1601, 0, 1).getTime();
  const timestampMs = timestamp / 1000;
  const date = new Date(epochStart + timestampMs);

  if (isNaN(date.getTime())) {
    console.warn(`⚠️ Invalid timestamp conversion detected:`, timestamp);
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('nl-NL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
