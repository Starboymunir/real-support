import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - RS CAB",
  description:
    "Get in touch with RS CAB. Contact us for bookings, support, partnerships, or any questions.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
