"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, Clock, MapPin, CreditCard, Banknote, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { ServiceData } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

interface BookingModalProps {
  service: ServiceData | null;
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
  "06:30 PM",
];

export default function BookingModal({ service, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Tomorrow as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = new Date().toISOString().split("T")[0];
  const defaultDate = tomorrow.toISOString().split("T")[0];

  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("10:30 AM");
  const [address, setAddress] = useState(user?.location ? `${user.location}, House #` : "");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "CASH">("STRIPE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);
  const [aiSummarizing, setAiSummarizing] = useState(false);

  if (!isOpen || !service) return null;

  const handleAiSummarize = async () => {
    if (!notes.trim()) return;
    setAiSummarizing(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setNotes(data.summary);
      }
    } catch {}
    setAiSummarizing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push(`/login?redirect=/services/${service.slug || service.id}`);
      return;
    }

    if (!address.trim()) {
      setError("Please provide your complete service address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          date,
          startTime,
          address: address.trim(),
          notes: notes.trim(),
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Booking could not be scheduled.");
        setLoading(false);
        return;
      }

      setSuccessBookingId(data.data.id);
    } catch (err) {
      setError("Network error while placing booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Book Appointment</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{service.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {successBookingId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Booking Confirmed!</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your appointment with <span className="font-semibold">{service.provider?.user?.name}</span> has been created. The provider has been notified.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl text-xs text-left space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-semibold text-slate-800">{date} at {startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Fee:</span>
                <span className="font-semibold text-emerald-600">PKR {service.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-semibold text-slate-800">
                  {paymentMethod === "STRIPE" ? "Paid via Stripe Sandbox" : "Cash on Delivery"}
                </span>
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  onClose();
                  router.push(`/dashboard/bookings`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
              >
                View in Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Provider brief */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    service.provider?.user?.avatar ||
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                  }
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900">{service.provider?.user?.name}</div>
                  <div className="text-[11px] text-emerald-700">{service.provider?.profession}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Total Price</div>
                <div className="text-sm font-bold text-emerald-700">PKR {service.price.toLocaleString()}</div>
              </div>
            </div>

            {/* Date selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Select Date
              </label>
              <input
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Start Time Slot selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Select Preferred Time Slot
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setStartTime(slot)}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      startTime === slot
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Complete Service Address
              </label>
              <input
                type="text"
                placeholder="e.g. House 42, Street 7, Block 5 Clifton, Karachi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Instructions / Notes with AI assist */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Instructions / Job Details (Optional)
                </label>
                {notes.length > 20 && (
                  <button
                    type="button"
                    onClick={handleAiSummarize}
                    disabled={aiSummarizing}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {aiSummarizing ? "Structuring..." : "AI Format Checklist"}
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                placeholder="Describe your issue or any specific requirements (e.g. 1.5 ton Inverter AC, leaking water, bring ladder)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("STRIPE")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                    paymentMethod === "STRIPE"
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 font-semibold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs">Stripe Sandbox (Card)</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Instant & Safe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                    paymentMethod === "CASH"
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 font-semibold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Banknote className="w-5 h-5 text-slate-700" />
                  <span className="text-xs">Cash on Completion</span>
                  <span className="text-[10px] text-slate-500 font-normal">Pay technician directly</span>
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Scheduling Appointment..." : `Confirm & Book for PKR ${service.price.toLocaleString()}`}
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Free cancellation up to 4 hours before service time.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
