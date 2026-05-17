import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - One App",
  description:
    "Get in touch with One App. Contact us for bookings, support, partnerships, or any questions.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
