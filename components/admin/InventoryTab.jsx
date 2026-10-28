"use client";

import { useEffect, useState, useCallback } from "react";
import { admin, rupees, formatApiError } from "@/lib/api";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  History,
  Search,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function InventoryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState("");

  // Modals
  const [adjustItem, setAdjustItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);

  const fetchInventory = useCallback(async (lowStock = lowStockOnly) => {
    setLoading(true);
    setError("");
    try {
      const data = await admin.inventory({ lowStockOnly: lowStock ? "true" : "false" });
      setItems(data || []);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [lowStockOnly]);

  useEffect(() => {
    fetchInventory(lowStockOnly);
  }, [fetchInventory, lowStockOnly]);

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.sku?.toLowerCase().includes(q) ||
      item.productName?.toLowerCase().includes(q) ||
      item.label?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inventory & Stock</h2>
          <p className="text-xs text-slate-500">
            Real-time variant inventory levels, cart reservations, thresholds, and replenishment logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Low stock toggle */}
          <button
            type="button"
            onClick={() => setLowStockOnly((p) => !p)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              lowStockOnly
                ? "bg-amber-600 text-white shadow-sm"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Low Stock Only</span>
          </button>

          <button
            type="button"
            onClick={() => fetchInventory(lowStockOnly)}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
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

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by SKU or Product name…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">SKU / Code</th>
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">Variant Size</th>
                <th className="px-5 py-3.5 text-center">Physical Stock</th>
                <th className="px-5 py-3.5 text-center">Reserved</th>
                <th className="px-5 py-3.5 text-center">Available</th>
                <th className="px-5 py-3.5 text-center">Threshold</th>
                <th className="px-5 py-3.5">Stock Health</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading inventory data…
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Package className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-900">No inventory entries found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Inventory from your live API will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const available = (item.stock || 0) - (item.reserved || 0);
                  const isLow = available <= (item.lowStockThreshold || 0);
                  const isOut = available <= 0;

                  return (
                    <tr key={item.variantId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{item.sku}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{item.productName}</td>
                      <td className="px-5 py-3.5 text-slate-500">{item.label}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-900">{item.stock}</td>
                      <td className="px-5 py-3.5 text-center text-slate-500">
                        {item.reserved > 0 ? (
                          <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            {item.reserved}
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`text-sm font-bold ${
                            isOut
                              ? "text-rose-600"
                              : isLow
                              ? "text-amber-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {available}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-slate-400">
                        {item.lowStockThreshold}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            isOut
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isLow
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOut ? "bg-rose-600" : isLow ? "bg-amber-600" : "bg-emerald-600"
                            }`}
                          />
                          {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAdjustItem(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                            title="Adjust Stock Quantity"
                          >
                            <span>Adjust</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setHistoryItem(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-800 hover:bg-slate-50"
                            title="View Stock Movement Logs"
                          >
                            <History className="h-3.5 w-3.5" />
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
      </div>

      {/* MODAL 1: Adjust Stock */}
      {adjustItem && (
        <AdjustStockModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onSuccess={() => {
            setAdjustItem(null);
            setSuccess(`Stock for ${adjustItem.sku} was adjusted successfully!`);
            fetchInventory(lowStockOnly);
            setTimeout(() => setSuccess(""), 4000);
          }}
        />
      )}

      {/* MODAL 2: Movement Logs */}
      {historyItem && (
        <MovementLogsModal item={historyItem} onClose={() => setHistoryItem(null)} />
      )}
    </div>
  );
}

/* ------------------- MODAL: Adjust Stock (POST /admin/inventory/:id/adjust) ------------------- */
function AdjustStockModal({ item, onClose, onSuccess }) {
  const [mode, setMode] = useState("change"); // 'change' (delta) or 'setTo' (absolute)
  const [change, setChange] = useState("");
  const [setTo, setSetTo] = useState("");
  const [reason, setReason] = useState("New batch received");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quickReasons = [
    "New batch received",
    "Stock-take",
    "Damaged in transit",
    "Customer return restock",
    "Warehouse audit correction",
  ];

  const currentStock = Number(item.stock) || 0;
  const computedResult =
    mode === "change"
      ? currentStock + (parseInt(change, 10) || 0)
      : setTo !== ""
      ? parseInt(setTo, 10) || 0
      : currentStock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let payload = {};
    if (mode === "change") {
      const parsedChange = parseInt(change, 10);
      if (isNaN(parsedChange) || parsedChange === 0) {
        setError("Please enter a valid non-zero change amount (e.g. 25, -5).");
        return;
      }
      // Matches Screenshot 2: { "change": 25, "reason": "New batch received" }
      payload = {
        change: parsedChange,
        reason: reason.trim() || "Stock adjustment",
      };
    } else {
      const parsedSetTo = parseInt(setTo, 10);
      if (isNaN(parsedSetTo) || parsedSetTo < 0) {
        setError("Please enter a valid non-negative stock count (e.g. 120).");
        return;
      }
      // Matches Screenshot 3: { "setTo": 120, "reason": "Stock-take" }
      payload = {
        setTo: parsedSetTo,
        reason: reason.trim() || "Stock-take",
      };
    }

    setLoading(true);
    try {
      await admin.adjustInventory(item.variantId, payload);
      onSuccess();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Adjust Stock</h3>
            <p className="text-[11px] text-slate-500 truncate">
              {item.productName} &bull; {item.label} ({item.sku})
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current status stats */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs flex justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Current Stock</span>
            <p className="text-lg font-bold text-slate-900">{currentStock}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Reserved</span>
            <p className="text-lg font-bold text-amber-700">{item.reserved || 0}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold">New Total Stock</span>
            <p className={`text-lg font-bold ${computedResult < currentStock ? "text-rose-600" : "text-emerald-700"}`}>
              {computedResult}
            </p>
          </div>
        </div>

        {/* Adjustment mode selector */}
        <div className="mt-4 flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("change");
              setReason("New batch received");
            }}
            className={`flex-1 rounded-lg py-1.5 text-center transition-all ${
              mode === "change"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Adjust by Delta (± Quantity)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("setTo");
              setReason("Stock-take");
            }}
            className={`flex-1 rounded-lg py-1.5 text-center transition-all ${
              mode === "setTo"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Set Exact Stock (setTo)
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === "change" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Change (positive to add, negative to deduct) *
              </label>
              <input
                type="number"
                value={change}
                onChange={(e) => setChange(e.target.value)}
                placeholder="e.g. 25 or -10"
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-bold"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Payload: <code>{`{ "change": ${change || 25}, "reason": "${reason}" }`}</code>
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Physical Stock (setTo) *
              </label>
              <input
                type="number"
                min="0"
                value={setTo}
                onChange={(e) => setSetTo(e.target.value)}
                placeholder="e.g. 120"
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-bold"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Payload: <code>{`{ "setTo": ${setTo || 120}, "reason": "${reason}" }`}</code>
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. New batch received or Stock-take"
              required
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickReasons.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => setReason(qr)}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    reason === qr
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Updating…" : "Apply Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------- MODAL: Movement Logs (GET /admin/inventory/:id/movements) ------------------- */
function MovementLogsModal({ item, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await admin.inventoryMovements(item.variantId);
        setMovements(Array.isArray(res) ? res : res?.items || res?.movements || []);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [item.variantId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Stock Movement History</h3>
            <p className="text-[11px] text-slate-500 truncate">
              {item.productName} &bull; {item.label} ({item.sku})
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
            {error}
          </div>
        )}

        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <p className="py-8 text-center text-xs text-slate-400">Loading movements…</p>
          ) : movements.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">No stock movements recorded yet for this SKU.</p>
          ) : (
            movements.map((m, idx) => {
              const changeVal =
                m.change != null
                  ? Number(m.change)
                  : m.delta != null
                  ? Number(m.delta)
                  : Number(m.quantity) || 0;
              const isPositive = changeVal > 0;
              const dateStr = m.createdAt
                ? new Date(m.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              const endingStock = m.finalStock ?? m.endingStock ?? m.newStock ?? m.stock;

              return (
                <div
                  key={m.id || idx}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold ${
                        isPositive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {m.reason || (isPositive ? "Stock Added" : "Stock Deducted")}
                      </p>
                      <p className="text-[10px] text-slate-400">{dateStr}</p>
                      {m.notes && <p className="text-[10px] text-slate-600 mt-0.5">{m.notes}</p>}
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        isPositive ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isPositive ? `+${changeVal}` : changeVal}
                    </p>
                    {endingStock != null && (
                      <p className="text-[10px] text-slate-400">Balance: {endingStock}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
