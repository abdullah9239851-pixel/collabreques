import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollabRequest",
  description: "Excel-like collaborative request tracker"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
