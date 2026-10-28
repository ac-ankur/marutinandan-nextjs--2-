"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { orders as ordersApi, rupees, formatApiError } from "@/lib/api";
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  FileDown,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  X,
  Loader2,
  Activity,
  Check,
  ShieldCheck,
  ArrowRight,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: {
    label: "Awaiting Payment",
    color: "bg-amber-500/15 text-amber-800 border-amber-500/30",
    icon: Clock,
    step: 1,
  },
  PAID: {
    label: "Payment Confirmed",
    color: "bg-sky-500/15 text-sky-800 border-sky-500/30",
    icon: CheckCircle2,
    step: 2,
  },
  PACKED: {
    label: "Packed & Ready",
    color: "bg-indigo-500/15 text-indigo-800 border-indigo-500/30",
    icon: Package,
    step: 3,
  },
  SHIPPED: {
    label: "Shipped & In Transit",
    color: "bg-purple-500/15 text-purple-800 border-purple-500/30",
    icon: Truck,
    step: 4,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "bg-teal-500/15 text-teal-800 border-teal-500/30",
    icon: Truck,
    step: 4,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30",
    icon: CheckCircle2,
    step: 5,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-rose-500/15 text-rose-800 border-rose-500/30",
    icon: XCircle,
    step: 0,
  },
  REFUNDED: {
    label: "Refunded",
    color: "bg-zinc-500/15 text-zinc-800 border-zinc-500/30",
    icon: RotateCcw,
    step: 0,
  },
};

