"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProducts, getFavorites, toggleFavorite } from "../../../lib/services";

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

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [togglingId, setTogglingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getFavorites()])
      .then(([prodRes, favRes]) => {
        setProducts(prodRes.data.items);
        setFavoriteIds(new Set(favRes.data.favorites.map((f) => f._id)));
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">🛍️ Products</h2>
          <p className="text-slate-500 text-sm mt-1">{!loading && `${products.length} items available`}</p>
        </div>
        {!loading && favoriteIds.size > 0 && (
          <span className="text-sm font-medium px-3 py-1 rounded-full"
            style={{ background: "rgba(219,39,119,0.15)", color: "#f472b6", border: "1px solid rgba(219,39,119,0.25)" }}>
            ❤️ {favoriteIds.size} favorited
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-slate-400 font-medium">No products available yet</p>
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
                  {/* Status badge top-left */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={p.isActive
                        ? { background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }
                        : { background: "rgba(100,116,139,0.2)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.3)" }}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {/* Favorite button top-right */}
                  <button
                    onClick={() => handleToggle(p._id)}
                    disabled={isToggling}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 disabled:opacity-50"
                    style={{
                      background: isFav ? "rgba(219,39,119,0.3)" : "rgba(0,0,0,0.4)",
                      border: isFav ? "1px solid rgba(219,39,119,0.5)" : "1px solid rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform duration-200"
                      style={{ transform: isToggling ? "scale(0.8)" : isFav ? "scale(1.1)" : "scale(1)" }}
                      viewBox="0 0 24 24"
                      fill={isFav ? "#f472b6" : "none"}
                      stroke={isFav ? "#f472b6" : "rgba(255,255,255,0.7)"}
                      strokeWidth={2}>
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
    </div>
  );
}
