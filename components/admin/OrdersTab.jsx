"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { admin, rupees, formatApiError } from "@/lib/api";
import {
  ShoppingBag,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  MapPin,
  RefreshCw,
  X,
  FileDown,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  PAID: { label: "Paid", color: "bg-sky-50 text-sky-700 border-sky-200" },
  PACKED: { label: "Packed", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  SHIPPED: { label: "Shipped", color: "bg-purple-50 text-purple-700 border-purple-200" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-teal-50 text-teal-700 border-teal-200" },
  DELIVERED: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200" },
  REFUNDED: { label: "Refunded", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default function OrdersTab({ initialFilter = {} }) {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(initialFilter.status || "ALL");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchOrders = useCallback(
    async (targetPage = 1, statusFilter = status, searchQuery = search, from = fromDate, to = toDate) => {
      setLoading(true);
      setError("");
      try {
        const params = { page: targetPage, pageSize: 20 };
        if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (from) params.from = from;
        if (to) params.to = to;
        const res = await admin.orders(params);
        setOrders(res.items || res.orders || []);
        setMeta(res.meta || null);
        setPage(targetPage);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [status, search, fromDate, toDate]
  );

  useEffect(() => {
    fetchOrders(1, status, search, fromDate, toDate);
  }, [fetchOrders, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1, status, search, fromDate, toDate);
  };

  const handleResetFilters = () => {
    setStatus("ALL");
    setSearch("");
    setFromDate("");
    setToDate("");
    fetchOrders(1, "ALL", "", "", "");
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const q = {};
      if (status && status !== "ALL") q.status = status;
      if (fromDate) q.from = fromDate;
      if (toDate) q.to = toDate;
      await admin.exportOrdersCsv(q, `orders-export-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadInvoice = async (order) => {
    setDownloadingId(order.id);
    try {
      await admin.downloadInvoice(order.id, `invoice-${order.orderNumber || order.id}.pdf`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus, trackingNumber = null, notes = null) => {
    try {
      await admin.updateOrderStatus(orderId, {
        status: nextStatus,
        ...(trackingNumber ? { trackingNumber } : {}),
        ...(notes ? { notes } : {}),
      });
      setSuccess(`Order updated to ${nextStatus}.`);
      fetchOrders(page, status, search, fromDate, toDate);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(formatApiError(err));
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Orders & Fulfillment</h2>
          <p className="text-xs text-slate-500">
            Process payments, manage shipping dispatches, issue GST invoices, and track orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            title="Download CSV filtered by active status & dates"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>{exporting ? "Exporting…" : "Export CSV"}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchOrders(page, status, search, fromDate, toDate)}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter, Date Range, and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-sm">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { key: "ALL", label: "All Orders" },
            { key: "PENDING", label: "Pending" },
            { key: "PAID", label: "Paid" },
            { key: "PACKED", label: "Packed" },
            { key: "SHIPPED", label: "Shipped" },
            { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
            { key: "DELIVERED", label: "Delivered" },
            { key: "CANCELLED", label: "Cancelled" },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setStatus(pill.key)}
              className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-all ${
                status === pill.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Date Range & Search Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Date range pickers (from & to) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Dates:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 outline-none focus:border-emerald-600"
                title="From Date"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 outline-none focus:border-emerald-600"
                title="To Date"
              />
            </div>
            <button
              type="button"
              onClick={() => fetchOrders(1, status, search, fromDate, toDate)}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 text-xs transition-colors"
            >
              Apply Dates
            </button>
            {(fromDate || toDate || search || status !== "ALL") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-slate-700 underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order # or customer email…"
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Order Number</th>
                <th className="px-5 py-3.5">Date Placed</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5 text-center">Items</th>
                <th className="px-5 py-3.5 text-right">Total Amount</th>
                <th className="px-5 py-3.5">Order Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading orders…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <ShoppingBag className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-900">No orders found</p>
                    <p className="mt-1 text-[11px] text-slate-400">No orders matching the selected filter criteria.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || {
                    label: order.status,
                    color: "bg-slate-100 text-slate-700 border-slate-200",
                  };
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        #{order.orderNumber || order.id?.slice(-8)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{dateStr}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900 truncate max-w-[180px]">
                          {order.shippingAddress?.fullName || order.user?.name || "Customer"}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {order.user?.email || order.shippingAddress?.phone || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm font-bold text-slate-900">
                        {order.total || rupees(order.totalPaise || 0)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(order.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Inspect</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(order)}
                            disabled={downloadingId === order.id}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            title="Download Invoice PDF"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-xs">
            <span className="text-slate-500">
              Showing page {page} of {meta.totalPages} ({meta.total} orders)
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => fetchOrders(page - 1, status, search, fromDate, toDate)}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-slate-300 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchOrders(page + 1, status, search, fromDate, toDate)}
                disabled={page >= meta.totalPages || loading}
                className="rounded-lg border border-slate-300 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Order Detail & Status Workflow */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusUpdated={() => {
            fetchOrders(page, status, search, fromDate, toDate);
          }}
          onDownloadInvoice={handleDownloadInvoice}
          downloadingId={downloadingId}
        />
      )}
    </div>
  );
}

function ModalPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

/* ------------------- MODAL: Order Detail Drawer ------------------- */
function OrderDetailModal({ orderId, onClose, onStatusUpdated, onDownloadInvoice, downloadingId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [showStatusForm, setShowStatusForm] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Fetch complete fresh order info from GET /admin/orders/{{adminOrderId}}
  useEffect(() => {
    let active = true;
    async function loadOrder() {
      setLoading(true);
      setError("");
      try {
        const data = await admin.order(orderId);
        if (active) {
          setOrder(data);
          setNewStatus(data.status || "PENDING");
          setTrackingNumber(data.trackingNumber || "");
        }
      } catch (err) {
        if (active) setError(formatApiError(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadOrder();
    return () => {
      active = false;
    };
  }, [orderId]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setUpdating(true);
    setError("");
    try {
      const updated = await admin.updateOrderStatus(orderId, {
        status: newStatus,
        ...(trackingNumber ? { trackingNumber } : {}),
        ...(statusNotes ? { notes: statusNotes } : {}),
      });
      setOrder(updated);
      setShowStatusForm(false);
      onStatusUpdated();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setUpdating(false);
    }
  };

  const cfg = order ? (STATUS_CONFIG[order.status] || {
    label: order.status,
    color: "bg-slate-100 text-slate-700 border-slate-200",
  }) : null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
      <div
        data-lenis-prevent
        className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Order #{order?.orderNumber || orderId?.slice(-8)}
              </h3>
              {cfg && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cfg.color}`}
                >
                  {cfg.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading order details…</div>
          ) : !order ? (
            <div className="py-12 text-center text-xs text-slate-500">Order details unavailable.</div>
          ) : (
            <div className="space-y-5">
            {/* Fulfillment Status & Actions Bar */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">Order Status: {order.status}</p>
                  {order.trackingNumber && (
                    <p className="text-[11px] text-purple-700 font-medium">
                      Tracking # {order.trackingNumber}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusForm(!showStatusForm)}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm transition-colors"
                  >
                    {showStatusForm ? "Cancel Change" : "Update Status"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDownloadInvoice(order)}
                    disabled={downloadingId === order.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <FileDown className="h-3.5 w-3.5 text-slate-500" />
                    <span>{downloadingId === order.id ? "Downloading…" : "Invoice PDF"}</span>
                  </button>
                </div>
              </div>

              {/* Status Update Form (PATCH /admin/orders/:id/status) */}
              {showStatusForm && (
                <form
                  onSubmit={handleStatusSubmit}
                  className="pt-3 border-t border-slate-200 space-y-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Select New Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                        required
                      >
                        <option value="PENDING">PENDING (Pending Payment)</option>
                        <option value="PAID">PAID (Payment Verified)</option>
                        <option value="PACKED">PACKED (Ready to Ship)</option>
                        <option value="SHIPPED">SHIPPED (In Transit)</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Out for Delivery)</option>
                        <option value="DELIVERED">DELIVERED (Completed)</option>
                        <option value="CANCELLED">CANCELLED (Cancelled)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tracking Number / AWB (Optional)
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. BlueDart 987654321"
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Internal Notes / Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="e.g. Dispatched via express courier or cancellation reason"
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowStatusForm(false)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="rounded-lg bg-emerald-600 px-4 py-1 text-xs font-semibold text-white disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                    >
                      {updating ? "Saving…" : "Save Status"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Purchased Items ({order.items?.length || 0})</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 divide-y divide-slate-200">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.quantity}× {item.productName || item.product?.name || "Product"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Variant: {item.variantLabel || item.variant?.label || item.sku || "Standard"}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {rupees(item.lineTotalPaise || (item.unitPricePaise ? item.unitPricePaise * item.quantity : 0))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address & Pricing Grid */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              {/* Shipping Address */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>Shipping Address</span>
                </div>
                {order.shippingAddress ? (
                  <>
                    <p className="font-medium text-slate-800">
                      {order.shippingAddress.fullName || order.shippingAddress.name}
                    </p>
                    <p className="text-slate-500">
                      {order.shippingAddress.line1}
                      {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
                    </p>
                    <p className="text-slate-500">
                      {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    {order.shippingAddress.phone && (
                      <p className="mt-1 text-[11px] text-slate-400">Phone: {order.shippingAddress.phone}</p>
                    )}
                  </>
                ) : (
                  <p className="text-slate-400 italic">No shipping address recorded</p>
                )}
              </div>

              {/* Pricing summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">{rupees(order.subtotalPaise || 0)}</span>
                </div>
                {order.discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({order.couponCode || "COUPON"})</span>
                    <span>-{rupees(order.discountPaise)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-medium text-slate-800">
                    {order.shippingPaise === 0 ? "FREE" : rupees(order.shippingPaise || 0)}
                  </span>
                </div>
                {order.gstIncludedPaise > 0 && (
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                    <span>GST (5% Included)</span>
                    <span>{rupees(order.gstIncludedPaise)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                  <span>Total</span>
                  <span>{order.total || rupees(order.totalPaise || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Pinned Footer */}
        <div className="flex justify-end px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 hover:bg-slate-800 px-5 py-2 text-xs font-semibold text-white transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}
