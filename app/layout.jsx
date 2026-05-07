import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "../components/ErrorBoundary";
import "./globals.css";

export const metadata = { title: "User Management" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: "rgba(20,20,35,0.95)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" } }} />
      </body>
    </html>
  );
}
