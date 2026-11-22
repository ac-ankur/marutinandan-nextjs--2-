"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { orders as ordersApi, returns as returnsApi, rupees, formatApiError } from "@/lib/api";
import ReturnClaimModal from "@/components/returns/ReturnClaimModal";
import ReturnStatusModal from "@/components/returns/ReturnStatusModal";
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
  COD_CONFIRMED: {
    label: "COD Confirmed",
    color: "bg-amber-500/15 text-amber-800 border-amber-500/30",
    icon: CheckCircle2,
    step: 2,
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

const RETURN_STATUS_COLORS = {
  SUBMITTED: "border-sky-200 bg-sky-50 text-sky-800",
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
  PICKUP_SCHEDULED: "border-indigo-200 bg-indigo-50 text-indigo-800",
  PICKUP_FAILED: "border-rose-200 bg-rose-50 text-rose-800",
  RECEIVED: "border-teal-200 bg-teal-50 text-teal-800",
  INSPECTED: "border-violet-200 bg-violet-50 text-violet-800",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function findReturnCaseForOrder(cases, order) {
  return cases.find((claim) => {
    const claimOrderId = claim.orderId || claim.order?.id || claim.order?.orderId;
    const claimOrderNumber = claim.orderNumber || claim.order?.orderNumber || claim.orderRef;
    return (claimOrderId && String(claimOrderId) === String(order.id)) ||
      (claimOrderNumber && order.orderNumber && String(claimOrderNumber) === String(order.orderNumber));
  }) || null;
}

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
  const [returnCases, setReturnCases] = useState([]);

  // Cancellation State (POST /orders/:orderNumber/cancel)
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [returnClaimOrder, setReturnClaimOrder] = useState(null);
  const [returnStatusSelection, setReturnStatusSelection] = useState(null);

  // Timeline State (GET /orders/:orderNumber/timeline)
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [activeTimelineEventIndex, setActiveTimelineEventIndex] = useState(0);
  const [timelineError, setTimelineError] = useState("");

  // Invoice State (GET /orders/:orderNumber/invoice)
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");
  const [refreshingOrderId, setRefreshingOrderId] = useState(null);

  const refreshReturnCases = useCallback(async () => {
    try {
      const result = await returnsApi.list();
      const list = Array.isArray(result) ? result : result?.returnCases || result?.items || result?.claims || [];
      setReturnCases(list);
      return list;
    } catch {
      return [];
    }
  }, []);

  // Fetch orders list (GET /orders?page=1&pageSize=10)
  const fetchOrders = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await ordersApi.list(targetPage, 10);
      const orderItems = res.items || [];
      // The list response may omit return eligibility and purchased order-item IDs.
      // Load full details for delivered orders so eligible claims can be shown and submitted.
      const [enrichedOrders] = await Promise.all([Promise.all(orderItems.map(async (order) => {
        const missingItemIds = !Array.isArray(order.items) || order.items.some((item) => !item.id);
        const eligibilityMissing = typeof order.canRequestReturn !== "boolean";
        if (order.status !== "DELIVERED" || (!eligibilityMissing && (order.canRequestReturn === false || !missingItemIds))) return order;
        try {
          const details = await ordersApi.get(order.orderNumber || order.id);
          return { ...order, ...details };
        } catch {
          return order;
        }
      })), refreshReturnCases()]);
      setOrders(enrichedOrders);
      setMeta(res.meta || null);
      setPage(targetPage);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [refreshReturnCases]);

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
    setActiveTimelineEventIndex(0);
    try {
      const orderIdentifier = order.orderNumber || order.id;
      const data = await ordersApi.timeline(orderIdentifier);
      const list = Array.isArray(data)
        ? data
        : data?.timeline || data?.events || data?.history || [];
      setTimelineEvents(list);
      setActiveTimelineEventIndex(Math.max(0, list.length - 1));
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
      const result = await ordersApi.cancel(orderIdentifier, cancelReason.trim());
      const cancellation = result?.shiprocketCancellation || result?.order?.shiprocketCancellation;
      const cancellationStatus = cancellation?.status;
      const cancellationMessage = cancellationStatus === "CANCEL_FAILED"
        ? " Shiprocket cancellation failed and will be retried automatically."
        : cancellationStatus === "CANCEL_PENDING"
          ? " Shiprocket cancellation is pending and will be attempted when the remote order is ready."
          : cancellationStatus
            ? ` Shiprocket cancellation: ${cancellationStatus}.`
            : "";
      setActionSuccess(`Order #${cancelModalOrder.orderNumber || cancelModalOrder.id} has been cancelled.${cancellationMessage}`);
      setCancelModalOrder(null);
      setCancelReason("");
      if (selectedTimelineOrder?.id === cancelModalOrder.id) {
        setSelectedTimelineOrder(null);
      }
      const latest = await ordersApi.get(orderIdentifier).catch(() => null);
      if (latest) setOrders((current) => current.map((order) => order.id === latest.id ? { ...order, ...latest } : order));
      await fetchOrders(page);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err) {
      setCancelError(formatApiError(err));
    } finally {
      setCancelLoading(false);
    }
  };

  const refreshOrder = async (order) => {
    setRefreshingOrderId(order.id);
    try {
      const latest = await ordersApi.get(order.orderNumber || order.id);
      setOrders((current) => current.map((item) => item.id === latest.id ? { ...item, ...latest } : item));
      if (selectedTimelineOrder?.id === latest.id) setSelectedTimelineOrder((current) => ({ ...current, ...latest }));
      await refreshReturnCases();
      setActionSuccess(`Order #${order.orderNumber || order.id} details and refund status refreshed.`);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setRefreshingOrderId(null);
    }
  };

  const refreshReturnRefundStatus = async (order) => {
    const latestOrder = await ordersApi.get(order.orderNumber || order.id);
    setOrders((current) => current.map((item) => item.id === latestOrder.id ? { ...item, ...latestOrder } : item));
    const result = await returnsApi.list();
    const latestCases = Array.isArray(result) ? result : result?.returnCases || result?.items || result?.claims || [];
    setReturnCases(latestCases);
    const latestSelection = {
      order: latestOrder,
      returnCase: findReturnCaseForOrder(latestCases, latestOrder),
    };
    setReturnStatusSelection(latestSelection);
    return latestSelection;
  };

  // Dynamic counts for status tabs
  const counts = useMemo(() => {
    let active = 0;
    let delivered = 0;
    let cancelled = 0;
    orders.forEach((o) => {
      if (["PENDING", "COD_CONFIRMED", "PAID", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)) {
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
          if (!["PENDING", "COD_CONFIRMED", "PAID", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)) {
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
            const returnCase = findReturnCaseForOrder(returnCases, order);

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
                        {returnCase?.status && (
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${RETURN_STATUS_COLORS[returnCase.status] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
                            <RotateCcw className="h-3 w-3" />
                            <span>Return: {String(returnCase.status).replaceAll("_", " ")}</span>
                          </span>
                        )}
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
                      {order.refundStatus && (
                        <span className="mt-1 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-800">
                          Refund Status: {String(order.refundStatus).replaceAll("_", " ")}
                        </span>
                      )}
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
                            <span>Payment</span>
                            <span className="font-medium text-pine-950">{["COD", "CASH_ON_DELIVERY"].includes(String(order.paymentMethod || "").toUpperCase()) ? (order.status === "DELIVERED" ? "Cash on delivery" : "Cash on delivery (unpaid)") : "Online"}</span>
                          </div>
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
                            <span>Order total</span>
                            <span>{order.total || rupees(order.totalPaise)}</span>
                          </div>
                          {order.refundStatus && (
                            <div className="mt-2 space-y-1.5 border-t border-ink/10 pt-2">
                              <div className="flex justify-between gap-2 font-semibold text-indigo-900">
                                <span>Refund status</span><span>{String(order.refundStatus).replaceAll("_", " ")}</span>
                              </div>
                              {order.totalRefundedPaise != null && <div className="flex justify-between text-ink/70"><span>Total refunded</span><span>{rupees(order.totalRefundedPaise)}</span></div>}
                              {(order.refunds || []).map((refund) => (
                                <div key={refund.id} className="flex flex-wrap justify-between gap-x-3 text-[11px] text-ink/60">
                                  <span>Refund {refund.status?.toLowerCase()} · {refund.createdAt ? new Date(refund.createdAt).toLocaleDateString("en-IN") : ""}</span>
                                  <span>{rupees(refund.amountPaise)}</span>
                                </div>
                              ))}
                              {order.refundStatus === "PENDING" && <p className="text-[11px] leading-relaxed text-ink/60">Once processed, your bank may take 5–7 business days to reflect the refund.</p>}
                              {order.refundStatus === "FAILED" && <p className="text-[11px] leading-relaxed text-rose-700">The refund attempt failed. Please contact customer support for help.</p>}
                            </div>
                          )}
                        </div>
                      </div>
                      {(order.shiprocketCancellation || order.shipments?.length > 0) && (
                        <div className="rounded-2xl border border-ink/8 bg-cream/50 p-3.5 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-pine-950">Shipping provider status</p>
                            <button
                              type="button"
                              onClick={() => refreshOrder(order)}
                              disabled={refreshingOrderId === order.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-pine-900/20 bg-white px-3 py-1.5 text-[11px] font-semibold text-pine-900 hover:bg-pine-900/5 disabled:opacity-50"
                            >
                              <RefreshCw className={`h-3 w-3 ${refreshingOrderId === order.id ? "animate-spin" : ""}`} />
                              Refresh shipment status
                            </button>
                          </div>
                          {order.shiprocketCancellation?.status && (
                            <p className="mt-2 text-ink/70">Shiprocket cancellation: <span className="font-semibold text-pine-950">{order.shiprocketCancellation.status}</span></p>
                          )}
                          {Array.isArray(order.shipments) && order.shipments.length > 0 && (
                            <ul className="mt-2 space-y-1 text-ink/70">
                              {order.shipments.map((shipment, index) => (
                                <li key={shipment.id || index} className="rounded-lg bg-white/70 px-3 py-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold text-pine-950">{shipment.courier || shipment.courierName || shipment.provider || "Shiprocket"}</span>
                                    <span>{shipment.trackingStatus || shipment.status || "Status unavailable"}</span>
                                  </div>
                                  {shipment.awb && <p className="mt-1">AWB: <span className="font-medium text-pine-950">{shipment.awb}</span></p>}
                                  {shipment.trackingUrl && <a href={shipment.trackingUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold text-pine-800 underline">Track with courier</a>}
                                </li>
                              ))}
                            </ul>
                          )}
                          {/* {order.status === "CANCELLED" && <p className="mt-2 text-[11px] leading-5 text-ink/60">If a courier or AWB was already booked manually, cancel that shipment in the Shiprocket dashboard too.</p>} */}
                        </div>
                      )}
                    </div>
                  )}

                  {order.status === "CANCELLED" && !order.refundStatus && (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                      Cancellation does not start a refund automatically. Refund progress will appear here once processing begins.
                    </p>
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
                      {(returnCase || order.refundStatus || order.refunds?.length || ["DELIVERED", "CANCELLED"].includes(order.status)) && (
                        <button
                          type="button"
                          onClick={() => setReturnStatusSelection({ order, returnCase })}
                          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-900 transition hover:bg-indigo-100"
                        >
                          <Search className="h-3.5 w-3.5" />
                          <span>Check Return / Refund Status</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => refreshOrder(order)}
                        disabled={refreshingOrderId === order.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-1.5 font-semibold text-ink/70 transition hover:bg-ink/5 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshingOrderId === order.id ? "animate-spin" : ""}`} />
                        <span>Refresh order</span>
                      </button>

                      {/* Order Timeline (GET /orders/:orderNumber/timeline) */}
                      <button
                        type="button"
                        onClick={() => handleOpenTimeline(order)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-pine-900/25 bg-pine-900/5 px-3 py-1.5 font-semibold text-pine-900 shadow-2xs transition-all hover:bg-pine-900 hover:text-cream"
                      >
                        <Activity className="h-3.5 w-3.5 text-gold-deep" />
                        <span>Track Timeline</span>
                      </button>

                      {/* Cancelled orders should not offer an invoice download. */}
                      {order.status !== "CANCELLED" && <button
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
                      </button>}

                      {/* Cancel Order (POST /orders/:orderNumber/cancel) */}
                      {(order.canCancel ?? ["PENDING", "COD_CONFIRMED", "PAID"].includes(order.status)) && (
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

                      {order.canRequestReturn === true && (
                        <button
                          type="button"
                          onClick={() => setReturnClaimOrder(order)}
                          className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Return / Report damage</span>
                        </button>
                      )}
                      {order.status === "DELIVERED" && order.canRequestReturn === false && (
                        <span className="text-[10px] text-ink/50">Damage or leak claims are available within 24 hours of delivery.</span>
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
      {selectedTimelineOrder && typeof document !== "undefined" && createPortal(
        <div style={{ zIndex: 9999 }} className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black/60 p-3 backdrop-blur-xs sm:p-5">
          <div data-lenis-prevent className="relative flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-gold/30 bg-cream-paper shadow-2xl">
            {/* Modal Header */}
            <header className="relative flex flex-shrink-0 items-start justify-between gap-4 border-b border-ink/10 px-5 py-4 sm:px-8 sm:py-5">
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
              <button
                type="button"
                onClick={() => setSelectedTimelineOrder(null)}
                aria-label="Close shipment tracking"
                className="absolute right-4 top-4 rounded-full p-1.5 text-ink/40 transition-colors hover:bg-ink/10 hover:text-ink sm:right-6 sm:top-5"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="cart-drawer-scroll min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
            {/* Visual Step Progress Bar */}
            <div className="rounded-2xl border border-gold/20 bg-white/70 p-4">
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
      {selectedTimelineOrder.status === "CANCELLED" && !selectedTimelineOrder.refundStatus && (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                      Cancellation does not start a refund automatically. Refund progress will appear here once processing begins.
                    </p>
                  )}
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
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-pine-900">
                Activity Log
              </h4>

              {timelineLoading ? (
                <div className="space-y-4 py-2 animate-pulse">
                  <div className="flex justify-between gap-3">
                    {[1, 2, 3, 4].map((n) => <div key={n} className="h-9 w-9 rounded-full bg-ink/10" />)}
                  </div>
                  <div className="h-32 rounded-2xl bg-ink/5" />
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
              ) : timelineEvents.length > 0 ? (
                <>
                  <div className="relative overflow-x-auto px-1 pb-2 pt-1">
                    <div className="absolute left-5 right-5 top-[1.15rem] h-0.5 bg-gold/35" />
                    <div className="relative flex min-w-max gap-2 sm:min-w-0 sm:gap-0">
                      {timelineEvents.map((event, idx) => {
                        const isActive = idx === activeTimelineEventIndex;
                        const isComplete = idx <= activeTimelineEventIndex;
                        return (
                          <button
                            key={event.id || idx}
                            type="button"
                            onClick={() => setActiveTimelineEventIndex(idx)}
                            aria-pressed={isActive}
                            className="group flex min-w-[112px] flex-1 flex-col items-center px-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-700 sm:min-w-0"
                          >
                            <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                              isActive
                                ? "border-pine-900 bg-pine-900 text-gold-light shadow-md ring-4 ring-pine-900/10"
                                : isComplete
                                  ? "border-pine-800 bg-pine-800 text-white"
                                  : "border-gold/50 bg-cream-paper text-ink/40"
                            }`}>
                              {isComplete ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs font-semibold">{idx + 1}</span>}
                            </span>
                            <span className={`mt-2 line-clamp-2 max-w-32 text-[11px] leading-snug ${isActive ? "font-bold text-pine-950" : "font-medium text-ink/60"}`}>
                              {event.title || event.status || "Order update"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(() => {
                    const event = timelineEvents[activeTimelineEventIndex] || timelineEvents[timelineEvents.length - 1];
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
                    const eventBody = event.body || event.description || event.message;

                    return (
                      <article className="mt-4 rounded-2xl border border-gold/25 bg-white/80 p-5 shadow-sm sm:p-6" aria-live="polite">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pine-900/5 text-pine-900">
                              <Activity className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-pine-800">Update {activeTimelineEventIndex + 1} of {timelineEvents.length}</p>
                              <h5 className="mt-0.5 font-display text-lg font-bold leading-snug text-pine-950">
                                {event.title || event.status || "Order update"}
                              </h5>
                            </div>
                          </div>
                          <time className="rounded-full bg-cream-paper px-3 py-1.5 text-[11px] font-medium text-ink/60">
                            {formattedTime}
                          </time>
                        </div>
                        {eventBody && <p className="mt-4 border-t border-ink/8 pt-4 text-sm leading-relaxed text-ink/75">{eventBody}</p>}
                        {event.location && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-ink/60">
                            <MapPin className="h-3.5 w-3.5 text-gold-deep" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </article>
                    );
                  })()}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-gold/40 bg-white/50 px-5 py-8 text-center">
                  <Truck className="mx-auto h-6 w-6 text-gold-deep" />
                  <p className="mt-2 text-sm font-semibold text-pine-950">No tracking updates yet</p>
                  <p className="mt-1 text-xs text-ink/60">New order milestones will appear here as they become available.</p>
                </div>
              )}
            </div>

            </div>

            {/* Modal Bottom Actions */}
            <footer className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-cream-paper px-5 py-4 sm:px-8">
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
            </footer>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* CANCEL ORDER MODAL (POST /orders/:orderNumber/cancel) */}
      {/* ========================================================================= */}
      {cancelModalOrder && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => event.target === event.currentTarget && !cancelLoading && setCancelModalOrder(null)}
        >
          <section
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            className="flex max-h-[min(90dvh,800px)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-gold/30 bg-cream-paper shadow-2xl"
          >
            <header className="flex flex-shrink-0 items-start gap-3 border-b border-ink/10 px-5 py-4 sm:px-7">
              <span className="mt-0.5 rounded-full bg-rose-50 p-2">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </span>
              <h3 id="cancel-order-title" className="min-w-0 flex-1 pt-1 font-display text-xl font-bold leading-snug text-rose-900 sm:text-2xl">
                Cancel Order #{cancelModalOrder.orderNumber || cancelModalOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                disabled={cancelLoading}
                aria-label="Close cancellation dialog"
                className="rounded-full p-2 text-ink/50 transition hover:bg-ink/5 hover:text-ink disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={handleCancelSubmit} className="flex min-h-0 flex-1 flex-col">
              <div data-lenis-prevent className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
               


                <div>
                  <label className="mb-3 block text-sm font-semibold text-pine-950">
                    Select a reason for cancellation <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {CANCEL_PRESET_REASONS.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCancelReason(r)}
                        aria-pressed={cancelReason === r}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm leading-snug transition-all ${
                          cancelReason === r
                            ? "border-rose-400 bg-rose-50 text-rose-900 font-semibold shadow-sm"
                            : "border-ink/10 bg-white text-ink/80 hover:border-gold/50 hover:bg-gold/5"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-pine-950">
                    Reason details
                    <span className="ml-1 font-normal text-ink/50">(edit or add context)</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Tell us what went wrong so we can improve…"
                    rows={3}
                    required
                    className="w-full resize-y rounded-2xl border border-ink/15 bg-white p-4 text-sm leading-relaxed text-ink outline-none transition focus:border-pine-800 focus:ring-2 focus:ring-pine-800/10"
                  />
                </div>

                {cancelError && <p className="text-xs font-medium text-rose-600">{cancelError}</p>}
              </div>

              <footer className="flex flex-shrink-0 flex-col-reverse gap-3 border-t border-ink/10 bg-white/40 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  disabled={cancelLoading}
                  className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5 sm:py-2.5"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading || !cancelReason.trim()}
                  className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5"
                >
                  {cancelLoading ? "Cancelling…" : "Confirm Cancellation"}
                </button>
              </footer>
            </form>
          </section>
        </div>,
        document.body
      )}

      {returnClaimOrder && (
        <ReturnClaimModal
          order={returnClaimOrder}
          onClose={() => setReturnClaimOrder(null)}
          onSubmitted={async (submittedCase) => {
            setReturnClaimOrder(null);
            const latest = await ordersApi.get(returnClaimOrder.orderNumber || returnClaimOrder.id).catch(() => null);
            if (latest) setOrders((current) => current.map((order) => order.id === latest.id ? { ...order, ...latest } : order));
            await refreshReturnCases();
            if (submittedCase?.id) {
              const linkedCase = {
                ...submittedCase,
                orderId: submittedCase.orderId || returnClaimOrder.id,
                orderNumber: submittedCase.orderNumber || returnClaimOrder.orderNumber,
              };
              setReturnCases((current) => [linkedCase, ...current.filter((claim) => claim.id !== linkedCase.id)]);
            }
            await fetchOrders(page);
            setActionSuccess("Your claim was submitted for review. We’ll update its status in My Returns.");
            setTimeout(() => setActionSuccess(""), 6000);
          }}
        />
      )}

      {returnStatusSelection && (
        <ReturnStatusModal
          order={returnStatusSelection.order}
          returnCase={returnStatusSelection.returnCase}
          onClose={() => setReturnStatusSelection(null)}
          onRefresh={() => refreshReturnRefundStatus(returnStatusSelection.order)}
        />
      )}
    </div>
  );
}
