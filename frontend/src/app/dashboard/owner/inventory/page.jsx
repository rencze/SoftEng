"use client";

import { useState, useEffect } from "react";
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBox, 
  FaWarehouse, FaUpload 
} from "react-icons/fa";

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
    unitPrice: "",
    remarks: ""
  });

  const [stockInModal, setStockInModal] = useState({ open: false, item: null });
  const [stockInQuantity, setStockInQuantity] = useState("");
  const [stockInRemarks, setStockInRemarks] = useState("");
  
  const [bulkStockInModal, setBulkStockInModal] = useState({ open: false });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkQuantity, setBulkQuantity] = useState("");
  const [bulkRemarks, setBulkRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

// Enhanced stock-in function - REMOVE technicianId
const handleStockIn = async () => {
  if (!stockInModal.item) return;
  
  const addQty = Number(stockInQuantity);
  if (isNaN(addQty) || addQty <= 0) {
    alert("Please enter a valid quantity to add.");
    return;
  }

  setActionLoading(stockInModal.item.partId);

  try {
    const payload = {
      quantityToAdd: addQty,
      remarks: stockInRemarks || `Stock-in of ${addQty} units`,
      // ❌ REMOVE technicianId: 1
    };

    const res = await fetch(`http://localhost:3001/api/parts/${stockInModal.item.partId}/stock-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to stock in");
    }

    const updated = await res.json();
    setInventory(prev => prev.map(p => 
      p.partId === stockInModal.item.partId ? updated : p
    ));
    
    // Reset modal
    setStockInModal({ open: false, item: null });
    setStockInQuantity("");
    setStockInRemarks("");
    
    alert(`Successfully stocked in ${addQty} units of ${stockInModal.item.partName}`);
  } catch (err) {
    console.error("Stock in failed:", err);
    alert(`Error: ${err.message}`);
  } finally {
    setActionLoading(null);
  }
};


  // Bulk stock-in function
  const handleBulkStockIn = async () => {
    if (selectedItems.size === 0) {
      alert("Please select items to stock in");
      return;
    }

    const addQty = Number(bulkQuantity);
    if (isNaN(addQty) || addQty <= 0) {
      alert("Please enter a valid quantity to add.");
      return;
    }

    setActionLoading("bulk");

    try {
      const items = Array.from(selectedItems).map(partId => ({
        partId: parseInt(partId),
        quantityToAdd: addQty
      }));

      const payload = {
        items,
        remarks: bulkRemarks || `Bulk stock-in of ${addQty} units`,
        // technicianId: 1
      };

      const res = await fetch("http://localhost:3001/api/parts/bulk/stock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to bulk stock in");
      }

      const result = await res.json();
      
      // Update inventory with successful results
      result.results.forEach(updatedPart => {
        if (updatedPart.partId && !updatedPart.error) {
          setInventory(prev => prev.map(p => 
            p.partId === updatedPart.partId ? updatedPart : p
          ));
        }
      });

      // Reset everything
      setBulkStockInModal({ open: false });
      setBulkQuantity("");
      setBulkRemarks("");
      setSelectedItems(new Set());
      
      alert(`Successfully processed bulk stock-in for ${selectedItems.size} items`);
    } catch (err) {
      console.error("Bulk stock in failed:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (partId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(partId)) {
      newSelected.delete(partId);
    } else {
      newSelected.add(partId);
    }
    setSelectedItems(newSelected);
  };

  // Select all filtered items
  const selectAllItems = () => {
    if (selectedItems.size === filteredInventory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredInventory.map(item => item.partId)));
    }
  };

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
        unitPrice: Number(inventoryData.unitPrice),
        remarks: inventoryData.remarks || "Manual adjustment"
      };

      if (editingItem?.partId) {
        // Update existing
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
        unitPrice: item.unitPrice.toString(),
        remarks: ""
      });
    } else {
      setEditingItem(null);
      setInventoryData({ 
        quantity: "", 
        partName: "", 
        partDescription: "", 
        unitPrice: "",
        remarks: ""
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
      unitPrice: "",
      remarks: ""
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
          <p className="text-gray-600">Manage inventory levels and stock movements</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setBulkStockInModal({ open: true })}
            disabled={selectedItems.size === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaUpload className="mr-2" /> Bulk Stock In
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            <FaPlus className="mr-2" /> Add Item
          </button>
        </div>
      </div>

      {/* Selection Info Bar */}
      {selectedItems.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaBox className="text-blue-500 mr-2" />
              <span className="text-blue-800 font-medium">
                {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={() => setSelectedItems(new Set())}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredInventory.length && filteredInventory.length > 0}
                  onChange={selectAllItems}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
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
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.partId)}
                      onChange={() => toggleItemSelection(item.partId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
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
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setStockInModal({ open: true, item })}
                        disabled={actionLoading === item.partId}
                        className="flex items-center text-green-600 hover:text-green-800 transition p-2 rounded-full hover:bg-green-50 disabled:opacity-50"
                        title="Stock In"
                      >
                        <FaWarehouse />
                      </button>
                      <button 
                        onClick={() => openModal(item)} 
                        className="text-blue-600 hover:text-blue-800 transition p-2 rounded-full hover:bg-blue-50"
                        title="Edit inventory"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => deleteInventory(item.partId)} 
                        className="text-red-600 hover:text-red-800 transition p-2 rounded-full hover:bg-red-50"
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
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  {search ? "No inventory items match your search" : "No inventory items found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  name="remarks"
                  value={inventoryData.remarks}
                  onChange={handleChange}
                  placeholder="Add remarks for this change..."
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="2"
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

      {/* Single Item Stock In Modal */}
      {stockInModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <FaWarehouse className="mr-2 text-green-600" />
              Stock In - {stockInModal.item?.partName}
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Current Stock Level</p>
                <p className="text-lg font-bold text-gray-800">{stockInModal.item?.quantity} units</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to Add *
                </label>
                <input
                  type="number"
                  value={stockInQuantity}
                  onChange={(e) => setStockInQuantity(e.target.value)}
                  placeholder="Enter quantity to add"
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  value={stockInRemarks}
                  onChange={(e) => setStockInRemarks(e.target.value)}
                  placeholder="Add remarks for this stock movement..."
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                  rows="2"
                />
              </div>

              {stockInQuantity && !isNaN(stockInQuantity) && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">New Stock Level After Addition</p>
                  <p className="text-lg font-bold text-green-800">
                    {Number(stockInModal.item?.quantity) + Number(stockInQuantity)} units
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setStockInModal({ open: false, item: null });
                  setStockInQuantity("");
                  setStockInRemarks("");
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStockIn}
                disabled={!stockInQuantity || isNaN(stockInQuantity) || stockInQuantity <= 0 || actionLoading === stockInModal.item?.partId}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {actionLoading === stockInModal.item?.partId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm Stock In"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Stock In Modal */}
      {bulkStockInModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <FaUpload className="mr-2 text-green-600" />
              Bulk Stock In ({selectedItems.size} items)
            </h2>
            
            <div className="max-h-60 overflow-y-auto mb-4 border rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Part Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Current Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">New Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory
                    .filter(item => selectedItems.has(item.partId))
                    .map((item) => (
                    <tr key={item.partId} className="border-t">
                      <td className="px-4 py-2">{item.partName}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2 font-semibold text-green-600">
                        {item.quantity + (Number(bulkQuantity) || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to Add to All Items *
                </label>
                <input
                  type="number"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(e.target.value)}
                  placeholder="Enter quantity to add to all selected items"
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  value={bulkRemarks}
                  onChange={(e) => setBulkRemarks(e.target.value)}
                  placeholder="Add remarks for this bulk stock movement..."
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                  rows="2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setBulkStockInModal({ open: false });
                  setBulkQuantity("");
                  setBulkRemarks("");
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStockIn}
                disabled={!bulkQuantity || isNaN(bulkQuantity) || bulkQuantity <= 0 || actionLoading === "bulk"}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {actionLoading === "bulk" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Apply to All Selected"
                )}
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


  // "use client";

  // import { useState, useEffect } from "react";
  // import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBox } from "react-icons/fa";

  // export default function InventoryPage() {
  //   const [inventory, setInventory] = useState([]);
  //   const [loading, setLoading] = useState(true);
  //   const [search, setSearch] = useState("");

  //   // Modal state
  //   const [isModalOpen, setIsModalOpen] = useState(false);
  //   const [editingItem, setEditingItem] = useState(null);
  //   const [inventoryData, setInventoryData] = useState({
  //     quantity: "",
  //     partName: "",
  //     partDescription: "",
  //     unitPrice: ""
  //   });

  // const [stockInModal, setStockInModal] = useState({ open: false, item: null });
  // const [stockInQuantity, setStockInQuantity] = useState("");

  // const handleStockIn = async () => {
  //   if (!stockInModal.item) return;
  //   const addQty = Number(stockInQuantity);
  //   if (isNaN(addQty) || addQty <= 0) {
  //     alert("Please enter a valid quantity to add.");
  //     return;
  //   }

  //   try {
  //     const newQty = Number(stockInModal.item.quantity) + addQty;
  //     const payload = { 
  //       ...stockInModal.item, 
  //       quantity: newQty,
  //       referenceType: "Stock-in", // ✅ match your ENUM in DB
  //       remarks: `Stock-in of ${addQty} units`
  //     };

  //     const res = await fetch(`http://localhost:3001/api/parts/${stockInModal.item.partId}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload)
  //     });

  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       throw new Error(errorData.error || "Failed to update quantity");
  //     }

  //     const updated = await res.json();
  //     setInventory(prev => prev.map(p => 
  //       p.partId === stockInModal.item.partId ? updated : p
  //     ));
  //     setStockInModal({ open: false, item: null });
  //     setStockInQuantity("");
  //   } catch (err) {
  //     console.error("Stock in failed:", err);
  //     alert(`Error: ${err.message}`);
  //   }
  // };



  //   // Fetch inventory
  //   useEffect(() => {
  //     fetchInventory();
  //   }, []);

  //   const fetchInventory = async () => {
  //     try {
  //       const res = await fetch("http://localhost:3001/api/parts");
  //       if (!res.ok) throw new Error("Failed to fetch inventory");
        
  //       const data = await res.json();
  //       setInventory(data);
  //     } catch (err) {
  //       console.error("Error fetching inventory:", err);
  //       // Fallback to sample data if API fails
  //       setInventory([
  //         {
  //           partId: 1,
  //           partName: "Air Conditioner Filter",
  //           partDescription: "High-quality air filter for AC units",
  //           unitPrice: 12.99,
  //           quantity: 45
  //         },
  //         {
  //           partId: 2,
  //           partName: "R-410A Freon",
  //           partDescription: "Refrigerant for modern AC systems",
  //           unitPrice: 89.99,
  //           quantity: 22
  //         },
  //         {
  //           partId: 3,
  //           partName: "Compressor Capacitor",
  //           partDescription: "Start capacitor for AC compressors",
  //           unitPrice: 24.50,
  //           quantity: 18
  //         }
  //       ]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const handleChange = (e) => {
  //     const { name, value } = e.target;
  //     setInventoryData((prev) => ({
  //       ...prev,
  //       [name]: value
  //     }));
  //   };

  //   const saveInventory = async () => {
  //     try {
  //       // Convert string values to numbers
  //       const payload = {
  //         ...inventoryData,
  //         quantity: Number(inventoryData.quantity),
  //         unitPrice: Number(inventoryData.unitPrice)
  //       };

  //       if (editingItem?.partId) {
  //         // Update existing - send all fields to match your backend
  //         const res = await fetch(`http://localhost:3001/api/parts/${editingItem.partId}`, {
  //           method: "PUT",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(payload)
  //         });

  //         if (!res.ok) {
  //           const errorData = await res.json();
  //           throw new Error(errorData.error || "Failed to update part");
  //         }

  //         const updatedPart = await res.json();
  //         setInventory((prev) =>
  //           prev.map((item) =>
  //             item.partId === editingItem.partId ? updatedPart : item
  //           )
  //         );
  //       } else {
  //         // Add new
  //         const res = await fetch("http://localhost:3001/api/parts", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(payload)
  //         });

  //         if (!res.ok) {
  //           const errorData = await res.json();
  //           throw new Error(errorData.error || "Failed to add part");
  //         }

  //         const newItem = await res.json();
  //         setInventory((prev) => [...prev, newItem]);
  //       }

  //       closeModal();
  //     } catch (err) {
  //       console.error("Error saving inventory:", err);
  //       alert(`Error saving inventory: ${err.message}`);
  //     }
  //   };

  //   const deleteInventory = async (partId) => {
  //     if (!confirm("Are you sure you want to delete this inventory item?")) return;
  //     try {
  //       const res = await fetch(`http://localhost:3001/api/parts/${partId}`, { 
  //         method: "DELETE" 
  //       });
        
  //       if (!res.ok) {
  //         const errorData = await res.json();
  //         throw new Error(errorData.error || "Failed to delete part");
  //       }
        
  //       setInventory((prev) => prev.filter((item) => item.partId !== partId));
  //     } catch (err) {
  //       console.error("Error deleting inventory:", err);
  //       alert(`Error deleting inventory: ${err.message}`);
  //     }
  //   };

  //   const openModal = (item = null) => {
  //     if (item) {
  //       setEditingItem(item);
  //       setInventoryData({
  //         quantity: item.quantity.toString(),
  //         partName: item.partName,
  //         partDescription: item.partDescription || "",
  //         unitPrice: item.unitPrice.toString()
  //       });
  //     } else {
  //       setEditingItem(null);
  //       setInventoryData({ 
  //         quantity: "", 
  //         partName: "", 
  //         partDescription: "", 
  //         unitPrice: "" 
  //       });
  //     }
  //     setIsModalOpen(true);
  //   };

  //   const closeModal = () => {
  //     setIsModalOpen(false);
  //     setEditingItem(null);
  //     setInventoryData({ 
  //       quantity: "", 
  //       partName: "", 
  //       partDescription: "", 
  //       unitPrice: "" 
  //     });
  //   };

  //   const filteredInventory = inventory.filter((item) =>
  //     item.partName.toLowerCase().includes(search.toLowerCase()) ||
  //     (item.partDescription && item.partDescription.toLowerCase().includes(search.toLowerCase()))
  //   );

  //   if (loading) {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="min-h-screen bg-gray-50 p-6">
  //       {/* Header */}
  //       <div className="flex justify-between items-center mb-6">
  //         <div>
  //           <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
  //           <p className="text-gray-600">Manage inventory levels for parts</p>
  //         </div>
  //         <button
  //           onClick={() => openModal()}
  //           className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
  //         >
  //           <FaPlus className="mr-2" /> Add Item
  //         </button>
  //       </div>

  //       {/* Search */}
  //       <div className="bg-white rounded-xl border p-4 mb-6 flex items-center shadow-sm">
  //         <div className="relative flex-1">
  //           <FaSearch className="absolute left-3 top-3 text-gray-400" />
  //           <input
  //             type="text"
  //             placeholder="Search parts by name or description..."
  //             value={search}
  //             onChange={(e) => setSearch(e.target.value)}
  //             className="border rounded-lg pl-10 pr-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
  //           />
  //         </div>
  //         {search && (
  //           <button
  //             onClick={() => setSearch("")}
  //             className="ml-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
  //           >
  //             Clear
  //           </button>
  //         )}
  //       </div>

  //       {/* Inventory Table */}
  //       <div className="bg-white rounded-xl shadow overflow-hidden">
  //         <table className="min-w-full divide-y divide-gray-200">
  //           <thead className="bg-gray-50">
  //             <tr>
  //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
  //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
  //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
  //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
  //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
  //             </tr>
  //           </thead>
  //           <tbody className="divide-y divide-gray-200">
  //             {filteredInventory.length > 0 ? (
  //               filteredInventory.map((item) => (
  //                 <tr key={item.partId} className="hover:bg-gray-50 transition">
  //                   <td className="px-6 py-4 font-medium">
  //                     <div className="flex items-center">
  //                       <FaBox className="text-blue-500 mr-2" />
  //                       {item.partName}
  //                     </div>
  //                   </td>
  //                   <td className="px-6 py-4 text-gray-600">{item.partDescription || "No description"}</td>
  //                   <td className="px-6 py-4">
  //                     ${typeof item.unitPrice === 'number' 
  //                       ? item.unitPrice.toFixed(2) 
  //                       : Number(item.unitPrice).toFixed(2)}
  //                   </td>
  //                   <td className="px-6 py-4">
  //                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
  //                       item.quantity > 20 
  //                         ? "bg-green-100 text-green-800" 
  //                         : item.quantity > 5 
  //                         ? "bg-yellow-100 text-yellow-800" 
  //                         : "bg-red-100 text-red-800"
  //                     }`}>
  //                       {item.quantity} in stock
  //                     </span>
  //                   </td>
  //                   <td className="px-6 py-4">
  // <div className="flex space-x-3">
  //   <button 
  //     onClick={() => setStockInModal({ open: true, item })}
  //     className="text-green-600 hover:text-green-800 transition p-1 rounded-full hover:bg-green-50"
  //     title="Stock In"
  //   >
  //     <FaPlus />
  //   </button>
  //   <button 
  //     onClick={() => openModal(item)} 
  //     className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
  //     title="Edit inventory"
  //   >
  //     <FaEdit />
  //   </button>
  //   <button 
  //     onClick={() => deleteInventory(item.partId)} 
  //     className="text-red-600 hover:text-red-800 transition p-1 rounded-full hover:bg-red-50"
  //     title="Delete inventory"
  //   >
  //     <FaTrash />
  //   </button>
  // </div>

  //                   </td>
  //                 </tr>
  //               ))
  //             ) : (
  //               <tr>
  //                 <td colSpan={5} className="text-center py-12 text-gray-500">
  //                   {search ? "No inventory items match your search" : "No inventory items found"}
  //                 </td>
  //               </tr>
  //             )}
  //           </tbody>
  //         </table>
  //       </div>

  //       {/* Modal */}
  //       {isModalOpen && (
  //         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
  //           <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
  //             <div className="flex justify-between items-center mb-4">
  //               <h2 className="text-xl font-bold text-gray-800">
  //                 {editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
  //               </h2>
  //               <button
  //                 onClick={closeModal}
  //                 className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
  //               >
  //                 <FaTimes />
  //               </button>
  //             </div>
              
  //             <div className="space-y-4">
  //               {!editingItem && (
  //                 <>
  //                   <div>
  //                     <label className="block text-sm font-medium text-gray-700 mb-1">
  //                       Part Name *
  //                     </label>
  //                     <input
  //                       type="text"
  //                       name="partName"
  //                       value={inventoryData.partName}
  //                       onChange={handleChange}
  //                       placeholder="Enter part name"
  //                       className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
  //                       required
  //                     />
  //                   </div>
                    
  //                   <div>
  //                     <label className="block text-sm font-medium text-gray-700 mb-1">
  //                       Description
  //                     </label>
  //                     <textarea
  //                       name="partDescription"
  //                       value={inventoryData.partDescription}
  //                       onChange={handleChange}
  //                       placeholder="Enter part description"
  //                       className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
  //                       rows="2"
  //                     />
  //                   </div>
                    
  //                   <div>
  //                     <label className="block text-sm font-medium text-gray-700 mb-1">
  //                       Unit Price ($) *
  //                     </label>
  //                     <input
  //                       type="number"
  //                       name="unitPrice"
  //                       value={inventoryData.unitPrice}
  //                       onChange={handleChange}
  //                       placeholder="0.00"
  //                       min="0"
  //                       step="0.01"
  //                       className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
  //                       required
  //                     />
  //                   </div>
  //                 </>
  //               )}
                
  //               {editingItem && (
  //                 <>
  //                   <DisplayField label="Part Name" value={inventoryData.partName} />
  //                   <DisplayField label="Description" value={inventoryData.partDescription || "No description"} />
  //                   <DisplayField label="Unit Price" value={`$${Number(inventoryData.unitPrice).toFixed(2)}`} />
  //                 </>
  //               )}

  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Quantity *
  //                 </label>
  //                 <input
  //                   type="number"
  //                   name="quantity"
  //                   value={inventoryData.quantity}
  //                   onChange={handleChange}
  //                   placeholder="Enter quantity"
  //                   min="0"
  //                   className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
  //                   required
  //                 />
  //               </div>
  //             </div>

  //             <div className="mt-6 flex justify-end space-x-3">
  //               <button 
  //                 onClick={closeModal} 
  //                 className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
  //               >
  //                 Cancel
  //               </button>
  //               <button 
  //                 onClick={saveInventory} 
  //                 className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
  //                 disabled={!inventoryData.partName || inventoryData.quantity === "" || inventoryData.quantity < 0 || !inventoryData.unitPrice}
  //               >
  //                 {editingItem ? "Update" : "Add"} Inventory
  //               </button>
  //             </div>
  //           </div>
  //         </div>
        
  //       )}

  //       {stockInModal.open && (
  //   <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
  //     <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
  //       <h2 className="text-xl font-bold mb-4 text-gray-800">
  //         Stock In - {stockInModal.item?.partName}
  //       </h2>
  //       <div className="space-y-3">
  //         <p className="text-gray-600">
  //           Current Quantity: <strong>{stockInModal.item?.quantity}</strong>
  //         </p>
  //         <input
  //           type="number"
  //           value={stockInQuantity}
  //           onChange={(e) => setStockInQuantity(e.target.value)}
  //           placeholder="Enter quantity to add"
  //           className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
  //           min="1"
  //         />
  //       </div>
  //       <div className="mt-5 flex justify-end space-x-3">
  //         <button
  //           onClick={() => {
  //             setStockInModal({ open: false, item: null });
  //             setStockInQuantity("");
  //           }}
  //           className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
  //         >
  //           Cancel
  //         </button>
  //         <button
  //           onClick={handleStockIn}
  //           className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
  //         >
  //           Confirm
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // )}



  //     </div>
  //   );
  // }

  // // Small component for display-only fields in modal
  // function DisplayField({ label, value }) {
  //   return (
  //     <div className="border rounded-lg px-3 py-2 bg-gray-50">
  //       <p className="text-sm text-gray-500">{label}</p>
  //       <p className="font-medium">{value}</p>
  //     </div>
  //   );
  // }