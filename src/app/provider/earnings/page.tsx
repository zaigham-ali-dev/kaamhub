"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { DollarSign, TrendingUp, Download, ArrowUpRight, CheckCircle2, Clock, Plus, CreditCard } from "lucide-react";

export default function ProviderEarningsPage() {
  const [availableBalance, setAvailableBalance] = useState(13000);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("Meezan Bank (PK36MEZN0001020304050607)");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [earningsHistory, setEarningsHistory] = useState([
    {
      id: "trn_1",
      customer: "Fatima Ali",
      service: "AC General Chemical Service",
      date: "Oct 01, 2026",
      amount: 2500,
      status: "COMPLETED",
      method: "Online Transfer",
    },
    {
      id: "trn_2",
      customer: "Usman Tariq",
      service: "AC Gas Top-Up & Leakage Fix",
      date: "Sep 28, 2026",
      amount: 4500,
      status: "COMPLETED",
      method: "Cash on Delivery",
    },
    {
      id: "trn_3",
      customer: "Sana Mir",
      service: "Split AC Compressor Repair",
      date: "Sep 22, 2026",
      amount: 6000,
      status: "COMPLETED",
      method: "Online Transfer",
    },
  ]);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(withdrawAmount);
    if (!num || num <= 0 || num > availableBalance) return;

    setAvailableBalance((prev) => prev - num);
    const newTx = {
      id: `wth_${Date.now()}`,
      customer: "Platform Payout",
      service: `Bank Withdrawal (${payoutMethod.split(" ")[0]})`,
      date: "Just Now",
      amount: num,
      status: "PROCESSING",
      method: payoutMethod,
    };

    setEarningsHistory([newTx, ...earningsHistory]);
    setWithdrawAmount("");
    setShowWithdrawModal(false);
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 4000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="PROVIDER" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Earnings & Payouts</h1>
            <p className="text-xs text-slate-500 mt-1">
              Track completed jobs revenue, platform fee deductions, and withdrawal ledger.
            </p>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Withdraw Available Funds</span>
          </button>
        </div>

        {withdrawSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Withdrawal request submitted! Funds will be transferred to your account within 24 business hours.
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Earned (Gross)</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">PKR 48,500</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Available for Withdrawal</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                PKR {availableBalance.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Platform Fee Rate</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">0% (Beta Offer)</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Service Payouts & Transfers</h2>
            <button
              onClick={() => alert("Downloading CSV statement...")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <Download className="w-3.5 h-3.5" />
              Download Statement
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Client & Service</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earningsHistory.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{t.service}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.customer}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{t.date}</td>
                    <td className="px-6 py-4 text-slate-600">{t.method}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      PKR {t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Request Payout Withdrawal
                </h2>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Withdrawal Amount (PKR)</label>
                    <span className="text-[11px] text-slate-500">
                      Max: PKR {availableBalance.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min={500}
                    max={availableBalance}
                    placeholder="e.g. 5000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Destination Account
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="Meezan Bank (PK36MEZN0001020304050607)">
                      Meezan Bank (IBAN: ...0607)
                    </option>
                    <option value="Easypaisa (+92 300 1234567)">
                      Easypaisa (+92 300 1234567)
                    </option>
                    <option value="JazzCash (+92 300 1234567)">
                      JazzCash (+92 300 1234567)
                    </option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
                  <p>• Transfers to 1Link banks are processed within 24 hours.</p>
                  <p>• Zero withdrawal fee applied during promotional phase.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Confirm Withdrawal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
