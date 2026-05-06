import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export const metadata = { title: "User Management" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
