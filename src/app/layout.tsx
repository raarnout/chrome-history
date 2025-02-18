import type { Metadata } from "next";
import "@/styles/globals.css"; // Ensure you create this file for global styles

export const metadata: Metadata = {
  title: "Chrome History Viewer",
  description: "View and analyze your Chrome browsing history",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <header className="w-full bg-blue-600 text-white py-4 text-center text-lg font-semibold">
          Chrome History Viewer
        </header>
        <main className="flex-1 container mx-auto p-6">{children}</main>
        <footer className="w-full bg-gray-800 text-white py-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Chrome History Viewer
        </footer>
      </body>
    </html>
  );
}
