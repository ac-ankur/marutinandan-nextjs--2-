"use client";

import { useEffect, useState, useCallback } from "react";
import { admin, rupees, formatApiError } from "@/lib/api";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  Clock,
  Truck,
  CheckCircle2,
  RefreshCw,
  Inbox,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  CircleDollarSign,
} from "lucide-react";

export default function OverviewTab({ onNavigateTab }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (timeframe = 30) => {
    setLoading(true);
    setError("");
    try {
      const res = await admin.dashboard(timeframe);
      setData(res);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(days);
  }, [days, fetchDashboard]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    );
  }

  const period = data?.period || {};
  const today = data?.today || {};
  const fulfilment = data?.fulfilment || {};
  const customers = data?.customers || {};
  const lowStock = data?.lowStock || [];
  const topProducts = data?.topProducts || [];
  const dailySales = data?.dailySales || [];

  const maxRevenue = Math.max(...dailySales.map((d) => d.revenuePaise || 0), 100);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Operations & Performance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time business performance, revenue, and active fulfillment pipeline from connected API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe pill selector */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-xs">
            {[
              { val: 7, label: "7D" },
              { val: 14, label: "14D" },
              { val: 30, label: "30D" },
              { val: 90, label: "90D" },
              { val: 365, label: "1Y" },
            ].map((d) => (
              <button
                key={d.val}
                type="button"
                onClick={() => setDays(d.val)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  days === d.val
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(days)}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* 4 Core Financial & Customer Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Net Revenue ({days}d)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CircleDollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {rupees(period.revenuePaise || 0)}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span>Avg: {rupees(period.averageOrderPaise || 0)}</span>
            <span>Today: {rupees(today.revenuePaise || 0)}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Orders Placed ({days}d)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {period.orders || 0}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span>Discounts: {rupees(period.discountsGivenPaise || 0)}</span>
            <span>Today: {today.orders || 0}</span>
          </div>
        </div>

        {/* Customer Directory */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Customers
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {customers.total || 0}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span>+{customers.new || 0} new in {days}d</span>
            <button
              type="button"
              onClick={() => onNavigateTab("users")}
              className="font-semibold text-blue-600 hover:underline"
            >
              Directory →
            </button>
          </div>
        </div>

        {/* Wholesale Inquiries */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Trade Leads
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {data?.newEnquiries || 0}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span>Pending response</span>
            <button
              type="button"
              onClick={() => onNavigateTab("enquiries")}
              className="font-semibold text-blue-600 hover:underline"
            >
              Review leads →
            </button>
          </div>
        </div>
      </div>

      {/* Fulfillment Pipeline Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Fulfillment Pipeline</h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("orders")}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Manage order dispatches →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            onClick={() => onNavigateTab("orders", { status: "PAID" })}
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-all hover:border-slate-300 hover:bg-slate-100/70"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To Pack</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{fulfilment.toPack || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Payment confirmed</p>
          </div>

          <div
            onClick={() => onNavigateTab("orders", { status: "PACKED" })}
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-all hover:border-slate-300 hover:bg-slate-100/70"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To Ship</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{fulfilment.toShip || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Ready for carrier</p>
          </div>

          <div
            onClick={() => onNavigateTab("orders", { status: "SHIPPED" })}
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-all hover:border-slate-300 hover:bg-slate-100/70"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">In Transit</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{fulfilment.inTransit || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">With courier partner</p>
          </div>

          <div
            onClick={() => onNavigateTab("orders", { status: "PENDING" })}
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-all hover:border-slate-300 hover:bg-slate-100/70"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Pay</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{fulfilment.awaitingPayment || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting gateway</p>
          </div>
        </div>
      </div>

      {/* Sales Trend & Stock Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend Bar Visualizer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sales Trend ({days} Days)</h3>
              <p className="text-[11px] text-slate-500">Daily revenue captured from paid consumer orders</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {rupees(period.revenuePaise || 0)} Total
            </span>
          </div>

          {dailySales.length === 0 || period.orders === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center p-6">
              <CircleDollarSign className="h-8 w-8 text-slate-400 mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">No checkout transactions recorded</p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                Live API is connected. Sales graphs will plot dynamically as consumers place orders in the store.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex h-44 items-end gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {dailySales.map((day, idx) => {
                const heightPct = Math.max(Math.round((day.revenuePaise / maxRevenue) * 100), 4);
                const hasSales = day.revenuePaise > 0;
                return (
                  <div
                    key={idx}
                    className="group relative flex flex-1 min-w-[10px] flex-col items-center justify-end h-full"
                  >
                    <div className="pointer-events-none absolute bottom-full mb-2 hidden w-28 rounded-lg bg-slate-900 p-2 text-center text-[10px] text-white shadow-xl group-hover:block z-20">
                      <p className="font-semibold">{day.date}</p>
                      <p className="text-emerald-400 font-bold">{rupees(day.revenuePaise)}</p>
                      <p className="text-slate-400">{day.orders} order(s)</p>
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        hasSales ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-200"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Stock Alerts</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("inventory")}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Inventory →
            </button>
          </div>

          {lowStock.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600 mb-1.5" />
              <p className="font-semibold text-slate-900">Inventory Healthy</p>
              <p className="text-[11px] mt-0.5">All SKUs are operating above safety reorder thresholds.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 truncate">{item.product}</p>
                    <span className="rounded-md bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      {item.available} units left
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {item.variant} ({item.sku}) • Threshold: {item.threshold}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top SKUs Table (only rendered if data exists) */}
      {topProducts.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Top Performing SKUs ({days} Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="pb-2.5 font-semibold">SKU</th>
                  <th className="pb-2.5 font-semibold">Product</th>
                  <th className="pb-2.5 font-semibold">Variant</th>
                  <th className="pb-2.5 font-semibold text-center">Units Sold</th>
                  <th className="pb-2.5 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-slate-900">{p.sku}</td>
                    <td className="py-2.5 font-medium text-slate-800">{p.product}</td>
                    <td className="py-2.5 text-slate-600">{p.variant}</td>
                    <td className="py-2.5 text-center font-bold text-slate-900">{p.units}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-700">
                      {rupees(p.revenuePaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