const CANCEL_PRESET_REASONS = [
  "Changed my mind / Need to reconsider",
  "Placed order by mistake",
  "Need to modify delivery address or phone",
  "Want to change product variant or bottle size",
  "Expected faster delivery timeframe",
  "Found alternative / Other reason",
];

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [amountFilter, setAmountFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [pageSize, setPageSize] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  // Cancellation State (POST /orders/:orderNumber/cancel)
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Timeline State (GET /orders/:orderNumber/timeline)
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineError, setTimelineError] = useState("");

  // Invoice State (GET /orders/:orderNumber/invoice)
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  // Fetch orders list (GET /orders?page=1&pageSize=10)
  const fetchOrders = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await ordersApi.list(targetPage, 10);
      setOrders(res.items || []);
      setMeta(res.meta || null);
      setPage(targetPage);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const toggleExpand = (id) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open & load timeline (GET /orders/:orderNumber/timeline)
  const handleOpenTimeline = async (order) => {
    setSelectedTimelineOrder(order);
    setTimelineLoading(true);
    setTimelineError("");
    setTimelineEvents([]);
    try {
      const orderIdentifier = order.orderNumber || order.id;
      const data = await ordersApi.timeline(orderIdentifier);
      const list = Array.isArray(data)
        ? data
        : data?.timeline || data?.events || data?.history || [];
      setTimelineEvents(list);
    } catch (err) {
      setTimelineError(formatApiError(err));
    } finally {
      setTimelineLoading(false);
    }
  };

  // Download GST Invoice PDF (GET /orders/:orderNumber/invoice)
  const handleDownloadInvoice = async (order) => {
    const orderIdentifier = order.orderNumber || order.id;
    setDownloadingId(order.id);
    try {
      await ordersApi.downloadInvoice(
        orderIdentifier,
        `Invoice-${order.orderNumber || order.id}.pdf`
      );
    } catch (err) {
      alert(formatApiError(err));
    } finally {
      setDownloadingId(null);
    }
  };

  // Submit Cancel Order (POST /orders/:orderNumber/cancel)
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    if (!cancelReason.trim()) {
      setCancelError("Please select or enter a reason for cancellation.");
      return;
    }
    setCancelLoading(true);
    setCancelError("");
    try {
      const orderIdentifier = cancelModalOrder.orderNumber || cancelModalOrder.id;
      await ordersApi.cancel(orderIdentifier, cancelReason.trim());
      setActionSuccess(
        `Order #${cancelModalOrder.orderNumber || cancelModalOrder.id} has been cancelled successfully.`
      );
      setCancelModalOrder(null);
      setCancelReason("");
      if (selectedTimelineOrder?.id === cancelModalOrder.id) {
        setSelectedTimelineOrder(null);
      }
      fetchOrders(page);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err) {
      setCancelError(formatApiError(err));
    } finally {
      setCancelLoading(false);
    }
  };

  // Dynamic counts for status tabs
  const counts = useMemo(() => {
    let active = 0;
    let delivered = 0;
    let cancelled = 0;
    orders.forEach((o) => {
      if (["PENDING", "PAID", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)) {
        active++;
      } else if (o.status === "DELIVERED") {
        delivered++;
      } else if (["CANCELLED", "REFUNDED"].includes(o.status)) {
        cancelled++;
      }
    });
    return {
      all: orders.length,
      active,
      delivered,
      cancelled,
    };
  }, [orders]);

  // Check how many filters are currently active
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "ALL") count++;
    if (searchQuery.trim() !== "") count++;
    if (timeFilter !== "ALL") count++;
    if (amountFilter !== "ALL") count++;
    if (sortBy !== "NEWEST") count++;
    return count;
  }, [statusFilter, searchQuery, timeFilter, amountFilter, sortBy]);

  const handleClearAllFilters = () => {
    setStatusFilter("ALL");
    setSearchQuery("");
    setTimeFilter("ALL");
    setAmountFilter("ALL");
    setSortBy("NEWEST");
    setCurrentPage(1);
  };

  // Filtered and Sorted Orders
  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Status filter
        if (statusFilter === "ACTIVE") {
          if (!["PENDING", "PAID", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)) {
            return false;
          }
        } else if (statusFilter === "DELIVERED") {
          if (o.status !== "DELIVERED") return false;
        } else if (statusFilter === "CANCELLED") {
          if (!["CANCELLED", "REFUNDED"].includes(o.status)) return false;
        }

        // Search query (Order #, ID, Item name, variant, sku)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const orderNum = (o.orderNumber || "").toLowerCase();
          const orderId = (o.id || "").toLowerCase();
          const matchesOrder = orderNum.includes(q) || orderId.includes(q);
          const matchesItems = Array.isArray(o.items) && o.items.some((item) => {
            const name = (item.productName || item.name || "").toLowerCase();
            const variant = (item.variantLabel || "").toLowerCase();
            const sku = (item.sku || "").toLowerCase();
            return name.includes(q) || variant.includes(q) || sku.includes(q);
          });
          if (!matchesOrder && !matchesItems) return false;
        }

        // Timeframe filter
        if (timeFilter !== "ALL" && o.createdAt) {
          const orderDate = new Date(o.createdAt);
          const now = new Date();
          if (timeFilter === "30_DAYS") {
            const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (orderDate < days30Ago) return false;
          } else if (timeFilter === "90_DAYS") {
            const days90Ago = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            if (orderDate < days90Ago) return false;
          } else if (timeFilter === "180_DAYS") {
            const days180Ago = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            if (orderDate < days180Ago) return false;
          } else if (timeFilter === "2026") {
            if (orderDate.getFullYear() !== 2026) return false;
          }
        }

        // Amount filter
        if (amountFilter !== "ALL") {
          const totalVal = (o.totalPaise != null ? o.totalPaise / 100 : Number(o.total)) || 0;
          if (amountFilter === "UNDER_1000" && totalVal >= 1000) return false;
          if (amountFilter === "1000_3000" && (totalVal < 1000 || totalVal > 3000)) return false;
          if (amountFilter === "ABOVE_3000" && totalVal <= 3000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "OLDEST") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === "PRICE_HIGH") {
          const priceA = (a.totalPaise != null ? a.totalPaise : (a.total || 0) * 100) || 0;
          const priceB = (b.totalPaise != null ? b.totalPaise : (b.total || 0) * 100) || 0;
          return priceB - priceA;
        }
        if (sortBy === "PRICE_LOW") {
          const priceA = (a.totalPaise != null ? a.totalPaise : (a.total || 0) * 100) || 0;
          const priceB = (b.totalPaise != null ? b.totalPaise : (b.total || 0) * 100) || 0;
          return priceA - priceB;
        }
        return 0;
      });
  }, [orders, statusFilter, searchQuery, timeFilter, amountFilter, sortBy]);

  // Total pages and bounded current page
  const totalClientPages = Math.max(1, Math.ceil(filteredAndSortedOrders.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalClientPages);

  // Paginated items
  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAndSortedOrders.slice(start, start + pageSize);
  }, [filteredAndSortedOrders, safeCurrentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-pine-950">My Orders</h2>
          <p className="text-xs text-ink/60">
            Track order timelines, download official GST invoices, and review shipment history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchOrders(page)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-gold/30 bg-cream-paper px-3.5 py-1.5 text-xs font-semibold text-pine-900 hover:bg-gold/15 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-900 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modern Filter Toolbar */}
      <div className="space-y-3.5 rounded-3xl border border-gold/25 bg-cream-paper/70 p-4 sm:p-5 shadow-xs">
        {/* Search bar + Dropdown Selectors */}
        <div className="flex flex-col lg:flex-row gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Order #, product name, or SKU..."
              className="w-full rounded-2xl border border-gold/30 bg-cream py-2.5 pl-10 pr-9 text-xs font-medium text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/40 hover:bg-gold/20 hover:text-ink transition-colors"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Selectors: Timeframe, Amount, Sort */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Timeframe Filter */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none rounded-2xl border border-gold/30 bg-cream py-2.5 pl-3 pr-8 text-xs font-medium text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="30_DAYS">Last 30 Days</option>
                <option value="90_DAYS">Last 3 Months</option>
                <option value="180_DAYS">Last 6 Months</option>
                <option value="2026">Year 2026</option>
              </select>
              <Calendar className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
            </div>

            {/* Price/Amount Filter */}
            <div className="relative">
              <select
                value={amountFilter}
                onChange={(e) => {
                  setAmountFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none rounded-2xl border border-gold/30 bg-cream py-2.5 pl-3 pr-8 text-xs font-medium text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
              >
                <option value="ALL">All Amounts</option>
                <option value="UNDER_1000">Under ₹1,000</option>
                <option value="1000_3000">₹1,000 – ₹3,000</option>
                <option value="ABOVE_3000">Above ₹3,000</option>
              </select>
              <CreditCard className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
            </div>

            {/* Sort Order */}
            <div className="relative col-span-2 sm:col-span-1">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none rounded-2xl border border-gold/30 bg-cream py-2.5 pl-3 pr-8 text-xs font-medium text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="PRICE_HIGH">Price: High to Low</option>
                <option value="PRICE_LOW">Price: Low to High</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
            </div>
          </div>
        </div>

        {/* Status Tabs + Filter Stats & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gold/15">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { key: "ALL", label: "All Orders", count: counts.all },
              { key: "ACTIVE", label: "Active", count: counts.active },
              { key: "DELIVERED", label: "Delivered", count: counts.delivered },
              { key: "CANCELLED", label: "Cancelled", count: counts.cancelled },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-all ${
                  statusFilter === tab.key
                    ? "bg-pine-900 text-cream shadow-xs"
                    : "bg-cream text-ink/70 hover:bg-gold/15 border border-gold/20"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    statusFilter === tab.key
                      ? "bg-pine-800 text-gold-light"
                      : "bg-ink/5 text-ink/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-ink/60 hidden sm:inline">
                {filteredAndSortedOrders.length} {filteredAndSortedOrders.length === 1 ? "match" : "matches"}
              </span>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-800 transition-colors hover:bg-rose-100"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filters ({activeFiltersCount})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="animate-pulse rounded-3xl border border-gold/20 bg-cream-paper p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-ink/10 rounded" />
                <div className="h-6 w-24 bg-ink/10 rounded-full" />
              </div>
              <div className="h-12 bg-ink/5 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-gold/25 bg-cream-paper p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold-deep">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-pine-950">
            No orders yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink/60">
            Discover our cold-pressed, wood-churned mustard oils fresh from Rajasthan.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-pine-900 px-5 py-2.5 text-xs font-semibold text-cream shadow-md transition-all hover:bg-pine-950 hover:shadow-lg"
          >
            <span>Explore Products</span>
          </Link>
        </div>
      ) : filteredAndSortedOrders.length === 0 ? (
        <div className="rounded-3xl border border-gold/25 bg-cream-paper p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold-deep">
            <SlidersHorizontal className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-pine-950">
            No matching orders found
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink/60">
            No orders match the current search or filter combination.
          </p>
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-pine-900 px-5 py-2.5 text-xs font-semibold text-cream shadow-md transition-all hover:bg-pine-950 hover:shadow-lg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear All Filters</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => {
            const config = STATUS_CONFIG[order.status] || {
              label: order.status,
              color: "bg-zinc-500/15 text-zinc-800 border-zinc-500/30",
              icon: Package,
            };
            const StatusIcon = config.icon;
            const isExpanded = !!expandedOrders[order.id];

            const placedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—";

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-gold/25 bg-cream-paper shadow-xs transition-all hover:border-gold/40"
              >
                {/* Order Top Summary */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/8 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-pine-950">
                          Order #{order.orderNumber || order.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${config.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span>{config.label}</span>
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink/60">
                        <Calendar className="h-3 w-3" />
                        <span>Placed on {placedDate}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-ink/50">Total Amount</p>
                      <p className="font-display text-lg font-bold text-pine-950">
                        {order.total || rupees(order.totalPaise)}
                      </p>
                    </div>
                  </div>

                  {/* Primary items snippet */}
                  <div className="mt-4 space-y-2">
                    {order.items?.slice(0, isExpanded ? order.items.length : 2).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 py-1.5 text-xs text-ink"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-deep font-bold text-[10px]">
                            {item.quantity}×
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-pine-950 truncate">{item.productName}</p>
                            <p className="text-[10px] text-ink/50 truncate">
                              Variant: {item.variantLabel || item.sku}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-pine-900 flex-shrink-0">
                          {rupees(item.lineTotalPaise || item.unitPricePaise * item.quantity)}
                        </span>
                      </div>
                    ))}

                    {order.items?.length > 2 && !isExpanded && (
                      <p className="text-[11px] text-ink/50 italic">
                        +{order.items.length - 2} more item{order.items.length - 2 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Expanded Detailed Breakdown */}
                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-ink/8 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Shipping Details */}
                        {order.shippingAddress && (
                          <div className="rounded-2xl border border-ink/8 bg-cream/50 p-3.5 text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-pine-950 mb-1.5">
                              <MapPin className="h-3.5 w-3.5 text-gold-deep" />
                              <span>Delivery Address</span>
                            </div>
                            <p className="font-medium text-ink">
                              {order.shippingAddress.fullName || order.shippingAddress.name}
                            </p>
                            <p className="text-ink/70">
                              {order.shippingAddress.line1}
                              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
                            </p>
                            <p className="text-ink/70">
                              {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                              {order.shippingAddress.postalCode}
                            </p>
                            {order.shippingAddress.phone && (
                              <p className="mt-1 text-[11px] text-ink/60">
                                Phone: {order.shippingAddress.phone}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Price breakdown */}
                        <div className="rounded-2xl border border-ink/8 bg-cream/50 p-3.5 text-xs space-y-1">
                          <div className="flex justify-between text-ink/70">
                            <span>Subtotal</span>
                            <span>{rupees(order.subtotalPaise)}</span>
                          </div>
                          {order.discountPaise > 0 && (
                            <div className="flex justify-between text-emerald-800 font-medium">
                              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                              <span>-{rupees(order.discountPaise)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-ink/70">
                            <span>Shipping</span>
                            <span>
                              {order.shippingPaise === 0 ? "FREE" : rupees(order.shippingPaise)}
                            </span>
                          </div>
                          {order.gstIncludedPaise > 0 && (
                            <div className="flex justify-between text-[10px] text-ink/50 pt-1 border-t border-ink/5">
                              <span>GST Included (5%)</span>
                              <span>{rupees(order.gstIncludedPaise)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-pine-950 pt-1 text-sm border-t border-ink/10">
                            <span>Total Paid</span>
                            <span>{order.total || rupees(order.totalPaise)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink/8 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      className="inline-flex items-center gap-1 font-semibold text-pine-900 hover:text-pine-950 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <span>Hide Details</span>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <span>View Details</span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Order Timeline (GET /orders/:orderNumber/timeline) */}
                      <button
                        type="button"
                        onClick={() => handleOpenTimeline(order)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-pine-900/25 bg-pine-900/5 px-3 py-1.5 font-semibold text-pine-900 shadow-2xs transition-all hover:bg-pine-900 hover:text-cream"
                      >
                        <Activity className="h-3.5 w-3.5 text-gold-deep" />
                        <span>Track Timeline</span>
                      </button>

                      {/* Download GST Invoice (GET /orders/:orderNumber/invoice) */}
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(order)}
                        disabled={downloadingId === order.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-white px-3 py-1.5 font-semibold text-pine-900 shadow-2xs transition-all hover:bg-gold/15 disabled:opacity-50"
                      >
                        {downloadingId === order.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-deep" />
                        ) : (
                          <FileDown className="h-3.5 w-3.5 text-gold-deep" />
                        )}
                        <span>
                          {downloadingId === order.id ? "Downloading…" : "GST Invoice"}
                        </span>
                      </button>

                      {/* Cancel Order (POST /orders/:orderNumber/cancel) */}
                      {(order.canCancel ?? ["PENDING", "PAID"].includes(order.status)) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancelModalOrder(order);
                            setCancelReason("");
                            setCancelError("");
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 font-semibold text-rose-800 transition-colors hover:bg-rose-100"
                        >
                          <XCircle className="h-3.5 w-3.5 text-rose-600" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {filteredAndSortedOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-gold/20">
              {/* Page size & count summary */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-ink/70">
                <span>
                  Showing{" "}
                  <strong className="text-pine-950 font-semibold">
                    {Math.min(
                      (safeCurrentPage - 1) * pageSize + 1,
                      filteredAndSortedOrders.length
                    )}
                  </strong>
                  {" "}to{" "}
                  <strong className="text-pine-950 font-semibold">
                    {Math.min(
                      safeCurrentPage * pageSize,
                      filteredAndSortedOrders.length
                    )}
                  </strong>
                  {" "}of{" "}
                  <strong className="text-pine-950 font-semibold">
                    {filteredAndSortedOrders.length}
                  </strong>
                  {" "}orders
                </span>

                <div className="flex items-center gap-1.5 pl-2 border-l border-gold/30">
                  <span className="text-[11px] text-ink/50">Per page:</span>
                  {[2, 5, 10, 20].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={`h-6 min-w-[24px] px-1.5 rounded-md text-[11px] font-semibold transition-all ${
                        pageSize === size
                          ? "bg-pine-900 text-cream shadow-xs"
                          : "bg-cream-paper text-ink/60 border border-gold/25 hover:bg-gold/15"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Numbered Page Buttons & Prev/Next */}
              {totalClientPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage <= 1}
                    aria-label="Previous page"
                    className="inline-flex items-center justify-center h-8 px-2.5 rounded-full border border-gold/30 bg-cream-paper text-xs font-semibold text-pine-900 transition-colors hover:bg-gold/15 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalClientPages }, (_, i) => i + 1).map((p) => {
                      if (
                        totalClientPages > 7 &&
                        Math.abs(p - safeCurrentPage) > 2 &&
                        p !== 1 &&
                        p !== totalClientPages
                      ) {
                        if (p === 2 || p === totalClientPages - 1) {
                          return (
                            <span key={p} className="px-1 text-xs text-ink/40">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`h-8 w-8 rounded-full text-xs font-semibold transition-all ${
                            safeCurrentPage === p
                              ? "bg-pine-900 text-cream shadow-sm"
                              : "bg-cream-paper text-ink/70 border border-gold/25 hover:bg-gold/15"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalClientPages, p + 1))}
                    disabled={safeCurrentPage >= totalClientPages}
                    aria-label="Next page"
                    className="inline-flex items-center justify-center h-8 px-2.5 rounded-full border border-gold/30 bg-cream-paper text-xs font-semibold text-pine-900 transition-colors hover:bg-gold/15 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER TIMELINE MODAL (GET /orders/:orderNumber/timeline) */}
      {/* ========================================================================= */}
      {selectedTimelineOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gold/30 bg-cream-paper p-6 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedTimelineOrder(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-ink/40 hover:bg-ink/10 hover:text-ink transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="pr-8">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gold/15 p-1.5 text-gold-deep">
                  <Truck className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-pine-900">
                  Shipment Tracking
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-pine-950 mt-1">
                Order #{selectedTimelineOrder.orderNumber || selectedTimelineOrder.id}
              </h3>
              <p className="text-xs text-ink/60 mt-0.5">
                Real-time milestone updates from our cold-press production facility to your doorstep.
              </p>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="mt-6 rounded-2xl border border-gold/20 bg-white/70 p-4">
              <div className="flex items-center justify-between text-[11px] font-semibold text-pine-950">
                <span>Placed</span>
                <span>Confirmed</span>
                <span>Packed</span>
                <span>Shipped</span>
                <span>Delivered</span>
              </div>
              {(() => {
                const currentStep = STATUS_CONFIG[selectedTimelineOrder.status]?.step || 1;
                const isCancelled = selectedTimelineOrder.status === "CANCELLED";
                const percentage = isCancelled
                  ? 100
                  : Math.max(10, Math.min(100, ((currentStep - 1) / 4) * 100));

                return (
                  <div className="relative mt-2.5 h-2 w-full overflow-hidden rounded-full bg-ink/10">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isCancelled
                          ? "bg-rose-500"
                          : "bg-gradient-to-r from-gold via-pine-700 to-pine-900"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                );
              })()}
              <div className="mt-2 flex items-center justify-between text-[10px] text-ink/50">
                <span>
                  Current Status:{" "}
                  <strong className="text-pine-950">
                    {STATUS_CONFIG[selectedTimelineOrder.status]?.label || selectedTimelineOrder.status}
                  </strong>
                </span>
                <span>Carrier: BlueDart / Delhivery</span>
              </div>
            </div>

            {/* Detailed Timeline Events Feed */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-pine-900">
                Activity Log
              </h4>

              {timelineLoading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-3 animate-pulse">
                      <div className="h-6 w-6 rounded-full bg-ink/10 flex-shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-32 bg-ink/10 rounded" />
                        <div className="h-2.5 w-48 bg-ink/5 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : timelineError ? (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
                  <p className="font-semibold">Unable to fetch live event stream.</p>
                  <p className="mt-1 text-ink/60">{timelineError}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenTimeline(selectedTimelineOrder)}
                    className="mt-2 text-xs font-bold text-pine-900 underline"
                  >
                    Try Refreshing Timeline
                  </button>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gold/30">
                  {timelineEvents.length > 0 ? (
                    timelineEvents.map((event, idx) => {
                      const eventDate = event.createdAt || event.timestamp || event.time;
                      const formattedTime = eventDate
                        ? new Date(eventDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now";

                      return (
                        <div key={idx} className="relative group">
                          {/* Node Icon */}
                          <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-pine-900 text-gold-light ring-4 ring-cream-paper shadow-2xs">
                            <Check className="h-3 w-3" />
                          </div>

                          <div className="rounded-2xl border border-ink/8 bg-white/80 p-3.5 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-pine-950">
                                {event.title || event.status || "Milestone Update"}
                              </span>
                              <span className="text-[10px] text-ink/50 whitespace-nowrap">
                                {formattedTime}
                              </span>
                            </div>

                            {(event.description || event.message) && (
                              <p className="mt-1 text-xs text-ink/75 leading-relaxed">
                                {event.description || event.message}
                              </p>
                            )}

                            {event.location && (
                              <div className="mt-2 flex items-center gap-1 text-[11px] text-ink/60">
                                <MapPin className="h-3 w-3 text-gold-deep" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Default baseline milestones if events list is fresh */
                    <>
                      <div className="relative">
                        <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-pine-900 text-gold-light ring-4 ring-cream-paper">
                          <Check className="h-3 w-3" />
                        </div>
                        <div className="rounded-2xl border border-ink/8 bg-white/80 p-3.5">
                          <span className="font-bold text-xs text-pine-950">
                            Order Placed & Confirmed
                          </span>
                          <p className="mt-1 text-xs text-ink/70">
                            Your order has been verified and registered in our Rajasthan production ledger.
                          </p>
                          <span className="mt-1.5 block text-[10px] text-ink/50">
                            {selectedTimelineOrder.createdAt
                              ? new Date(selectedTimelineOrder.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Recent"}
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-pine-950 ring-4 ring-cream-paper">
                          <Clock className="h-3 w-3" />
                        </div>
                        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-3.5">
                          <span className="font-bold text-xs text-pine-950">
                            Traditional Wood-Churn Pressing & Quality Dispatch
                          </span>
                          <p className="mt-1 text-xs text-ink/70">
                            Bottles are freshly filled in small batches to preserve natural pungency and antioxidants.
                          </p>
                          <span className="mt-1.5 block text-[10px] text-gold-deep font-semibold">
                            Estimated Dispatch: 24–48 Hours
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={() => handleDownloadInvoice(selectedTimelineOrder)}
                disabled={downloadingId === selectedTimelineOrder.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-white px-4 py-2 text-xs font-semibold text-pine-900 hover:bg-gold/15 transition-all disabled:opacity-50"
              >
                {downloadingId === selectedTimelineOrder.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-deep" />
                ) : (
                  <FileDown className="h-3.5 w-3.5 text-gold-deep" />
                )}
                <span>Download GST Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimelineOrder(null)}
                className="rounded-full bg-pine-900 px-5 py-2 text-xs font-semibold text-cream hover:bg-pine-950 transition-all"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANCEL ORDER MODAL (POST /orders/:orderNumber/cancel) */}
      {/* ========================================================================= */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-gold/30 bg-cream-paper p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-900 mb-2">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <h3 className="font-display text-lg font-bold">
                Cancel Order #{cancelModalOrder.orderNumber || cancelModalOrder.id}
              </h3>
            </div>
            <p className="text-xs text-ink/70">
              Are you sure you want to cancel this order? Any reserved inventory will be released and
              the cancellation request is irreversible.
            </p>

            <form onSubmit={handleCancelSubmit} className="mt-4 space-y-4">
              {/* Preset Reason Chips */}
              <div>
                <label className="block text-xs font-semibold text-pine-950 mb-2">
                  Select a reason for cancellation <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {CANCEL_PRESET_REASONS.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCancelReason(r)}
                      className={`w-full text-left rounded-xl border px-3 py-1.5 text-xs transition-all ${
                        cancelReason === r
                          ? "border-rose-400 bg-rose-50 text-rose-900 font-semibold"
                          : "border-ink/10 bg-white text-ink/80 hover:bg-ink/5"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-pine-950 mb-1">
                  Additional remarks or custom reason:
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us what went wrong so we can improve…"
                  rows={2}
                  required
                  className="w-full rounded-2xl border border-ink/20 bg-white p-3 text-xs text-ink outline-none focus:border-pine-800"
                />
              </div>

              {cancelError && (
                <p className="text-xs text-rose-600 font-medium">{cancelError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  disabled={cancelLoading}
                  className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold text-ink hover:bg-ink/5"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading || !cancelReason.trim()}
                  className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 shadow-md transition-all"
                >
                  {cancelLoading ? "Cancelling…" : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
