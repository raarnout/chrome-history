export async function fetchHistory(date?: string) {
  try {
    const url = date ? `/api/history?date=${date}` : "/api/history";
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json(); // Get detailed error message
      throw new Error(`API Error: ${errorData.error || "Unknown error"}`);
    }

    return response.json();
  } catch (error) {
    console.error("fetchHistory failed:", error);
    throw error; 
  }
}

