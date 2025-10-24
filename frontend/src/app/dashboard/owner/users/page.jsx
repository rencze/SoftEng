  "use client";
  import { useState, useEffect } from "react";
  import { 
    FaEdit, 
    FaTrash, 
    FaLock, 
    FaUnlock, 
    FaEye,
    FaSearch,
    FaFilter,
    FaPlus,
    FaUserCheck,
    FaUserTimes,
    FaDownload,
    FaSort,
    FaUsers
  } from "react-icons/fa";

  export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState("firstName");
    const [sortDirection, setSortDirection] = useState("asc");
    const [showFilters, setShowFilters] = useState(false);
    const [editingUser, setEditingUser] = useState(null); 
    const [editData, setEditData] = useState({});        

      const [currentUser, setCurrentUser] = useState(null);

      useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setCurrentUser(JSON.parse(userData));
      }, []);



    // Fetch users from backend
    useEffect(() => {
      setLoading(true);
      fetch("http://localhost:3001/api/users")
        .then((res) => res.json())
        .then((data) => {
          setUsers(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch users error:", err);
          setLoading(false);
        });
    }, []);

    // Handle select
    const toggleSelect = (id) => {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
    };

    const toggleSelectAll = () => {
      setSelected(selected.length === filteredUsers.length ? [] : filteredUsers.map((u) => u.userId));
    };

    // Delete users
    const handleDelete = async (ids) => {
      if (!confirm(`Are you sure you want to delete ${ids.length} user(s)?`)) return;
      
      for (let id of ids) {
        await fetch(`http://localhost:3001/api/users/${id}`, { method: "DELETE" });
      }
      setUsers(users.filter((u) => !ids.includes(u.userId)));
      setSelected([]);
    };
  ///---------vBLOCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCK/UNBLOCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCK
  const handleBlockToggle = async (user) => {
    const action = user.isBlocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/users/${user.userId}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: user.isBlocked ? 0 : 1 }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) =>
            u.userId === user.userId ? { ...u, isBlocked: user.isBlocked ? 0 : 1 } : u
          )
        );
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update user status");
      }
    } catch (err) {
      console.error(err);
      alert("Error blocking/unblocking user");
    }
  };

    // Sorting
    const handleSort = (field) => {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    };

      const currentUserId = currentUser?.userId; // get the logged-in user's ID

    // Filter + search + sort
    const filteredUsers = users
      .filter(u => u.userId !== currentUserId) // exclude logged-in user
      .filter((u) => {
        const searchText = search.toLowerCase();
        const matchesSearch = 
          u.username?.toLowerCase().includes(searchText) ||
          u.firstName?.toLowerCase().includes(searchText) ||
          u.lastName?.toLowerCase().includes(searchText) ||
          u.contactNumber?.toLowerCase().includes(searchText) ||
          u.address?.toLowerCase().includes(searchText) ||
          u.email?.toLowerCase().includes(searchText);

        const matchesRole = !filterRole || u.roleName === filterRole;
        const matchesStatus = !filterStatus || 
          (filterStatus === "active" && !u.isBlocked) ||
          (filterStatus === "blocked" && u.isBlocked);

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        let aVal = a[sortField] || "";
        let bVal = b[sortField] || "";
        
        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (sortDirection === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

    // Helper: role colors
    const getRoleColor = (role) => {
      switch (role) {
        case "Owner": return "bg-purple-100 text-purple-700 border-purple-200";
        case "Technician": return "bg-blue-100 text-blue-700 border-blue-200";
        case "Customer": return "bg-green-100 text-green-700 border-green-200";
        default: return "bg-gray-100 text-gray-700 border-gray-200";
      }
    };

    // Helper: status colors
    const getStatusColor = (isBlocked) => {
      return isBlocked 
        ? "bg-red-100 text-red-700 border-red-200" 
        : "bg-green-100 text-green-700 border-green-200";
    };

  // Open edit modal
  const openEdit = (user) => {
    setEditingUser(user);
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      contactNumber: user.contactNumber,
      address: user.address,
      roleName: user.roleName // initialize dropdown
    });
  };

  // Mapping role names to role IDs
  const roleMap = { Customer: 3, Technician: 1, Owner: 2 };

  // Handle edit field changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

 const submitEdit = async () => {
  try {
    const payload = {
      firstName: editData.firstName,
      lastName: editData.lastName,
      contactNumber: editData.contactNumber,
      address: editData.address,
      roleId: roleMap[editData.roleName], // convert roleName to roleId
      isBlocked: editingUser.isBlocked    // keep current block status
    };

    const res = await fetch(`http://localhost:3001/api/users/${editingUser.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      setUsers(users.map(u => 
        u.userId === editingUser.userId 
          ? { ...u, ...editData, roleId: payload.roleId, roleName: editData.roleName } 
          : u
      ));

      // ✅ Show message if role changed to/from Technician
      if (payload.roleId === 1) {
        alert("User updated and added as Technician");
      } else if (editingUser.roleName === "Technician" && payload.roleId !== 1) {
        alert("User updated and removed from Technician if existed");
      }

      setEditingUser(null); // close modal
    } else {
      alert(data.error || "Failed to update user");
    }
  } catch (err) {
    console.error(err);
    alert("Error updating user");
  }
};

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
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
                User Management
              </h1>
              <p className="text-gray-600 flex items-center">
                <FaUsers className="mr-2" />
                {filteredUsers.length} of {users.length} users
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FaDownload className="mr-2" />
                Export
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                <FaPlus className="mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 rounded-lg border transition-all ${
                  showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter className="mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="Owner">Owner</option>
                    <option value="Technician">Technician</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterRole("");
                      setFilterStatus("");
                      setSearch("");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                {selected.length} user{selected.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-3">
             
                <button
                  onClick={() => handleDelete(selected)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FaTrash className="mr-2" />
                  Delete Selected
                </button>
          
                <button
                  onClick={() => setSelected([])}
                  className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selected.length === filteredUsers.length && filteredUsers.length > 0}
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
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("roleName")}
                  >
                    <div className="flex items-center">
                      Role
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.userId} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selected.includes(user.userId) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selected.includes(user.userId)}
                        onChange={() => toggleSelect(user.userId)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.contactNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={user.address}>
                        {user.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.roleName)}`}>
                        {user.roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.isBlocked)}`}>
                        {user.isBlocked ? (
                          <>
                            <FaUserTimes className="mr-1" />
                            Blocked
                          </>
                        ) : (
                          <>
                            <FaUserCheck className="mr-1" />
                            Active
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button className="text-blue-600 hover:text-blue-800 transition-colors p-1" title="View">
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => openEdit(user)}
                          className="text-green-600 hover:text-green-800 transition-colors p-1" 
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleBlockToggle(user)}
                          className={`transition-colors p-1 ${
                            user.isBlocked 
                              ? 'text-yellow-600 hover:text-yellow-800' 
                              : 'text-orange-600 hover:text-orange-800'
                          }`}
                          title={user.isBlocked ? "Unblock" : "Block"}
                        >
                          {user.isBlocked ? <FaUnlock /> : <FaLock />}
                        </button>
                 
                        <button 
                          onClick={() => handleDelete([user.userId])}
                          className="text-red-600 hover:text-red-800 transition-colors p-1" 
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                       
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {search || filterRole || filterStatus 
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by adding your first user"
                }
              </p>
            </div>
          )}
        </div>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Edit User</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={editData.firstName}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={editData.lastName}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    name="contactNumber"
                    placeholder="Contact Number"
                    value={editData.contactNumber}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={editData.address}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <select
                    name="roleName"
                    value={editData.roleName} // use roleName string for combo box
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Customer">Customer</option>
                    {/* <option value="Owner">Owner</option> */}
                    <option value="Technician">Technician</option>
                  </select>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Pagination (if needed) */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
              <span className="font-medium">{users.length}</span> results
            </div>
          </div>
        )}
      </div>
    );
  }
