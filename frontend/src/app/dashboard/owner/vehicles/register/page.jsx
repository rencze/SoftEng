"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaCar,
  FaSearch,
  FaSort,
  FaPlus,
  FaBan,
  FaUserEdit,
  FaHistory,
  FaTimes,
  FaIdCard,
  FaUser,
  FaExclamationTriangle,
  FaShieldAlt
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import React from "react";

// Memoized searchable dropdown component
const SearchableDropdown = React.memo(({ options, value, onChange, placeholder, disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  const filteredOptions = (options || []).filter(
    (opt) => opt && opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          onChange(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full max-h-40 overflow-auto bg-white border border-gray-300 rounded-xl mt-1 shadow-lg">
          {filteredOptions.map((opt, idx) => (
            <li
              key={idx}
              onClick={() => {
                onChange(opt);
                setSearchTerm(opt);
                setIsOpen(false);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-blue-100 transition-colors"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

SearchableDropdown.displayName = 'SearchableDropdown';

// Loading skeleton component
const VehicleRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 w-4 bg-gray-300 rounded"></div>
    </td>
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded"></div>
      </td>
    ))}
  </tr>
);

export default function RegisteredVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("plateNumber");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeOwnerModalOpen, setIsChangeOwnerModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleToChange, setVehicleToChange] = useState(null);
  const [vehicleToBlock, setVehicleToBlock] = useState(null);
  const [vehicleData, setVehicleData] = useState({
    plateNumber: "",
    currentOwner: "",
  });
  const [newOwner, setNewOwner] = useState("");
  
  // Updated for new Change Owner modal - storing entire vehicle object
  const [showChangeOwnerModal, setShowChangeOwnerModal] = useState(false);
  const [changeOwnerData, setChangeOwnerData] = useState({ 
    vehicle: null, 
    currentOwner: "" 
  });
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  const router = useRouter();

  // Memoized data fetching functions
  const loadRegisteredVehicles = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/registered-vehicle", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to load vehicles");
      
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setVehicles([]);
    }
  }, []);

  const loadAllVehicles = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to load all vehicles");
      
      const data = await res.json();
      setAllVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load all vehicles:", err);
      setAllVehicles([]);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to load customers");
      
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setCustomers([]);
    }
  }, []);

  // Updated: Open Change Owner modal and store entire vehicle object
  const handleOpenChangeOwner = async (vehicle) => {
    setChangeOwnerData({ vehicle, currentOwner: "" });
    setIsCustomerLoading(true);
    await loadCustomers();
    setIsCustomerLoading(false);
    setShowChangeOwnerModal(true);
  };

  // Updated: Handle saving owner change using the stored vehicle object
  const handleSaveChangeOwner = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Find customerId from customers
      const selectedCustomer = customers.find(
        (c) => `${c.firstName} ${c.lastName}` === changeOwnerData.currentOwner
      );
      const customerId = selectedCustomer ? selectedCustomer.customerId : null;

      if (!customerId) {
        throw new Error("Invalid customer selection");
      }

      const payload = { 
        vehicleId: changeOwnerData.vehicle.vehicleId, 
        customerId 
      };

      const res = await fetch("http://localhost:3001/api/registered-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to change owner");
      }

      await loadRegisteredVehicles();
      setShowChangeOwnerModal(false);
      alert("Owner changed successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadRegisteredVehicles(),
          loadAllVehicles(),
          loadCustomers()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [loadRegisteredVehicles, loadAllVehicles, loadCustomers]);

  // Optimized search and filter
  const filteredVehicles = useCallback(() => {
    if (!vehicles.length) return [];
    
    return vehicles
      .filter((v) => {
        if (!search) return true;
        const searchText = search.toLowerCase();
        return (
          v.plateNumber?.toLowerCase().includes(searchText) ||
          v.currentOwner?.toLowerCase().includes(searchText) ||
          v.ownerLabel?.toLowerCase().includes(searchText)
        );
      })
      .sort((a, b) => {
        let aVal = a[sortField] || "";
        let bVal = b[sortField] || "";
        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
      });
  }, [vehicles, search, sortField, sortDirection]);

  // Memoized utility functions
  const getOrdinalSuffix = useCallback((num) => {
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected(
      selected.length === filteredVehicles().length
        ? []
        : filteredVehicles().map((v) => v.vehicleId)
    );
  }, [selected.length, filteredVehicles]);

  const handleSort = useCallback((field) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === "asc" ? "desc" : "asc");
        return field;
      } else {
        setSortDirection("asc");
        return field;
      }
    });
  }, []);

  // Modal handlers
  const openModal = useCallback(async (vehicle = null) => {
    setIsModalOpen(true);
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleData({
        plateNumber: vehicle.plateNumber,
        currentOwner: vehicle.currentOwner,
      });
    } else {
      setEditingVehicle(null);
      setVehicleData({ plateNumber: "", currentOwner: "" });
    }

    // Load dropdown data if not already loaded
    if (allVehicles.length === 0 || customers.length === 0) {
      setDropdownsLoading(true);
      try {
        await Promise.all([
          allVehicles.length === 0 ? loadAllVehicles() : Promise.resolve(),
          customers.length === 0 ? loadCustomers() : Promise.resolve()
        ]);
      } finally {
        setDropdownsLoading(false);
      }
    }
  }, [allVehicles.length, customers.length, loadAllVehicles, loadCustomers]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setVehicleData({ plateNumber: "", currentOwner: "" });
  }, []);

  const openChangeOwnerModal = useCallback(async (vehicle) => {
    setVehicleToChange(vehicle);
    setNewOwner(vehicle.currentOwner);
    setIsChangeOwnerModalOpen(true);

    // Load customers if not already loaded
    if (customers.length === 0) {
      setDropdownsLoading(true);
      try {
        await loadCustomers();
      } finally {
        setDropdownsLoading(false);
      }
    }
  }, [customers.length, loadCustomers]);

  const closeChangeOwnerModal = useCallback(() => {
    setIsChangeOwnerModalOpen(false);
    setVehicleToChange(null);
    setNewOwner("");
  }, []);

  const openBlockModal = useCallback((vehicle) => {
    setVehicleToBlock(vehicle);
    setIsBlockModalOpen(true);
  }, []);

  const closeBlockModal = useCallback(() => {
    setIsBlockModalOpen(false);
    setVehicleToBlock(null);
  }, []);

  // Save vehicle registration
  const saveVehicle = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      // Find vehicleId from allVehicles
      const selectedVehicle = allVehicles.find(
        (v) => v.plateNumber === vehicleData.plateNumber
      );
      const vehicleId = selectedVehicle ? selectedVehicle.vehicleId : null;

      // Find customerId from customers
      const selectedCustomer = customers.find(
        (c) => `${c.firstName} ${c.lastName}` === vehicleData.currentOwner
      );
      const customerId = selectedCustomer ? selectedCustomer.customerId : null;

      if (!vehicleId || !customerId) {
        throw new Error("Invalid vehicle or customer selection");
      }

      const payload = { vehicleId, customerId };
      const url = editingVehicle 
        ? `http://localhost:3001/api/registered-vehicle/${editingVehicle.vehicleId}`
        : "http://localhost:3001/api/registered-vehicle";
      
      const method = editingVehicle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save vehicle");
      }

      await loadRegisteredVehicles();
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, [vehicleData, allVehicles, customers, editingVehicle, loadRegisteredVehicles, closeModal]);

  // Change owner function
  const changeOwner = useCallback(async () => {
    if (!vehicleToChange || !newOwner) return;

    try {
      const token = localStorage.getItem("token");

      // Find customerId from customers
      const selectedCustomer = customers.find(
        (c) => `${c.firstName} ${c.lastName}` === newOwner
      );
      const customerId = selectedCustomer ? selectedCustomer.customerId : null;

      if (!customerId) {
        throw new Error("Invalid customer selection");
      }

      const payload = { 
        vehicleId: vehicleToChange.vehicleId, 
        customerId 
      };

      const res = await fetch("http://localhost:3001/api/registered-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to change owner");
      }

      await loadRegisteredVehicles();
      closeChangeOwnerModal();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, [vehicleToChange, newOwner, customers, loadRegisteredVehicles, closeChangeOwnerModal]);

  // Block/Unregister vehicle function
  const blockVehicle = useCallback(async () => {
    if (!vehicleToBlock) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3001/api/registered-vehicle/${vehicleToBlock.vehicleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to block vehicle");
      }

      await loadRegisteredVehicles();
      closeBlockModal();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, [vehicleToBlock, loadRegisteredVehicles, closeBlockModal]);

  const currentVehicles = filteredVehicles();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 bg-gray-300 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-300 rounded w-40 animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="h-12 bg-gray-300 rounded w-96 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4"><div className="h-4 w-4 bg-gray-300 rounded"></div></th>
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <VehicleRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Registered Vehicles</h1>
          <p className="text-gray-600 flex items-center">
            <FaCar className="mr-2" /> {currentVehicles.length} of {vehicles.length} vehicles
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-medium"
        >
          <FaPlus className="mr-2" /> Register Vehicle
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles by plate, owner, ownership..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === currentVehicles.length && currentVehicles.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                {["plateNumber", "ownerLabel", "currentOwner", "model", "brand", "year"].map((field) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-6 py-4 cursor-pointer text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      {field === "plateNumber"
                        ? "Plate Number"
                        : field === "currentOwner"
                        ? "Owner"
                        : field === "ownerLabel"
                        ? "Ownership"
                        : field.charAt(0).toUpperCase() + field.slice(1)}
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentVehicles.map((v) => (
                <tr key={v.vehicleId} className={selected.includes(v.vehicleId) ? "bg-blue-50" : "hover:bg-gray-50 transition-colors"}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(v.vehicleId)}
                      onChange={() => toggleSelect(v.vehicleId)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">{v.plateNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      v.ownerOrder === 1 ? 'bg-green-100 text-green-800' :
                      v.ownerOrder === 2 ? 'bg-blue-100 text-blue-800' :
                      v.ownerOrder === 3 ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {v.ownerLabel || `${v.ownerOrder}${getOrdinalSuffix(v.ownerOrder)} Owner`}
                    </span>
                  </td>
                  <td className="px-6 py-4">{v.currentOwner}</td>
                  <td className="px-6 py-4">{v.model || "-"}</td>
                  <td className="px-6 py-4">{v.brand || "-"}</td>
                  <td className="px-6 py-4">{v.year || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => router.push(`/vehicles/history/${v.vehicleId}`)}
                        className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                        title="View Ownership History"
                      >
                        <FaHistory size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenChangeOwner(v)}
                        className="text-green-600 hover:text-green-800 p-1 transition-colors"
                        title="Change Owner"
                      >
                        <FaUserEdit size={16} />
                      </button>
                      <button 
                        onClick={() => openBlockModal(v)}
                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                        title="Block/Unregister Vehicle"
                      >
                        <FaBan size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentVehicles.length === 0 && (
          <div className="text-center py-12">
            <FaCar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No registered vehicles found</h3>
            <p className="text-gray-500">
              {search ? "Try adjusting your search criteria" : "No vehicles registered yet"}
            </p>
          </div>
        )}
      </div>

      {/* Improved Register/Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingVehicle ? "Edit Vehicle Registration" : "Register New Vehicle"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <p className="text-blue-100 mt-2">
                {editingVehicle 
                  ? "Update vehicle registration information" 
                  : "Register a new vehicle to the system"
                }
              </p>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plate Number */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <FaIdCard className="mr-2 text-blue-600" />
                    Plate Number *
                  </label>
                  {dropdownsLoading ? (
                    <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500">
                      Loading vehicles...
                    </div>
                  ) : (
                    <SearchableDropdown
                      options={allVehicles.map((v) => v.plateNumber)}
                      value={vehicleData.plateNumber}
                      onChange={(val) => setVehicleData((prev) => ({ ...prev, plateNumber: val }))}
                      placeholder="Select or type plate number..."
                    />
                  )}
                  {vehicleData.plateNumber && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <strong>Vehicle Details:</strong> {
                        allVehicles.find(v => v.plateNumber === vehicleData.plateNumber)?.brand || ''
                      } {
                        allVehicles.find(v => v.plateNumber === vehicleData.plateNumber)?.model ? 
                        `${allVehicles.find(v => v.plateNumber === vehicleData.plateNumber)?.model}` : ''
                      } {
                        allVehicles.find(v => v.plateNumber === vehicleData.plateNumber)?.year ? 
                        ` (${allVehicles.find(v => v.plateNumber === vehicleData.plateNumber)?.year})` : ''
                      }
                    </div>
                  )}
                </div>

                {/* Current Owner */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="mr-2 text-blue-600" />
                    Current Owner *
                  </label>
                  {dropdownsLoading ? (
                    <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500">
                      Loading customers...
                    </div>
                  ) : (
                    <SearchableDropdown
                      options={customers.map((c) => `${c.firstName} ${c.lastName}`)}
                      value={vehicleData.currentOwner}
                      onChange={(val) => setVehicleData((prev) => ({ ...prev, currentOwner: val }))}
                      placeholder="Select or type owner name..."
                    />
                  )}
                  {vehicleData.currentOwner && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <strong>Contact:</strong> {
                        customers.find(c => `${c.firstName} ${c.lastName}` === vehicleData.currentOwner)?.email || ''
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Warning Note for Editing */}
              {editingVehicle && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Important Note</p>
                      <p className="text-sm text-yellow-700">
                        Changing the owner will create a new ownership record in the vehicle's history.
                        The current ownership period will be closed and a new one will begin.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveVehicle}
                  disabled={!vehicleData.plateNumber || !vehicleData.currentOwner || dropdownsLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingVehicle ? "Update Registration" : "Register Vehicle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Improved Change Owner Modal */}
      {showChangeOwnerModal && changeOwnerData.vehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <FaUserEdit className="mr-2" />
                  Change Vehicle Owner
                </h2>
                <button
                  onClick={() => setShowChangeOwnerModal(false)}
                  className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <p className="text-green-100 mt-2">
                Transfer ownership of {changeOwnerData.vehicle.plateNumber}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Vehicle Information */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <FaCar className="mr-2" />
                  Vehicle Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plate Number:</span>
                    <span className="font-medium">{changeOwnerData.vehicle.plateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Owner:</span>
                    <span className="font-medium">{changeOwnerData.vehicle.currentOwner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ownership:</span>
                    <span className="font-medium">{changeOwnerData.vehicle.ownerLabel}</span>
                  </div>
                </div>
              </div>

              {/* New Owner Selection */}
              <div className="mb-6">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="mr-2 text-green-600" />
                  New Owner *
                </label>
                {isCustomerLoading ? (
                  <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500">
                    Loading customers...
                  </div>
                ) : (
                  <SearchableDropdown
                    options={customers.map((c) => `${c.firstName} ${c.lastName}`)}
                    value={changeOwnerData.currentOwner}
                    onChange={(val) => setChangeOwnerData((prev) => ({ ...prev, currentOwner: val }))}
                    placeholder="Select or type new owner name..."
                  />
                )}
                {changeOwnerData.currentOwner && (
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <strong>Contact:</strong> {
                      customers.find(c => `${c.firstName} ${c.lastName}` === changeOwnerData.currentOwner)?.email || ''
                    }
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-6">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">Important Notice</p>
                    <p className="text-sm text-yellow-700">
                      This action will close the current ownership record and start a new one in the vehicle's history.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowChangeOwnerModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChangeOwner}
                  disabled={!changeOwnerData.currentOwner}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Change Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Improved Block/Unregister Vehicle Modal */}
      {isBlockModalOpen && vehicleToBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <FaBan className="mr-2" />
                  Block Vehicle
                </h2>
                <button
                  onClick={closeBlockModal}
                  className="p-2 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <p className="text-red-100 mt-2">
                Remove {vehicleToBlock.plateNumber} from registered vehicles
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Vehicle Information */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaCar className="mr-2" />
                  Vehicle to Block
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plate Number:</span>
                    <span className="font-medium">{vehicleToBlock.plateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Owner:</span>
                    <span className="font-medium">{vehicleToBlock.currentOwner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ownership:</span>
                    <span className="font-medium">{vehicleToBlock.ownerLabel}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-6">
                <div className="flex items-start">
                  <FaShieldAlt className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-2">Warning: This action cannot be undone</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Close the current ownership record</li>
                      <li>• Remove vehicle from registered vehicles</li>
                      <li>• Make vehicle available for new registration</li>
                      <li>• All data will be preserved in history</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={closeBlockModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={blockVehicle}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  Block Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}