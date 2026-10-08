import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "KaamHub — Find Trusted Local Services. Book with Confidence.",
  description:
    "Pakistan's premier AI-powered local services marketplace. Discover verified electricians, plumbers, AC repair specialists, home cleaners, photographers, tutors, and more across Karachi, Lahore, and Islamabad.",
  keywords: [
    "KaamHub",
    "Pakistan services",
    "AC repair Karachi",
    "electrician Lahore",
    "deep cleaning Islamabad",
    "home services",
    "local marketplace",
  ],
  openGraph: {
    title: "KaamHub — Trusted Local Services Marketplace",
    description: "Book verified local service professionals with confidence across Pakistan.",
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="antialiased font-sans bg-slate-50 text-slate-900">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
