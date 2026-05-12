"use client";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getProducts, getFavorites, toggleFavorite, getFavoriteProducts } from "../../../lib/services";

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded-lg w-3/4" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="h-3 rounded-lg w-1/2" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="flex justify-between">
          <div className="h-4 rounded-lg w-16" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="h-4 rounded-lg w-16" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e2e8f0",
  borderRadius: "0.75rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  outline: "none",
  transition: "all 0.2s",
};

const SORT_OPTIONS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Oldest", value: "createdAt" },
  { label: "Price ↑", value: "price" },
  { label: "Price ↓", value: "-price" },
  { label: "Name A-Z", value: "name" },
];

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [togglingId, setTogglingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFirstLoad = useRef(true);

  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [active, setActive] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [showFavOnly, setShowFavOnly] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("favorites") === "1") {
      setShowFavOnly(true);
      router.replace("/dashboard/products");
    }
  }, []);

  const fetchProducts = useCallback(() => {
    if (isFirstLoad.current) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    const request = showFavOnly
      ? getFavoriteProducts()
      : (() => {
          const params = { page, sort, limit: 12 };
          if (search) params.q = search;
          if (category) params.category = category;
          if (minPrice) params.minPrice = minPrice;
          if (maxPrice) params.maxPrice = maxPrice;
          if (active !== "") params.active = active;
          return getProducts(params);
        })();

    request
      .then(({ data }) => {
        setProducts(data.items);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
        isFirstLoad.current = false;
      });
  }, [page, search, category, minPrice, maxPrice, active, sort, showFavOnly]);

  useEffect(() => {
    getFavorites()
      .then(({ data }) => setFavoriteIds(new Set(data.favorites.map((f) => f._id))))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => { setPage(1); }, [search, category, minPrice, maxPrice, active, sort]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearch(val); // keep as typed for display
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val.trim());
    }, 500);
  };

  const clearFilters = () => {
    setSearch(""); setCategory("");
    setMinPrice(""); setMaxPrice(""); setActive("");
    setSort("-createdAt"); setPage(1);
  };

  const hasFilters = search || category || minPrice || maxPrice || active !== "" || sort !== "-createdAt";

  const handleToggle = async (productId) => {
    setTogglingId(productId);
    try {
      const { data } = await toggleFavorite(productId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        data.favorited ? next.add(productId) : next.delete(productId);
        return next;
      });
      toast.success(data.favorited ? "Added to favorites ❤️" : "Removed from favorites");
    } catch {
      toast.error("Failed to update favorites");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">🛍️ Products</h2>
          <p className="text-slate-500 text-sm mt-1">
            {!loading && `${total} item${total !== 1 ? "s" : ""} found`}
          </p>
        </div>
        {favoriteIds.size > 0 && (
          <button onClick={() => setShowFavOnly((v) => !v)}
            className="text-sm font-medium px-3 py-1 rounded-full transition-all active:scale-95"
            style={showFavOnly
              ? { background: "rgba(219,39,119,0.4)", color: "#f472b6", border: "1px solid rgba(219,39,119,0.6)" }
              : { background: "rgba(219,39,119,0.15)", color: "#f472b6", border: "1px solid rgba(219,39,119,0.25)" }}>
            ❤️ {favoriteIds.size} favorited{showFavOnly ? " ✕" : ""}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <input value={search} onChange={handleSearchInput}
          placeholder="🔍  Search products..." style={{ ...inputStyle, width: "100%" }}
          onFocus={e => { e.target.style.borderColor = "rgba(167,139,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />

        <div className="flex flex-wrap gap-2">
          <input value={category} onChange={(e) => setCategory(e.target.value)}
            placeholder="🏷️ Category" style={{ ...inputStyle, width: "140px" }}
            onFocus={e => e.target.style.borderColor = "rgba(167,139,250,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            placeholder="💰 Min price" type="number" min="0" style={{ ...inputStyle, width: "130px" }}
            onFocus={e => e.target.style.borderColor = "rgba(167,139,250,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="💰 Max price" type="number" min="0" style={{ ...inputStyle, width: "130px" }}
            onFocus={e => e.target.style.borderColor = "rgba(167,139,250,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          <select value={active} onChange={(e) => setActive(e.target.value)} style={{ ...inputStyle, width: "130px" }}>
            <option value="" style={{ background: "#1a1a2e" }}>All Status</option>
            <option value="true" style={{ background: "#1a1a2e" }}>✅ Active</option>
            <option value="false" style={{ background: "#1a1a2e" }}>❌ Inactive</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ ...inputStyle, width: "130px" }}>
            <option value="-createdAt" disabled hidden style={{ background: "#1a1a2e" }}>Sort by</option>
            {SORT_OPTIONS.filter((o) => o.value !== "-createdAt").map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#1a1a2e" }}>{o.label}</option>
            ))}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="relative">
        {refreshing && (
          <div className="absolute inset-0 z-10 rounded-2xl flex items-start justify-center pt-8 pointer-events-none"
            style={{ background: "rgba(10,10,15,0.5)", backdropFilter: "blur(2px)" }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-purple-300 text-xs font-medium">Updating...</span>
            </div>
          </div>
        )}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-slate-400 font-medium">No products found</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition">
              Clear filters and try again
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            const isFav = favoriteIds.has(p._id);
            const isToggling = togglingId === p._id;
            return (
              <div key={p._id} className="glass-card rounded-2xl overflow-hidden hover-lift group">
                <div className="relative h-44 flex items-center justify-center overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(219,39,119,0.15))" }}>
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <span className="text-5xl">📦</span>
                  }
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={p.isActive
                        ? { background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }
                        : { background: "rgba(100,116,139,0.2)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.3)" }}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <button onClick={() => handleToggle(p._id)} disabled={isToggling}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 disabled:opacity-50"
                    style={{
                      background: isFav ? "rgba(219,39,119,0.3)" : "rgba(0,0,0,0.4)",
                      border: isFav ? "1px solid rgba(219,39,119,0.5)" : "1px solid rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
                      style={{ transform: isToggling ? "scale(0.8)" : isFav ? "scale(1.1)" : "scale(1)", transition: "transform 0.2s" }}
                      viewBox="0 0 24 24" fill={isFav ? "#f472b6" : "none"}
                      stroke={isFav ? "#f472b6" : "rgba(255,255,255,0.7)"} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-white truncate">{p.name}</h3>
                  {p.category && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                      {p.category}
                    </span>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-bold text-gradient">{p.currency} {p.price}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={p.stock > 0
                        ? { background: "rgba(16,185,129,0.15)", color: "#34d399" }
                        : { background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                      {p.stock > 0 ? `${p.stock} left` : "Out of stock"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      </div> {/* end relative wrapper */}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }}>
            ← Prev
          </button>
          {[...Array(pages)].map((_, i) => {
            const p = i + 1;
            const isActive = p === page;
            if (pages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== pages) {
              if (p === 2 || p === pages - 1) return <span key={p} className="text-slate-600">…</span>;
              return null;
            }
            return (
              <button key={p} onClick={() => setPage(p)}
                className="w-9 h-9 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={isActive
                  ? { background: "linear-gradient(135deg, #7c3aed, #db2777)", color: "white" }
                  : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPageWrapper() {
  return <Suspense><ProductsPage /></Suspense>;
}
