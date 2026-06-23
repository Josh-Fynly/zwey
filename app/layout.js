import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Zwey",
  description: "Social hub for upcoming artists",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">

        {/* GLOBAL NAV */}
        <header className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">

            <Link href="/" className="font-bold text-xl">
              Zwey
            </Link>

            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/explore" className="hover:text-blue-600">
                Explore
              </Link>

              <Link href="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
            </nav>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
          }
