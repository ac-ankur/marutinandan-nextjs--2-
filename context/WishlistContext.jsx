"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { wishlist as wishlistApi, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

const WishlistContext = createContext(null);

const GUEST_WISHLIST_KEY = "yugika_guest_wishlist";

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Load wishlist from API when user is logged in, or from localStorage for guests
  const loadWishlist = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const res = await wishlistApi.list();
        const list = Array.isArray(res) ? res : res?.items || [];
        setItems(list);

        // Sync guest items if any
        if (typeof window !== "undefined") {
          const guestRaw = localStorage.getItem(GUEST_WISHLIST_KEY);
          if (guestRaw) {
            try {
              const guestItems = JSON.parse(guestRaw);
              if (Array.isArray(guestItems) && guestItems.length > 0) {
                for (const g of guestItems) {
                  const pid = g.productId || g.id;
                  if (pid && !list.some((existing) => (existing.productId || existing.id) === pid)) {
                    await wishlistApi.add(pid).catch(() => {});
                  }
                }
                localStorage.removeItem(GUEST_WISHLIST_KEY);
                const updated = await wishlistApi.list();
                setItems(Array.isArray(updated) ? updated : updated?.items || []);
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        console.warn("Failed to load wishlist:", err);
      } finally {
        setLoading(false);
        setInitialLoaded(true);
      }
    } else {
      // Guest mode
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
          setItems(raw ? JSON.parse(raw) : []);
        } catch (_) {
          setItems([]);
        }
      }
      setInitialLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Check if a product is wishlisted by ID or slug
  const isInWishlist = useCallback(
    (productIdOrSlug) => {
      if (!productIdOrSlug) return false;
      return items.some((item) => {
        const itemId = item.productId || item.product?.id || item.id;
        const itemSlug = item.product?.slug || item.slug;
        return (
          itemId === productIdOrSlug ||
          itemSlug === productIdOrSlug ||
          String(itemId) === String(productIdOrSlug)
        );
      });
    },
    [items]
  );

  // Add to wishlist
  const addToWishlist = useCallback(
    async (productId, productMeta = {}) => {
      if (!productId) return;

      const optimisticItem = {
        id: productId,
        productId,
        product: {
          id: productId,
          name: productMeta.name || "Product",
          slug: productMeta.slug || "",
          image: productMeta.image || "",
          mrp: productMeta.mrp || 0,
          price: productMeta.price || productMeta.mrp || 0,
          variants: productMeta.variants || [],
        },
        createdAt: new Date().toISOString(),
      };

      if (user) {
        try {
          setItems((prev) => [optimisticItem, ...prev.filter((i) => (i.productId || i.id) !== productId)]);
          await wishlistApi.add(productId);
          addToast("Added to your wishlist", "success");
          // Refresh to get server timestamps/structure
          const updated = await wishlistApi.list();
          setItems(Array.isArray(updated) ? updated : updated?.items || []);
        } catch (err) {
          // Revert on error
          setItems((prev) => prev.filter((i) => (i.productId || i.id) !== productId));
          addToast(formatApiError(err) || "Failed to add to wishlist", "error");
          throw err;
        }
      } else {
        // Guest mode
        setItems((prev) => {
          const next = [optimisticItem, ...prev.filter((i) => (i.productId || i.id) !== productId)];
          if (typeof window !== "undefined") {
            localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(next));
          }
          return next;
        });
        addToast("Added to your wishlist (Saved locally)", "success");
      }
    },
    [user, addToast]
  );

  // Remove from wishlist
  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!productId) return;

      const previous = [...items];
      setItems((prev) => prev.filter((i) => {
        const id = i.productId || i.product?.id || i.id;
        const slug = i.product?.slug || i.slug;
        return id !== productId && slug !== productId;
      }));

      if (user) {
        try {
          await wishlistApi.remove(productId);
          addToast("Removed from wishlist", "info");
        } catch (err) {
          setItems(previous);
          addToast(formatApiError(err) || "Failed to remove from wishlist", "error");
          throw err;
        }
      } else {
        if (typeof window !== "undefined") {
          const filtered = previous.filter((i) => {
            const id = i.productId || i.product?.id || i.id;
            const slug = i.product?.slug || i.slug;
            return id !== productId && slug !== productId;
          });
          localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(filtered));
        }
        addToast("Removed from wishlist", "info");
      }
    },
    [items, user, addToast]
  );

  // Toggle wishlist
  const toggleWishlist = useCallback(
    async (productId, productMeta = {}) => {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
        return false;
      } else {
        await addToWishlist(productId, productMeta);
        return true;
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  // Move to cart
  const moveToCart = useCallback(
    async (productId, variantId, quantity = 1) => {
      if (!productId || !variantId) return;

      try {
        if (user) {
          await wishlistApi.moveToCart(productId, variantId, quantity);
        } else {
          // If guest, remove from local wishlist
          await removeFromWishlist(productId);
        }

        // Refresh cart & wishlist
        if (refreshCart) await refreshCart();
        await loadWishlist();

        addToast("Moved item to your cart!", "success");
      } catch (err) {
        addToast(formatApiError(err) || "Failed to move item to cart", "error");
        throw err;
      }
    },
    [user, refreshCart, loadWishlist, removeFromWishlist, addToast]
  );

  const value = {
    items,
    count: items.length,
    loading,
    initialLoaded,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    moveToCart,
    refreshWishlist: loadWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
