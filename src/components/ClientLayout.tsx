"use client";

import React, { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIAssistantModal from "@/components/AIAssistantModal";
import BookingModal from "@/components/BookingModal";
import { ServiceData } from "@/lib/types";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [bookingService, setBookingService] = useState<ServiceData | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const pathname = usePathname();

  // Certain dashboard subpages can hide the public footer for full-screen dashboards if desired
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/admin");

  const handleSelectServiceForBooking = (service: ServiceData) => {
    setBookingService(service);
    setBookingModalOpen(true);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50/50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300">
          <Navbar onOpenAI={() => setAiModalOpen(true)} />

          <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>

        {!isDashboard && <Footer />}

        {/* Global AI Assistant Modal */}
        <AIAssistantModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          onSelectService={handleSelectServiceForBooking}
        />

        {/* Global Booking Modal */}
        <BookingModal
          service={bookingService}
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setBookingService(null);
          }}
        />
      </div>
    </AuthProvider>
  </ThemeProvider>
);
}
