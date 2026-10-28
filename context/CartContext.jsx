"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { cart as cartApi, rupees, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const GUEST_CART_KEY = "yugika_guest_cart";

const CartContext = createContext({
  cart: null,
  itemCount: 0,
  loading: false,
  actionLoadingId: null,
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  addItem: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  applyCoupon: async () => {},
  removeCoupon: async () => {},
  refreshCart: async () => {},
});

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const isMigratingRef = useRef(false);

  // Helper to load guest cart from localStorage
  const loadGuestCart = useCallback(() => {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return normalizeCart(parsed);
      }
    } catch (_) {}
    return createEmptyCart();
  }, []);

  // Helper to save guest cart to localStorage
  const saveGuestCart = useCallback((cartData) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
    } catch (_) {}
  }, []);

  // Fetch Cart from Backend or Guest LocalStorage
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const serverCart = await cartApi.get();
        setCart(normalizeCart(serverCart));
      } catch (err) {
        // If 401 or unauthorized, fallback to guest cart
        if (err?.status === 401) {
          setCart(loadGuestCart());
        }
      } finally {
        setLoading(false);
      }
    } else {
      setCart(loadGuestCart());
    }
  }, [isAuthenticated, loadGuestCart]);

  // Initial load
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Auto-migrate guest cart to server cart when user logs in
  useEffect(() => {
    if (isAuthenticated && !isMigratingRef.current) {
      try {
        const guest = loadGuestCart();
        if (guest && guest.items && guest.items.length > 0) {
          isMigratingRef.current = true;
          (async () => {
            for (const item of guest.items) {
              if (item.variantId) {
                try {
                  await cartApi.add(item.variantId, item.quantity || 1);
                } catch (_) {}
              }
            }
            try {
              localStorage.removeItem(GUEST_CART_KEY);
            } catch (_) {}
            isMigratingRef.current = false;
            refreshCart();
          })();
        }
      } catch (_) {
        isMigratingRef.current = false;
      }
    }
  }, [isAuthenticated, loadGuestCart, refreshCart]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  // Add Item to Cart
  const addItem = useCallback(
    async (variantId, quantity = 1, itemMeta = {}) => {
      setActionLoadingId(variantId);
      try {
        if (isAuthenticated) {
          const updated = await cartApi.add(variantId, quantity);
          setCart(normalizeCart(updated));
        } else {
          // Guest Cart update
          setCart((prev) => {
            const current = prev || createEmptyCart();
            const existingIdx = current.items.findIndex(
              (i) => i.variantId === variantId || (i.itemId && i.itemId === variantId)
            );
            let nextItems = [...current.items];

            if (existingIdx > -1) {
              nextItems[existingIdx] = {
                ...nextItems[existingIdx],
                quantity: nextItems[existingIdx].quantity + quantity,
              };
            } else {
              const unitPricePaise = itemMeta.pricePaise || (itemMeta.price ? itemMeta.price * 100 : 34900);
              const mrpPaise = itemMeta.mrpPaise || (itemMeta.mrp ? itemMeta.mrp * 100 : unitPricePaise);

              nextItems.push({
                itemId: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                variantId: variantId,
                productId: itemMeta.productId || "",
                productName: itemMeta.productName || itemMeta.name || "Cold Pressed Mustard Oil",
                productSlug: itemMeta.productSlug || itemMeta.slug || "cold-pressed-mustard-oil",
                variantLabel: itemMeta.variantLabel || itemMeta.label || "1 Litre",
                sku: itemMeta.sku || "YUG-MO-1L",
                image: itemMeta.image || null,
                quantity: quantity,
                unitPricePaise: unitPricePaise,
                unitPrice: unitPricePaise / 100,
                mrpPaise: mrpPaise,
                mrp: mrpPaise / 100,
                lineTotalPaise: unitPricePaise * quantity,
                available: 100,
                inStock: true,
              });
            }

            const updatedCart = recalculateGuestCart(nextItems, current.coupon);
            saveGuestCart(updatedCart);
            return updatedCart;
          });
        }
        setIsOpen(true); // Smoothly open cart to confirm addition
      } catch (err) {
        console.error("Cart add failed:", err);
        addToast(formatApiError(err), "error");
        throw err;
      } finally {
        setActionLoadingId(null);
      }
    },
    [isAuthenticated, saveGuestCart]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      setActionLoadingId(itemId);
      try {
        if (isAuthenticated) {
          if (quantity <= 0) {
            const updated = await cartApi.remove(itemId);
            setCart(normalizeCart(updated));
          } else {
            const updated = await cartApi.setQuantity(itemId, quantity);
            setCart(normalizeCart(updated));
          }
        } else {
          // Guest Cart update
          setCart((prev) => {
            const current = prev || createEmptyCart();
            let nextItems = current.items
              .map((i) => {
                if (i.itemId === itemId || i.id === itemId || i.variantId === itemId) {
                  return { ...i, quantity };
                }
                return i;
              })
              .filter((i) => i.quantity > 0);

            const updatedCart = recalculateGuestCart(nextItems, current.coupon);
            saveGuestCart(updatedCart);
            return updatedCart;
          });
        }
      } catch (err) {
        console.error("Cart update quantity failed:", err);
        addToast(formatApiError(err), "error");
        throw err;
      } finally {
        setActionLoadingId(null);
      }
    },
    [isAuthenticated, saveGuestCart]
  );

  // Remove item
  const removeItem = useCallback(
    async (itemId) => {
      setActionLoadingId(itemId);
      try {
        if (isAuthenticated) {
          const updated = await cartApi.remove(itemId);
          setCart(normalizeCart(updated));
        } else {
          setCart((prev) => {
            const current = prev || createEmptyCart();
            const nextItems = current.items.filter(
              (i) => i.itemId !== itemId && i.id !== itemId && i.variantId !== itemId
            );
            const updatedCart = recalculateGuestCart(nextItems, current.coupon);
            saveGuestCart(updatedCart);
            return updatedCart;
          });
        }
      } catch (err) {
        console.error("Cart remove item failed:", err);
        addToast(formatApiError(err), "error");
        throw err;
      } finally {
        setActionLoadingId(null);
      }
    },
    [isAuthenticated, saveGuestCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const updated = await cartApi.clear();
        setCart(normalizeCart(updated));
      } else {
        const empty = createEmptyCart();
        setCart(empty);
        saveGuestCart(empty);
      }
    } catch (err) {
      console.error("Cart clear failed:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, saveGuestCart]);

  // Apply Coupon
  const applyCoupon = useCallback(
    async (code) => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          const updated = await cartApi.applyCoupon(code);
          setCart(normalizeCart(updated));
          return updated;
        } else {
          // Client-side demo code simulation
          const codeUpper = code.trim().toUpperCase();
          let discountPaise = 5000; // default ₹50
          if (codeUpper.includes("10") || codeUpper.includes("PERCENT")) {
            discountPaise = Math.round(((cart?.subtotalPaise || 0) * 10) / 100);
          }
          const couponObj = { code: codeUpper, discountPaise };
          setCart((prev) => {
            const updatedCart = recalculateGuestCart(prev?.items || [], couponObj);
            saveGuestCart(updatedCart);
            return updatedCart;
          });
          return { success: true };
        }
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, cart?.subtotalPaise, saveGuestCart]
  );

  // Remove Coupon
  const removeCoupon = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const updated = await cartApi.removeCoupon();
        setCart(normalizeCart(updated));
      } else {
        setCart((prev) => {
          const updatedCart = recalculateGuestCart(prev?.items || [], null);
          saveGuestCart(updatedCart);
          return updatedCart;
        });
      }
    } catch (err) {
      console.error("Cart remove coupon failed:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, saveGuestCart]);

  const itemCount =
    cart?.itemCount ??
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) ??
    0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        actionLoadingId,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

/* ----------------- Helpers ----------------- */
function createEmptyCart() {
  return {
    items: [],
    itemCount: 0,
    coupon: null,
    subtotalPaise: 0,
    discountPaise: 0,
    shippingPaise: 0,
    gstIncludedPaise: 0,
    totalPaise: 0,
    total: 0,
    freeShippingRemainingPaise: 100000, // ₹1,000 threshold for free shipping
    issues: [],
    canCheckout: false,
  };
}

function normalizeCart(data) {
  if (!data) return createEmptyCart();
  const c = data.cart || data;
  const items = (c.items || []).map((item) => ({
    ...item,
    id: item.itemId || item.id,
    itemId: item.itemId || item.id,
    unitPrice: item.unitPrice || (item.unitPricePaise ? item.unitPricePaise / 100 : 0),
    mrp: item.mrp || (item.mrpPaise ? item.mrpPaise / 100 : item.unitPrice || 0),
  }));

  const itemCount =
    c.itemCount ?? items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const subtotalPaise =
    c.subtotalPaise ?? items.reduce((acc, curr) => acc + (curr.unitPricePaise || 0) * (curr.quantity || 1), 0);
  const discountPaise = c.discountPaise || 0;
  const shippingPaise = c.shippingPaise || 0;
  const totalPaise = c.totalPaise || Math.max(0, subtotalPaise - discountPaise + shippingPaise);
  const total = c.total || totalPaise / 100;

  return {
    ...c,
    items,
    itemCount,
    subtotalPaise,
    discountPaise,
    shippingPaise,
    totalPaise,
    total,
    freeShippingRemainingPaise: c.freeShippingRemainingPaise ?? Math.max(0, 100000 - subtotalPaise),
    canCheckout: items.length > 0 && (c.canCheckout !== false),
  };
}

function recalculateGuestCart(items, coupon = null) {
  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const subtotalPaise = items.reduce(
    (sum, i) => sum + (i.unitPricePaise || (i.price ? i.price * 100 : 0)) * (i.quantity || 1),
    0
  );

  const FREE_SHIPPING_THRESHOLD = 100000; // ₹1,000
  const STANDARD_SHIPPING = 6000; // ₹60

  const shippingPaise = subtotalPaise >= FREE_SHIPPING_THRESHOLD || subtotalPaise === 0 ? 0 : STANDARD_SHIPPING;
  const freeShippingRemainingPaise = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalPaise);

  let discountPaise = 0;
  if (coupon && coupon.discountPaise) {
    discountPaise = Math.min(coupon.discountPaise, subtotalPaise);
  }

  const taxablePaise = Math.max(0, subtotalPaise - discountPaise);
  const gstIncludedPaise = Math.round(taxablePaise * 0.05); // 5% GST included
  const totalPaise = taxablePaise + shippingPaise;

  return {
    items,
    itemCount,
    coupon,
    subtotalPaise,
    discountPaise,
    shippingPaise,
    gstIncludedPaise,
    totalPaise,
    total: totalPaise / 100,
    freeShippingRemainingPaise,
    issues: [],
    canCheckout: items.length > 0,
  };
}
