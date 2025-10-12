"use client";

import { useState, useEffect } from "react";
import { 
  FaUserTie,
  FaPlus,
  FaEye,
  FaSearch,
  FaDownload,
  FaSort,
  FaUsers,
  FaEdit,
  FaTrash 
} from "react-icons/fa";
import TechnicianRegisterForm from "@/components/TechnicianRegisterForm";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("firstName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [editingTech, setEditingTech] = useState(null);

  useEffect(() => {
    async function loadTechnicians() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/api/technicians", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (Array.isArray(data)) setTechnicians(data);
        else setTechnicians([]);
      } catch (err) {
        console.error("Error loading technicians:", err);
        setTechnicians([]);
      } finally {
        setLoading(false);
      }
    }

    loadTechnicians();
  }, []);

  // Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Select
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === filteredTechnicians.length ? [] : filteredTechnicians.map((t) => t.technicianId));
  };

  // Filter + search + sort
  const filteredTechnicians = technicians
    .filter((t) => {
      const searchText = search.toLowerCase();
      return (
        t.firstName?.toLowerCase().includes(searchText) ||
        t.lastName?.toLowerCase().includes(searchText) ||
        t.contactNumber?.toLowerCase().includes(searchText) ||
        t.address?.toLowerCase().includes(searchText) ||
        t.email?.toLowerCase().includes(searchText)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading technicians...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Technician Management
            </h1>
            <p className="text-gray-600 flex items-center">
              <FaUsers className="mr-2" />
              {filteredTechnicians.length} of {technicians.length} technicians
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FaDownload className="mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <FaPlus className="mr-2" /> Add Technician
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search technicians by name, email, contact..."
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
                    checked={selected.length === filteredTechnicians.length && filteredTechnicians.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("firstName")}
                >
                  <div className="flex items-center">
                    Name
                    <FaSort className="ml-1 text-gray-400" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">
                    Email
                    <FaSort className="ml-1 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTechnicians.map((tech) => (
                <tr
                  key={tech.technicianId}
                  className={`hover:bg-gray-50 transition-colors ${
                    selected.includes(tech.technicianId) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selected.includes(tech.technicianId)}
                      onChange={() => toggleSelect(tech.technicianId)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {tech.firstName?.charAt(0)}
                        {tech.lastName?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tech.firstName} {tech.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tech.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tech.contactNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={tech.address}>
                      {tech.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FaEye />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTechnicians.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No technicians found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-md p-6 relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Technician</h2>
            <TechnicianRegisterForm
              onSuccess={(newTech) =>
                setTechnicians((prev) => [
                  ...prev,
                  {
                    technicianId: newTech.userId,
                    username: newTech.username,
                    email: newTech.email,
                    firstName: newTech.firstName,
                    lastName: newTech.lastName,
                    contactNumber: newTech.contactNumber,
                    address: newTech.address,
                  },
                ])
              }
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}





// // src/app/dashboard/owner/technicians/page.jsx
// "use client";

// import { useState, useEffect } from "react";
// import { 
//   FaUserTie,
//   FaPlus,
//   FaEye,
//   FaSearch,
//   FaDownload,
//   FaSort,
//   FaUsers
// } from "react-icons/fa";

// export default function TechniciansPage() {
//   const [technicians, setTechnicians] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState([]);
//   const [sortField, setSortField] = useState("firstName");
//   const [sortDirection, setSortDirection] = useState("asc");
//   const [showFilters, setShowFilters] = useState(false);
//   const [editingTech, setEditingTech] = useState(null);
//   const [showModal, setShowModal] = useState(false);
  
//   const [techData, setTechData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     contactNumber: "",
//     address: "",
//   });

//   useEffect(() => {
//     async function loadTechnicians() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch("http://localhost:3001/api/technicians", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const data = await res.json();
//         if (Array.isArray(data)) {
//           setTechnicians(data);
//         } else {
//           setTechnicians([]);
//         }
//       } catch (err) {
//         console.error("Error loading technicians:", err);
//         setTechnicians([]);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadTechnicians();
//   }, []);

// // Update openModal function
// const openModal = (tech = null) => {
//   if (tech) {
//     setEditingTech(tech);
//     setTechData({
//       firstName: tech.firstName,
//       lastName: tech.lastName,
//       email: tech.email,
//       contactNumber: tech.contactNumber,
//       address: tech.address || "",
//     });
//   } else {
//     setEditingTech(null);
//     setTechData({
//       firstName: "",
//       lastName: "",
//       email: "",
//       contactNumber: "",
//       address: "",
//     });
//   }
//   setShowModal(true); // open modal
// };

// // Close modal function
// const closeModal = () => {
//   setShowModal(false);
//   setEditingTech(null);
//   setTechData({
//     firstName: "",
//     lastName: "",
//     email: "",
//     contactNumber: "",
//     address: "",
//   });
// };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setTechData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

// const saveTechnician = async () => {
//   try {
//     const token = localStorage.getItem("token");

//     // POST request to create a new technician
//     const res = await fetch("http://localhost:3001/api/technicians", {
//       method: "POST",
//       headers: { 
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ ...techData, roleId: 1 }),
//     });

//     const newTech = await res.json();
    
//     if (res.ok) {
//       // Add the new technician to the state
//       setTechnicians([...technicians, newTech]);
//     }

//     // Reset form
//     setTechData({
//       firstName: "",
//       lastName: "",
//       email: "",
//       contactNumber: "",
//       address: "",
//     });
    
//   } catch (err) {
//     console.error("Error saving technician:", err);
//   }
// };

//   // Handle select
//   const toggleSelect = (id) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     setSelected(selected.length === filteredTechnicians.length ? [] : filteredTechnicians.map((t) => t.technicianId));
//   };

//   // Sorting
//   const handleSort = (field) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     } else {
//       setSortField(field);
//       setSortDirection("asc");
//     }
//   };

//   // Filter + search + sort
//   const filteredTechnicians = technicians
//     .filter((t) => {
//       const searchText = search.toLowerCase();
//       return (
//         t.firstName?.toLowerCase().includes(searchText) ||
//         t.lastName?.toLowerCase().includes(searchText) ||
//         t.contactNumber?.toLowerCase().includes(searchText) ||
//         t.address?.toLowerCase().includes(searchText) ||
//         t.email?.toLowerCase().includes(searchText)
//       );
//     })
//     .sort((a, b) => {
//       let aVal = a[sortField] || "";
//       let bVal = b[sortField] || "";
      
//       if (typeof aVal === "string") {
//         aVal = aVal.toLowerCase();
//         bVal = bVal.toLowerCase();
//       }
      
//       if (sortDirection === "asc") {
//         return aVal > bVal ? 1 : -1;
//       } else {
//         return aVal < bVal ? 1 : -1;
//       }
//     });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <span className="ml-3 text-gray-600">Loading technicians...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
//               Technician Management
//             </h1>
//             <p className="text-gray-600 flex items-center">
//               <FaUsers className="mr-2" />
//               {filteredTechnicians.length} of {technicians.length} technicians
//             </p>
//           </div>
//           <div className="flex space-x-3">
//             <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <FaDownload className="mr-2" />
//               Export
//             </button>
//             <button
//               onClick={() => openModal()}
//               className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
//             >
//               <FaPlus className="mr-2" /> Add Technician
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
//           <div className="relative flex-1 max-w-md">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search technicians by name, email, contact..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Technicians Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left">
//                   <input
//                     type="checkbox"
//                     checked={selected.length === filteredTechnicians.length && filteredTechnicians.length > 0}
//                     onChange={toggleSelectAll}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                 </th>
//                 <th 
//                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                   onClick={() => handleSort("firstName")}
//                 >
//                   <div className="flex items-center">
//                     Name
//                     <FaSort className="ml-1 text-gray-400" />
//                   </div>
//                 </th>
//                 <th 
//                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                   onClick={() => handleSort("email")}
//                 >
//                   <div className="flex items-center">
//                     Email
//                     <FaSort className="ml-1 text-gray-400" />
//                   </div>
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Contact
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Address
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredTechnicians.map((tech) => (
//                 <tr 
//                   key={tech.technicianId} 
//                   className={`hover:bg-gray-50 transition-colors ${
//                     selected.includes(tech.technicianId) ? 'bg-blue-50' : ''
//                   }`}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <input
//                       type="checkbox"
//                       checked={selected.includes(tech.technicianId)}
//                       onChange={() => toggleSelect(tech.technicianId)}
//                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     />
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
//                         {tech.firstName?.charAt(0)}{tech.lastName?.charAt(0)}
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">
//                           {tech.firstName} {tech.lastName}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{tech.email}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{tech.contactNumber}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-gray-900 max-w-xs truncate" title={tech.address}>
//                       {tech.address}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex items-center space-x-3">
//                       <button className="text-blue-600 hover:text-blue-800 transition-colors p-1" title="View">
//                         <FaEye />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Empty State */}
//         {filteredTechnicians.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <FaUserTie className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians found</h3>
//             <p className="text-gray-500">
//               {search
//                 ? "Try adjusting your search criteria" 
//                 : "Get started by adding your first technician"
//               }
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {filteredTechnicians.length > 0 && (
//         <div className="mt-6 flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
//           <div className="text-sm text-gray-700">
//             Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTechnicians.length}</span> of{' '}
//             <span className="font-medium">{technicians.length}</span> results
//           </div>
//         </div>
//       )}

// {/* Modal */}
// {showModal && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//     <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-md p-6 relative">
//       <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Technician</h2>

//       {/* Technician Registration Form */}
//       <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveTechnician(); }}>
//         <div className="grid grid-cols-2 gap-4">
//           <div className="flex flex-col text-left">
//             <label htmlFor="firstName" className="text-gray-600 mb-1 text-sm">First Name</label>
//             <input
//               type="text"
//               id="firstName"
//               name="firstName"
//               value={techData.firstName}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           <div className="flex flex-col text-left">
//             <label htmlFor="lastName" className="text-gray-600 mb-1 text-sm">Last Name</label>
//             <input
//               type="text"
//               id="lastName"
//               name="lastName"
//               value={techData.lastName}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>
//         </div>

//         <div className="flex flex-col text-left">
//           <label htmlFor="username" className="text-gray-600 mb-1 text-sm">Username</label>
//           <input
//             type="text"
//             id="username"
//             name="username"
//             value={techData.username || ""}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div className="flex flex-col text-left">
//           <label htmlFor="email" className="text-gray-600 mb-1 text-sm">Email</label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={techData.email}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div className="flex flex-col text-left">
//           <label htmlFor="phone" className="text-gray-600 mb-1 text-sm">Phone Number</label>
//           <input
//             type="tel"
//             id="phone"
//             name="phone"
//             value={techData.phone || ""}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div className="flex flex-col text-left">
//           <label htmlFor="password" className="text-gray-600 mb-1 text-sm">Password</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             value={techData.password || ""}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div className="flex flex-col text-left">
//           <label htmlFor="confirmPassword" className="text-gray-600 mb-1 text-sm">Confirm Password</label>
//           <input
//             type="password"
//             id="confirmPassword"
//             name="confirmPassword"
//             value={techData.confirmPassword || ""}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div className="flex flex-col text-left">
//           <label htmlFor="address" className="text-gray-600 mb-1 text-sm">Address</label>
//           <input
//             type="text"
//             id="address"
//             name="address"
//             value={techData.address}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div className="mt-6 flex justify-end space-x-3">
//           <button
//             type="button"
//             onClick={closeModal}
//             className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Save
//           </button>
//         </div>
//       </form>
//     </div>
//   </div>
// )}
//     </div>
//   );
// }
