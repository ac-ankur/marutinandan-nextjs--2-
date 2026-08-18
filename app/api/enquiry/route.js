import { NextResponse } from "next/server";
import { addEnquiry, getEnquiries, updateEnquiryStatus } from "@/lib/enquiries";
import { cookies } from "next/headers";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatField(label, value) {
  if (!value) return "";
  return `<tr><td style=\"padding:6px 12px 6px 0;color:#5b5b5b;font-weight:600;vertical-align:top\">${label}</td><td style=\"padding:6px 0\">${escapeHtml(value)}</td></tr>`;
}

async function sendEnquiryEmail(enquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_TO_EMAIL || "yugikafoods@gmail.com";
  const from = process.env.RESEND_FROM_EMAIL || "Yugika Foods <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("Email service is not configured. Add RESEND_API_KEY to .env.local.");
  }

  const subject = `New website enquiry from ${enquiry.name}`;
  const fields = [
    formatField("Name", enquiry.name),
    formatField("Phone", enquiry.phone),
    formatField("Email", enquiry.email),
    formatField("Product", enquiry.product),
    formatField("Quantity", enquiry.quantity),
    formatField("Delivery address", enquiry.deliveryAddress),
    formatField("Message", enquiry.message),
  ].join("");
  const text = [
    subject,
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    enquiry.email && `Email: ${enquiry.email}`,
    enquiry.product && `Product: ${enquiry.product}`,
    enquiry.quantity && `Quantity: ${enquiry.quantity}`,
    enquiry.deliveryAddress && `Delivery address: ${enquiry.deliveryAddress}`,
    enquiry.message && `Message: ${enquiry.message}`,
  ].filter(Boolean).join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      reply_to: enquiry.email || undefined,
      text,
      html: `<div style=\"font-family:Arial,sans-serif;color:#1f2937\"><h2>New website enquiry</h2><table style=\"border-collapse:collapse\">${fields}</table></div>`,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Resend could not send the enquiry email.");
  }
}

function isAdmin() {
  return cookies().get("mn_admin")?.value === "ok";
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid form submission." }, { status: 400 });
  }
  const { name, phone, email, product, quantity, deliveryAddress, message, honeypot } = body;

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

  const enquiry = {
    name: String(name).slice(0, 200),
    phone: String(phone).slice(0, 40),
    email: email ? String(email).slice(0, 200) : "",
    product: product ? String(product).slice(0, 200) : "",
    quantity: quantity ? String(quantity).slice(0, 100) : "",
    deliveryAddress: deliveryAddress ? String(deliveryAddress).slice(0, 500) : "",
    message: message ? String(message).slice(0, 2000) : "",
  };

  try {
    await sendEnquiryEmail(enquiry);
  } catch (error) {
    console.error("Unable to send enquiry email:", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't send your enquiry right now. Please try again shortly." },
      { status: 502 }
    );
  }

  const record = addEnquiry(enquiry);

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
