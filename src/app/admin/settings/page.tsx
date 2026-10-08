"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Settings, Save, ShieldCheck, CheckCircle2, Globe, DollarSign, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  const [platformFee, setPlatformFee] = useState("10");
  const [supportPhone, setSupportPhone] = useState("+92 300 1122334");
  const [supportEmail, setSupportEmail] = useState("support@kaamhub.pk");
  const [autoVerifyPros, setAutoVerifyPros] = useState(false);
  const [karachiActive, setKarachiActive] = useState(true);
  const [lahoreActive, setLahoreActive] = useState(true);
  const [isbActive, setIsbActive] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Platform Master Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global marketplace commission parameters, operational cities, and administrative controls.
          </p>
        </div>

        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Platform configurations updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Revenue & Commission */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Commission & Take Rate</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Platform Commission Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Deducted automatically from total completed booking value.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Customer Support Hotline
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Operational Cities */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Active Operating Hubs</h2>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-900">Karachi Metropolitan</p>
                  <p className="text-[11px] text-slate-500">Clifton, DHA, Gulshan, Nazimabad, PECHS</p>
                </div>
                <input
                  type="checkbox"
                  checked={karachiActive}
                  onChange={(e) => setKarachiActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-900">Lahore</p>
                  <p className="text-[11px] text-slate-500">Gulberg, DHA, Model Town, Johar Town, Bahria</p>
                </div>
                <input
                  type="checkbox"
                  checked={lahoreActive}
                  onChange={(e) => setLahoreActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-900">Islamabad & Rawalpindi (Twin Cities)</p>
                  <p className="text-[11px] text-slate-500">F-6 to F-11, G-Sectors, Bahria Town, Saddar</p>
                </div>
                <input
                  type="checkbox"
                  checked={isbActive}
                  onChange={(e) => setIsbActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Master Settings
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
