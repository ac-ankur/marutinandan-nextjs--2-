const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function formatApiError(err) {
  if (!err) return "An unexpected error occurred. Please try again.";

  // Handle both raw backend JSON responses { success: false, error: ... } and ApiError instances
  const actual = err?.error && typeof err.error === "object" ? err.error : err;

  // Specific backend codes
  if (actual.code === "INSUFFICIENT_STOCK") {
    if (actual.message) return actual.message;
    if (actual.details?.available !== undefined) {
      return `Only ${actual.details.available} left in stock`;
    }
  }

  // Extract structured fieldErrors / formErrors from backend details (e.g. Zod / API responses)
  if (actual.details && typeof actual.details === "object") {
    // If details is an array (e.g. Zod issues array [{ message, path }])
    if (Array.isArray(actual.details)) {
      const msgs = actual.details
        .map((d) => (typeof d === "string" ? d : d?.message || (d?.code ? `${d.path?.join(".") || "field"}: ${d.message || d.code}` : null)))
        .filter(Boolean);
      if (msgs.length > 0) return msgs.join(". ");
    }

    const { fieldErrors, formErrors } = actual.details;
    const messages = [];

    if (Array.isArray(formErrors) && formErrors.length > 0) {
      messages.push(...formErrors);
    }

    if (fieldErrors && typeof fieldErrors === "object") {
      for (const [, errList] of Object.entries(fieldErrors)) {
        if (Array.isArray(errList) && errList.length > 0) {
          messages.push(...errList);
        } else if (typeof errList === "string") {
          messages.push(errList);
        }
      }
    }

    if (actual.details.message && typeof actual.details.message === "string") {
      messages.push(actual.details.message);
    }

    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  if (typeof actual.details === "string") return actual.details;

  if (actual.message && actual.message !== "Invalid request" && actual.message !== "Request failed") {
    return actual.message;
  }

  if (typeof actual === "string") return actual;
  if (actual.error && typeof actual.error === "string") return actual.error;

  return "Invalid request. Please check your inputs.";
}

const KEY_ACCESS = "yugika_access";
const KEY_REFRESH = "yugika_refresh";
const isBrowser = typeof window !== "undefined";
let memoryAccess = null;
let memoryRefresh = null;

export const tokens = {
  get access() {
    return isBrowser ? localStorage.getItem(KEY_ACCESS) : memoryAccess;
  },
  get refresh() {
    return isBrowser ? localStorage.getItem(KEY_REFRESH) : memoryRefresh;
  },
  set(access, refresh) {
    if (isBrowser) {
      if (access) localStorage.setItem(KEY_ACCESS, access);
      else localStorage.removeItem(KEY_ACCESS);
      if (refresh) localStorage.setItem(KEY_REFRESH, refresh);
      else localStorage.removeItem(KEY_REFRESH);
    } else {
      memoryAccess = access;
      memoryRefresh = refresh;
    }
  },
  clear() {
    if (isBrowser) {
      localStorage.removeItem(KEY_ACCESS);
      localStorage.removeItem(KEY_REFRESH);
    } else {
      memoryAccess = null;
      memoryRefresh = null;
    }
  },
};

let refreshing = null;
async function tryRefresh() {
  const refreshToken = tokens.refresh;
  if (!refreshToken) return false;
  refreshing ??= fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (r) => {
      if (!r.ok) return false;
      const j = await r.json();
      tokens.set(j.data.accessToken, j.data.refreshToken);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function api(method, path, body, retry = true) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(tokens.access ? { authorization: `Bearer ${tokens.access}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (res.status === 401 && retry && tokens.refresh && (await tryRefresh())) {
    return api(method, path, body, false);
  }
  if (!res.ok || !json?.success) {
    const e = json?.error;
    throw new ApiError(res.status, e?.code ?? "ERROR", e?.message ?? "Request failed", e?.details);
  }
  return json.data;
}

/* ------------------------------ auth ------------------------------ */
export const auth = {
  async register(input) {
    const d = await api("POST", "/auth/register", input);
    tokens.set(d.accessToken, d.refreshToken);
    return d.user;
  },
  async login(email, password) {
    const d = await api("POST", "/auth/login", { email, password });
    tokens.set(d.accessToken, d.refreshToken);
    return d.user;
  },
  async logout() {
    try {
      await api("POST", "/auth/logout", { refreshToken: tokens.refresh });
    } finally {
      tokens.clear();
    }
  },
  // "Continue with Google": pass the `credential` string Google's button gives you.
  async googleLogin(credential) {
    const d = await api("POST", "/auth/google", { credential });
    tokens.set(d.accessToken, d.refreshToken);
    return { user: d.user, isNewUser: d.isNewUser };
  },
  verifyEmail: (token) => api("POST", "/auth/verify-email", { token }),
  resendVerification: () => api("POST", "/auth/resend-verification"),
  forgotPassword: (email) => api("POST", "/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) => api("POST", "/auth/reset-password", { token, newPassword }),
  async changePassword(currentPassword, newPassword) {
    const d = await api("POST", "/auth/change-password", { currentPassword, newPassword });
    tokens.set(d.accessToken, d.refreshToken);
  },
  me: () => api("GET", "/users/me").then((d) => d.user),
};

/* ----------------------------- catalog ----------------------------- */
export const shop = {
  products: (q = {}) =>
    api(
      "GET",
      `/products?${new URLSearchParams(
        Object.entries(q)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      )}`
    ),
  product: (slug) => api("GET", `/products/${slug}`).then((d) => d.product),
  categories: () => api("GET", "/categories").then((d) => d.categories),
};

/* ------------------------- cart / wishlist ------------------------- */
export const cart = {
  get: () =>
    api("GET", "/cart").then((d) => {
      const c = d?.cart ?? d ?? {};
      return {
        ...c,
        canCheckout: d?.canCheckout ?? c?.canCheckout ?? (c?.items?.length > 0),
        issues: Array.isArray(d?.issues) ? d.issues : Array.isArray(c?.issues) ? c.issues : [],
      };
    }),
  add: (variantId, quantity = 1) => api("POST", "/cart/items", { variantId, quantity }).then((d) => d?.cart ?? d),
  setQuantity: (itemId, quantity) => api("PATCH", `/cart/items/${itemId}`, { quantity }).then((d) => d?.cart ?? d),
  remove: (itemId) => api("DELETE", `/cart/items/${itemId}`).then((d) => d?.cart ?? d),
  clear: () => api("DELETE", "/cart").then((d) => d?.cart ?? d),
  applyCoupon: (code) => api("POST", "/cart/coupon", { code }).then((d) => d?.cart ?? d),
  removeCoupon: () => api("DELETE", "/cart/coupon").then((d) => d?.cart ?? d),
};

export const wishlist = {
  list: () =>
    api("GET", "/wishlist").then((d) => {
      if (Array.isArray(d)) return d;
      return d?.items ?? d?.wishlist ?? [];
    }),
  add: (productId) =>
    api("POST", "/wishlist", { productId }).then((d) => {
      if (Array.isArray(d)) return d;
      return d?.items ?? d?.wishlist ?? d;
    }),
  remove: (productId) =>
    api("DELETE", `/wishlist/${productId}`).then((d) => {
      if (Array.isArray(d)) return d;
      return d?.items ?? d?.wishlist ?? d;
    }),
  moveToCart: (productId, variantId, quantity = 1) =>
    api("POST", `/wishlist/${productId}/move-to-cart`, { variantId, quantity }),
};

/* --------------------- addresses / orders / pay -------------------- */
export const account = {
  addresses: () => api("GET", "/users/me/addresses").then((d) => d?.addresses ?? d),
  addAddress: (a) => api("POST", "/users/me/addresses", a).then((d) => d?.address ?? d),
  updateAddress: (id, a) => api("PUT", `/users/me/addresses/${id}`, a).then((d) => d?.address ?? d),
  deleteAddress: (id) => api("DELETE", `/users/me/addresses/${id}`),
};

export const orders = {
  checkout: (addressId, paymentMethod = "ONLINE") =>
    api("POST", "/orders/checkout", { addressId, paymentMethod }).then((d) => d?.order ?? d),
  list: (page = 1, pageSize = 10) => api("GET", `/orders?page=${page}&pageSize=${pageSize}`),
  get: (idOrNumber) => api("GET", `/orders/${idOrNumber}`).then((d) => d?.order ?? d),
  // Order tracking timeline (GET /orders/:orderNumber/timeline)
  timeline: (idOrNumber) =>
    api("GET", `/orders/${idOrNumber}/timeline`).then((d) => {
      if (Array.isArray(d)) return d;
      return d?.timeline ?? d?.events ?? d?.history ?? (Array.isArray(d?.items) ? d.items : []);
    }),
  // Cancel order (POST /orders/:orderNumber/cancel)
  cancel: (idOrNumber, reason) =>
    api("POST", `/orders/${idOrNumber}/cancel`, reason ? { reason } : {}),
  // Download GST invoice PDF (GET /orders/:orderNumber/invoice)
  async downloadInvoice(idOrNumber, filename) {
    const finalFilename = filename || `invoice-${idOrNumber}.pdf`;
    const res = await fetch(`${API}/orders/${idOrNumber}/invoice`, {
      headers: {
        ...(tokens.access ? { authorization: `Bearer ${tokens.access}` } : {}),
      },
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg =
        errJson?.error?.message ||
        errJson?.message ||
        "Invoice not available for this order yet";
      throw new ApiError(res.status, "INVOICE_UNAVAILABLE", errMsg);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: finalFilename });
    a.click();
    URL.revokeObjectURL(url);
  },
  // DEV ONLY until Razorpay is wired (Phase 7): pretends the payment succeeded / failed.
  simulatePayment: (orderId, outcome = "success") =>
    api("POST", `/payments/simulate/${orderId}`, { outcome }),
};

/* ------------------------ reviews / contact form ------------------------ */
export const reviews = {
  list: (slug, page = 1) => api("GET", `/products/${slug}/reviews?page=${page}`),
  eligibility: (slug) => api("GET", `/products/${slug}/reviews/eligibility`),
  create: (slug, r) => api("POST", `/products/${slug}/reviews`, r),
  update: (id, r) => api("PATCH", `/reviews/${id}`, r),
  remove: (id) => api("DELETE", `/reviews/${id}`),
};

export const enquiries = {
  // Keep a hidden input named "website" in your form and send its value as `website` (bot trap; leave it empty for humans).
  send: (e) => api("POST", "/enquiries", e),
};

/* ----------------------------- admin ----------------------------- */
export const admin = {
  // Executive Dashboard
  dashboard: (days = 30) => api("GET", `/admin/dashboard?days=${days}`),

  // Products Catalog
  products: (q = {}) => {
    const params = {
      includeDeleted: "false",
      ...q,
    };
    return api(
      "GET",
      `/admin/products?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      )}`
    );
  },
  product: (id) => api("GET", `/admin/products/${id}`).then((d) => d.product),
  createProduct: (p) => api("POST", "/admin/products", p).then((d) => d.product),
  updateProduct: (id, p) => api("PATCH", `/admin/products/${id}`, p).then((d) => d.product),
  deleteProduct: (id) => api("DELETE", `/admin/products/${id}`),
  restoreProduct: (id) => api("POST", `/admin/products/${id}/restore`).then((d) => d.product),

  // Product Variants
  addVariant: (productId, v) => api("POST", `/admin/products/${productId}/variants`, v).then((d) => d.variant),
  updateVariant: (id, v) => api("PATCH", `/admin/variants/${id}`, v).then((d) => d.variant),
  deleteVariant: (id) => api("DELETE", `/admin/variants/${id}`),

  // Product Images
  addImage: (productId, img) => api("POST", `/admin/products/${productId}/images`, img).then((d) => d.image || d),
  deleteImage: (imgIdOrProductId, possibleImgId) =>
    api("DELETE", `/admin/images/${possibleImgId || imgIdOrProductId}`),

  // Categories
  categories: () => api("GET", "/admin/categories").then((d) => d.categories),
  createCategory: (c) => api("POST", "/admin/categories", c).then((d) => d.category),
  updateCategory: (id, c) => api("PATCH", `/admin/categories/${id}`, c).then((d) => d.category),
  deleteCategory: (id) => api("DELETE", `/admin/categories/${id}`),

  // Inventory
  inventory: (q = {}) => {
    const params = {
      lowStockOnly: "false",
      ...q,
    };
    return api(
      "GET",
      `/admin/inventory?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      )}`
    ).then((d) => d.items || d.inventory || d);
  },
  adjustInventory: (variantId, body) => {
    const payload = {
      ...body,
      ...(body.change != null ? { change: Number(body.change) } : {}),
      ...(body.delta != null && body.change == null ? { change: Number(body.delta) } : {}),
      ...(body.setTo != null ? { setTo: Number(body.setTo) } : {}),
    };
    return api("POST", `/admin/inventory/${variantId}/adjust`, payload);
  },
  inventoryMovements: (variantId) =>
    api("GET", `/admin/inventory/${variantId}/movements`).then((d) => d.movements || d.history || d.items || d),

  // Orders & Fulfillment
  orders: (q = {}) =>
    api(
      "GET",
      `/admin/orders?${new URLSearchParams(
        Object.entries(q)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      )}`
    ),
  order: (id) => api("GET", `/admin/orders/${id}`).then((d) => d.order || d),
  updateOrderStatus: (id, body) => api("PATCH", `/admin/orders/${id}/status`, body).then((d) => d.order || d),
  async downloadInvoice(idOrNumber, filename = "invoice.pdf") {
    const res = await fetch(`${API}/admin/orders/${idOrNumber}/invoice`, {
      headers: { authorization: `Bearer ${tokens.access}` },
    });
    if (!res.ok) throw new ApiError(res.status, "INVOICE_UNAVAILABLE", "Invoice unavailable for this order");
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
  },
  async exportOrdersCsv(q = {}, filename = "orders-export.csv") {
    const params = new URLSearchParams(
      Object.entries(q)
        .filter(([, v]) => v != null && v !== "")
        .map(([k, v]) => [k, String(v)])
    ).toString();
    const queryStr = params ? `?${params}` : "";
    const res = await fetch(`${API}/admin/orders/export.csv${queryStr}`, {
      headers: { authorization: `Bearer ${tokens.access}` },
    });
    if (!res.ok) throw new ApiError(res.status, "EXPORT_FAILED", "Failed to export orders CSV");
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
  },

  // Users Management
  users: (q = {}) =>
    api(
      "GET",
      `/admin/users?${new URLSearchParams(
        Object.entries(q)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      )}`
    ),
  user: (id) => api("GET", `/admin/users/${id}`).then((d) => d.user),
  toggleBlockUser: (id, isBlocked, reason) =>
    api("PATCH", `/admin/users/${id}/block`, { isBlocked, reason }).then((d) => d.user),

  // Coupons
  coupons: () => api("GET", "/admin/coupons").then((d) => d.coupons || d.items || d),
  coupon: (id) => api("GET", `/admin/coupons/${id}`).then((d) => d.coupon || d),
  createCoupon: (body) => api("POST", "/admin/coupons", body).then((d) => d.coupon || d),
  updateCoupon: (id, body) => api("PATCH", `/admin/coupons/${id}`, body).then((d) => d.coupon || d),
  deleteCoupon: (id) => api("DELETE", `/admin/coupons/${id}`),

  // Offers
  offers: () => api("GET", "/admin/offers").then((d) => d.items),
  createOffer: (body) => api("POST", "/admin/offers", body).then((d) => d.offer),
  updateOffer: (id, body) => api("PATCH", `/admin/offers/${id}`, body).then((d) => d.offer),
  deleteOffer: (id) => api("DELETE", `/admin/offers/${id}`),

  // Enquiries
  enquiries: (q = {}) =>
    api(
      "GET",
      `/admin/enquiries?${new URLSearchParams(
        Object.entries(q)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      )}`
    ),
  updateEnquiry: (id, status, notes) =>
    api("PATCH", `/admin/enquiries/${id}`, { status, notes }).then((d) => d.enquiry),

  // Reviews Moderation
  reviews: (q = {}) =>
    api(
      "GET",
      `/admin/reviews?${new URLSearchParams(
        Object.entries(q)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      )}`
    ),
  toggleReviewVisibility: (id, visible) =>
    api("PATCH", `/admin/reviews/${id}/visibility`, { visible, isVisible: visible }).then((d) => d.review || d),
  deleteReview: (id) => api("DELETE", `/admin/reviews/${id}`),
};

export const rupees = (paise) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
