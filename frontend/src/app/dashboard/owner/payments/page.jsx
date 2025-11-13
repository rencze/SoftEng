"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaDownload, FaEye, FaReceipt, FaCreditCard, FaMoneyBillWave, FaWallet, FaCalendar, FaExchangeAlt, FaPlus } from "react-icons/fa";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [activeTable, setActiveTable] = useState("payments");
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Sample payments data
  useEffect(() => {
    const samplePayments = [
      {
        id: 1,
        clientName: "John Smith",
        amount: 450.00,
        paymentMethod: "credit",
        status: "completed",
        date: "2024-01-15",
        invoiceNumber: "INV-001234",
        type: "payment"
      },
      {
        id: 2,
        clientName: "Sarah Johnson",
        amount: 289.50,
        paymentMethod: "bank",
        status: "completed",
        date: "2024-01-14",
        invoiceNumber: "INV-001235",
        type: "payment"
      },
      {
        id: 3,
        clientName: "Mike Wilson",
        amount: 125.75,
        paymentMethod: "cash",
        status: "pending",
        date: "2024-01-14",
        invoiceNumber: "INV-001236",
        type: "payment"
      },
      {
        id: 4,
        clientName: "Emily Davis",
        amount: 567.25,
        paymentMethod: "credit",
        status: "completed",
        date: "2024-01-13",
        invoiceNumber: "INV-001237",
        type: "payment"
      },
      {
        id: 5,
        clientName: "Robert Brown",
        amount: 89.99,
        paymentMethod: "debit",
        status: "failed",
        date: "2024-01-12",
        invoiceNumber: "INV-001238",
        type: "payment"
      }
    ];

    // Sample transaction history data
    const sampleHistory = [
      {
        id: 101,
        clientName: "John Smith",
        amount: 150.00,
        type: "refund",
        status: "completed",
        date: "2024-01-16",
        referenceNumber: "REF-001234",
        description: "Service cancellation refund"
      },
      {
        id: 102,
        clientName: "Lisa Anderson",
        amount: -75.50,
        type: "adjustment",
        status: "completed",
        date: "2024-01-15",
        referenceNumber: "ADJ-001235",
        description: "Price adjustment"
      },
      {
        id: 103,
        clientName: "Sarah Johnson",
        amount: 50.00,
        type: "partial_payment",
        status: "completed",
        date: "2024-01-14",
        referenceNumber: "PP-001236",
        description: "Partial payment for invoice"
      },
      {
        id: 104,
        clientName: "Mike Wilson",
        amount: -25.00,
        type: "discount",
        status: "completed",
        date: "2024-01-13",
        referenceNumber: "DISC-001237",
        description: "Loyalty discount applied"
      },
      {
        id: 105,
        clientName: "Tech Corp Inc",
        amount: 1200.00,
        type: "bulk_payment",
        status: "pending",
        date: "2024-01-12",
        referenceNumber: "BULK-001238",
        description: "Corporate bulk service payment"
      }
    ];

    // Combine both datasets
    const allData = [...samplePayments, ...sampleHistory];
    setPayments(allData);
    setLoading(false);
  }, []);

  // Filter data based on active table and filters
  const filteredData = payments.filter(item => {
    const matchesSearch = item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.referenceNumber && item.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    // Date range filter
    const itemDate = new Date(item.date);
    const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
    const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
    
    const matchesDateRange = (!startDate || itemDate >= startDate) && 
                            (!endDate || itemDate <= endDate);
    
    // Filter by type based on active table
    const matchesType = activeTable === "payments" 
      ? (item.type === "payment" || !item.type)
      : (item.type !== "payment" && item.type);
    
    return matchesSearch && matchesStatus && matchesDateRange && matchesType;
  });

  // Calculate summary statistics
  const totalRevenue = payments
    .filter(p => p.status === 'completed' && p.amount > 0)
    .reduce((sum, p) => sum + p.amount, 0);

  const completedCount = payments.filter(p => p.status === 'completed').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" }
    };
    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      payment: { color: "bg-blue-100 text-blue-800", label: "Payment", icon: "💳" },
      refund: { color: "bg-orange-100 text-orange-800", label: "Refund", icon: "↩️" },
      adjustment: { color: "bg-purple-100 text-purple-800", label: "Adjustment", icon: "⚖️" },
      partial_payment: { color: "bg-cyan-100 text-cyan-800", label: "Partial", icon: "💰" },
      discount: { color: "bg-pink-100 text-pink-800", label: "Discount", icon: "🎯" },
      bulk_payment: { color: "bg-indigo-100 text-indigo-800", label: "Bulk", icon: "📦" }
    };
    const config = typeConfig[type] || { color: "bg-gray-100 text-gray-800", label: type, icon: "📄" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      credit: <FaCreditCard className="text-blue-500" />,
      debit: <FaCreditCard className="text-purple-500" />,
      cash: <FaMoneyBillWave className="text-green-500" />,
      bank: <FaWallet className="text-orange-500" />,
      check: <FaWallet className="text-yellow-500" />
    };
    return icons[method] || <FaCreditCard className="text-gray-500" />;
  };

  const exportToCSV = () => {
    const headers = activeTable === "payments" 
      ? ["Date", "Client", "Amount", "Method", "Status", "Invoice"]
      : ["Date", "Client", "Amount", "Type", "Status", "Reference", "Description"];
    
    const csvData = filteredData.map(item => {
      if (activeTable === "payments") {
        return [
          item.date, 
          item.clientName, 
          `$${item.amount}`, 
          item.paymentMethod || "N/A", 
          item.status, 
          item.invoiceNumber || "N/A"
        ];
      } else {
        return [
          item.date,
          item.clientName,
          `$${item.amount}`,
          item.type,
          item.status,
          item.referenceNumber || "N/A",
          item.description || "N/A"
        ];
      }
    });
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTable}-history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearDateFilters = () => {
    setDateFilter({
      startDate: "",
      endDate: ""
    });
  };

  const TableToggleButton = () => (
    <button
      onClick={() => setActiveTable(activeTable === "payments" ? "history" : "payments")}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
    >
      <FaExchangeAlt className="mr-2" />
      {activeTable === "payments" ? "View Transaction History" : "View Payments"}
    </button>
  );

  const AddPaymentButton = () => (
    <button
      onClick={() => setShowAddPayment(true)}
      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
    >
      <FaPlus className="mr-2" />
      Add Payment
    </button>
  );

  // Add Payment Modal
  const AddPaymentModal = () => {
    const [formData, setFormData] = useState({
      clientName: "",
      amount: "",
      paymentMethod: "credit",
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: "",
      notes: ""
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Here you would typically send the data to your API
      console.log("Adding payment:", formData);
      alert("Payment added successfully!");
      setShowAddPayment(false);
      // Reset form
      setFormData({
        clientName: "",
        amount: "",
        paymentMethod: "credit",
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: "",
        notes: ""
      });
    };

    const handleChange = (e) => {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    };

    if (!showAddPayment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Add New Payment</h3>
            <button
              onClick={() => setShowAddPayment(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="INV-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes..."
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddPayment(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Add Payment Modal */}
      <AddPaymentModal />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTable === "payments" ? "Sales Transactions" : "Transaction History"}
          </h1>
          <p className="text-gray-600">
            {activeTable === "payments" 
              ? "View all balance and sales transactions history" 
              : "View complete transaction history including adjustments and refunds"}
          </p>
        </div>
        <div className="flex gap-3">
          <AddPaymentButton />
          <TableToggleButton />
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            <FaDownload className="mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-800">
            ${totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {completedCount}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingCount}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-red-600">
            {failedCount}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={
                  activeTable === "payments" 
                    ? "Search by client name or invoice number..." 
                    : "Search by client name or reference number..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Clear Date Filters */}
          <div className="flex items-end">
            <button
              onClick={clearDateFilters}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear Dates
            </button>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <div className="relative">
              <FaCalendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => handleDateFilterChange("startDate", e.target.value)}
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <div className="relative">
              <FaCalendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => handleDateFilterChange("endDate", e.target.value)}
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-2 w-full text-center">
              {dateFilter.startDate && dateFilter.endDate 
                ? `${dateFilter.startDate} to ${dateFilter.endDate}`
                : "Select date range"}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              {activeTable === "payments" ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaCalendar className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium">{item.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.clientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-bold ${
                      item.amount < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${Math.abs(item.amount).toFixed(2)}
                      {item.amount < 0 && <span className="text-xs ml-1">(credit)</span>}
                    </div>
                  </td>
                  
                  {activeTable === "payments" ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(item.paymentMethod)}
                          <span className="ml-2 capitalize">{item.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.invoiceNumber}</code>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        {getTypeBadge(item.type)}
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.referenceNumber}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{item.description}</span>
                      </td>
                    </>
                  )}
                  
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button 
                        className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                        title="View details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-50"
                        title="Download receipt"
                      >
                        <FaReceipt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeTable === "payments" ? 8 : 9} className="text-center py-12 text-gray-500">
                  {searchTerm || statusFilter !== "all" || dateFilter.startDate || dateFilter.endDate
                    ? `No ${activeTable} match your search criteria` 
                    : `No ${activeTable} history found`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}