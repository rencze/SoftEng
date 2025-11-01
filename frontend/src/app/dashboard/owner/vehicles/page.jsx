"use client";

import { useState, useEffect } from "react";
import {
  FaCar,
  FaPlus,
  FaEdit,
  FaSearch,
  FaDownload,
  FaSort,
  FaHistory,
} from "react-icons/fa";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("plateNumber");
  const [sortDirection, setSortDirection] = useState("asc");

  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    plateNumber: "",
    model: "",
    brand: "",
    year: "",
  });

  // History modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load vehicles
  useEffect(() => {
    async function loadVehicles() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/api/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setVehicles(data);
        else setVehicles([]);
      } catch (err) {
        console.error("Error loading vehicles:", err);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  // Modal controls
  const openModal = (vehicle = null) => {
    setIsModalOpen(true);
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleData({ ...vehicle });
    } else {
      setEditingVehicle(null);
      setVehicleData({ plateNumber: "", model: "", brand: "", year: "" });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setVehicleData({ plateNumber: "", model: "", brand: "", year: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({ ...prev, [name]: value }));
  };

  // Save or update
  const saveVehicle = async () => {
    try {
      const token = localStorage.getItem("token");

      if (editingVehicle) {
        const res = await fetch(
          `http://localhost:3001/api/vehicles/${editingVehicle.vehicleId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(vehicleData),
          }
        );
        if (!res.ok) {
          const error = await res.json();
          alert("Failed to update vehicle: " + (error.message || res.status));
          return;
        }
        setVehicles(
          vehicles.map((v) =>
            v.vehicleId === editingVehicle.vehicleId
              ? { ...v, ...vehicleData }
              : v
          )
        );
        closeModal();
      } else {
        const res = await fetch("http://localhost:3001/api/vehicles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` },
          body: JSON.stringify(vehicleData),
        });
        if (!res.ok) {
          const error = await res.json();
          alert("Failed to add vehicle: " + (error.message || res.status));
          return;
        }
        const newVehicle = await res.json();
        setVehicles([...vehicles, newVehicle]);
        closeModal();
      }
    } catch (err) {
      console.error("Error saving vehicle:", err);
      alert("Something went wrong when saving the vehicle.");
    }
  };

  // Load vehicle ownership history - CORRECTED ENDPOINT
  const openHistoryModal = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    setHistoryData([]);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/registered-vehicle/history/${vehicle.vehicleId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      } else {
        console.error("Failed to load ownership history");
        setHistoryData([]);
      }
    } catch (err) {
      console.error("Error loading ownership history:", err);
      alert("Failed to load ownership history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedVehicle(null);
    setHistoryData([]);
  };

  // Selection
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

  // Sorting
  const handleSort = (field) => {
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filtering + sorting
  const filteredVehicles = vehicles
    .filter((v) => {
      const searchText = search.toLowerCase();
      return (
        v.plateNumber?.toLowerCase().includes(searchText) ||
        v.model?.toLowerCase().includes(searchText) ||
        v.brand?.toLowerCase().includes(searchText) ||
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
        <span className="ml-3 text-gray-600">Loading vehicles...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Vehicle Management
          </h1>
          <p className="text-gray-600 flex items-center">
            <FaCar className="mr-2" />
            {filteredVehicles.length} of {vehicles.length} vehicles
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FaDownload className="mr-2" /> Export
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <FaPlus className="mr-2" /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles by plate, model, brand, year..."
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
                    checked={
                      selected.length === filteredVehicles.length &&
                      filteredVehicles.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                {["plateNumber", "model", "brand", "year"].map((field) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((v) => (
                <tr
                  key={v.vehicleId}
                  className={`hover:bg-gray-50 transition-colors ${
                    selected.includes(v.vehicleId) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selected.includes(v.vehicleId)}
                      onChange={() => toggleSelect(v.vehicleId)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {v.plateNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => openModal(v)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit Vehicle"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => openHistoryModal(v)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      title="View Ownership History"
                    >
                      <FaHistory />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaCar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-500">
              {search
                ? "Try adjusting your search criteria"
                : "Get started by adding your first vehicle"}
            </p>
          </div>
        )}
      </div>

      {/* Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </h2>
            <div className="space-y-3">
              {["plateNumber", "model", "brand", "year"].map((field) => (
                <input
                  key={field}
                  type={field === "year" ? "number" : "text"}
                  name={field}
                  value={vehicleData[field]}
                  onChange={handleChange}
                  placeholder={
                    field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveVehicle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ownership History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl relative shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaHistory className="mr-2 text-blue-600" />
              {selectedVehicle?.plateNumber} — Ownership History
            </h2>

            {loadingHistory ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading ownership history...</span>
              </div>
            ) : historyData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Owner Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Email</th>
                      <th className="px-4 py-3 text-left font-semibold">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold">Registration Start</th>
                      <th className="px-4 py-3 text-left font-semibold">Registration End</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
<tbody>
  {historyData.map((record, idx) => (
    <tr 
      key={idx} 
      className={`border-b hover:bg-gray-50 ${
        !record.ownershipEnd ? 'bg-green-50' : ''
      }`}
    >
      {/* Owner Name */}
      <td className="px-4 py-3 font-medium">{record.ownerName}</td>

      {/* Email (from backend, optional) */}
      <td className="px-4 py-3">{record.email || 'N/A'}</td>

      {/* Phone (from backend, optional) */}
      <td className="px-4 py-3">{record.phone || 'N/A'}</td>

      {/* Registration Start */}
      <td className="px-4 py-3">
        {record.ownershipStart
          ? new Date(record.ownershipStart).toLocaleDateString()
          : 'N/A'}
      </td>

      {/* Registration End */}
      <td className="px-4 py-3">
        {record.ownershipEnd
          ? new Date(record.ownershipEnd).toLocaleDateString()
          : 'Current Owner'}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            !record.ownershipEnd ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {!record.ownershipEnd ? 'Active' : 'Previous'}
        </span>
      </td>
    </tr>
  ))}
</tbody>

                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No ownership history found</p>
                <p className="text-gray-400 text-sm">
                  This vehicle doesn't have any registered ownership records yet.
                </p>
              </div>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={closeHistoryModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import {
//   FaCar,
//   FaPlus,
//   FaEdit,
//   FaSearch,
//   FaDownload,
//   FaSort,
//   FaHistory, // ✅ Added
// } from "react-icons/fa";

// export default function VehiclesPage() {
//   const [vehicles, setVehicles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState([]);
//   const [sortField, setSortField] = useState("plateNumber");
//   const [sortDirection, setSortDirection] = useState("asc");

//   const [editingVehicle, setEditingVehicle] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [vehicleData, setVehicleData] = useState({
//     plateNumber: "",
//     model: "",
//     brand: "",
//     year: "",
//   });

//   // ✅ History modal state
//   const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
//   const [historyData, setHistoryData] = useState([]);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [loadingHistory, setLoadingHistory] = useState(false);

//   // Load vehicles
//   useEffect(() => {
//     async function loadVehicles() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch("http://localhost:3001/api/vehicles", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         if (Array.isArray(data)) setVehicles(data);
//         else setVehicles([]);
//       } catch (err) {
//         console.error("Error loading vehicles:", err);
//         setVehicles([]);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadVehicles();
//   }, []);

//   // Modal controls
//   const openModal = (vehicle = null) => {
//     setIsModalOpen(true);
//     if (vehicle) {
//       setEditingVehicle(vehicle);
//       setVehicleData({ ...vehicle });
//     } else {
//       setEditingVehicle(null);
//       setVehicleData({ plateNumber: "", model: "", brand: "", year: "" });
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingVehicle(null);
//     setVehicleData({ plateNumber: "", model: "", brand: "", year: "" });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setVehicleData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Save or update
//   const saveVehicle = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       if (editingVehicle) {
//         const res = await fetch(
//           `http://localhost:3001/api/vehicles/${editingVehicle.vehicleId}`,
//           {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify(vehicleData),
//           }
//         );
//         if (!res.ok) {
//           const error = await res.json();
//           alert("Failed to update vehicle: " + (error.message || res.status));
//           return;
//         }
//         setVehicles(
//           vehicles.map((v) =>
//             v.vehicleId === editingVehicle.vehicleId
//               ? { ...v, ...vehicleData }
//               : v
//           )
//         );
//         closeModal();
//       } else {
//         const res = await fetch("http://localhost:3001/api/vehicles", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}` },
//           body: JSON.stringify(vehicleData),
//         });
//         if (!res.ok) {
//           const error = await res.json();
//           alert("Failed to add vehicle: " + (error.message || res.status));
//           return;
//         }
//         const newVehicle = await res.json();
//         setVehicles([...vehicles, newVehicle]);
//         closeModal();
//       }
//     } catch (err) {
//       console.error("Error saving vehicle:", err);
//       alert("Something went wrong when saving the vehicle.");
//     }
//   };

//   // ✅ Load vehicle history
//   const openHistoryModal = async (vehicle) => {
//     setSelectedVehicle(vehicle);
//     setIsHistoryModalOpen(true);
//     setLoadingHistory(true);
//     setHistoryData([]);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         `http://localhost:3001/api/vehicles/${vehicle.vehicleId}/history`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.ok) {
//         const data = await res.json();
//         setHistoryData(data);
//       } else {
//         console.error("Failed to load history");
//         setHistoryData([]);
//       }
//     } catch (err) {
//       console.error("Error loading history:", err);
//     } finally {
//       setLoadingHistory(false);
//     }
//   };

//   const closeHistoryModal = () => {
//     setIsHistoryModalOpen(false);
//     setSelectedVehicle(null);
//     setHistoryData([]);
//   };

//   // Selection
//   const toggleSelect = (id) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     setSelected(
//       selected.length === filteredVehicles.length
//         ? []
//         : filteredVehicles.map((v) => v.vehicleId)
//     );
//   };

//   // Sorting
//   const handleSort = (field) => {
//     if (sortField === field)
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     else {
//       setSortField(field);
//       setSortDirection("asc");
//     }
//   };

//   // Filtering + sorting
//   const filteredVehicles = vehicles
//     .filter((v) => {
//       const searchText = search.toLowerCase();
//       return (
//         v.plateNumber?.toLowerCase().includes(searchText) ||
//         v.model?.toLowerCase().includes(searchText) ||
//         v.brand?.toLowerCase().includes(searchText) ||
//         String(v.year || "").toLowerCase().includes(searchText)
//       );
//     })
//     .sort((a, b) => {
//       let aVal = a[sortField] || "";
//       let bVal = b[sortField] || "";
//       if (typeof aVal === "string") {
//         aVal = aVal.toLowerCase();
//         bVal = bVal.toLowerCase();
//       }
//       return sortDirection === "asc"
//         ? aVal > bVal
//           ? 1
//           : -1
//         : aVal < bVal
//         ? 1
//         : -1;
//     });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         <span className="ml-3 text-gray-600">Loading vehicles...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//       {/* Header */}
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
//             Vehicle Management
//           </h1>
//           <p className="text-gray-600 flex items-center">
//             <FaCar className="mr-2" />
//             {filteredVehicles.length} of {vehicles.length} vehicles
//           </p>
//         </div>
//         <div className="flex space-x-3">
//           <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//             <FaDownload className="mr-2" /> Export
//           </button>
//           <button
//             onClick={() => openModal()}
//             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
//           >
//             <FaPlus className="mr-2" /> Add Vehicle
//           </button>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
//         <div className="relative max-w-md">
//           <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search vehicles by plate, model, brand, year..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           />
//         </div>
//       </div>

//       {/* Vehicles Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left">
//                   <input
//                     type="checkbox"
//                     checked={
//                       selected.length === filteredVehicles.length &&
//                       filteredVehicles.length > 0
//                     }
//                     onChange={toggleSelectAll}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                 </th>
//                 {["plateNumber", "model", "brand", "year"].map((field) => (
//                   <th
//                     key={field}
//                     onClick={() => handleSort(field)}
//                     className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                   >
//                     <div className="flex items-center">
//                       {field.charAt(0).toUpperCase() + field.slice(1)}
//                       <FaSort className="ml-1 text-gray-400" />
//                     </div>
//                   </th>
//                 ))}
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredVehicles.map((v) => (
//                 <tr
//                   key={v.vehicleId}
//                   className={`hover:bg-gray-50 transition-colors ${
//                     selected.includes(v.vehicleId) ? "bg-blue-50" : ""
//                   }`}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <input
//                       type="checkbox"
//                       checked={selected.includes(v.vehicleId)}
//                       onChange={() => toggleSelect(v.vehicleId)}
//                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     />
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {v.plateNumber}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">{v.model}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{v.brand}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{v.year}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
//                     {/* ✅ Edit Icon */}
//                     <button
//                       onClick={() => openModal(v)}
//                       className="text-blue-600 hover:text-blue-800 transition-colors"
//                       title="Edit Vehicle"
//                     >
//                       <FaEdit />
//                     </button>

//                     {/* ✅ History Icon */}
//                     <button
//                       onClick={() => openHistoryModal(v)}
//                       className="text-gray-600 hover:text-gray-900 transition-colors"
//                       title="View History"
//                     >
//                       <FaHistory />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {filteredVehicles.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <FaCar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No vehicles found
//             </h3>
//             <p className="text-gray-500">
//               {search
//                 ? "Try adjusting your search criteria"
//                 : "Get started by adding your first vehicle"}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Vehicle Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[99999]">
//           <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl">
//             <h2 className="text-xl font-bold mb-4">
//               {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
//             </h2>
//             <div className="space-y-3">
//               {["plateNumber", "model", "brand", "year"].map((field) => (
//                 <input
//                   key={field}
//                   type={field === "year" ? "number" : "text"}
//                   name={field}
//                   value={vehicleData[field]}
//                   onChange={handleChange}
//                   placeholder={
//                     field.charAt(0).toUpperCase() + field.slice(1)
//                   }
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                 />
//               ))}
//             </div>
//             <div className="mt-4 flex justify-end space-x-3">
//               <button
//                 onClick={closeModal}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={saveVehicle}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ✅ History Modal */}
//       {isHistoryModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[99999]">
//           <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative shadow-xl">
//             <h2 className="text-xl font-bold mb-4 flex items-center">
//               <FaHistory className="mr-2 text-blue-600" />{" "}
//               {selectedVehicle?.plateNumber} — History
//             </h2>

//             {loadingHistory ? (
//               <div className="flex justify-center items-center py-10">
//                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
//                 <span className="ml-3 text-gray-600">Loading history...</span>
//               </div>
//             ) : historyData.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm border">
//                   <thead className="bg-gray-100 border-b">
//                     <tr>
//                       <th className="px-4 py-2 text-left">Date</th>
//                       <th className="px-4 py-2 text-left">Action</th>
//                       <th className="px-4 py-2 text-left">Details</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {historyData.map((h, idx) => (
//                       <tr key={idx} className="border-b hover:bg-gray-50">
//                         <td className="px-4 py-2">{h.date}</td>
//                         <td className="px-4 py-2">{h.action}</td>
//                         <td className="px-4 py-2">{h.details}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-6">
//                 No history found for this vehicle.
//               </p>
//             )}

//             <div className="mt-4 text-right">
//               <button
//                 onClick={closeHistoryModal}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
