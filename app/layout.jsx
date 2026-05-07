import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = { title: "User Management" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
