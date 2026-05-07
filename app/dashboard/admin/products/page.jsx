"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRequireAdmin } from "../../../../context/AuthContext";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../../../lib/services";

const empty = { name: "", description: "", price: "", stock: "", category: "", currency: "INR", image: "", isActive: true };

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded-lg animate-pulse w-24" style={{ background: "rgba(255,255,255,0.07)" }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminProducts() {
  const { loading: authLoading } = useRequireAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const isFormValid = form.name.trim() !== "" && form.price !== "" && form.stock !== "";
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (authLoading) return;
    getProducts()
      .then(({ data }) => setProducts(data.items))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [authLoading]);

  const handle = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleEditChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditForm({ ...editForm, [e.target.name]: val });
  };

  const startEdit = (p) => {
    setEditId(p._id);
    setEditForm({ name: p.name, description: p.description || "", price: p.price, stock: p.stock, category: p.category || "", currency: p.currency || "INR", image: p.image || "", isActive: p.isActive });
  };

  const cancelEdit = () => { setEditId(null); setEditForm({}); };

  const handleUpdate = async (id) => {
    if (!editForm.name.trim()) return toast.error("Product name is required");
    if (isNaN(editForm.price) || Number(editForm.price) < 0) return toast.error("Enter a valid price");
    if (isNaN(editForm.stock) || Number(editForm.stock) < 0) return toast.error("Enter a valid stock");
    try {
      const { data } = await updateProduct(id, { ...editForm, price: Number(editForm.price), stock: Number(editForm.stock) });
      setProducts(products.map((p) => p._id === id ? data.product : p));
      cancelEdit();
      toast.success("Product updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");
    if (isNaN(form.price) || Number(form.price) < 0) return toast.error("Enter a valid price");
    if (isNaN(form.stock) || Number(form.stock) < 0) return toast.error("Enter a valid stock");
    setSubmitting(true);
    try {
      const { data } = await createProduct({ ...form, price: Number(form.price), stock: Number(form.stock) });
      setProducts([data.product, ...products]);
      setForm(empty);
      toast.success("Product added!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const editInputClass = "w-full rounded-lg px-2 py-1 text-sm text-white outline-none transition"
    + " bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30";

  return (
    <div className="space-y-6">
      {/* Add Product Form */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">➕</span>
          <h2 className="text-xl font-bold text-gradient">Add New Product</h2>
        </div>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="name" placeholder="📦 Product Name *" value={form.name} onChange={handle} required className="input-dark" />
          <input name="category" placeholder="🏷️ Category" value={form.category} onChange={handle} className="input-dark" />
          <input name="price" placeholder="💰 Price *" type="number" min="0" step="0.01" value={form.price} onChange={handle} required className="input-dark" />
          <select name="currency" value={form.currency} onChange={handle} className="input-dark">
            <option value="INR" style={{ background: "#1a1a2e" }}>INR (₹)</option>
            <option value="USD" style={{ background: "#1a1a2e" }}>USD ($)</option>
            <option value="EUR" style={{ background: "#1a1a2e" }}>EUR (€)</option>
            <option value="GBP" style={{ background: "#1a1a2e" }}>GBP (£)</option>
          </select>
          <input name="stock" placeholder="📊 Stock *" type="number" min="0" value={form.stock} onChange={handle} required className="input-dark" />
          <input name="image" placeholder="🖼️ Image URL" value={form.image} onChange={handle} className="input-dark" />
          <input name="description" placeholder="📝 Description" value={form.description} onChange={handle} className="input-dark sm:col-span-2" />
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <input type="checkbox" name="isActive" id="isActive" checked={form.isActive} onChange={handle} className="w-4 h-4 accent-green-500" />
            <label htmlFor="isActive" className="text-sm text-slate-300 font-medium cursor-pointer"> Active Product</label>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting || !isFormValid} className="btn-primary" style={{ width: "auto", padding: "0.625rem 1.5rem" }}>
              {submitting ? "Adding..." : "Add Product 🚀"}
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📦</span>
          <h2 className="text-xl font-bold text-gradient">All Products</h2>
          {!loading && <span className="text-sm text-slate-500">({products.length})</span>}
        </div>
        <div className="overflow-x-auto rounded-2xl scrollbar-dark" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(124,58,237,0.08)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : products.length === 0
                  ? <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      <div className="text-4xl mb-2">📭</div>
                      <p>No products yet</p>
                    </td></tr>
                  : products.map((p) => editId === p._id ? (
                    <tr key={p._id} style={{ background: "rgba(124,58,237,0.06)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-4 py-3"><input name="image" value={editForm.image} onChange={handleEditChange} placeholder="URL" className={editInputClass} /></td>
                      <td className="px-4 py-3"><input name="name" value={editForm.name} onChange={handleEditChange} required className={editInputClass} /></td>
                      <td className="px-4 py-3"><input name="category" value={editForm.category} onChange={handleEditChange} className={editInputClass} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <input name="price" type="number" min="0" step="0.01" value={editForm.price} onChange={handleEditChange} className={`${editInputClass} w-20`} />
                          <select name="currency" value={editForm.currency} onChange={handleEditChange} className={editInputClass} style={{ background: "#1a1a2e" }}>
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3"><input name="stock" type="number" min="0" value={editForm.stock} onChange={handleEditChange} className={`${editInputClass} w-20`} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <input type="checkbox" name="isActive" checked={editForm.isActive} onChange={handleEditChange} className="w-4 h-4 accent-green-500" />
                          <span className="text-xs text-slate-400">Active</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdate(p._id)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold transition active:scale-95"
                            style={{ background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>
                            ✓ Save
                          </button>
                          <button onClick={cancelEdit}
                            className="px-3 py-1 rounded-lg text-xs font-semibold transition active:scale-95"
                            style={{ background: "rgba(100,116,139,0.2)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.3)" }}>
                            ✕ Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={p._id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td className="px-4 py-3">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                          : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(219,39,119,0.2))", border: "1px solid rgba(255,255,255,0.08)" }}>📦</div>
                        }
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                      <td className="px-4 py-3">
                        {p.category
                          ? <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>{p.category}</span>
                          : <span className="text-slate-600 text-xs">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 font-semibold text-gradient">{p.currency} {p.price}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={p.stock > 0
                            ? { background: "rgba(16,185,129,0.15)", color: "#34d399" }
                            : { background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                          {p.stock > 0 ? `${p.stock} left` : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={p.isActive
                            ? { background: "rgba(37,99,235,0.15)", color: "#60a5fa" }
                            : { background: "rgba(100,116,139,0.15)", color: "#94a3b8" }}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(p)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold transition active:scale-95"
                            style={{ background: "rgba(234,179,8,0.15)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.25)" }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(p._id)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold transition active:scale-95"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
