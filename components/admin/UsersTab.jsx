"use client";

import { useEffect, useState, useCallback } from "react";
import { admin, formatApiError } from "@/lib/api";
import {
  Users,
  Search,
  Shield,
  Award,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockLoading, setBlockLoading] = useState(false);

  const fetchUsers = useCallback(
    async (targetPage = 1, role = roleFilter, searchQuery = search) => {
      setLoading(true);
      setError("");
      try {
        const params = { page: targetPage, pageSize: 20 };
        if (role && role !== "ALL") params.role = role;
        if (searchQuery.trim()) params.search = searchQuery.trim();
        const res = await admin.users(params);
        setUsers(res.items || []);
        setMeta(res.meta || null);
        setPage(targetPage);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [roleFilter, search]
  );

  useEffect(() => {
    fetchUsers(1, roleFilter, search);
  }, [fetchUsers, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1, roleFilter, search);
  };

  const handleToggleBlock = async (user) => {
    const nextBlock = !user.isBlocked;
    const actionWord = nextBlock ? "block" : "unblock";
    let reason = "";
    if (nextBlock) {
      reason = prompt(`Please specify a reason to block ${user.email}:`);
      if (reason === null) return; // user cancelled
    }
    setBlockLoading(true);
    try {
      await admin.toggleBlockUser(user.id, nextBlock, reason);
      setSuccess(`User ${user.email} has been ${actionWord}ed.`);
      fetchUsers(page, roleFilter, search);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBlockLoading(false);
    }
  };

  const inspectUser = async (u) => {
    try {
      const details = await admin.user(u.id);
      setSelectedUser(details);
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Users & Customers</h2>
          <p className="text-xs text-slate-500">
            View registered customer accounts, roles, addresses, and access permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(page, roleFilter, search)}
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
        {/* Role pills */}
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { key: "ALL", label: "All Users" },
            { key: "CUSTOMER", label: "Customers" },
            { key: "ADMIN", label: "Administrators" },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setRoleFilter(pill.key)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                roleFilter === pill.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
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

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-900">No users found</p>
                    <p className="mt-1 text-[11px] text-slate-400">User accounts from your live API will appear here.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isAdmin = u.role?.toUpperCase() === "ADMIN";
                  const dateStr = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            isAdmin
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isAdmin ? (
                            <Shield className="h-3 w-3 text-purple-600" />
                          ) : (
                            <Award className="h-3 w-3 text-emerald-600" />
                          )}
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{u.phone || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-400">{dateStr}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            u.isBlocked
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {u.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => inspectUser(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                            title="Inspect User Details"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Details</span>
                          </button>

                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(u)}
                              disabled={blockLoading}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                                u.isBlocked
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                  : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              }`}
                            >
                              {u.isBlocked ? "Unblock" : "Block"}
                            </button>
                          )}
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
              Showing page {page} of {meta.totalPages} ({meta.total} users)
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => fetchUsers(page - 1, roleFilter, search)}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-slate-300 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchUsers(page + 1, roleFilter, search)}
                disabled={page >= meta.totalPages || loading}
                className="rounded-lg border border-slate-300 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: User Details */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedUser.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Role</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedUser.role}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Phone</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedUser.phone || "None"}</p>
                </div>
              </div>

              {/* Saved addresses */}
              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                  <p className="font-bold text-slate-900">Saved Addresses</p>
                  {selectedUser.addresses.map((a, i) => (
                    <div key={i} className="text-[11px] text-slate-600 border-b border-slate-200 pb-1.5 last:border-0">
                      <p className="font-semibold text-slate-900">{a.fullName}</p>
                      <p>{a.line1}, {a.city}, {a.state} - {a.postalCode}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Order stats */}
              {selectedUser.orders && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="font-bold text-slate-900 mb-1.5">Order History</p>
                  <p className="text-[11px] text-slate-600">
                    Total orders placed: <span className="font-bold text-slate-900">{selectedUser.orders.length}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg bg-slate-900 hover:bg-slate-800 px-5 py-2 text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
