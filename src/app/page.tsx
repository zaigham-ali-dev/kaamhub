"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Star,
  Clock,
  ArrowRight,
  Wrench,
  Zap,
  Scissors,
  Camera,
  GraduationCap,
  Award,
  ChevronRight,
  TrendingUp,
  Smile,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import ProviderCard from "@/components/ProviderCard";
import BookingModal from "@/components/BookingModal";
import AIAssistantModal from "@/components/AIAssistantModal";
import { ServiceData, ProviderProfileData, CategoryData } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [services, setServices] = useState<ServiceData[]>([]);
  const [providers, setProviders] = useState<ProviderProfileData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookingService, setBookingService] = useState<ServiceData | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [srvRes, provRes, catRes] = await Promise.all([
          fetch("/api/services?limit=6"),
          fetch("/api/providers?limit=4&verified=true"),
          fetch("/api/categories"),
        ]);

        const [srvData, provData, catData] = await Promise.all([
          srvRes.json(),
          provRes.json(),
          catRes.json(),
        ]);

        if (srvData.success) setServices(srvData.data || []);
        if (provData.success) setProviders(provData.data || []);
        if (catData.success) setCategories(catData.data || []);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCity && selectedCity !== "All Cities") params.set("location", selectedCity);
    router.push(`/services?${params.toString()}`);
  };

  const categoryIcons: Record<string, any> = {
    "home-repair": Wrench,
    cleaning: Sparkles,
    electrical: Zap,
    photography: Camera,
    tutoring: GraduationCap,
    beauty: Scissors,
    shifting: TrendingUp,
    mechanic: Wrench,
    cooking: Award,
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-100">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-200/30 to-teal-100/30 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top trust pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 shadow-sm text-xs font-semibold text-emerald-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Pakistan&apos;s Most Trusted On-Demand Skilled Workers Network</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Find the right person <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">
              for every job in Pakistan.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Mistri, Plumbers, Electricians, Dihari Mazdoors, Painters, Tailors, and Home Cleaners across all major cities with transparent PKR rates.
          </p>

          {/* Search Bar Container */}
          <div className="mt-8 max-w-3xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 flex flex-col md:flex-row items-stretch gap-2"
            >
              {/* Service Input */}
              <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 md:bg-transparent rounded-xl">
                <Search className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="What service do you need? (e.g. Mistri, Plumber, AC Repair, Mazdoor)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* City Selector */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 md:bg-transparent rounded-xl border-t md:border-t-0 md:border-l border-slate-200">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="All Cities">All Pakistan</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Quetta">Quetta</option>
                </select>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>Find Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Quick Searches */}
            <div className="mt-3.5 flex items-center justify-center flex-wrap gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Popular:</span>
              <Link
                href="/services?search=Mazdoor"
                className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 transition-colors font-medium"
              >
                Dihari Mazdoor
              </Link>
              <Link
                href="/services?search=Mistri"
                className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 transition-colors font-medium"
              >
                Mistri & Mason
              </Link>
              <Link
                href="/services?search=Plumber"
                className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 transition-colors font-medium"
              >
                Plumber (Sanitary)
              </Link>
              <Link
                href="/services?search=AC"
                className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
              >
                AC Servicing & Gas
              </Link>
              <Link
                href="/services?search=Electrician"
                className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
              >
                Electrician & Solar
              </Link>
              <Link
                href="/services?search=Maid"
                className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
              >
                House Maid & Safai
              </Link>
            </div>
          </div>

          {/* AI Banner Callout */}
          <div className="mt-10 max-w-xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Not sure who to hire?
                </p>
                <p className="text-sm font-semibold text-white">
                  Let KaamHub AI diagnose your issue and pick the right expert.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-emerald-50 transition-colors whitespace-nowrap shadow-sm"
            >
              Ask KaamHub AI
            </button>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories Section */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Browse Marketplace
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Explore Popular Categories
              </h2>
            </div>
            <Link
              href="/categories"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>View all categories</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => {
              const IconComp = categoryIcons[cat.slug] || Wrench;
              return (
                <Link
                  key={cat.id}
                  href={`/services?category=${cat.slug}`}
                  className="group p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {cat.serviceCount || "Verified"} Services
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Popular Services Grid */}
      <section className="py-16 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Top Rated Solutions
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Trending Services in Pakistan
              </h2>
            </div>
            <Link
              href="/services"
              className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>Explore all services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 bg-slate-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBookClick={(s) => setBookingService(s)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. How KaamHub Works */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Simple & Transparent
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              How KaamHub Works
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Book the help you need in under two minutes with complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/20">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">
                Search & Compare
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse hundreds of certified local pros or describe your issue to our AI Assistant.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/20">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">
                Pick Date & Slot
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select your convenient date and morning/afternoon time window with zero double-booking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">
                Work Done Right
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified technician arrives equipped with pro tools. Track job progress right on your dashboard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/20">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">
                Pay & Review
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pay safely via Stripe Sandbox or Cash on completion. Leave a review to help your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Verified Providers */}
      <section className="py-16 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Background Checked & Certified
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Meet Verified Top Providers
              </h2>
            </div>
            <Link
              href="/providers"
              className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>View all providers</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.slice(0, 4).map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Customers Trust KaamHub */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Uncompromising Standard
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Why thousands of households trust KaamHub
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                We eliminate the uncertainty of unverified handymen. Every technician, tutor, cleaner, and photographer on KaamHub goes through strict verification.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      ID & Skill Verification
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      CNIC authentication, past work portfolio scrutiny, and trade credentials check.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Upfront Transparent Pricing
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      No last minute surprises or made-up fees. What you see is what you pay.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Punctuality & Re-work Warranty
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Technicians arrive within your chosen time window with 30-day service warranty on repairs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials snippet */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-1 text-amber-400 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-base sm:text-lg text-slate-200 italic leading-relaxed">
                &ldquo;Tariq bhai arrived within 30 minutes for our master split AC chemical wash in Clifton. The unit is cooling like brand new. Booking on KaamHub was painless, and paying with card made everything transparent!&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3.5">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <div className="font-bold text-sm text-white">Fatima Ali</div>
                  <div className="text-xs text-slate-400">Homeowner, Clifton Karachi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Statistics Banner */}
      <section className="py-14 bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">12,500+</div>
              <div className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">Completed Bookings</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">1,400+</div>
              <div className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">Verified Professionals</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">4.9 / 5</div>
              <div className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">Average Customer Rating</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">3 Cities</div>
              <div className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">Karachi • Lahore • Islamabad</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Provider Onboarding / User Action CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            {user ? (
              <>
                <div className="space-y-3 max-w-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Welcome Back, {user.name}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {user.role === "PROVIDER"
                      ? "Manage your active services and customer bookings"
                      : user.role === "ADMIN"
                      ? "Administrative control and platform management"
                      : "Track your bookings and discover top services"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {user.role === "PROVIDER"
                      ? "Review new job requests, update your trade rates, and coordinate with clients seamlessly."
                      : user.role === "ADMIN"
                      ? "Review provider credentials, verify listings, and inspect marketplace metrics."
                      : "Easily manage scheduled repairs, view favorite technicians, and message providers directly."}
                  </p>
                </div>
                <Link
                  href={
                    user.role === "ADMIN"
                      ? "/admin"
                      : user.role === "PROVIDER"
                      ? "/provider"
                      : "/dashboard"
                  }
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 whitespace-nowrap transition-colors flex items-center gap-2"
                >
                  <span>
                    {user.role === "ADMIN"
                      ? "Go to Admin Portal"
                      : user.role === "PROVIDER"
                      ? "Go to Provider Portal"
                      : "Go to Customer Dashboard"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <div className="space-y-3 max-w-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Are you a skilled professional?
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Expand your service business with KaamHub
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Connect with thousands of paying customers in your neighborhood. Set your own prices, manage your calendar, and get paid safely.
                  </p>
                </div>
                <Link
                  href="/register?role=PROVIDER"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 whitespace-nowrap transition-colors flex items-center gap-2"
                >
                  <span>Register as Provider</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      <BookingModal
        service={bookingService}
        isOpen={!!bookingService}
        onClose={() => setBookingService(null)}
      />

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSelectService={(s) => setBookingService(s)}
      />
    </div>
  );
}
