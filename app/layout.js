import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Zwey",
  description: "Social hub for upcoming artists",
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
