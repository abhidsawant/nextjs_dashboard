if (!process.env.NEXT_PUBLIC_API_URL) {
  if (process.env.NODE_ENV === "development") {
    console.warn("Warning: NEXT_PUBLIC_API_URL is not set, falling back to http://localhost:7000");
  }
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";
