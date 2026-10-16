"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import {
  Wrench,
  Search,
  Bell,
  User as UserIcon,
  Sparkles,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Calendar,
  Heart,
  MessageSquare,
  ChevronDown,
  Briefcase,
  MapPin,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";
import { NotificationData } from "@/lib/types";

interface NavbarProps {
  onOpenAI?: () => void;
}

export default function Navbar({ onOpenAI }: NavbarProps) {
  const { user, loading, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch notifications");
      }

      setNotifications(json.data || []);
      setUnreadCount(json.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to mark notifications as read");
      }

      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  // Fetch notifications if logged in
  useEffect(() => {
    if (user) {
      const initialFetch = setTimeout(fetchNotifications, 0);
      const interval = setInterval(fetchNotifications, 5000);
      return () => {
        clearTimeout(initialFetch);
        clearInterval(interval);
      };
    }
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dashboard link based on role
  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "PROVIDER") return "/provider";
    return "/dashboard";
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  const themeOptions: { mode: ThemeMode; label: string; icon: any; desc: string }[] = [
    { mode: "light", label: "Light Mode", icon: Sun, desc: "Bright and clean" },
    { mode: "dark", label: "Dark Mode", icon: Moon, desc: "Easy on the eyes" },
    { mode: "default", label: "Default Mode", icon: Monitor, desc: "Follows system theme" },
  ];

  const CurrentThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left Side: Theme Switcher & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Left Corner Theme Switcher (Desktop / Tablet - Mobile has it inside drawer) */}
          <div className="relative hidden sm:block" ref={themeRef}>
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="p-2 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
              title={`Theme: ${theme.toUpperCase()} (Click to change)`}
              aria-label="Toggle Theme"
            >
              <CurrentThemeIcon className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline text-xs font-semibold capitalize text-slate-700">
                {theme}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Theme Dropdown Menu */}
            {themeDropdownOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Appearance
                  </p>
                </div>
                {themeOptions.map(({ mode, label, icon: Icon, desc }) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setTheme(mode);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-emerald-50/60 transition-colors ${
                      theme === mode ? "bg-emerald-50 text-emerald-800 font-semibold" : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${theme === mode ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{label}</p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{desc}</p>
                      </div>
                    </div>
                    {theme === mode && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Brand Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 group flex-shrink-0 cursor-pointer"
            title="Go to Top / Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Kaam<span className="text-emerald-600">Hub</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded">
                  PK
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link
            href="/services"
            className={`px-3 py-2 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-50 ${
              pathname.startsWith("/services") ? "text-emerald-600 font-semibold bg-emerald-50/50" : ""
            }`}
          >
            Find Services
          </Link>
          <Link
            href="/providers"
            className={`px-3 py-2 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-50 ${
              pathname.startsWith("/providers") ? "text-emerald-600 font-semibold bg-emerald-50/50" : ""
            }`}
          >
            Verified Providers
          </Link>
          <Link
            href="/categories"
            className={`px-3 py-2 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-50 ${
              pathname === "/categories" ? "text-emerald-600 font-semibold bg-emerald-50/50" : ""
            }`}
          >
            Categories
          </Link>
          <Link
            href="/about"
            className={`px-3 py-2 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-50 ${
              pathname === "/about" ? "text-emerald-600 font-semibold bg-emerald-50/50" : ""
            }`}
          >
            How it Works
          </Link>
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-1 sm:gap-2.5">
          {/* AI Assistant Quick Trigger */}
          <button
            onClick={onOpenAI}
            type="button"
            className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 text-emerald-700 hover:from-emerald-500/20 hover:to-indigo-500/20 border border-emerald-200/80 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse flex-shrink-0" />
            <span className="hidden sm:inline">Ask AI Assistant</span>
            <span className="inline sm:hidden">AI</span>
          </button>

          {/* Right auth state */}
          {loading ? (
            <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-xl" />
          ) : user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="font-semibold text-slate-900 text-sm">Notifications</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-emerald-600 hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || "#"}
                            onClick={() => setNotifDropdownOpen(false)}
                            className={`block p-3.5 hover:bg-slate-50 transition-colors ${
                              !n.read ? "bg-emerald-50/40" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  !n.read ? "bg-emerald-500" : "bg-transparent"
                                }`}
                              />
                              <div className="text-xs">
                                <p className="font-semibold text-slate-800">{n.title}</p>
                                <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString("en-PK", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name
                      )}&background=059669&color=fff`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href={getDashboardHref()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                        <span>Dashboard</span>
                      </Link>

                      {user.role === "CUSTOMER" && (
                        <>
                          <Link
                            href="/dashboard/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span>My Bookings</span>
                          </Link>
                          <Link
                            href="/dashboard/favorites"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-slate-500" />
                            <span>Favorites</span>
                          </Link>
                          <Link
                            href="/dashboard/messages"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-slate-500" />
                            <span>Messages</span>
                          </Link>
                        </>
                      )}

                      {user.role === "PROVIDER" && (
                        <>
                          <Link
                            href="/provider/services"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Briefcase className="w-4 h-4 text-slate-500" />
                            <span>My Services</span>
                          </Link>
                          <Link
                            href="/provider/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span>Client Bookings</span>
                          </Link>
                          <Link
                            href="/provider/messages"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-slate-500" />
                            <span>Client Messages</span>
                          </Link>
                        </>
                      )}

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin/providers"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-slate-500" />
                          <span>Verify Providers</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/login"
                className="whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-emerald-600 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all shadow-sm"
              >
                <span className="hidden sm:inline">Join KaamHub</span>
                <span className="inline sm:hidden">Join</span>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Services
          </Link>
          <Link
            href="/providers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Verified Providers
          </Link>
          <Link
            href="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Categories
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            How it Works
          </Link>

          {/* Mobile Theme Selector */}
          <div className="pt-2 pb-1 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Theme Mode
            </p>
            <div className="grid grid-cols-3 gap-1.5 px-3">
              {themeOptions.map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                    theme === mode
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="pt-3 border-t border-slate-100 flex justify-center py-2">
              <div className="w-32 h-9 bg-slate-100 animate-pulse rounded-xl" />
            </div>
          ) : user ? (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <Link
                href={getDashboardHref()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-600 bg-emerald-50"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow"
              >
                Join as Customer or Provider
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
