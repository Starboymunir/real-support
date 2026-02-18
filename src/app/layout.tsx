import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RS CAB - Local Taxi Service You Can Trust",
  description: "RS CAB - Rides in seconds with service. Background-checked drivers, real-time tracking, and secure payments. Book airport transfers, city rides, and business transport.",
  icons: {
    icon: "/images/brand/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-light text-text-primary font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
