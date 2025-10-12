"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaDownload, FaEye, FaReceipt, FaCreditCard, FaMoneyBillWave, FaWallet, FaCalendar } from "react-icons/fa";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Sample payments data - replace with your API
  useEffect(() => {
    const samplePayments = [
      {
        id: 1,
        clientName: "John Smith",
        amount: 450.00,
        paymentMethod: "credit",
        status: "completed",
        date: "2024-01-15",
        invoiceNumber: "INV-001234"
      },
      {
        id: 2,
        clientName: "Sarah Johnson",
        amount: 289.50,
        paymentMethod: "bank",
        status: "completed",
        date: "2024-01-14",
        invoiceNumber: "INV-001235"
      },
      {
        id: 3,
        clientName: "Mike Wilson",
        amount: 125.75,
        paymentMethod: "cash",
        status: "pending",
        date: "2024-01-14",
        invoiceNumber: "INV-001236"
      },
      {
        id: 4,
        clientName: "Emily Davis",
        amount: 567.25,
        paymentMethod: "credit",
        status: "completed",
        date: "2024-01-13",
        invoiceNumber: "INV-001237"
      },
      {
        id: 5,
        clientName: "Robert Brown",
        amount: 89.99,
        paymentMethod: "debit",
        status: "failed",
        date: "2024-01-12",
        invoiceNumber: "INV-001238"
      }
    ];
    
    setPayments(samplePayments);
    setLoading(false);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    // Simple CSV export implementation
    const headers = ["Date", "Client", "Amount", "Method", "Status", "Invoice"];
    const csvData = filteredPayments.map(p => [
      p.date, p.clientName, `$${p.amount}`, p.paymentMethod, p.status, p.invoiceNumber
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-history.csv";
    a.click();
    URL.revokeObjectURL(url);
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payment History</h1>
          <p className="text-gray-600">View and manage all payment transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          <FaDownload className="mr-2" /> Export CSV
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaCalendar className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium">{payment.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{payment.clientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-green-600">
                      ${typeof payment.amount === 'number' 
                        ? payment.amount.toFixed(2) 
                        : Number(payment.amount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span className="ml-2 capitalize">{payment.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{payment.invoiceNumber}</code>
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
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  {searchTerm || statusFilter !== "all" 
                    ? "No payments match your search criteria" 
                    : "No payment history found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-800">
            ${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {payments.filter(p => p.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {payments.filter(p => p.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-red-600">
            {payments.filter(p => p.status === 'failed').length}
          </div>
        </div>
      </div>
    </div>
  );
}