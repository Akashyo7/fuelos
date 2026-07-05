import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FuelOS",
  description: "Hit your protein. Every day.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center">
        <div className="w-full max-w-sm min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
