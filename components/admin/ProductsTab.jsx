"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { admin, rupees, formatApiError } from "@/lib/api";
import { getStaticFallback } from "@/components/SafeImage";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
  Package,
  Plus,
  Search,
  Filter,
  Sliders,
  Edit2,
  Trash2,
  RotateCcw,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderPlus,
  Layers,
  Image as ImageIcon,
  X,
} from "lucide-react";

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  const [editVariantModal, setEditVariantModal] = useState(null);
  const [imageModalProduct, setImageModalProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Expanded product variants view
  const [expandedProducts, setExpandedProducts] = useState({});

  // Confirmation Modal state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: null,
    subMessage: "",
    confirmText: "Delete",
    variant: "danger",
    loading: false,
    onConfirm: () => {},
  });

  const fetchCatalog = useCallback(
    async (targetPage = 1, searchQuery = search, withDeleted = includeDeleted) => {
      setLoading(true);
      setError("");
      try {
        const [prodRes, catRes] = await Promise.all([
          admin.products({
            page: targetPage,
            search: searchQuery || undefined,
            pageSize: 20,
            includeDeleted: withDeleted ? "true" : "false",
          }),
          admin.categories(),
        ]);
        setProducts(prodRes.items || []);
        setMeta(prodRes.meta || null);
        setCategories(catRes || []);
        setPage(targetPage);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [search, includeDeleted]
  );

  useEffect(() => {
    fetchCatalog(1, "", false);
  }, [fetchCatalog]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCatalog(1, search, includeDeleted);
  };

  const handleToggleIncludeDeleted = (val) => {
    setIncludeDeleted(val);
    fetchCatalog(1, search, val);
  };

  const toggleExpand = (id) => {
    setExpandedProducts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteProduct = (id, name) => {
    setConfirmState({
      isOpen: true,
      title: "Deactivate Product",
      message: (
        <span>
          Are you sure you want to deactivate and archive{" "}
          <strong className="text-slate-900 font-bold">&ldquo;{name}&rdquo;</strong>?
        </span>
      ),
      subMessage:
        "This product will be archived and hidden from the customer storefront. You can view and restore it anytime by enabling 'Include Archived / Deleted'.",
      confirmText: "Deactivate Product",
      variant: "danger",
      loading: false,
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, loading: true }));
        try {
          await admin.deleteProduct(id);
          setSuccess(`Product "${name}" was archived.`);
          fetchCatalog(page, search, includeDeleted);
          setTimeout(() => setSuccess(""), 4000);
          setConfirmState((prev) => ({ ...prev, isOpen: false, loading: false }));
        } catch (err) {
          setError(formatApiError(err));
          setConfirmState((prev) => ({ ...prev, isOpen: false, loading: false }));
        }
      },
    });
  };

  const handleRestoreProduct = async (id, name) => {
    try {
      await admin.restoreProduct(id);
      setSuccess(`Product "${name}" was restored successfully.`);
      fetchCatalog(page, search, includeDeleted);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  const handleDeleteVariant = (variantId, label) => {
    setConfirmState({
      isOpen: true,
      title: "Delete SKU Variant",
      message: (
        <span>
          Are you sure you want to delete variant{" "}
          <strong className="text-slate-900 font-bold">&ldquo;{label}&rdquo;</strong>?
        </span>
      ),
      subMessage: "This SKU variant and its inventory records will be permanently removed.",
      confirmText: "Delete Variant",
      variant: "danger",
      loading: false,
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, loading: true }));
        try {
          await admin.deleteVariant(variantId);
          setSuccess(`Variant "${label}" was deleted.`);
          fetchCatalog(page, search, includeDeleted);
          setTimeout(() => setSuccess(""), 4000);
          setConfirmState((prev) => ({ ...prev, isOpen: false, loading: false }));
        } catch (err) {
          setError(formatApiError(err));
          setConfirmState((prev) => ({ ...prev, isOpen: false, loading: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Products & Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your oil SKUs, pack sizes, MRP/selling prices, GST rates, and product categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          >
            <FolderPlus className="h-3.5 w-3.5 text-slate-500" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddProduct(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog by name or slug…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchCatalog(1, "", includeDeleted);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 bg-white"
            >
              Clear
            </button>
          )}
        </form>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => handleToggleIncludeDeleted(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Include Archived / Deleted</span>
        </label>
      </div>

      {/* Product List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading catalog from API…</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <Package className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-semibold text-slate-900 text-sm">No products found in catalog</p>
            <p className="mt-1 text-slate-400">Create products with the button above or sync your database.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map((prod) => {
              const isExpanded = !!expandedProducts[prod.id];
              const variants = prod.variants || [];
              const category = categories.find((c) => c.id === prod.categoryId) || prod.category;
              const isDeleted = Boolean(prod.deletedAt || prod.isDeleted);

              return (
                <div key={prod.id} className={`transition-colors ${isDeleted ? "bg-slate-50/80" : "hover:bg-slate-50/60"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 gap-3.5">
                    {/* Left: Product Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">
                        {prod.images && prod.images.length > 0 ? (
                          <img
                            src={prod.images[0].url}
                            alt={prod.name}
                            className="h-11 w-11 rounded-xl object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getStaticFallback(prod.name);
                            }}
                          />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-sans text-sm font-bold text-slate-900 truncate ${isDeleted ? "line-through text-slate-400" : ""}`}>
                            {prod.name}
                          </h3>
                          {isDeleted ? (
                            <span className="rounded-md px-2 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              DELETED / ARCHIVED
                            </span>
                          ) : (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${
                                prod.isActive
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {prod.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          /{prod.slug} • HSN: {prod.hsnCode || "1514"} • GST: {prod.gstRate ?? 5}%
                          {category ? ` • Category: ${category.name}` : ""}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                          {variants.length} SKU variant(s) • {prod.images?.length || 0} image(s)
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => toggleExpand(prod.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                      >
                        <span>Variants ({variants.length})</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setImageModalProduct(prod)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                        title="Manage Images"
                      >
                        <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                        <span>Images ({prod.images?.length || 0})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVariantModalProduct(prod)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                        title="Add Variant"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Variant</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditProduct(prod)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900 shadow-xs"
                        title="Edit Product"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {isDeleted ? (
                        <button
                          type="button"
                          onClick={() => handleRestoreProduct(prod.id, prod.name)}
                          className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 shadow-xs"
                          title="Restore Product"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 shadow-xs"
                          title="Soft Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Variants Table */}
                  {isExpanded && (
                    <div className="bg-slate-50/50 px-5 pb-4 pt-1 border-t border-slate-100">
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                              <th className="pb-2 font-semibold">SKU</th>
                              <th className="pb-2 font-semibold">Variant Size</th>
                              <th className="pb-2 font-semibold">Price</th>
                              <th className="pb-2 font-semibold">MRP</th>
                              <th className="pb-2 font-semibold text-center">Stock</th>
                              <th className="pb-2 font-semibold text-center">Safety Threshold</th>
                              <th className="pb-2 font-semibold">Weight & Size</th>
                              <th className="pb-2 font-semibold">Status</th>
                              <th className="pb-2 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {variants.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="py-4 text-center text-slate-400 italic">
                                  No variants added yet. Click &quot;+ Variant&quot; above to create one.
                                </td>
                              </tr>
                            ) : (
                              variants.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 font-mono font-bold text-slate-900">
                                    {v.sku}
                                  </td>
                                  <td className="py-2.5 font-medium text-slate-800">{v.label}</td>
                                  <td className="py-2.5 font-bold text-emerald-700">
                                    {rupees(v.pricePaise)}
                                  </td>
                                  <td className="py-2.5 text-slate-400 line-through">
                                    {rupees(v.mrpPaise)}
                                  </td>
                                  <td className="py-2.5 text-center font-bold text-slate-900">
                                    {v.stock}
                                  </td>
                                  <td className="py-2.5 text-center text-slate-500">
                                    {v.lowStockThreshold}
                                  </td>
                                  <td className="py-2.5 text-slate-500">
                                    {v.weightGrams ? `${v.weightGrams}g` : "—"}
                                    {v.lengthCm ? ` • ${v.lengthCm}×${v.breadthCm}×${v.heightCm}cm` : ""}
                                  </td>
                                  <td className="py-2.5">
                                    <span
                                      className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${
                                        v.isActive
                                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                          : "bg-slate-100 text-slate-500 border border-slate-200"
                                      }`}
                                    >
                                      {v.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setEditVariantModal({ product: prod, variant: v })}
                                        className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                        title="Update Variant (Price/MRP/SKU)"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteVariant(v.id, v.sku || v.label)}
                                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                        title="Delete Variant"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs">
            <span className="text-slate-500">
              Showing page {page} of {meta.totalPages} ({meta.total} products)
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => fetchCatalog(page - 1, search, includeDeleted)}
                disabled={page <= 1 || loading}
                className="rounded-xl border border-slate-200 px-3 py-1 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchCatalog(page + 1, search, includeDeleted)}
                disabled={page >= meta.totalPages || loading}
                className="rounded-xl border border-slate-200 px-3 py-1 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Add Product */}
      {showAddProduct && (
        <AddProductModal
          categories={categories}
          onClose={() => setShowAddProduct(false)}
          onSuccess={() => {
            setShowAddProduct(false);
            setSuccess("Product created successfully!");
            fetchCatalog(1, search, includeDeleted);
            setTimeout(() => setSuccess(""), 4000);
          }}
        />
      )}

      {/* MODAL 2: Edit Product */}
      {editProduct && (
        <EditProductModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSuccess={() => {
            setEditProduct(null);
            setSuccess("Product updated successfully!");
            fetchCatalog(page, search, includeDeleted);
            setTimeout(() => setSuccess(""), 4000);
          }}
        />
      )}

      {/* MODAL 3: Add Variant */}
      {variantModalProduct && (
        <AddVariantModal
          product={variantModalProduct}
          onClose={() => setVariantModalProduct(null)}
          onSuccess={() => {
            setVariantModalProduct(null);
            setSuccess("Variant added successfully!");
            fetchCatalog(page, search, includeDeleted);
            setTimeout(() => setSuccess(""), 4000);
          }}
        />
      )}

      {/* MODAL 4: Edit Variant */}
      {editVariantModal && (
        <EditVariantModal
          product={editVariantModal.product}
          variant={editVariantModal.variant}
          onClose={() => setEditVariantModal(null)}
          onSuccess={() => {
            setEditVariantModal(null);
            setSuccess("Variant updated successfully!");
            fetchCatalog(page, search, includeDeleted);
            setTimeout(() => setSuccess(""), 4000);
          }}
        />
      )}

      {/* MODAL 5: Manage Images */}
      {imageModalProduct && (
        <ProductImagesModal
          product={imageModalProduct}
          onClose={() => setImageModalProduct(null)}
          onRefresh={() => {
            fetchCatalog(page, search, includeDeleted);
          }}
        />
      )}

      {/* MODAL 4: Categories Manager */}
      {showCategoryModal && (
        <CategoriesModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onRefresh={() => fetchCatalog(page, search)}
        />
      )}

      {/* Reusable Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        subMessage={confirmState.subMessage}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        loading={confirmState.loading}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false, loading: false }))}
      />
    </div>
  );
}

function ModalPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

function useModalScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}

/* ------------------- MODAL: Add Product ------------------- */
function AddProductModal({ categories, onClose, onSuccess }) {
  useModalScrollLock();
  const [form, setForm] = useState({
    name: "Kachi Ghani Mustard Oil",
    slug: "kachi-ghani-mustard-oil",
    categoryId: categories[0]?.id || "",
    description: "Cold-pressed in small batches.",
    hsnCode: "1514",
    gstRate: 5,
    fssaiNumber: "12345678901234",
    metaTitle: "Kachi Ghani Mustard Oil",
    metaDescription: "Pure cold-pressed mustard oil",
    isActive: true,
  });

  const [variants, setVariants] = useState([
    {
      sku: "YUG-KG-1L",
      label: "1 L",
      priceRs: 349,
      mrpRs: 399,
      stock: 50,
      threshold: 10,
      weightGrams: 2300,
      lengthCm: 12,
      breadthCm: 12,
      heightCm: 28,
      isActive: true,
      images: [
        { url: "https://your-image-host.com/kachi-ghani-1l-front.jpg", alt: "1 L bottle front", sortOrder: 0 },
        { url: "https://your-image-host.com/kachi-ghani-1l-back.jpg", alt: "1 L bottle back label", sortOrder: 1 },
        { url: "https://your-image-host.com/kachi-ghani-1l-packaging.jpg", alt: "1 L bottle packaging", sortOrder: 2 },
      ],
    },
    {
      sku: "YUG-KG-500ML",
      label: "500 ml",
      priceRs: 189,
      mrpRs: 229,
      stock: 40,
      threshold: 8,
      weightGrams: 1200,
      lengthCm: 10,
      breadthCm: 10,
      heightCm: 22,
      isActive: true,
      images: [
        { url: "https://your-image-host.com/kachi-ghani-500ml-front.jpg", alt: "500 ml bottle front", sortOrder: 0 },
        { url: "https://your-image-host.com/kachi-ghani-500ml-packaging.jpg", alt: "500 ml bottle packaging", sortOrder: 1 },
      ],
    },
  ]);

  const [images, setImages] = useState([
    { url: "https://your-image-host.com/kachi-ghani-lifestyle.jpg", alt: "Mustard oil product lifestyle", sortOrder: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (name) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm((prev) => ({
      ...prev,
      name,
      slug,
      metaTitle: prev.metaTitle ? prev.metaTitle : name,
    }));
  };

  // Product Images
  const addImageRow = () => {
    setImages((prev) => [...prev, { url: "", alt: form.name, sortOrder: prev.length }]);
  };
  const removeImageRow = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const updateImageRow = (index, field, value) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    );
  };

  // Variants
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        sku: "",
        label: "",
        priceRs: "",
        mrpRs: "",
        stock: 0,
        threshold: 10,
        weightGrams: "",
        lengthCm: "",
        breadthCm: "",
        heightCm: "",
        isActive: true,
        images: [{ url: "", alt: "", sortOrder: 0 }],
      },
    ]);
  };
  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };
  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // Variant Images
  const addVariantImage = (variantIndex) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        const currentImgs = v.images || [];
        return {
          ...v,
          images: [
            ...currentImgs,
            { url: "", alt: `${v.label || v.sku || "Variant"} photo`, sortOrder: currentImgs.length },
          ],
        };
      })
    );
  };
  const removeVariantImage = (variantIndex, imgIndex) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        return {
          ...v,
          images: (v.images || []).filter((_, imgI) => imgI !== imgIndex),
        };
      })
    );
  };
  const updateVariantImage = (variantIndex, imgIndex, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        return {
          ...v,
          images: (v.images || []).map((img, imgI) =>
            imgI === imgIndex ? { ...img, [field]: value } : img
          ),
        };
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Build variants matching exact API specification
      const formattedVariants = variants
        .filter((v) => v.sku && v.sku.trim() !== "")
        .map((v) => {
          const variantImages = (v.images || [])
            .filter((img) => img.url && img.url.trim() !== "")
            .map((img, idx) => ({
              url: img.url.trim(),
              alt: img.alt?.trim() || `${v.label || v.sku} bottle`,
              sortOrder: Number(img.sortOrder) ?? idx,
            }));

          const item = {
            sku: v.sku.trim().toUpperCase(),
            label: v.label.trim() || "Default",
            pricePaise: Math.round(Number(v.priceRs) * 100),
            mrpPaise: Math.round(Number(v.mrpRs) * 100),
            stock: Number(v.stock) || 0,
            lowStockThreshold: Number(v.threshold) || 10,
            weightGrams: Number(v.weightGrams) || 0,
            isActive: Boolean(v.isActive),
            images: variantImages,
          };

          if (v.lengthCm !== "" && v.lengthCm != null) item.lengthCm = Number(v.lengthCm);
          if (v.breadthCm !== "" && v.breadthCm != null) item.breadthCm = Number(v.breadthCm);
          if (v.heightCm !== "" && v.heightCm != null) item.heightCm = Number(v.heightCm);

          return item;
        });

      // Build product-level images
      const validImages = images
        .filter((img) => img.url && img.url.trim() !== "")
        .map((img, idx) => ({
          url: img.url.trim(),
          alt: img.alt?.trim() || form.name.trim(),
          sortOrder: Number(img.sortOrder) ?? idx,
        }));

      // Combined product payload matching exact API contract
      const productPayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId || undefined,
        hsnCode: form.hsnCode.trim() || "1514",
        gstRate: Number(form.gstRate) || 5,
        fssaiNumber: form.fssaiNumber.trim() || undefined,
        metaTitle: form.metaTitle.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined,
        isActive: Boolean(form.isActive),
        variants: formattedVariants,
        images: validImages,
      };

      await admin.createProduct(productPayload);
      onSuccess();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          data-lenis-prevent
          className="flex flex-col w-[94vw] lg:w-[84vw] max-w-[1440px] h-[85vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        >
          {/* Pinned Modal Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/70">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Add New Product & Variants</h3>
              <p className="text-xs text-slate-500 mt-0.5">Complete product details and multiple SKU variants with variant-specific images</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Container with Scrollable Body and Pinned Footer */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {error && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
                  {error}
                </div>
              )}

              {/* 2-Column Responsive Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                {/* LEFT COLUMN: Core Product Information & Product-Level Images (Span 6) */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Card 1: Product Information */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                        1
                      </span>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-800">
                        Product Information
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Product Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="e.g. Kachi Ghani Mustard Oil"
                          required
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">URL Slug *</label>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                          placeholder="kachi-ghani-mustard-oil"
                          required
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-mono shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Category</label>
                        <select
                          value={form.categoryId}
                          onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        >
                          <option value="">No Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">HSN Code</label>
                        <input
                          type="text"
                          value={form.hsnCode}
                          onChange={(e) => setForm((p) => ({ ...p, hsnCode: e.target.value }))}
                          placeholder="1514"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">GST Rate (%)</label>
                        <input
                          type="number"
                          value={form.gstRate}
                          onChange={(e) => setForm((p) => ({ ...p, gstRate: e.target.value }))}
                          placeholder="5"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-12">
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">FSSAI License No.</label>
                        <input
                          type="text"
                          value={form.fssaiNumber}
                          onChange={(e) => setForm((p) => ({ ...p, fssaiNumber: e.target.value }))}
                          placeholder="12345678901234"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        />
                      </div>
                      <div className="sm:col-span-7">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Description</label>
                        <input
                          type="text"
                          value={form.description}
                          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Cold-pressed in small batches."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">SEO Meta Title</label>
                        <input
                          type="text"
                          value={form.metaTitle}
                          onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value }))}
                          placeholder="Kachi Ghani Mustard Oil"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">SEO Meta Description</label>
                        <input
                          type="text"
                          value={form.metaDescription}
                          onChange={(e) => setForm((p) => ({ ...p, metaDescription: e.target.value }))}
                          placeholder="Pure cold-pressed mustard oil"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="productIsActive"
                          checked={form.isActive}
                          onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                          className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <label htmlFor="productIsActive" className="text-sm font-semibold text-slate-800 cursor-pointer">
                          Active for customer purchase
                        </label>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        form.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}>
                        {form.isActive ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Product-Level Lifestyle / Marketing Images */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                          2
                        </span>
                        <div>
                          <p className="text-sm font-bold uppercase tracking-wider text-slate-800">
                            Product Lifestyle Images
                          </p>
                          <p className="text-[11px] text-slate-400">Marketing photos applied across all product sizes</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addImageRow}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200/60 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Image</span>
                      </button>
                    </div>

                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {images.map((img, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) => updateImageRow(idx, "url", e.target.value)}
                            placeholder="https://your-image-host.com/kachi-ghani-lifestyle.jpg"
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                          />
                          <input
                            type="text"
                            value={img.alt}
                            onChange={(e) => updateImageRow(idx, "alt", e.target.value)}
                            placeholder="Alt text"
                            className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                          />
                          <input
                            type="number"
                            value={img.sortOrder}
                            onChange={(e) => updateImageRow(idx, "sortOrder", e.target.value)}
                            placeholder="Order"
                            title="Sort order"
                            className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 text-center"
                          />
                          {images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImageRow(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove Image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Multiple SKU Variants & Variant Images (Span 6) */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                        3
                      </span>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-800">
                          SKU Variants ({variants.length})
                        </p>
                        <p className="text-[11px] text-slate-400">Pack sizes, pricing, dimensions, and variant photos</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300/80 transition-colors shadow-2xs"
                    >
                      <Plus className="h-4 w-4" />
                      <span>+ Add Another Variant</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[64vh] overflow-y-auto pr-1">
                    {variants.map((v, vIdx) => (
                      <div
                        key={vIdx}
                        className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 space-y-3.5 shadow-2xs relative"
                      >
                        {/* Variant Card Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                              {vIdx + 1}
                            </span>
                            <span className="text-sm font-bold text-slate-900 font-mono">
                              {v.sku || "NEW-SKU"}
                            </span>
                            {v.label && (
                              <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                {v.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={v.isActive}
                                onChange={(e) => updateVariant(vIdx, "isActive", e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              Active
                            </label>
                            {variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariant(vIdx)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                                title="Delete this variant"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* SKU & Label */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">SKU Code *</label>
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => updateVariant(vIdx, "sku", e.target.value)}
                              placeholder="e.g. YUG-KG-1L"
                              required
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 uppercase focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Variant Label *</label>
                            <input
                              type="text"
                              value={v.label}
                              onChange={(e) => updateVariant(vIdx, "label", e.target.value)}
                              placeholder="e.g. 1 L or 500 ml"
                              required
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                            />
                          </div>
                        </div>

                        {/* Price, MRP, Stock, Threshold */}
                        <div className="grid gap-3 sm:grid-cols-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹) *</label>
                            <input
                              type="number"
                              value={v.priceRs}
                              onChange={(e) => updateVariant(vIdx, "priceRs", e.target.value)}
                              placeholder="349"
                              required
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-bold focus:border-emerald-600 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">MRP (₹) *</label>
                            <input
                              type="number"
                              value={v.mrpRs}
                              onChange={(e) => updateVariant(vIdx, "mrpRs", e.target.value)}
                              placeholder="399"
                              required
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Stock</label>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => updateVariant(vIdx, "stock", e.target.value)}
                              placeholder="50"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Low Threshold</label>
                            <input
                              type="number"
                              value={v.threshold}
                              onChange={(e) => updateVariant(vIdx, "threshold", e.target.value)}
                              placeholder="10"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                            />
                          </div>
                        </div>

                        {/* Weight & Dimensions */}
                        <div className="grid gap-3 sm:grid-cols-4 pt-0.5">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Weight (g)</label>
                            <input
                              type="number"
                              value={v.weightGrams}
                              onChange={(e) => updateVariant(vIdx, "weightGrams", e.target.value)}
                              placeholder="2300"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">L (cm)</label>
                            <input
                              type="number"
                              value={v.lengthCm}
                              onChange={(e) => updateVariant(vIdx, "lengthCm", e.target.value)}
                              placeholder="12"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">B (cm)</label>
                            <input
                              type="number"
                              value={v.breadthCm}
                              onChange={(e) => updateVariant(vIdx, "breadthCm", e.target.value)}
                              placeholder="12"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">H (cm)</label>
                            <input
                              type="number"
                              value={v.heightCm}
                              onChange={(e) => updateVariant(vIdx, "heightCm", e.target.value)}
                              placeholder="28"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                            />
                          </div>
                        </div>

                        {/* Variant-Specific Images */}
                        <div className="pt-2 border-t border-slate-200/70">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              Variant Images ({v.images?.length || 0})
                            </span>
                            <button
                              type="button"
                              onClick={() => addVariantImage(vIdx)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Image</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(v.images || []).map((img, imgIdx) => (
                              <div key={imgIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                                <input
                                  type="text"
                                  value={img.url}
                                  onChange={(e) => updateVariantImage(vIdx, imgIdx, "url", e.target.value)}
                                  placeholder="https://your-image-host.com/kachi-ghani-1l-front.jpg"
                                  className="flex-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none focus:border-emerald-600"
                                />
                                <input
                                  type="text"
                                  value={img.alt}
                                  onChange={(e) => updateVariantImage(vIdx, imgIdx, "alt", e.target.value)}
                                  placeholder="1 L bottle front"
                                  className="w-32 rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none focus:border-emerald-600"
                                />
                                <input
                                  type="number"
                                  value={img.sortOrder}
                                  onChange={(e) => updateVariantImage(vIdx, imgIdx, "sortOrder", e.target.value)}
                                  placeholder="0"
                                  title="Sort Order"
                                  className="w-12 text-center rounded-md border border-slate-300 px-1 py-1 text-xs text-slate-800 outline-none focus:border-emerald-600"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(vIdx, imgIdx)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                  title="Remove image"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100 bg-slate-50/80 flex-shrink-0">
              <span className="text-xs text-slate-500">
                Payload creates product with <strong className="text-slate-800">{variants.length} variant(s)</strong> and <strong className="text-slate-800">{images.filter(i => i.url.trim()).length} lifestyle image(s)</strong>.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-7 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? "Creating…" : "Create Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ------------------- MODAL: Edit Product ------------------- */
function EditProductModal({ product, categories, onClose, onSuccess }) {
  useModalScrollLock();
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    categoryId: product.categoryId || "",
    hsnCode: product.hsnCode || "1514",
    gstRate: product.gstRate ?? 5,
    fssaiNumber: product.fssaiNumber || "",
    metaTitle: product.metaTitle || "",
    metaDescription: product.metaDescription || "",
    isActive: product.isActive ?? true,
  });

  const [images, setImages] = useState(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images.map((img, idx) => ({
        id: img.id,
        url: img.url || "",
        alt: img.alt || "",
        sortOrder: img.sortOrder ?? idx,
      }));
    }
    return [{ url: "", alt: product?.name || "", sortOrder: 0 }];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addImageRow = () => {
    setImages((prev) => [
      ...prev,
      { url: "", alt: form.name || "Product photo", sortOrder: prev.length },
    ]);
  };
  const removeImageRow = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateImageRow = (idx, field, value) => {
    setImages((prev) =>
      prev.map((img, i) => (i === idx ? { ...img, [field]: value } : img))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const validImages = images
        .filter((img) => img.url && img.url.trim() !== "")
        .map((img, idx) => ({
          ...(img.id ? { id: img.id } : {}),
          url: img.url.trim(),
          alt: img.alt?.trim() || form.name.trim(),
          sortOrder: Number(img.sortOrder) ?? idx,
        }));

      await admin.updateProduct(product.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        categoryId: form.categoryId || null,
        hsnCode: form.hsnCode.trim() || null,
        gstRate: Number(form.gstRate),
        fssaiNumber: form.fssaiNumber.trim() || null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        isActive: form.isActive,
        images: validImages,
      });
      onSuccess();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          data-lenis-prevent
          className="flex flex-col w-[94vw] lg:w-[80vw] max-w-5xl h-[80vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/70">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Edit Product</h3>
              <p className="text-xs text-slate-500 mt-0.5">Update general product details, taxonomy, and SEO</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {error && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Category</label>
                      <select
                        value={form.categoryId}
                        onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                      >
                        <option value="">None</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">HSN</label>
                      <input
                        type="text"
                        value={form.hsnCode}
                        onChange={(e) => setForm((p) => ({ ...p, hsnCode: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">GST (%)</label>
                      <input
                        type="number"
                        value={form.gstRate}
                        onChange={(e) => setForm((p) => ({ ...p, gstRate: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">FSSAI License Number</label>
                    <input
                      type="text"
                      value={form.fssaiNumber}
                      onChange={(e) => setForm((p) => ({ ...p, fssaiNumber: e.target.value }))}
                      placeholder="12345678901234"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                        className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="isActive" className="text-sm font-semibold text-slate-800 cursor-pointer">
                        Active for purchase
                      </label>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      form.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}>
                      {form.isActive ? "LIVE" : "DRAFT"}
                    </span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">SEO Meta Title</label>
                    <input
                      type="text"
                      value={form.metaTitle}
                      onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">SEO Meta Description</label>
                    <input
                      type="text"
                      value={form.metaDescription}
                      onChange={(e) => setForm((p) => ({ ...p, metaDescription: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Product Images Section */}
              <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-800">
                        Product Images ({images.length})
                      </p>
                      <p className="text-[11px] text-slate-400">Marketing photos and lifestyle images for this product</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addImageRow}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200/60 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Image URL</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="h-9 w-9 flex-shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                        {img.url ? (
                          <img
                            src={img.url}
                            alt={img.alt || "Preview"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={img.url}
                        onChange={(e) => updateImageRow(idx, "url", e.target.value)}
                        placeholder="https://your-image-host.com/product-image.jpg"
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => updateImageRow(idx, "alt", e.target.value)}
                        placeholder="Alt text"
                        className="w-40 sm:w-56 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                      <input
                        type="number"
                        value={img.sortOrder}
                        onChange={(e) => updateImageRow(idx, "sortOrder", e.target.value)}
                        placeholder="Order"
                        title="Sort order"
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-center"
                      />
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-slate-100 bg-slate-50/80 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-7 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ------------------- MODAL: Add Variant ------------------- */
function AddVariantModal({ product, onClose, onSuccess }) {
  useModalScrollLock();
  const [form, setForm] = useState({
    sku: "",
    label: "",
    priceRs: 349,
    mrpRs: 399,
    stock: 50,
    threshold: 10,
    weightGrams: 2300,
    lengthCm: 12,
    breadthCm: 12,
    heightCm: 28,
    isActive: true,
  });
  const [images, setImages] = useState([
    { url: "", alt: "", sortOrder: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addImageRow = () => {
    setImages((prev) => [...prev, { url: "", alt: `${form.label || form.sku || "Variant"} photo`, sortOrder: prev.length }]);
  };
  const removeImageRow = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateImageRow = (idx, field, value) => {
    setImages((prev) =>
      prev.map((img, i) => (i === idx ? { ...img, [field]: value } : img))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const validImages = images
        .filter((img) => img.url && img.url.trim() !== "")
        .map((img, idx) => ({
          url: img.url.trim(),
          alt: img.alt?.trim() || `${form.label || form.sku} bottle`,
          sortOrder: Number(img.sortOrder) ?? idx,
        }));

      await admin.addVariant(product.id, {
        sku: form.sku.trim().toUpperCase(),
        label: form.label.trim(),
        pricePaise: Math.round(Number(form.priceRs) * 100),
        mrpPaise: Math.round(Number(form.mrpRs) * 100),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.threshold),
        weightGrams: Number(form.weightGrams),
        lengthCm: form.lengthCm ? Number(form.lengthCm) : undefined,
        breadthCm: form.breadthCm ? Number(form.breadthCm) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        isActive: form.isActive,
        ...(validImages.length > 0 ? { images: validImages } : {}),
      });
      onSuccess();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          data-lenis-prevent
          className="flex flex-col w-full max-w-xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/70">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add SKU Variant</h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">{product.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
                  {error}
                </div>
              )}
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">SKU *</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    placeholder="e.g. YUG-KG-5L"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 uppercase focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Label *</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                    placeholder="e.g. 5 L"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={form.priceRs}
                    onChange={(e) => setForm((p) => ({ ...p, priceRs: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    value={form.mrpRs}
                    onChange={(e) => setForm((p) => ({ ...p, mrpRs: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Threshold</label>
                  <input
                    type="number"
                    value={form.threshold}
                    onChange={(e) => setForm((p) => ({ ...p, threshold: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Weight (g)</label>
                  <input
                    type="number"
                    value={form.weightGrams}
                    onChange={(e) => setForm((p) => ({ ...p, weightGrams: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Length (cm)</label>
                  <input
                    type="number"
                    value={form.lengthCm}
                    onChange={(e) => setForm((p) => ({ ...p, lengthCm: e.target.value }))}
                    placeholder="12"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Breadth (cm)</label>
                  <input
                    type="number"
                    value={form.breadthCm}
                    onChange={(e) => setForm((p) => ({ ...p, breadthCm: e.target.value }))}
                    placeholder="12"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={form.heightCm}
                    onChange={(e) => setForm((p) => ({ ...p, heightCm: e.target.value }))}
                    placeholder="28"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Variant Images Section */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Variant Images ({images.length})
                  </span>
                  <button
                    type="button"
                    onClick={addImageRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Image</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        value={img.url}
                        onChange={(e) => updateImageRow(idx, "url", e.target.value)}
                        placeholder="https://your-image-host.com/variant-front.jpg"
                        className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                      />
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => updateImageRow(idx, "alt", e.target.value)}
                        placeholder="Bottle front view"
                        className="w-36 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                      />
                      <input
                        type="number"
                        value={img.sortOrder}
                        onChange={(e) => updateImageRow(idx, "sortOrder", e.target.value)}
                        placeholder="0"
                        title="Sort Order"
                        className="w-12 text-center rounded-md border border-slate-300 bg-white px-1 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                      />
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageRow(idx)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Remove image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-slate-100 bg-slate-50/70 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 shadow-xs"
              >
                {loading ? "Adding…" : "Add Variant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ------------------- MODAL: Categories Manager ------------------- */
function CategoriesModal({ categories, onClose, onRefresh }) {
  useModalScrollLock();
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder((categories?.length || 0) + 1);
    setIsActive(true);
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setDescription(cat.description || "");
    setSortOrder(cat.sortOrder ?? 1);
    setIsActive(cat.isActive !== false);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        name: name.trim(),
        slug:
          slug.trim() ||
          name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-"),
        description: description.trim() || null,
        isActive: Boolean(isActive),
        sortOrder: Number(sortOrder) || 1,
      };

      if (editingCategory) {
        // Matches PATCH /admin/categories/{{categoryId}}
        await admin.updateCategory(editingCategory.id, payload);
        setSuccess(`Category "${name}" updated successfully.`);
      } else {
        // Matches POST /admin/categories
        await admin.createCategory(payload);
        setSuccess(`Category "${name}" created successfully.`);
      }

      resetForm();
      onRefresh();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const [confirmCatDelete, setConfirmCatDelete] = useState({ isOpen: false, cat: null, loading: false });

  const handleDelete = (cat) => {
    setConfirmCatDelete({
      isOpen: true,
      cat,
      loading: false,
    });
  };

  const executeDeleteCategory = async () => {
    if (!confirmCatDelete.cat) return;
    setConfirmCatDelete((prev) => ({ ...prev, loading: true }));
    try {
      await admin.deleteCategory(confirmCatDelete.cat.id);
      setSuccess(`Category "${confirmCatDelete.cat.name}" deleted.`);
      if (editingCategory?.id === confirmCatDelete.cat.id) resetForm();
      onRefresh();
      setConfirmCatDelete({ isOpen: false, cat: null, loading: false });
    } catch (err) {
      setError(formatApiError(err));
      setConfirmCatDelete({ isOpen: false, cat: null, loading: false });
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
      <div
        data-lenis-prevent
        className="flex flex-col w-full max-w-lg max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage Product Categories</h3>
            <p className="text-[11px] text-slate-400">Add, edit, reorder or toggle catalog categories</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
              {success}
            </div>
          )}

        {/* Existing Categories */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-700 mb-2">Existing Categories ({categories.length})</p>
          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No categories found in catalog.</p>
          ) : (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-colors ${
                    editingCategory?.id === c.id
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50/70 hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">{c.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 truncate">/{c.slug}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        c.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}>
                        {c.isActive !== false ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Order: {c.sortOrder ?? 1} {c.description ? `• ${c.description}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(c)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white"
                      title="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create / Edit Form */}
        <form onSubmit={handleSubmit} className="mt-5 border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900">
              {editingCategory ? `Edit Category: "${editingCategory.name}"` : "+ Add New Category"}
            </p>
            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ghee"
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ghee"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Desi ghee"
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="2"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="catActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="catActive" className="text-xs font-semibold text-slate-800">
                Active for shop display
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              {loading ? (editingCategory ? "Saving…" : "Creating…") : (editingCategory ? "Save Changes" : "Save Category")}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <ConfirmModal
    isOpen={confirmCatDelete.isOpen}
    title="Delete Category"
    message={
      <span>
        Are you sure you want to delete category{" "}
        <strong className="font-bold text-slate-900">&ldquo;{confirmCatDelete.cat?.name}&rdquo;</strong>?
      </span>
    }
    subMessage="Ensure no active products depend on this category before deleting."
    confirmText="Delete Category"
    variant="danger"
    loading={confirmCatDelete.loading}
    onConfirm={executeDeleteCategory}
    onClose={() => setConfirmCatDelete({ isOpen: false, cat: null, loading: false })}
  />
</ModalPortal>
);
}

/* ------------------- MODAL: Edit Variant (PATCH /admin/variants/:id) ------------------- */
function EditVariantModal({ product, variant, onClose, onSuccess }) {
  useModalScrollLock();
  const [form, setForm] = useState({
    sku: variant.sku || "",
    label: variant.label || "",
    priceRs: variant.pricePaise ? Math.round(variant.pricePaise / 100) : 0,
    mrpRs: variant.mrpPaise ? Math.round(variant.mrpPaise / 100) : 0,
    stock: variant.stock ?? 0,
    threshold: variant.lowStockThreshold ?? 10,
    weightGrams: variant.weightGrams ?? "",
    lengthCm: variant.lengthCm ?? "",
    breadthCm: variant.breadthCm ?? "",
    heightCm: variant.heightCm ?? "",
    isActive: variant.isActive !== false,
  });

  const [images, setImages] = useState(() => {
    if (Array.isArray(variant?.images) && variant.images.length > 0) {
      return variant.images.map((img, idx) => ({
        id: img.id,
        url: img.url || "",
        alt: img.alt || "",
        sortOrder: img.sortOrder ?? idx,
      }));
    }
    return [{ url: "", alt: `${variant?.label || variant?.sku || "Variant"} photo`, sortOrder: 0 }];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addImageRow = () => {
    setImages((prev) => [
      ...prev,
      { url: "", alt: `${form.label || form.sku || "Variant"} photo`, sortOrder: prev.length },
    ]);
  };
  const removeImageRow = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateImageRow = (idx, field, value) => {
    setImages((prev) =>
      prev.map((img, i) => (i === idx ? { ...img, [field]: value } : img))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const validImages = images
        .filter((img) => img.url && img.url.trim() !== "")
        .map((img, idx) => ({
          ...(img.id ? { id: img.id } : {}),
          url: img.url.trim(),
          alt: img.alt?.trim() || `${form.label || form.sku} bottle`,
          sortOrder: Number(img.sortOrder) ?? idx,
        }));

      await admin.updateVariant(variant.id, {
        sku: form.sku.trim().toUpperCase() || undefined,
        label: form.label.trim() || undefined,
        pricePaise: Math.round(Number(form.priceRs) * 100),
        mrpPaise: Math.round(Number(form.mrpRs) * 100),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.threshold),
        weightGrams: form.weightGrams ? Number(form.weightGrams) : undefined,
        lengthCm: form.lengthCm ? Number(form.lengthCm) : undefined,
        breadthCm: form.breadthCm ? Number(form.breadthCm) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        isActive: Boolean(form.isActive),
        images: validImages,
      });
      onSuccess();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
      <div
        data-lenis-prevent
        className="flex flex-col w-full max-w-xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">Update Variant</h3>
            <p className="text-[11px] text-slate-500 truncate">{product?.name} &bull; {variant.sku}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code *</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 uppercase focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Variant Size / Label *</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                step="any"
                value={form.priceRs}
                onChange={(e) => setForm((p) => ({ ...p, priceRs: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 font-bold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">MRP (₹) *</label>
              <input
                type="number"
                step="any"
                value={form.mrpRs}
                onChange={(e) => setForm((p) => ({ ...p, mrpRs: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Units</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Safety Threshold</label>
              <input
                type="number"
                value={form.threshold}
                onChange={(e) => setForm((p) => ({ ...p, threshold: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-4 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Weight (g)</label>
              <input
                type="number"
                value={form.weightGrams}
                onChange={(e) => setForm((p) => ({ ...p, weightGrams: e.target.value }))}
                placeholder="2300"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">L (cm)</label>
              <input
                type="number"
                value={form.lengthCm}
                onChange={(e) => setForm((p) => ({ ...p, lengthCm: e.target.value }))}
                placeholder="12"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">B (cm)</label>
              <input
                type="number"
                value={form.breadthCm}
                onChange={(e) => setForm((p) => ({ ...p, breadthCm: e.target.value }))}
                placeholder="12"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">H (cm)</label>
              <input
                type="number"
                value={form.heightCm}
                onChange={(e) => setForm((p) => ({ ...p, heightCm: e.target.value }))}
                placeholder="28"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editVariantActive"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="editVariantActive" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Active for customer purchase
            </label>
          </div>

          {/* Variant Images Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <ImageIcon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Variant Images ({images.length})
                </span>
              </div>
              <button
                type="button"
                onClick={addImageRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Image URL</span>
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="h-8 w-8 flex-shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={img.alt || "Preview"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={img.url}
                    onChange={(e) => updateImageRow(idx, "url", e.target.value)}
                    placeholder="https://your-image-host.com/variant-photo.jpg"
                    className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => updateImageRow(idx, "alt", e.target.value)}
                    placeholder="Alt label"
                    className="w-28 sm:w-36 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <input
                    type="number"
                    value={img.sortOrder}
                    onChange={(e) => updateImageRow(idx, "sortOrder", e.target.value)}
                    placeholder="0"
                    title="Sort Order"
                    className="w-12 text-center rounded-lg border border-slate-300 bg-white px-1 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageRow(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </ModalPortal>
  );
}

/* ------------------- MODAL: Product Images (POST /admin/products/:id/images) ------------------- */
function ProductImagesModal({ product, onClose, onRefresh }) {
  const [images, setImages] = useState(product.images || []);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState(product.name || "");
  const [sortOrder, setSortOrder] = useState((product.images?.length || 0) + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Matches POST /admin/products/{{productId}}/images
      // Body: { url, alt, sortOrder }
      const newImg = await admin.addImage(product.id, {
        url: url.trim(),
        alt: alt.trim() || product.name,
        sortOrder: Number(sortOrder) || 0,
      });
      setSuccess("Image added successfully!");
      if (newImg && (newImg.url || newImg.id)) {
        setImages((prev) => [...prev, newImg]);
      } else {
        setImages((prev) => [
          ...prev,
          { url: url.trim(), alt: alt.trim() || product.name, sortOrder: Number(sortOrder) || 0 },
        ]);
      }
      setUrl("");
      setSortOrder((prev) => Number(prev) + 1);
      onRefresh();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const [confirmImgDelete, setConfirmImgDelete] = useState({ isOpen: false, imgId: null, idx: null, loading: false });

  const handleDeleteImage = (imgId, idx) => {
    setConfirmImgDelete({ isOpen: true, imgId, idx, loading: false });
  };

  const executeDeleteImage = async () => {
    const { imgId, idx } = confirmImgDelete;
    setConfirmImgDelete((prev) => ({ ...prev, loading: true }));
    try {
      if (imgId) {
        await admin.deleteImage(product.id, imgId);
      }
      setImages((prev) => prev.filter((_, i) => i !== idx));
      onRefresh();
      setConfirmImgDelete({ isOpen: false, imgId: null, idx: null, loading: false });
    } catch (err) {
      setError(formatApiError(err));
      setConfirmImgDelete({ isOpen: false, imgId: null, idx: null, loading: false });
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage Product Images</h3>
              <p className="text-[11px] text-slate-500 truncate">{product?.name}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              {success}
            </div>
          )}

          {/* Existing Images Gallery */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">Current Images ({images.length})</p>
            {images.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No images uploaded for this product yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                {images.map((img, idx) => (
                  <div key={img.id || idx} className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                    <img
                      src={img.url}
                      alt={img.alt || product?.name}
                      className="h-24 w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getStaticFallback(img.alt || product?.name);
                      }}
                    />
                    <div className="p-1.5 bg-white text-[10px]">
                      <p className="font-semibold text-slate-800 truncate">{img.alt || "Product image"}</p>
                      <p className="text-slate-400">Order: {img.sortOrder ?? idx}</p>
                    </div>
                    {img.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id, idx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Image Form (Matches POST /admin/products/:id/images) */}
          <form onSubmit={handleAddImage} className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">+ Add New Image (by URL)</p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/oil2.jpg"
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Side view"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-colors"
              >
                {loading ? "Adding…" : "Add Image"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmImgDelete.isOpen}
        title="Remove Product Image"
        message="Are you sure you want to remove this image from the product gallery?"
        confirmText="Remove Image"
        variant="danger"
        loading={confirmImgDelete.loading}
        onConfirm={executeDeleteImage}
        onClose={() => setConfirmImgDelete({ isOpen: false, imgId: null, idx: null, loading: false })}
      />
    </ModalPortal>
  );
}
