"use client";

import { useState, useEffect } from "react";
import { 
  FaCar,
  FaPlus,
  FaEye,
  FaSearch,
  FaDownload,
  FaSort,
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

  // Load all vehicles
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

  const openModal = (vehicle = null) => {
    setIsModalOpen(true);
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleData({ ...vehicle });
    } else {
      setEditingVehicle(null);
      setVehicleData({
        plateNumber: "",
        model: "",
        brand: "",
        year: "",
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setVehicleData({
      plateNumber: "",
      model: "",
      brand: "",
      year: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
  };

  // Save new or update existing vehicle
  const saveVehicle = async () => {
    try {
      const token = localStorage.getItem("token");

      if (editingVehicle) {
        // Update
        const res = await fetch(`http://localhost:3001/api/vehicles/${editingVehicle.vehicleId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(vehicleData),
        });
        if (res.ok) {
          setVehicles(
            vehicles.map(v =>
              v.vehicleId === editingVehicle.vehicleId ? { ...v, ...vehicleData } : v
            )
          );
          closeModal();
        }
      } else {
        // Create
        const res = await fetch("http://localhost:3001/api/vehicles", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` },
          body: JSON.stringify(vehicleData),
        });
        const newVehicle = await res.json();
        if (res.ok) {
          setVehicles([...vehicles, newVehicle]); // works because backend returns vehicleId + fields
          closeModal();
        }
      }
    } catch (err) {
      console.error("Error saving vehicle:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === filteredVehicles.length ? [] : filteredVehicles.map(v => v.vehicleId));
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredVehicles = vehicles
    .filter(v => {
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
      return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
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
                    checked={selected.length === filteredVehicles.length && filteredVehicles.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th onClick={() => handleSort("plateNumber")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center">Plate Number <FaSort className="ml-1 text-gray-400" /></div>
                </th>
                <th onClick={() => handleSort("model")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center">Model <FaSort className="ml-1 text-gray-400" /></div>
                </th>
                <th onClick={() => handleSort("brand")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center">Brand <FaSort className="ml-1 text-gray-400" /></div>
                </th>
                <th onClick={() => handleSort("year")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center">Year <FaSort className="ml-1 text-gray-400" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((v) => (
                <tr key={v.vehicleId} className={`hover:bg-gray-50 transition-colors ${selected.includes(v.vehicleId) ? 'bg-blue-50' : ''}`}>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors p-1" title="View">
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredVehicles.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaCar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500">
              {search ? "Try adjusting your search criteria" : "Get started by adding your first vehicle"}
            </p>
          </div>
        )}
      </div>

      {/* Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>
            <div className="space-y-3">
              <input type="text" name="plateNumber" value={vehicleData.plateNumber} onChange={handleChange} placeholder="Plate Number" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <input type="text" name="model" value={vehicleData.model} onChange={handleChange} placeholder="Model" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <input type="text" name="brand" value={vehicleData.brand} onChange={handleChange} placeholder="Brand" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <input type="text" name="year" value={vehicleData.year} onChange={handleChange} placeholder="Year" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={saveVehicle} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// // src/app/dashboard/owner/vehicles/page.jsx
// "use client";

// import { useState, useEffect } from "react";
// import { 
//   FaCar,
//   FaPlus,
//   FaEye,
//   FaSearch,
//   FaDownload,
//   FaSort,
// } from "react-icons/fa";

// export default function VehiclesPage() {
//   const [vehicles, setVehicles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState([]);
//   const [sortField, setSortField] = useState("plateNumber");
//   const [sortDirection, setSortDirection] = useState("asc");
//   const [editingVehicle, setEditingVehicle] = useState(null);
//   const [vehicleData, setVehicleData] = useState({
//     plateNumber: "",
//     model: "",
//     brand: "",
//     ownerName: "",
//   });

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

//   const openModal = (vehicle = null) => {
//     if (vehicle) {
//       setEditingVehicle(vehicle);
//       setVehicleData({ ...vehicle });
//     } else {
//       setEditingVehicle(null);
//       setVehicleData({
//         plateNumber: "",
//         model: "",
//         brand: "",
//         ownerName: "",
//       });
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setVehicleData(prev => ({ ...prev, [name]: value }));
//   };

//   const saveVehicle = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (editingVehicle) {
//         const res = await fetch(`http://localhost:3001/api/vehicles/${editingVehicle.vehicleId}`, {
//           method: "PUT",
//           headers: { 
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(vehicleData),
//         });
//         if (res.ok) {
//           setVehicles(
//             vehicles.map(v =>
//               v.vehicleId === editingVehicle.vehicleId ? { ...v, ...vehicleData } : v
//             )
//           );
//           setEditingVehicle(null);
//         }
//       } else {
//         const res = await fetch("http://localhost:3001/api/vehicles", {
//           method: "POST",
//           headers: { 
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(vehicleData),
//         });
//         const newVehicle = await res.json();
//         if (res.ok) setVehicles([...vehicles, newVehicle]);
//       }
//       setVehicleData({
//         plateNumber: "",
//         model: "",
//         brand: "",
//         ownerName: "",
//       });
//     } catch (err) {
//       console.error("Error saving vehicle:", err);
//     }
//   };

//   const toggleSelect = (id) => {
//     setSelected(prev =>
//       prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     setSelected(selected.length === filteredVehicles.length ? [] : filteredVehicles.map(v => v.vehicleId));
//   };

//   const handleSort = (field) => {
//     if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     else {
//       setSortField(field);
//       setSortDirection("asc");
//     }
//   };

//   const filteredVehicles = vehicles
//     .filter(v => {
//       const searchText = search.toLowerCase();
//       return (
//         v.plateNumber?.toLowerCase().includes(searchText) ||
//         v.model?.toLowerCase().includes(searchText) ||
//         v.brand?.toLowerCase().includes(searchText) ||
//         v.ownerName?.toLowerCase().includes(searchText) 
//       );
//     })
//     .sort((a, b) => {
//       let aVal = a[sortField] || "";
//       let bVal = b[sortField] || "";
//       if (typeof aVal === "string") {
//         aVal = aVal.toLowerCase();
//         bVal = bVal.toLowerCase();
//       }
//       return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
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
//             placeholder="Search vehicles by plate, model, brand..."
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
//                     checked={selected.length === filteredVehicles.length && filteredVehicles.length > 0}
//                     onChange={toggleSelectAll}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                 </th>
//                 <th onClick={() => handleSort("plateNumber")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
//                   <div className="flex items-center">Plate Number <FaSort className="ml-1 text-gray-400" /></div>
//                 </th>
//                 <th onClick={() => handleSort("model")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
//                   <div className="flex items-center">Model <FaSort className="ml-1 text-gray-400" /></div>
//                 </th>
//                 <th onClick={() => handleSort("brand")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
//                   <div className="flex items-center">Brand <FaSort className="ml-1 text-gray-400" /></div>
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredVehicles.map((v) => (
//                 <tr key={v.vehicleId} className={`hover:bg-gray-50 transition-colors ${selected.includes(v.vehicleId) ? 'bg-blue-50' : ''}`}>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <input
//                       type="checkbox"
//                       checked={selected.includes(v.vehicleId)}
//                       onChange={() => toggleSelect(v.vehicleId)}
//                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     />
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">{v.plateNumber}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{v.model}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{v.brand}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{v.ownerName}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button className="text-blue-600 hover:text-blue-800 transition-colors p-1" title="View">
//                       <FaEye />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Empty State */}
//         {filteredVehicles.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <FaCar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
//             <p className="text-gray-500">
//               {search ? "Try adjusting your search criteria" : "Get started by adding your first vehicle"}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Edit Vehicle Modal */}
//       {(editingVehicle || vehicleData.plateNumber !== "") && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 w-full max-w-md">
//             <h2 className="text-xl font-bold mb-4">{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>
//             <div className="space-y-3">
//               <input type="text" name="plateNumber" value={vehicleData.plateNumber} onChange={handleChange} placeholder="Plate Number" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
//               <input type="text" name="model" value={vehicleData.model} onChange={handleChange} placeholder="Model" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
//               <input type="text" name="brand" value={vehicleData.brand} onChange={handleChange} placeholder="Brand" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
//               <input type="text" name="ownerName" value={vehicleData.ownerName} onChange={handleChange} placeholder="Owner Name" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
//             </div>
//             <div className="mt-4 flex justify-end space-x-3">
//               <button onClick={() => setEditingVehicle(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//               <button onClick={saveVehicle} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
