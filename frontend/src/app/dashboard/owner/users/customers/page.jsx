// src/app/dashboard/owner/customers/page.jsx
"use client";

import { useState, useEffect } from "react";
import { 
  FaUserTie,
  FaPlus,
  FaEye,
  FaSearch,
  FaDownload,
  FaSort,
  FaUsers
} from "react-icons/fa";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("firstName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address: "",
  });

  useEffect(() => {
    async function loadCustomers() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (Array.isArray(data)) setCustomers(data);
        else setCustomers([]);
      } catch (err) {
        console.error("Error loading customers:", err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        contactNumber: customer.contactNumber,
        address: customer.address || "",
      });
    } else {
      setEditingCustomer(null);
      setCustomerData({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        address: "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  const saveCustomer = async () => {
    try {
      const token = localStorage.getItem("token");
      if (editingCustomer) {
        const res = await fetch(`http://localhost:3001/api/customers/${editingCustomer.customerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(customerData),
        });
        if (res.ok) {
          setCustomers(customers.map(c => c.customerId === editingCustomer.customerId ? { ...c, ...customerData } : c));
          setEditingCustomer(null);
        }
      } else {
        const res = await fetch("http://localhost:3001/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...customerData, roleId: 3 }),
        });
        const newCustomer = await res.json();
        if (res.ok) setCustomers([...customers, newCustomer]);
      }
      setCustomerData({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        address: "",
      });
    } catch (err) {
      console.error("Error saving customer:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c.customerId));
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredCustomers = customers
    .filter(c => {
      const text = search.toLowerCase();
      return (
        c.firstName?.toLowerCase().includes(text) ||
        c.lastName?.toLowerCase().includes(text) ||
        c.contactNumber?.toLowerCase().includes(text) ||
        c.address?.toLowerCase().includes(text) ||
        c.email?.toLowerCase().includes(text)
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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Loading customers...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Customer Management
          </h1>
          <p className="text-gray-600 flex items-center">
            <FaUsers className="mr-2" />
            {filteredCustomers.length} of {customers.length} customers
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
            <FaPlus className="mr-2" /> Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("firstName")}
                >
                  <div className="flex items-center">Name <FaSort className="ml-1 text-gray-400" /></div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">Email <FaSort className="ml-1 text-gray-400" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map(c => (
                <tr key={c.customerId} className={`hover:bg-gray-50 transition-colors ${selected.includes(c.customerId) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selected.includes(c.customerId)}
                      onChange={() => toggleSelect(c.customerId)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {c.firstName?.charAt(0)}{c.lastName?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{c.email}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{c.contactNumber}</div></td>
                  <td className="px-6 py-4"><div className="text-sm text-gray-900 max-w-xs truncate" title={c.address}>{c.address}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors p-1" title="View"><FaEye /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaUserTie className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500">{search ? "Try adjusting your search criteria" : "Get started by adding your first customer"}</p>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      {(editingCustomer || customerData.firstName !== "") && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>
            <div className="space-y-3">
              <input type="text" name="firstName" value={customerData.firstName} onChange={handleChange} placeholder="First Name" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <input type="text" name="lastName" value={customerData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <input type="email" name="email" value={customerData.email} onChange={handleChange} placeholder="Email" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <input type="text" name="contactNumber" value={customerData.contactNumber} onChange={handleChange} placeholder="Contact" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <input type="text" name="address" value={customerData.address} onChange={handleChange} placeholder="Address" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button onClick={() => setEditingCustomer(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={saveCustomer} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
