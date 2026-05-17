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
  title: "One App - Local Taxi Service You Can Trust",
  description: "One App - Rides in seconds with service. Background-checked drivers, real-time tracking, and secure payments. Book airport transfers, city rides, and business transport.",
  manifest: "/manifest.webmanifest",
  applicationName: "One App",
  icons: {
    icon: "/images/brand/logo.png",
    apple: "/icons/icon-192.png",
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
