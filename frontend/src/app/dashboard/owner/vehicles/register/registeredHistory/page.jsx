"use client";

import { useState, useEffect } from "react";
import { FaCar, FaSearch, FaSort, FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function RegisteredVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("plateNumber");
  const [sortDirection, setSortDirection] = useState("asc");
  const router = useRouter();

  useEffect(() => {
    async function loadVehicles() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/api/registered-vehicle", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(
      selected.length === filteredVehicles.length
        ? []
        : filteredVehicles.map((v) => v.vehicleId)
    );
  };

  const handleSort = (field) => {
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredVehicles = vehicles
    .filter((v) => {
      const searchText = search.toLowerCase();
      return (
        v.plateNumber?.toLowerCase().includes(searchText) ||
        v.model?.toLowerCase().includes(searchText) ||
        v.brand?.toLowerCase().includes(searchText) ||
        v.currentOwner?.toLowerCase().includes(searchText) ||
        String(v.year || "").toLowerCase().includes(searchText)
      );
    })
    .sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return sortDirection === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading registered vehicles...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Registered Vehicles
          </h1>
          <p className="text-gray-600 flex items-center">
            <FaCar className="mr-2" />
            {filteredVehicles.length} of {vehicles.length} vehicles
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles by plate, model, brand, year, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === filteredVehicles.length &&
                      filteredVehicles.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th onClick={() => handleSort("plateNumber")} className="px-6 py-4 cursor-pointer">Plate Number</th>
                <th onClick={() => handleSort("model")} className="px-6 py-4 cursor-pointer">Model</th>
                <th onClick={() => handleSort("brand")} className="px-6 py-4 cursor-pointer">Brand</th>
                <th onClick={() => handleSort("year")} className="px-6 py-4 cursor-pointer">Year</th>
                <th onClick={() => handleSort("currentOwner")} className="px-6 py-4 cursor-pointer">Current Owner</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((v) => (
                <tr key={v.vehicleId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selected.includes(v.vehicleId)}
                      onChange={() => toggleSelect(v.vehicleId)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.plateNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.currentOwner}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/vehicles/history/${v.vehicleId}`)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      title="View Ownership History"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <FaCar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No registered vehicles found</h3>
            <p className="text-gray-500">
              {search ? "Try adjusting your search criteria" : "No vehicles registered yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
