"use client";

import { useState, useEffect } from "react";
import {
  FaSearch, FaFilter, FaDownload, FaEye, FaReceipt, FaCreditCard, FaMoneyBillWave,
  FaWallet, FaCalendar, FaUser, FaDollarSign, FaPaperPlane, FaPlus, FaTimes
} from "react-icons/fa";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "credit",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
  });

  useEffect(() => {
    setClients([
      { id: 1, name: "John Smith", email: "john@example.com" },
      { id: 2, name: "Sarah Johnson", email: "sarah@example.com" },
      { id: 3, name: "Mike Wilson", email: "mike@example.com" },
      { id: 4, name: "Emily Davis", email: "emily@example.com" }
    ]);

    const samplePayments = [
      {
        id: 1, clientName: "John Smith", amount: 450.0, paymentMethod: "credit",
        status: "completed", date: "2024-01-15", invoiceNumber: "INV-001234"
      },
      {
        id: 2, clientName: "Sarah Johnson", amount: 289.5, paymentMethod: "bank",
        status: "completed", date: "2024-01-14", invoiceNumber: "INV-001235"
      },
      {
        id: 3, clientName: "Mike Wilson", amount: 750.0, paymentMethod: "cash",
        status: "pending", date: "2024-01-13", invoiceNumber: "INV-001236"
      },
      {
        id: 4, clientName: "Emily Davis", amount: 320.0, paymentMethod: "debit",
        status: "failed", date: "2024-01-12", invoiceNumber: "INV-001237"
      },
    ];
    setPayments(samplePayments);
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPayment = {
        id: payments.length + 1,
        clientName: clients.find(c => c.id == selectedClient)?.name || "Unknown",
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        status: "completed",
        date: paymentData.paymentDate,
        invoiceNumber: paymentData.invoiceNumber
      };

      setPayments(prev => [newPayment, ...prev]);
      alert("Payment processed successfully!");
      setIsModalOpen(false);
      setPaymentData({
        amount: "",
        paymentMethod: "credit",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
      });
      setSelectedClient("");
    } catch (err) {
      console.error(err);
      alert("Error processing payment");
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      failed: "bg-rose-500/10 text-rose-600 border-rose-500/20"
    }[status] || "bg-gray-500/10 text-gray-600 border-gray-500/20";

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${config}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      credit: <FaCreditCard className="text-blue-500" />,
      debit: <FaCreditCard className="text-purple-500" />,
      cash: <FaMoneyBillWave className="text-emerald-500" />,
      bank: <FaWallet className="text-orange-500" />,
      check: <FaWallet className="text-amber-500" />
    };
    return icons[method] || <FaCreditCard className="text-gray-500" />;
  };

  const exportToCSV = () => {
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

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedPayments = filteredPayments.filter(p => p.status === "completed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Payment History</h1>
              <p className="text-slate-600 text-lg">Manage and track all your payment transactions</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 font-medium"
              >
                <FaPlus /> Add Payment
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium border border-slate-200"
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">Total Payments</span>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-xl" />
                </div>
              </div>
              <div className="text-3xl font-bold">${totalAmount.toFixed(2)}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100 text-sm font-medium">Completed</span>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaReceipt className="text-xl" />
                </div>
              </div>
              <div className="text-3xl font-bold">{completedPayments}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-sm font-medium">Total Transactions</span>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaWallet className="text-xl" />
                </div>
              </div>
              <div className="text-3xl font-bold">{filteredPayments.length}</div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by client name or invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2 border-slate-200 rounded-xl pl-12 pr-4 py-3.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-medium text-slate-700 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-medium text-slate-700 cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FaCalendar className="text-slate-400" />
                        <span className="font-medium">{p.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {p.clientName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{p.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                        ${p.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          {getPaymentMethodIcon(p.paymentMethod)}
                        </div>
                        <span className="capitalize font-medium text-slate-700">{p.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                    <td className="px-6 py-4">
                      <code className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold text-slate-700">
                        {p.invoiceNumber}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <FaEye />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          <FaReceipt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <FaTimes />
            </button>
            <h2 className="text-3xl font-bold mb-6 text-slate-800">Add New Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  <FaUser className="inline mr-2 text-blue-500" /> Select Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  <FaDollarSign className="inline mr-2 text-emerald-500" /> Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Payment Method</label>
                <div className="flex flex-wrap gap-3">
                  {["credit", "debit", "cash", "bank", "check"].map(method => (
                    <label key={method} className={`flex items-center gap-2 border-2 px-5 py-3 rounded-xl cursor-pointer transition-all ${
                      paymentData.paymentMethod === method 
                        ? "border-blue-500 bg-blue-50 shadow-md" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentData.paymentMethod === method}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {getPaymentMethodIcon(method)} 
                      <span className="capitalize font-medium">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Payment Date</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={paymentData.paymentDate}
                    onChange={handleChange}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={paymentData.invoiceNumber}
                    onChange={handleChange}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Notes</label>
                <textarea
                  name="notes"
                  value={paymentData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200 font-semibold"
                >
                  <FaPaperPlane /> Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import {
//   FaSearch, FaFilter, FaDownload, FaEye, FaReceipt, FaCreditCard, FaMoneyBillWave,
//   FaWallet, FaCalendar, FaUser, FaDollarSign, FaPaperPlane, FaPlus
// } from "react-icons/fa";

// export default function PaymentHistoryPage() {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [dateFilter, setDateFilter] = useState("all");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Payment form state
//   const [clients, setClients] = useState([]);
//   const [selectedClient, setSelectedClient] = useState("");
//   const [paymentData, setPaymentData] = useState({
//     amount: "",
//     paymentMethod: "credit",
//     paymentDate: new Date().toISOString().split("T")[0],
//     notes: "",
//     invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
//   });

//   // --- SAMPLE DATA --- //
//   useEffect(() => {
//     setClients([
//       { id: 1, name: "John Smith", email: "john@example.com" },
//       { id: 2, name: "Sarah Johnson", email: "sarah@example.com" },
//       { id: 3, name: "Mike Wilson", email: "mike@example.com" },
//       { id: 4, name: "Emily Davis", email: "emily@example.com" }
//     ]);

//     const samplePayments = [
//       {
//         id: 1, clientName: "John Smith", amount: 450.0, paymentMethod: "credit",
//         status: "completed", date: "2024-01-15", invoiceNumber: "INV-001234"
//       },
//       {
//         id: 2, clientName: "Sarah Johnson", amount: 289.5, paymentMethod: "bank",
//         status: "completed", date: "2024-01-14", invoiceNumber: "INV-001235"
//       },
//     ];
//     setPayments(samplePayments);
//     setLoading(false);
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setPaymentData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Simulated API call
//       const newPayment = {
//         id: payments.length + 1,
//         clientName: clients.find(c => c.id == selectedClient)?.name || "Unknown",
//         amount: Number(paymentData.amount),
//         paymentMethod: paymentData.paymentMethod,
//         status: "completed",
//         date: paymentData.paymentDate,
//         invoiceNumber: paymentData.invoiceNumber
//       };

//       setPayments(prev => [newPayment, ...prev]);
//       alert("Payment processed successfully!");
//       setIsModalOpen(false);
//       setPaymentData({
//         amount: "",
//         paymentMethod: "credit",
//         paymentDate: new Date().toISOString().split("T")[0],
//         notes: "",
//         invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
//       });
//       setSelectedClient("");
//     } catch (err) {
//       console.error(err);
//       alert("Error processing payment");
//     }
//   };

//   const filteredPayments = payments.filter(payment => {
//     const matchesSearch =
//       payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const getStatusBadge = (status) => {
//     const config = {
//       completed: "bg-green-100 text-green-800",
//       pending: "bg-yellow-100 text-yellow-800",
//       failed: "bg-red-100 text-red-800"
//     }[status] || "bg-gray-100 text-gray-800";

//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${config}`}>
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   const getPaymentMethodIcon = (method) => {
//     const icons = {
//       credit: <FaCreditCard className="text-blue-500" />,
//       debit: <FaCreditCard className="text-purple-500" />,
//       cash: <FaMoneyBillWave className="text-green-500" />,
//       bank: <FaWallet className="text-orange-500" />,
//       check: <FaWallet className="text-yellow-500" />
//     };
//     return icons[method] || <FaCreditCard className="text-gray-500" />;
//   };

//   const exportToCSV = () => {
//     const headers = ["Date", "Client", "Amount", "Method", "Status", "Invoice"];
//     const csvData = filteredPayments.map(p => [
//       p.date, p.clientName, `$${p.amount}`, p.paymentMethod, p.status, p.invoiceNumber
//     ]);
//     const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "payment-history.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Payment History</h1>
//           <p className="text-gray-600">View and manage all payment transactions</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
//           >
//             <FaPlus className="mr-2" /> Add Payment
//           </button>
//           <button
//             onClick={exportToCSV}
//             className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
//           >
//             <FaDownload className="mr-2" /> Export CSV
//           </button>
//         </div>
//       </div>

//       {/* Search + Filters */}
//       <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <FaSearch className="absolute left-3 top-3 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by client name or invoice number..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>
//           <div className="flex gap-4">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
//             >
//               <option value="all">All Status</option>
//               <option value="completed">Completed</option>
//               <option value="pending">Pending</option>
//               <option value="failed">Failed</option>
//             </select>
//             <select
//               value={dateFilter}
//               onChange={(e) => setDateFilter(e.target.value)}
//               className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
//             >
//               <option value="all">All Time</option>
//               <option value="today">Today</option>
//               <option value="week">This Week</option>
//               <option value="month">This Month</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredPayments.map((p) => (
//               <tr key={p.id} className="hover:bg-gray-50 transition">
//                 <td className="px-6 py-4 whitespace-nowrap flex items-center">
//                   <FaCalendar className="text-gray-400 mr-2" /> {p.date}
//                 </td>
//                 <td className="px-6 py-4">{p.clientName}</td>
//                 <td className="px-6 py-4 font-bold text-green-600">${p.amount.toFixed(2)}</td>
//                 <td className="px-6 py-4 flex items-center gap-2">
//                   {getPaymentMethodIcon(p.paymentMethod)}
//                   <span className="capitalize">{p.paymentMethod}</span>
//                 </td>
//                 <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
//                 <td className="px-6 py-4">
//                   <code className="bg-gray-100 px-2 py-1 rounded">{p.invoiceNumber}</code>
//                 </td>
//                 <td className="px-6 py-4 flex space-x-3">
//                   <button className="text-blue-600 hover:text-blue-800"><FaEye /></button>
//                   <button className="text-gray-600 hover:text-gray-800"><FaReceipt /></button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* --- PAYMENT MODAL --- */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
//             <button
//               onClick={() => setIsModalOpen(false)}
//               className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
//             >
//               ×
//             </button>
//             <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Payment</h2>
//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* Client */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <FaUser className="inline mr-2 text-blue-500" /> Select Client *
//                 </label>
//                 <select
//                   value={selectedClient}
//                   onChange={(e) => setSelectedClient(e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="">Choose a client...</option>
//                   {clients.map(client => (
//                     <option key={client.id} value={client.id}>
//                       {client.name} ({client.email})
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Amount */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <FaDollarSign className="inline mr-2 text-green-500" /> Amount *
//                 </label>
//                 <input
//                   type="number"
//                   name="amount"
//                   value={paymentData.amount}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3"
//                   required
//                 />
//               </div>

//               {/* Method */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Method *</label>
//                 <div className="flex flex-wrap gap-3">
//                   {["credit", "debit", "cash", "bank", "check"].map(method => (
//                     <label key={method} className={`flex items-center border px-4 py-2 rounded-lg cursor-pointer ${
//                       paymentData.paymentMethod === method ? "border-blue-500 bg-blue-50" : "border-gray-300"
//                     }`}>
//                       <input
//                         type="radio"
//                         name="paymentMethod"
//                         value={method}
//                         checked={paymentData.paymentMethod === method}
//                         onChange={handleChange}
//                         className="sr-only"
//                       />
//                       {getPaymentMethodIcon(method)} 
//                       <span className="ml-2 capitalize">{method}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Date + Invoice */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
//                   <input
//                     type="date"
//                     name="paymentDate"
//                     value={paymentData.paymentDate}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-3"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
//                   <input
//                     type="text"
//                     name="invoiceNumber"
//                     value={paymentData.invoiceNumber}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
//                   />
//                 </div>
//               </div>

//               {/* Notes */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
//                 <textarea
//                   name="notes"
//                   value={paymentData.notes}
//                   onChange={handleChange}
//                   rows="3"
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3"
//                 />
//               </div>

//               {/* Submit */}
//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   className="flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                   <FaPaperPlane className="mr-2" /> Process Payment
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
