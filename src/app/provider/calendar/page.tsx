"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProviderCalendarPage() {
  const [schedule, setSchedule] = useState([
    { day: "Monday", slots: "09:00 AM - 07:00 PM", active: true },
    { day: "Tuesday", slots: "09:00 AM - 07:00 PM", active: true },
    { day: "Wednesday", slots: "09:00 AM - 07:00 PM", active: true },
    { day: "Thursday", slots: "09:00 AM - 07:00 PM", active: true },
    { day: "Friday", slots: "09:00 AM - 07:00 PM", active: true },
    { day: "Saturday", slots: "09:00 AM - 05:00 PM", active: true },
    { day: "Sunday", slots: "Closed", active: false },
  ]);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="PROVIDER" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Availability & Calendar</h1>
            <p className="text-xs text-slate-500 mt-1">
              Set your operating hours and manage booking slots for customers across your service areas.
            </p>
          </div>
        </div>

        {/* Schedule grid */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Weekly Operating Hours</span>
          </h3>

          <div className="space-y-3 divide-y divide-slate-100">
            {schedule.map((item, idx) => (
              <div key={item.day} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      item.active ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-800 w-28">{item.day}</span>
                </div>

                <div className="text-xs text-slate-600 font-medium">{item.slots}</div>

                <button
                  type="button"
                  onClick={() => {
                    const newSched = [...schedule];
                    newSched[idx].active = !newSched[idx].active;
                    setSchedule(newSched);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    item.active
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {item.active ? "Available" : "Off"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
