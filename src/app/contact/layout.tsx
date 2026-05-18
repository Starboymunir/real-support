import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - RS Ride - One App",
  description:
    "Get in touch with RS Ride. Contact us for bookings, support, partnerships, or any questions.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
