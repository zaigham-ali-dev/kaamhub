"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  MessageSquare,
  Star,
  User,
  Settings,
  Briefcase,
  DollarSign,
  Users,
  ShieldCheck,
  FolderTree,
  CreditCard,
  BarChart3,
  LogOut,
  Layers,
  ChevronDown,
  Menu,
} from "lucide-react";

interface SidebarProps {
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
}

export default function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const customerLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { label: "Saved Favorites", href: "/dashboard/favorites", icon: Heart },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Reviews Given", href: "/dashboard/reviews", icon: Star },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const providerLinks = [
    { label: "Overview", href: "/provider", icon: LayoutDashboard },
    { label: "My Services", href: "/provider/services", icon: Briefcase },
    { label: "Client Bookings", href: "/provider/bookings", icon: Calendar },
    { label: "Schedule / Calendar", href: "/provider/calendar", icon: Layers },
    { label: "Messages", href: "/provider/messages", icon: MessageSquare },
    { label: "Earnings & Payouts", href: "/provider/earnings", icon: DollarSign },
    { label: "Client Reviews", href: "/provider/reviews", icon: Star },
    { label: "Business Profile", href: "/provider/profile", icon: User },
    { label: "Settings", href: "/provider/settings", icon: Settings },
  ];

  const adminLinks = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users Management", href: "/admin/users", icon: Users },
    { label: "Verify Providers", href: "/admin/providers", icon: ShieldCheck },
    { label: "All Services", href: "/admin/services", icon: Briefcase },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Bookings", href: "/admin/bookings", icon: Calendar },
    { label: "Payments Ledger", href: "/admin/payments", icon: CreditCard },
    { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  const links =
    role === "ADMIN" ? adminLinks : role === "PROVIDER" ? providerLinks : customerLinks;

  const currentActiveLink = links.find((link) =>
    link.href === "/dashboard" || link.href === "/provider" || link.href === "/admin"
      ? pathname === link.href
      : pathname.startsWith(link.href)
  ) || links[0];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. Mobile & Tablet (< lg) Header Strip with Horizontal Scroll & Drawer */}
      {/* ========================================================================= */}
      <div className="lg:hidden w-full bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        {/* Compact User Bar + Menu Toggle */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "User"
                )}&background=059669&color=fff`
              }
              alt=""
              className="w-7 h-7 rounded-lg object-cover border border-slate-200 flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate block">
                {user?.name || "My Account"}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex-shrink-0">
              {role === "ADMIN" ? "Admin" : role === "PROVIDER" ? "Provider" : "Customer"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 shadow-2xs"
            >
              <Menu className="w-3.5 h-3.5 text-slate-500" />
              <span>Menu</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="px-4 py-3 bg-white border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/dashboard" || link.href === "/provider" || link.href === "/admin"
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20"
                      : "text-slate-700 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="col-span-2 sm:col-span-3 mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Swipeable Pills Bar on Mobile/Tablet */}
        <div className="px-3 py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/dashboard" || link.href === "/provider" || link.href === "/admin"
                ? pathname === link.href
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Desktop (lg: and up: Laptops, MacBooks, iMacs, PC) Vertical Sidebar    */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 p-5 min-h-[calc(100vh-4rem)] flex-col justify-between sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="space-y-6">
          {/* User Mini Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "User"
                )}&background=059669&color=fff`
              }
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md mt-0.5">
                {role === "ADMIN" ? "Administrator" : role === "PROVIDER" ? "Service Pro" : "Customer"}
              </span>
            </div>
          </div>

          {/* Navigation list */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/dashboard" || link.href === "/provider" || link.href === "/admin"
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div className="pt-6 border-t border-slate-100 mt-6">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
