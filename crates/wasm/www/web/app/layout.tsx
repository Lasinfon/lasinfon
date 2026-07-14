import type { Metadata } from "next";
import "./globals.css"; // Critical: This imports our Tailwind directives and global configurations

export const metadata: Metadata = {
  title: "Lasinfon Metrology Cockpit",
  description: "Autonomous Self-Growing Propagation Dashboard v6.1.1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
