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
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
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
    setEditForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      stock: p.stock,
      category: p.category || "",
      currency: p.currency || "INR",
      image: p.image || "",
      isActive: p.isActive,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({});
  };

  const handleUpdate = async (id) => {
    if (!editForm.name.trim()) return toast.error("Product name is required");
    if (isNaN(editForm.price) || Number(editForm.price) < 0) return toast.error("Enter a valid price");
    if (isNaN(editForm.stock) || Number(editForm.stock) < 0) return toast.error("Enter a valid stock");

    try {
      const { data } = await updateProduct(id, {
        ...editForm,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
      });
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
      const { data } = await createProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
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

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const editInputClass = "w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      {/* Add Product Form */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Product</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="name" placeholder="Product Name" value={form.name} onChange={handle} required className={inputClass} />
          <input name="category" placeholder="Category (optional)" value={form.category} onChange={handle} className={inputClass} />
          <input name="price" placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={handle} required className={inputClass} />
          <select name="currency" value={form.currency} onChange={handle} className={inputClass}>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
          <input name="stock" placeholder="Stock" type="number" min="0" value={form.stock} onChange={handle} required className={inputClass} />
          <input name="image" placeholder="Image URL (optional)" value={form.image} onChange={handle} className={inputClass} />
          <input name="description" placeholder="Description (optional)" value={form.description} onChange={handle} className={`${inputClass} sm:col-span-2`} />
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isActive" id="isActive" checked={form.isActive} onChange={handle} className="w-4 h-4 accent-blue-600" />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting || !isFormValid}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm">
              {submitting ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          All Products {!loading && `(${products.length})`}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>{["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : products.length === 0
                  ? <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No products yet</td></tr>
                  : products.map((p) => editId === p._id ? (
                    // Edit Row
                    <tr key={p._id} className="bg-blue-50">
                      <td className="px-4 py-3">
                        <input name="image" value={editForm.image} onChange={handleEditChange} placeholder="Image URL" className={editInputClass} />
                      </td>
                      <td className="px-4 py-3">
                        <input name="name" value={editForm.name} onChange={handleEditChange} required className={editInputClass} />
                      </td>
                      <td className="px-4 py-3">
                        <input name="category" value={editForm.category} onChange={handleEditChange} placeholder="Category" className={editInputClass} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <input name="price" type="number" min="0" step="0.01" value={editForm.price} onChange={handleEditChange} className={`${editInputClass} w-20`} />
                          <select name="currency" value={editForm.currency} onChange={handleEditChange} className={editInputClass}>
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input name="stock" type="number" min="0" value={editForm.stock} onChange={handleEditChange} className={`${editInputClass} w-20`} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <input type="checkbox" name="isActive" checked={editForm.isActive} onChange={handleEditChange} className="w-4 h-4 accent-blue-600" />
                          <span className="text-xs text-gray-600">Active</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdate(p._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 transition">
                            Save
                          </button>
                          <button onClick={cancelEdit}
                            className="bg-gray-400 text-white px-3 py-1 rounded-lg text-xs hover:bg-gray-500 transition">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // View Row
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                          : <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                        }
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.category || "—"}</td>
                      <td className="px-4 py-3 text-gray-800">{p.currency} {p.price}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(p)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-600 transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(p._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition">
                            Delete
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
