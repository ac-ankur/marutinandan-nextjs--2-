"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = ["new", "contacted", "converted", "archived"];

export default function AdminDashboard({ initialEnquiries }) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      const matchesQuery =
        !query ||
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.phone.toLowerCase().includes(query.toLowerCase()) ||
        (e.email || "").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [enquiries, query, statusFilter]);

  async function updateStatus(id, status) {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    await fetch("/api/enquiry", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  async function logout() {
    await fetch("/api/admin-login", { method: "DELETE" });
    router.refresh();
  }

  const counts = useMemo(() => {
    const base = { total: enquiries.length, new: 0, contacted: 0, converted: 0, archived: 0 };
    enquiries.forEach((e) => {
      base[e.status] = (base[e.status] || 0) + 1;
    });
    return base;
  }, [enquiries]);

  return (
    <div className="min-h-screen bg-cream px-6 py-14 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Admin</p>
            <h1 className="mt-2 font-display text-4xl text-pine-900">Order Enquiries</h1>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm text-ink/70 hover:border-pine-800 hover:text-pine-800"
          >
            Log out
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Total" value={counts.total} />
          <StatCard label="New" value={counts.new || 0} accent />
          <StatCard label="Contacted" value={counts.contacted || 0} />
          <StatCard label="Converted" value={counts.converted || 0} />
          <StatCard label="Archived" value={counts.archived || 0} />
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, or email…"
            className="form-input max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input max-w-[200px]"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink/10 bg-cream-paper">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-[0.15em] text-ink/50">
                <th className="px-5 py-4 font-medium">Received</th>
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Contact</th>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Qty</th>
                <th className="px-5 py-4 font-medium">Message</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-ink/40">
                    No enquiries yet. New submissions from the contact form will appear here.
                  </td>
                </tr>
              )}
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-ink/5 align-top last:border-0">
                  <td className="whitespace-nowrap px-5 py-4 text-ink/60">
                    {new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-4 font-medium text-pine-900">{e.name}</td>
                  <td className="px-5 py-4 text-ink/70">
                    <p>{e.phone}</p>
                    {e.email && <p className="text-xs text-ink/45">{e.email}</p>}
                  </td>
                  <td className="px-5 py-4 text-ink/70">{e.product || "—"}</td>
                  <td className="px-5 py-4 text-ink/70">{e.quantity || "—"}</td>
                  <td className="max-w-xs px-5 py-4 text-ink/60">{e.message || "—"}</td>
                  <td className="px-5 py-4">
                    <select
                      value={e.status}
                      onChange={(ev) => updateStatus(e.id, ev.target.value)}
                      className="rounded-lg border border-ink/15 bg-cream px-3 py-2 text-xs"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-ink/40">
          Data is stored locally in <code>data-store/enquiries.json</code> for this demo. Swap{" "}
          <code>lib/enquiries.js</code> for a real database before deploying to production.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-2xl px-5 py-4 ${accent ? "bg-pine-800 text-cream" : "bg-cream-paper text-pine-900"}`}>
      <p className={`text-xs uppercase tracking-[0.15em] ${accent ? "text-cream/60" : "text-ink/45"}`}>{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}
