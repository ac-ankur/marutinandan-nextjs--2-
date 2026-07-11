import { cookies } from "next/headers";
import { getEnquiries } from "@/lib/enquiries";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const isAuthed = cookies().get("mn_admin")?.value === "ok";

  if (!isAuthed) {
    return <AdminLogin />;
  }

  const enquiries = getEnquiries();
  return <AdminDashboard initialEnquiries={enquiries} />;
}
