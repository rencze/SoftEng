"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBox } from "react-icons/fa";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [inventoryData, setInventoryData] = useState({
    quantity: "",
    partName: "",
    partDescription: "",
    unitPrice: ""
  });

  // Fetch inventory
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/parts");
      if (!res.ok) throw new Error("Failed to fetch inventory");
      
      const data = await res.json();
      setInventory(data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      // Fallback to sample data if API fails
      setInventory([
        {
          partId: 1,
          partName: "Air Conditioner Filter",
          partDescription: "High-quality air filter for AC units",
          unitPrice: 12.99,
          quantity: 45
        },
        {
          partId: 2,
          partName: "R-410A Freon",
          partDescription: "Refrigerant for modern AC systems",
          unitPrice: 89.99,
          quantity: 22
        },
        {
          partId: 3,
          partName: "Compressor Capacitor",
          partDescription: "Start capacitor for AC compressors",
          unitPrice: 24.50,
          quantity: 18
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInventoryData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const saveInventory = async () => {
    try {
      // Convert string values to numbers
      const payload = {
        ...inventoryData,
        quantity: Number(inventoryData.quantity),
        unitPrice: Number(inventoryData.unitPrice)
      };

      if (editingItem?.partId) {
        // Update existing - send all fields to match your backend
        const res = await fetch(`http://localhost:3001/api/parts/${editingItem.partId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to update part");
        }

        const updatedPart = await res.json();
        setInventory((prev) =>
          prev.map((item) =>
            item.partId === editingItem.partId ? updatedPart : item
          )
        );
      } else {
        // Add new
        const res = await fetch("http://localhost:3001/api/parts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to add part");
        }

        const newItem = await res.json();
        setInventory((prev) => [...prev, newItem]);
      }

      closeModal();
    } catch (err) {
      console.error("Error saving inventory:", err);
      alert(`Error saving inventory: ${err.message}`);
    }
  };

  const deleteInventory = async (partId) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/parts/${partId}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete part");
      }
      
      setInventory((prev) => prev.filter((item) => item.partId !== partId));
    } catch (err) {
      console.error("Error deleting inventory:", err);
      alert(`Error deleting inventory: ${err.message}`);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setInventoryData({
        quantity: item.quantity.toString(),
        partName: item.partName,
        partDescription: item.partDescription || "",
        unitPrice: item.unitPrice.toString()
      });
    } else {
      setEditingItem(null);
      setInventoryData({ 
        quantity: "", 
        partName: "", 
        partDescription: "", 
        unitPrice: "" 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setInventoryData({ 
      quantity: "", 
      partName: "", 
      partDescription: "", 
      unitPrice: "" 
    });
  };

  const filteredInventory = inventory.filter((item) =>
    item.partName.toLowerCase().includes(search.toLowerCase()) ||
    (item.partDescription && item.partDescription.toLowerCase().includes(search.toLowerCase()))
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
          <p className="text-gray-600">Manage inventory levels for parts</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" /> Add Item
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex items-center shadow-sm">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search parts by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg pl-10 pr-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="ml-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => (
                <tr key={item.partId} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center">
                      <FaBox className="text-blue-500 mr-2" />
                      {item.partName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.partDescription || "No description"}</td>
                  <td className="px-6 py-4">
                    ${typeof item.unitPrice === 'number' 
                      ? item.unitPrice.toFixed(2) 
                      : Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.quantity > 20 
                        ? "bg-green-100 text-green-800" 
                        : item.quantity > 5 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {item.quantity} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => openModal(item)} 
                        className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                        title="Edit inventory"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => deleteInventory(item.partId)} 
                        className="text-red-600 hover:text-red-800 transition p-1 rounded-full hover:bg-red-50"
                        title="Delete inventory"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  {search ? "No inventory items match your search" : "No inventory items found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              {!editingItem && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Part Name *
                    </label>
                    <input
                      type="text"
                      name="partName"
                      value={inventoryData.partName}
                      onChange={handleChange}
                      placeholder="Enter part name"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="partDescription"
                      value={inventoryData.partDescription}
                      onChange={handleChange}
                      placeholder="Enter part description"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      rows="2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price ($) *
                    </label>
                    <input
                      type="number"
                      name="unitPrice"
                      value={inventoryData.unitPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </>
              )}
              
              {editingItem && (
                <>
                  <DisplayField label="Part Name" value={inventoryData.partName} />
                  <DisplayField label="Description" value={inventoryData.partDescription || "No description"} />
                  <DisplayField label="Unit Price" value={`$${Number(inventoryData.unitPrice).toFixed(2)}`} />
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={inventoryData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="0"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={closeModal} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button 
                onClick={saveInventory} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                disabled={!inventoryData.partName || inventoryData.quantity === "" || inventoryData.quantity < 0 || !inventoryData.unitPrice}
              >
                {editingItem ? "Update" : "Add"} Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small component for display-only fields in modal
function DisplayField({ label, value }) {
  return (
    <div className="border rounded-lg px-3 py-2 bg-gray-50">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}