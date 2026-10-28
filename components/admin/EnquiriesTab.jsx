"use client";

import { useEffect, useState, useCallback } from "react";
import { admin, formatApiError } from "@/lib/api";
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";

const STATUS_OPTS = [
  { val: "NEW", label: "New", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { val: "CONTACTED", label: "Contacted", color: "bg-sky-50 text-sky-800 border-sky-200" },
  { val: "CONVERTED", label: "Converted", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { val: "ARCHIVED", label: "Archived", color: "bg-slate-100 text-slate-600 border-slate-200" },
];

export default function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchEnquiries = useCallback(
    async (targetPage = 1, status = statusFilter, searchQuery = search) => {
      setLoading(true);
      setError("");
      try {
        const params = { page: targetPage, pageSize: 20 };
        if (status && status !== "ALL") params.status = status;
        if (searchQuery.trim()) params.search = searchQuery.trim();
        const res = await admin.enquiries(params);
        setEnquiries(res.items || []);
        setMeta(res.meta || null);
        setPage(targetPage);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search]
  );

  useEffect(() => {
    fetchEnquiries(1, statusFilter, search);
  }, [fetchEnquiries, statusFilter]);

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await admin.updateEnquiry(id, nextStatus);
      setSuccess("Enquiry status updated.");
      fetchEnquiries(page, statusFilter, search);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Enquiries</h2>
          <p className="text-xs text-slate-500">
            Review, follow up, and manage incoming retail and wholesale trade enquiries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchEnquiries(page, statusFilter, search)}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center self-start sm:self-auto rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          {[{ val: "ALL", label: "All" }, ...STATUS_OPTS].map((s) => (
            <button
              key={s.val}
              type="button"
              onClick={() => setStatusFilter(s.val)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                statusFilter === s.val
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchEnquiries(1, statusFilter, search);
          }}
          className="flex gap-2 max-w-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enquiries…"
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

      {/* Enquiries List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading enquiries…</div>
          ) : enquiries.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-900 text-sm">No enquiries found</p>
              <p className="mt-1 text-slate-400">Customer contact queries from your website will appear here.</p>
            </div>
          ) : (
            enquiries.map((enq) => {
              const dateStr = enq.createdAt
                ? new Date(enq.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              return (
                <div key={enq.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">{enq.name}</h4>
                        <span className="text-[11px] text-slate-400">({dateStr})</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                        {enq.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {enq.email}
                          </span>
                        )}
                        {enq.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {enq.phone}
                          </span>
                        )}
                        {enq.product && (
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                            Product: {enq.product}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm"
                      >
                        {STATUS_OPTS.map((opt) => (
                          <option key={opt.val} value={opt.val}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {enq.message && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="whitespace-pre-line leading-relaxed">{enq.message}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-xs">
            <span className="text-slate-500">
              Showing page {page} of {meta.totalPages} ({meta.total} enquiries)
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => fetchEnquiries(page - 1, statusFilter, search)}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-slate-300 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchEnquiries(page + 1, statusFilter, search)}
                disabled={page >= meta.totalPages || loading}
                className="rounded-lg border border-slate-300 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
