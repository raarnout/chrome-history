import HistoryTable from "@/components/HistoryTable";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Chrome History Viewer</h1>
      <HistoryTable />
    </main>
  );
}
