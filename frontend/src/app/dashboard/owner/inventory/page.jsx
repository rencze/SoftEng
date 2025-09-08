// src/app/dashboard/owner/inventory/page.jsx
"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function InventoryPage() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [editingPart, setEditingPart] = useState(null);
  const [partData, setPartData] = useState({
    partsName: "",
    partsCost: "",
    stock: 0,
    reorder_level: 0,
  });

  // Fetch inventory parts
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/inventory");
        const data = await res.json();
        setParts(data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPartData((prev) => ({
      ...prev,
      [name]: name === "stock" || name === "reorder_level" || name === "partsCost" ? Number(value) : value,
    }));
  };

  const savePart = async () => {
    try {
      if (editingPart) {
        const res = await fetch(`http://localhost:3001/api/inventory/${editingPart.partsId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partData),
        });
        if (res.ok) {
          setParts(
            parts.map((p) =>
              p.partsId === editingPart.partsId ? { ...p, ...partData } : p
            )
          );
          setEditingPart(null);
        }
      } else {
        const res = await fetch("http://localhost:3001/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partData),
        });
        const newPart = await res.json();
        if (res.ok) setParts([...parts, newPart]);
      }
      setPartData({ partsName: "", partsCost: "", stock: 0, reorder_level: 0 });
    } catch (err) {
      console.error("Error saving part:", err);
    }
  };

  const deletePart = async (id) => {
    if (!confirm("Are you sure you want to delete this part?")) return;
    try {
      await fetch(`http://localhost:3001/api/inventory/${id}`, { method: "DELETE" });
      setParts(parts.filter((p) => p.partsId !== id));
    } catch (err) {
      console.error("Error deleting part:", err);
    }
  };

  const filteredParts = parts.filter((p) =>
    p.partsName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-600">Manage parts, stock, and reorder levels</p>
        </div>
        <button
          onClick={() => setEditingPart({})}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          <FaPlus className="mr-2" /> Add Part
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search parts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 w-1/2"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredParts.map((p) => (
              <tr key={p.partsId}>
                <td className="px-6 py-4">{p.partsName}</td>
                <td className="px-6 py-4">${p.partsCost.toFixed(2)}</td>
                <td className="px-6 py-4">{p.stock}</td>
                <td className="px-6 py-4">{p.reorder_level}</td>
                <td className="px-6 py-4 flex space-x-3">
                  <button
                    onClick={() => setEditingPart(p)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deletePart(p.partsId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredParts.length === 0 && (
          <div className="text-center py-12 text-gray-500">No parts found</div>
        )}
      </div>

      {/* Modal */}
      {editingPart && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingPart.partsId ? "Edit Part" : "Add Part"}</h2>
            <div className="space-y-3">
              <input
                type="text"
                name="partsName"
                value={partData.partsName}
                onChange={handleChange}
                placeholder="Part Name"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                name="partsCost"
                value={partData.partsCost}
                onChange={handleChange}
                placeholder="Cost"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                name="stock"
                value={partData.stock}
                onChange={handleChange}
                placeholder="Stock"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                name="reorder_level"
                value={partData.reorder_level}
                onChange={handleChange}
                placeholder="Reorder Level"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingPart(null);
                  setPartData({ partsName: "", partsCost: "", stock: 0, reorder_level: 0 });
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={savePart}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
