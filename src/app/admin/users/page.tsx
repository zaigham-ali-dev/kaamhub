"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Users, Search, Filter, ShieldCheck, UserCheck, Ban, CheckCircle2, MoreVertical, Mail, Phone } from "lucide-react";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [usersList, setUsersList] = useState([
    {
      id: "usr-1",
      name: "Ahmed Raza",
      email: "ahmed.customer@gmail.com",
      phone: "+92 300 9876543",
      role: "CUSTOMER",
      status: "ACTIVE",
      joined: "Jan 12, 2025",
      bookingsCount: 6,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "usr-2",
      name: "Tariq Mehmood",
      email: "tariq.ac@gmail.com",
      phone: "+92 300 1234567",
      role: "PROVIDER",
      status: "ACTIVE",
      joined: "Jan 05, 2025",
      bookingsCount: 38,
      avatar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "usr-3",
      name: "Fatima Noor",
      email: "fatima.clean@gmail.com",
      phone: "+92 321 4567890",
      role: "PROVIDER",
      status: "ACTIVE",
      joined: "Feb 10, 2025",
      bookingsCount: 29,
      avatar: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "usr-4",
      name: "Hamza Abbasi",
      email: "hamza.ab@gmail.com",
      phone: "+92 333 1122334",
      role: "CUSTOMER",
      status: "SUSPENDED",
      joined: "Feb 18, 2025",
      bookingsCount: 1,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "usr-5",
      name: "Admin Superuser",
      email: "admin@kaamhub.pk",
      phone: "+92 300 0000000",
      role: "ADMIN",
      status: "ACTIVE",
      joined: "Jan 01, 2025",
      bookingsCount: 0,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    },
  ]);

  const toggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" };
        }
        return u;
      })
    );
  };

  const filtered = usersList.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Platform User Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View, search, and manage registered customers, service providers, and administrators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm">
              Total Accounts: <strong>{usersList.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customers Only</option>
              <option value="PROVIDER">Providers Only</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">User / Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Activity</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : u.role === "PROVIDER"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          u.status === "ACTIVE" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">{u.joined}</td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {u.bookingsCount} orders
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            u.status === "ACTIVE"
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/60"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      )}
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
