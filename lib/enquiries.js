import fs from "fs";
import path from "path";

// NOTE: This uses a local JSON file as a lightweight datastore so the demo works
// out of the box with zero setup. Serverless hosts (Vercel, etc.) have a read-only
// filesystem in production, so before deploying, swap this for a real database
// (Postgres, SQLite via Turso/LibSQL, Supabase, Airtable, Google Sheets API, etc.)
// and keep the same getEnquiries()/addEnquiry() function signatures.

const DATA_DIR = path.join(process.cwd(), "data-store");
const DATA_FILE = path.join(DATA_DIR, "enquiries.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

export function getEnquiries() {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addEnquiry(entry) {
  ensureStore();
  const all = getEnquiries();
  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString(),
    status: "new",
    ...entry,
  };
  all.unshift(record);
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), "utf-8");
  return record;
}

export function updateEnquiryStatus(id, status) {
  ensureStore();
  const all = getEnquiries();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  all[idx].status = status;
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), "utf-8");
  return all[idx];
}
