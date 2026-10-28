"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Sparkles,
  FileText,
  Star,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Settings,
  Type,
  UserRound,
} from "lucide-react";

import OverviewTab from "./OverviewTab";
import PricingModeSwitch from "@/components/PricingModeSwitch";
import ProductsTab from "./ProductsTab";
import InventoryTab from "./InventoryTab";
import OrdersTab from "./OrdersTab";
import UsersTab from "./UsersTab";
import CouponsTab from "./CouponsTab";
import OffersTab from "./OffersTab";
import EnquiriesTab from "./EnquiriesTab";
import ReviewsTab from "./ReviewsTab";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products & Catalog", icon: Package },
  { id: "inventory", label: "Inventory & Stock", icon: Layers },
  { id: "orders", label: "Orders & Fulfillment", icon: ShoppingBag },
  { id: "users", label: "Users & Customers", icon: Users },
  { id: "coupons", label: "Coupons & Discounts", icon: Tag },
  { id: "offers", label: "Promotional Offers", icon: Sparkles },
  { id: "enquiries", label: "Customer Inquiries", icon: FileText },
  { id: "reviews", label: "Reviews Moderation", icon: Star },
];

export default function AdminConsole() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(tabParam);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState({});

  // Collapsible sidebar state (persisted)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Font size setting: 'sm' | 'md' | 'lg' (persisted)
  const [fontSize, setFontSize] = useState("md");
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem("yugika_admin_sidebar_collapsed");
      if (savedCollapsed !== null) setIsCollapsed(savedCollapsed === "true");

      const savedSize = localStorage.getItem("yugika_admin_font_size");
      if (savedSize && ["sm", "md", "lg"].includes(savedSize)) {
        setFontSize(savedSize);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("yugika_admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    try {
      localStorage.setItem("yugika_admin_font_size", size);
    } catch {}
    setShowSettingsDropdown(false);
  };

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && NAV_ITEMS.some((n) => n.id === t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleTabChange = (tabId, params = {}) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (tabId === "orders" && params.status) {
      setOrderFilter({ status: params.status });
    }
    router.replace(`/admin?tab=${tabId}`, { scroll: false });
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Font size multiplier classes
  const fontClass =
    fontSize === "sm"
      ? "text-xs [&_.text-sm]:text-xs [&_.text-base]:text-sm [&_.text-lg]:text-base [&_.text-xl]:text-lg [&_.text-2xl]:text-xl"
      : fontSize === "lg"
      ? "text-base [&_.text-xs]:text-sm [&_.text-sm]:text-base [&_.text-base]:text-lg [&_.text-lg]:text-xl [&_.text-2xl]:text-3xl"
      : "text-sm"; // default medium

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-800 antialiased ${fontClass}`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <span className="relative block h-9 w-9 overflow-hidden rounded-full border border-slate-200 shadow-sm flex-shrink-0">
                <Image
                  src="/images/yugika-logo.jpg"
                  alt="Yugika Foods Private Limited"
                  fill
                  className="object-cover"
                />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-bold tracking-tight text-slate-900 uppercase">
                    Yugika Foods
                  </span>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    Console
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block">Operations & Commerce Admin</p>
              </div>
            </div>
          </div>

          {/* Right: Actions & Display Controls */}
          <div className="flex items-center gap-2.5">
            {/* Font Size Settings Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettingsDropdown((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                title="Change font display size"
              >
                <Type className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Size:</span>
                <span className="font-bold uppercase text-slate-900">{fontSize}</span>
              </button>

              {showSettingsDropdown && (
                <div
                  onMouseLeave={() => setShowSettingsDropdown(false)}
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50"
                >
                  <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Display Density
                  </p>
                  {[
                    { id: "sm", label: "Small (Compact)", desc: "High row density" },
                    { id: "md", label: "Medium (Standard)", desc: "Balanced layout" },
                    { id: "lg", label: "Large (Spacious)", desc: "Larger text & spacing" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleFontSizeChange(s.id)}
                      className={`flex w-full flex-col items-start rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                        fontSize === s.id
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-semibold">{s.label}</span>
                      <span className={`text-[10px] ${fontSize === s.id ? "text-slate-300" : "text-slate-400"}`}>
                        {s.desc}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Mode Switch (Static vs Live API) */}
            <div className="hidden md:flex items-center">
              <PricingModeSwitch compact={true} />
            </div>

            {/* View public storefront */}
            <Link
              href="/products"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <span>Storefront</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>

            {/* Admin User Chip */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                  {user?.name || "Yugika Admin"}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{user?.email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors shadow-xs"
                title="Sign out of Admin Portal"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Collapsible Sidebar for Desktop */}
        <aside
          className={`hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-18" : "w-64"
          }`}
        >
          {/* Sidebar Top: Collapse/Expand Button */}
          <div className="flex items-center justify-between border-b border-slate-100 p-3">
            {!isCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Operations
              </span>
            )}
            <button
              type="button"
              onClick={toggleSidebar}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
                isCollapsed ? "mx-auto" : "ml-auto"
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 p-2.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex w-full items-center rounded-xl px-3 py-2.5 font-medium transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  } ${isCollapsed ? "justify-center" : "gap-3"}`}
                >
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate text-xs">{item.label}</span>}

                  {/* Floating tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full ml-2.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg group-hover:block z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-100 p-3 text-[11px] text-slate-400">
            {!isCollapsed ? (
              <div className="flex items-center justify-between px-1">
                <span className="font-medium">v1.2.0 Enterprise</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="API Connected" />
              </div>
            ) : (
              <div className="flex justify-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="API Connected" />
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            <div className="relative flex w-64 flex-col bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-3 flex-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabChange(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium ${
                        isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === "overview" && <OverviewTab onNavigateTab={handleTabChange} />}
            {activeTab === "products" && <ProductsTab />}
            {activeTab === "inventory" && <InventoryTab />}
            {activeTab === "orders" && <OrdersTab initialFilter={orderFilter} />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "coupons" && <CouponsTab />}
            {activeTab === "offers" && <OffersTab />}
            {activeTab === "enquiries" && <EnquiriesTab />}
            {activeTab === "reviews" && <ReviewsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
