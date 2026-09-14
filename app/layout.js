import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Zwey",
  description:
    "A social hub for upcoming artists to build their identity, share music, and connect.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
