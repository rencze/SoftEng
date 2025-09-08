// src/app/dashboard/owner/technicians/page.jsx
"use client";

import { useState, useEffect } from "react";
import { 
  FaUserTie,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const router = useRouter();

  // Modal state
  const [editingTech, setEditingTech] = useState(null);
  const [techData, setTechData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    skills: "",
    active: true,
  });

  // Fetch technicians
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/technicians");
        const data = await res.json();
        setTechnicians(data);
      } catch (err) {
        console.error("Error fetching technicians:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modal handling
  const openModal = (tech = null) => {
    if (tech) {
      setEditingTech(tech);
      setTechData({
        firstName: tech.firstName,
        lastName: tech.lastName,
        email: tech.email,
        phone: tech.phone,
        skills: tech.skills,
        active: tech.active,
      });
    } else {
      setEditingTech(null);
      setTechData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        skills: "",
        active: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setTechData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveTechnician = async () => {
    try {
      if (editingTech) {
        const res = await fetch(`http://localhost:3001/api/technicians/${editingTech.technicianId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(techData),
        });
        if (res.ok) {
          setTechnicians(
            technicians.map((t) =>
              t.technicianId === editingTech.technicianId ? { ...t, ...techData } : t
            )
          );
          setEditingTech(null);
        }
      } else {
        const res = await fetch("http://localhost:3001/api/technicians", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(techData),
        });
        const newTech = await res.json();
        if (res.ok) setTechnicians([...technicians, newTech]);
      }
      setTechData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        skills: "",
        active: true,
      });
    } catch (err) {
      console.error("Error saving technician:", err);
    }
  };

  const deleteTechnician = async (id) => {
    if (!confirm("Are you sure you want to delete this technician?")) return;
    try {
      await fetch(`http://localhost:3001/api/technicians/${id}`, { method: "DELETE" });
      setTechnicians(technicians.filter((t) => t.technicianId !== id));
    } catch (err) {
      console.error("Error deleting technician:", err);
    }
  };

  const filteredTechnicians = technicians.filter((t) => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Technician Management</h1>
          <p className="text-gray-600">Manage technician profiles and availability</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          <FaPlus className="mr-2" /> Add Technician
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search technician..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTechnicians.map((t) => (
              <tr key={t.technicianId}>
                <td className="px-6 py-4">{t.firstName} {t.lastName}</td>
                <td className="px-6 py-4">{t.email}</td>
                <td className="px-6 py-4">{t.phone}</td>
                <td className="px-6 py-4">{t.skills || "—"}</td>
                <td className="px-6 py-4">
                  {t.active ? (
                    <span className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-1" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <FaTimesCircle className="mr-1" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => openModal(t)} className="text-blue-600 hover:text-blue-800">
                    <FaEdit />
                  </button>
                  <button onClick={() => deleteTechnician(t.technicianId)} className="text-red-600 hover:text-red-800">
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/owner/technician-schedules?tech=${t.technicianId}`)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <FaCalendarAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTechnicians.length === 0 && (
          <div className="text-center py-12 text-gray-500">No technicians found</div>
        )}
      </div>

      {/* Modal */}
      {(editingTech || techData.firstName !== "") && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTech ? "Edit Technician" : "Add Technician"}
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                name="firstName"
                value={techData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="lastName"
                value={techData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="email"
                name="email"
                value={techData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="phone"
                value={techData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="skills"
                value={techData.skills}
                onChange={handleChange}
                placeholder="Skills (comma-separated)"
                className="w-full border rounded-lg px-3 py-2"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={techData.active}
                  onChange={handleChange}
                />
                <span>Active</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingTech(null);
                  setTechData({ firstName: "", lastName: "", email: "", phone: "", skills: "", active: true });
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveTechnician}
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
