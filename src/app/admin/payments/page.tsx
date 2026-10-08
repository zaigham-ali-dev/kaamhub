"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Search, Download } from "lucide-react";

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState([
    {
      id: "tx-901",
      orderId: "book-1",
      customer: "Ahmed Raza",
      provider: "Tariq Mehmood",
      amount: 4500,
      fee: 450,
      netProvider: 4050,
      date: "Today, 02:40 PM",
      status: "COMPLETED",
      paymentMethod: "JazzCash",
    },
    {
      id: "tx-902",
      orderId: "book-2",
      customer: "Sara Malik",
      provider: "Fatima Noor",
      amount: 6000,
      fee: 600,
      netProvider: 5400,
      date: "Yesterday, 05:15 PM",
      status: "COMPLETED",
      paymentMethod: "Debit Card",
    },
    {
      id: "tx-903",
      orderId: "book-3",
      customer: "Zaid Iqbal",
      provider: "Kamran Electrician",
      amount: 2200,
      fee: 220,
      netProvider: 1980,
      date: "2 days ago",
      status: "PENDING_PAYOUT",
      paymentMethod: "Cash on Delivery",
    },
    {
      id: "tx-904",
      orderId: "book-4",
      customer: "Hassan Ali",
      provider: "Usman Painter",
      amount: 15000,
      fee: 1500,
      netProvider: 13500,
      date: "3 days ago",
      status: "COMPLETED",
      paymentMethod: "Bank Transfer",
    },
  ]);

  const totalPlatformFees = transactions.reduce((acc, curr) => acc + curr.fee, 0);
  const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Payments & Settlement Ledger
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track gross transaction volume, automated 10% platform commissions, and provider withdrawals.
            </p>
          </div>

          <button
            onClick={() => alert("Exporting payment transactions CSV...")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross GMV (Volume)</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              PKR {totalVolume.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +18.4% this month
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Revenue (10%)</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
              PKR {totalPlatformFees.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Retained in platform escrow
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Pro Disbursements</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
              PKR 1,980
            </p>
            <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-1">
              <Clock className="w-3.5 h-3.5" />
              Next cycle payout: Friday
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Transaction Ledger</h2>
            <span className="text-xs text-slate-400">Showing all recent transfers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Transaction ID</th>
                  <th className="py-3.5 px-4">Payer / Payee</th>
                  <th className="py-3.5 px-4">Gross Amount</th>
                  <th className="py-3.5 px-4">Platform Fee (10%)</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <p className="font-mono font-bold text-slate-900">{tx.id}</p>
                      <p className="text-[11px] text-slate-400">{tx.date}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{tx.customer}</p>
                      <p className="text-[11px] text-slate-400">Pro: {tx.provider}</p>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      PKR {tx.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      +PKR {tx.fee.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {tx.paymentMethod}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tx.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
