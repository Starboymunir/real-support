import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const dynamic = 'force-dynamic'


export const metadata: Metadata = {
  title: "RS CAB - Local Taxi Service You Can Trust",
  description: "RS CAB - Rides in seconds with service. Background-checked drivers, real-time tracking, and secure payments. Book airport transfers, city rides, and business transport.",
  manifest: "/manifest.webmanifest",
  applicationName: "RS Ride",
  icons: {
    icon: "/images/brand/logo.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#0a2540",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-light text-text-primary font-sans overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
