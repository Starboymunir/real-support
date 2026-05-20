import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import NotificationPermissionPrompt from "@/components/NotificationPermissionPrompt";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const dynamic = 'force-dynamic'


export const metadata: Metadata = {
  title: "RS Ride - Fast & Reliable Taxi Service",
  description: "RS Ride - Rides in seconds with service. Background-checked drivers, real-time tracking, and secure payments. Book airport transfers, city rides, and business transport.",
  manifest: "/manifest.webmanifest",
  applicationName: "RS Ride - Fast & Reliable Taxi Service",
  icons: {
    icon: "/icons/logo192.png",
    apple: "/icons/logo192.png",
  },
};

export const viewport = {
  themeColor: "#0a2540",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
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
        <ServiceWorkerRegistrar />
        <PWAInstallPrompt />
        <NotificationPermissionPrompt />
      </body>
    </html>
  );
}
