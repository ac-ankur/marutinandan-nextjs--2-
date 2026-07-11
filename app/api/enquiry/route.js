import { NextResponse } from "next/server";
import { addEnquiry, getEnquiries, updateEnquiryStatus } from "@/lib/enquiries";
import { cookies } from "next/headers";

function isAdmin() {
  return cookies().get("mn_admin")?.value === "ok";
}

export async function POST(request) {
  const body = await request.json();
  const { name, phone, email, product, quantity, message, honeypot } = body;

  // basic bot honeypot
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, error: "Name and phone are required." },
      { status: 400 }
    );
  }

  const record = addEnquiry({
    name: String(name).slice(0, 200),
    phone: String(phone).slice(0, 40),
    email: email ? String(email).slice(0, 200) : "",
    product: product ? String(product).slice(0, 200) : "",
    quantity: quantity ? String(quantity).slice(0, 100) : "",
    message: message ? String(message).slice(0, 2000) : "",
  });

  return NextResponse.json({ ok: true, record });
}

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const enquiries = getEnquiries();
  return NextResponse.json({ ok: true, enquiries });
}

export async function PATCH(request) {
  if (!isAdmin()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, status } = await request.json();
  const updated = updateEnquiryStatus(id, status);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, record: updated });
}
