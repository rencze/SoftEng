"use client";

import { useState, useEffect, useRef } from "react";
import { FaCar, FaSearch, FaSort, FaEye, FaPlus } from "react-icons/fa";

// Reusable searchable dropdown component
function SearchableDropdown({ options, value, onChange, placeholder }) {
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
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full max-h-40 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
          {filteredOptions.map((opt, idx) => (
            <li
              key={idx}
              onClick={() => {
                onChange(opt);
                setSearchTerm(opt);
                setIsOpen(false);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-blue-100"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RegisteredVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("plateNumber");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleData, setVehicleData] = useState({
    plateNumber: "",
    currentOwner: "",
  });

  // Fetch registered vehicles
  const loadRegisteredVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/registered-vehicle", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setVehicles([]);
    }
  };

  // Fetch all vehicles and customers
  const loadAllVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load all vehicles:", err);
      setAllVehicles([]);
    }
  };

  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setCustomers([]);
    }
  };

  useEffect(() => {
    Promise.all([loadRegisteredVehicles(), loadAllVehicles(), loadCustomers()]).finally(
      () => setLoading(false)
    );
  }, []);

  const filteredVehicles = vehicles
    .filter(
      (v) =>
        v.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
        v.currentOwner?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelected(
      selected.length === filteredVehicles.length
        ? []
        : filteredVehicles.map((v) => v.vehicleId)
    );

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const openModal = (vehicle = null) => {
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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setVehicleData({ plateNumber: "", currentOwner: "" });
  };

  const saveVehicle = async () => {
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

      if (editingVehicle) {
        const res = await fetch(
          `http://localhost:3001/api/registered-vehicle/${editingVehicle.vehicleId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Failed to update vehicle");
      } else {
        const res = await fetch("http://localhost:3001/api/registered-vehicle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to add vehicle");
      }

      await loadRegisteredVehicles(); // Refresh table
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading registered vehicles...</span>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Registered Vehicles</h1>
          <p className="text-gray-600 flex items-center">
            <FaCar className="mr-2" /> {filteredVehicles.length} of {vehicles.length} vehicles
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
        >
          <FaPlus className="mr-2" /> Register Vehicle
        </button>
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
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </th>
                {["plateNumber", "currentOwner", "model", "brand", "year"].map((field) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-6 py-4 cursor-pointer text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
                  >
                    {field === "plateNumber"
                      ? "Plate Number"
                      : field === "currentOwner"
                      ? "Owner"
                      : field.charAt(0).toUpperCase() + field.slice(1)}
                  </th>
                ))}
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((v) => (
                <tr key={v.vehicleId} className={selected.includes(v.vehicleId) ? "bg-blue-50" : ""}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(v.vehicleId)}
                      onChange={() => toggleSelect(v.vehicleId)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">{v.plateNumber}</td>
                  <td className="px-6 py-4">{v.currentOwner}</td>
                  <td className="px-6 py-4">{v.model || "-"}</td>
                  <td className="px-6 py-4">{v.brand || "-"}</td>
                  <td className="px-6 py-4">{v.year || "-"}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => openModal(v)} className="text-blue-600 hover:text-blue-800">
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-xl relative">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              {editingVehicle ? "Edit Vehicle" : "Register Vehicle"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                <SearchableDropdown
                  options={allVehicles.map((v) => v.plateNumber)}
                  value={vehicleData.plateNumber}
                  onChange={(val) => setVehicleData((prev) => ({ ...prev, plateNumber: val }))}
                  placeholder="Select or type plate number..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Owner</label>
                <SearchableDropdown
                  options={customers.map((c) => `${c.firstName} ${c.lastName}`)}
                  value={vehicleData.currentOwner}
                  onChange={(val) => setVehicleData((prev) => ({ ...prev, currentOwner: val }))}
                  placeholder="Select or type owner..."
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveVehicle}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
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


// "use client";

// import { useState, useEffect, useRef } from "react";
// import { FaCar, FaSearch, FaSort, FaEye, FaPlus } from "react-icons/fa";

// // Reusable searchable dropdown component
// function SearchableDropdown({ options, value, onChange, placeholder }) {
//   const [searchTerm, setSearchTerm] = useState(value || "");
//   const [isOpen, setIsOpen] = useState(false);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     setSearchTerm(value || "");
//   }, [value]);

//   const filteredOptions = (options || []).filter(
//     (opt) => opt && opt.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div ref={containerRef} className="relative w-full">
//       <input
//         type="text"
//         value={searchTerm}
//         onChange={(e) => {
//           setSearchTerm(e.target.value);
//           setIsOpen(true);
//           onChange(e.target.value);
//         }}
//         onFocus={() => setIsOpen(true)}
//         placeholder={placeholder}
//         className="w-full border border-gray-300 rounded-lg px-3 py-2"
//       />
//       {isOpen && filteredOptions.length > 0 && (
//         <ul className="absolute z-10 w-full max-h-40 overflow-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
//           {filteredOptions.map((opt, idx) => (
//             <li
//               key={idx}
//               onClick={() => {
//                 onChange(opt);
//                 setSearchTerm(opt);
//                 setIsOpen(false);
//               }}
//               className="px-3 py-2 cursor-pointer hover:bg-blue-100"
//             >
//               {opt}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

// export default function RegisteredVehiclesPage() {
//   const [vehicles, setVehicles] = useState([]);
//   const [allVehicles, setAllVehicles] = useState([]); // For dropdown
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState([]);
//   const [sortField, setSortField] = useState("plateNumber");
//   const [sortDirection, setSortDirection] = useState("asc");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingVehicle, setEditingVehicle] = useState(null);
//   const [vehicleData, setVehicleData] = useState({
//     plateNumber: "",
//     currentOwner: "",
//   });

//   // Load registered vehicles
//   useEffect(() => {
//     async function loadRegisteredVehicles() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch("http://localhost:3001/api/registered-vehicle", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setVehicles(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to load vehicles:", err);
//         setVehicles([]);
//       }
//     }

//     // Load all vehicles for plate number dropdown
//     async function loadAllVehicles() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch("http://localhost:3001/api/vehicles", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setAllVehicles(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to load all vehicles:", err);
//         setAllVehicles([]);
//       }
//     }

//     // Load customers for owner dropdown
//     async function loadCustomers() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch("http://localhost:3001/api/customers", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setCustomers(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to load customers:", err);
//         setCustomers([]);
//       }
//     }

//     Promise.all([loadRegisteredVehicles(), loadAllVehicles(), loadCustomers()]).finally(() =>
//       setLoading(false)
//     );
//   }, []);

//   const filteredVehicles = vehicles
//     .filter(
//       (v) =>
//         v.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
//         v.currentOwner?.toLowerCase().includes(search.toLowerCase())
//     )
//     .sort((a, b) => {
//       let aVal = a[sortField] || "";
//       let bVal = b[sortField] || "";
//       if (typeof aVal === "string") {
//         aVal = aVal.toLowerCase();
//         bVal = bVal.toLowerCase();
//       }
//       return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
//     });

//   const toggleSelect = (id) =>
//     setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

//   const toggleSelectAll = () =>
//     setSelected(
//       selected.length === filteredVehicles.length
//         ? []
//         : filteredVehicles.map((v) => v.vehicleId)
//     );

//   const handleSort = (field) => {
//     if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     else {
//       setSortField(field);
//       setSortDirection("asc");
//     }
//   };

//   const openModal = (vehicle = null) => {
//     setIsModalOpen(true);
//     if (vehicle) {
//       setEditingVehicle(vehicle);
//       setVehicleData({
//         plateNumber: vehicle.plateNumber,
//         currentOwner: vehicle.currentOwner,
//       });
//     } else {
//       setEditingVehicle(null);
//       setVehicleData({ plateNumber: "", currentOwner: "" });
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingVehicle(null);
//     setVehicleData({ plateNumber: "", currentOwner: "" });
//   };

//   const saveVehicle = async () => {
//   try {
//     const token = localStorage.getItem("token");

//     // 🔎 Find vehicleId from allVehicles
//     const selectedVehicle = allVehicles.find(
//       (v) => v.plateNumber === vehicleData.plateNumber
//     );
//     const vehicleId = selectedVehicle ? selectedVehicle.vehicleId : null;

//     // 🔎 Find customerId from customers
//     const selectedCustomer = customers.find(
//       (c) => `${c.firstName} ${c.lastName}` === vehicleData.currentOwner
//     );
//     const customerId = selectedCustomer ? selectedCustomer.customerId : null;

//     if (!vehicleId || !customerId) {
//       throw new Error("Invalid vehicle or customer selection");
//     }

//     const payload = { vehicleId, customerId };

//     if (editingVehicle) {
//       // Update existing registration
//       const res = await fetch(
//         `http://localhost:3001/api/registered-vehicle/${editingVehicle.vehicleId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );
//       if (!res.ok) throw new Error("Failed to update vehicle");
//     } else {
//       // Register new vehicle
//       const res = await fetch("http://localhost:3001/api/registered-vehicle", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Failed to add vehicle");
//     }

//     closeModal();
//   } catch (err) {
//     console.error(err);
//     alert(err.message);
//   }
// };



//   // const saveVehicle = async () => {
//   //   try {
//   //     const token = localStorage.getItem("token");
//   //     if (editingVehicle) {
//   //       const res = await fetch(
//   //         `http://localhost:3001/api/registered-vehicle/${editingVehicle.vehicleId}`,
//   //         {
//   //           method: "PUT",
//   //           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//   //           body: JSON.stringify(vehicleData),
//   //         }
//   //       );
//   //       if (!res.ok) throw new Error("Failed to update vehicle");
//   //       setVehicles(
//   //         vehicles.map((v) =>
//   //           v.vehicleId === editingVehicle.vehicleId ? { ...v, ...vehicleData } : v
//   //         )
//   //       );
//   //     } else {
//   //       const res = await fetch("http://localhost:3001/api/registered-vehicle", {
//   //         method: "POST",
//   //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//   //         body: JSON.stringify(vehicleData),
//   //       });
//   //       if (!res.ok) throw new Error("Failed to add vehicle");
//   //       const newVehicle = await res.json();
//   //       setVehicles([...vehicles, newVehicle]);
//   //     }
//   //     closeModal();
//   //   } catch (err) {
//   //     console.error(err);
//   //     alert(err.message);
//   //   }
//   // };

//   if (loading)
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         <span className="ml-3 text-gray-600">Loading registered vehicles...</span>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-4xl font-bold text-gray-800 mb-2">Registered Vehicles</h1>
//           <p className="text-gray-600 flex items-center">
//             <FaCar className="mr-2" /> {filteredVehicles.length} of {vehicles.length} vehicles
//           </p>
//         </div>
//         <button
//           onClick={() => openModal()}
//           className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
//         >
//           <FaPlus className="mr-2" /> Register Vehicle
//         </button>
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
//                     className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//                   />
//                 </th>
//                 {["plateNumber", "currentOwner", "model", "brand", "year"].map((field) => (
//                   <th
//                     key={field}
//                     onClick={() => handleSort(field)}
//                     className="px-6 py-4 cursor-pointer text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
//                   >
//                     {field === "plateNumber"
//                       ? "Plate Number"
//                       : field === "currentOwner"
//                       ? "Owner"
//                       : field.charAt(0).toUpperCase() + field.slice(1)}
//                   </th>
//                 ))}
//                 <th className="px-6 py-4 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredVehicles.map((v) => (
//                 <tr key={v.vehicleId} className={selected.includes(v.vehicleId) ? "bg-blue-50" : ""}>
//                   <td className="px-6 py-4">
//                     <input
//                       type="checkbox"
//                       checked={selected.includes(v.vehicleId)}
//                       onChange={() => toggleSelect(v.vehicleId)}
//                       className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//                     />
//                   </td>
//                   <td className="px-6 py-4">{v.plateNumber}</td>
//                   <td className="px-6 py-4">{v.currentOwner}</td>
//                   <td className="px-6 py-4">{v.model || "-"}</td>
//                   <td className="px-6 py-4">{v.brand || "-"}</td>
//                   <td className="px-6 py-4">{v.year || "-"}</td>
//                   <td className="px-6 py-4">
//                     <button onClick={() => openModal(v)} className="text-blue-600 hover:text-blue-800">
//                       <FaEye />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal (unchanged) */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-xl relative">
//             <h2 className="text-3xl font-bold mb-6 text-gray-800">
//               {editingVehicle ? "Edit Vehicle" : "Register Vehicle"}
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Plate Number */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
//                 <SearchableDropdown
//                   options={allVehicles.map((v) => v.plateNumber)} // ✅ use allVehicles for dropdown
//                   value={vehicleData.plateNumber}
//                   onChange={(val) => setVehicleData((prev) => ({ ...prev, plateNumber: val }))}
//                   placeholder="Select or type plate number..."
//                 />
//               </div>

//               {/* Current Owner */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Current Owner</label>
//                 <SearchableDropdown
//                   options={customers.map((c) => `${c.firstName} ${c.lastName}`)}
//                   value={vehicleData.currentOwner}
//                   onChange={(val) => setVehicleData((prev) => ({ ...prev, currentOwner: val }))}
//                   placeholder="Select or type owner..."
//                 />
//               </div>
//             </div>

//             <div className="mt-8 flex justify-end gap-4">
//               <button
//                 onClick={closeModal}
//                 className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={saveVehicle}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
