export async function fetchHistory(date?: string) {
  const url = date ? `/api/history?date=${date}` : '/api/history';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }
  return response.json();
}
