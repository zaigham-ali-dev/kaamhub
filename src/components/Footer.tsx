"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Shield, CheckCircle, Award, Phone, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  const pathname = usePathname();

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

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Wrench className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Kaam<span className="text-emerald-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Find trusted local services. Book with confidence. KaamHub connects homeowners and businesses across Pakistan with certified, background-checked service professionals.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                <Shield className="w-3.5 h-3.5" />
                <span>100% Verified Providers</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Fair Pricing</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services" className="hover:text-emerald-400 transition-colors">
                  All Services
                </Link>
              </li>
              <li>
                <Link href="/providers" className="hover:text-emerald-400 transition-colors">
                  Verified Professionals
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-emerald-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About KaamHub
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services?category=home-repair" className="hover:text-emerald-400 transition-colors">
                  AC & Appliance Repair
                </Link>
              </li>
              <li>
                <Link href="/services?category=cleaning" className="hover:text-emerald-400 transition-colors">
                  Deep Home Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services?category=electrical" className="hover:text-emerald-400 transition-colors">
                  Electrical & Solar Setup
                </Link>
              </li>
              <li>
                <Link href="/services?category=tutoring" className="hover:text-emerald-400 transition-colors">
                  Academic Tutoring
                </Link>
              </li>
              <li>
                <Link href="/services?category=photography" className="hover:text-emerald-400 transition-colors">
                  Wedding & Photography
                </Link>
              </li>
            </ul>
          </div>

          {/* Major Cities */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">Locations</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services?location=Karachi" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Karachi (Clifton, DHA, PECHS)
                </Link>
              </li>
              <li>
                <Link href="/services?location=Lahore" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Lahore (Gulberg, DHA, Bahria)
                </Link>
              </li>
              <li>
                <Link href="/services?location=Islamabad" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Islamabad & Rawalpindi
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href={
                    user
                      ? user.role === "PROVIDER"
                        ? "/provider"
                        : user.role === "ADMIN"
                        ? "/admin"
                        : "/dashboard"
                      : "/register?role=PROVIDER"
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-800 hover:bg-emerald-900 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />{" "}
                  {user ? "Go to Dashboard" : "Become a KaamHub Provider"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} KaamHub Inc. All rights reserved. Designed for excellence across Pakistan.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-400">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-slate-400">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-slate-400">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
