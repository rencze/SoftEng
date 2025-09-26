// src/app/dashboard/owner/vehicle-assignment/page.jsx
"use client";

import { useState, useEffect } from "react";
import { FaCar, FaPlus, FaUserTie, FaCheck, FaSearch, FaTimes } from "react-icons/fa";

export default function VehicleAssignmentPage() {
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assignments, setAssignments] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load vehicles and users
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");

        const vehiclesRes = await fetch("http://localhost:3001/api/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const vehiclesData = await vehiclesRes.json();
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);

        const usersRes = await fetch("http://localhost:3001/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAssign = async () => {
    if (!selectedVehicle || !selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/vehicle-assign/${selectedVehicle.vehicleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedUser.userId }),
      });

      if (res.ok) {
        setAssignments(prev => ({
          ...prev,
          [selectedVehicle.vehicleId]: selectedUser.userId,
        }));
        setSelectedVehicle(null);
        setSelectedUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        Vehicle Assignment
      </h1>

      {/* Search */}
      <div className="mb-6 max-w-md relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search vehicles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Vehicle list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Plate Number</th>
              <th className="px-6 py-4 text-left">Model</th>
              <th className="px-6 py-4 text-left">Brand</th>
              <th className="px-6 py-4 text-left">Assign To</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVehicles.map(v => (
              <tr key={v.vehicleId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">{v.plateNumber}</td>
                <td className="px-6 py-4">{v.model}</td>
                <td className="px-6 py-4">{v.brand}</td>
                <td className="px-6 py-4">
                  <select
                    value={assignments[v.vehicleId] || ""}
                    onChange={e => setSelectedUser(users.find(u => u.userId === e.target.value))}
                    className="border border-gray-300 rounded-lg px-2 py-1"
                  >
                    <option value="">Select User</option>
                    {users.map(u => (
                      <option key={u.userId} value={u.userId}>
                        {u.name || u.username}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedVehicle(v);
                      handleAssign();
                    }}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaCheck className="mr-1" /> Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaCar className="mx-auto h-12 w-12 mb-4" />
            <p>No vehicles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
    