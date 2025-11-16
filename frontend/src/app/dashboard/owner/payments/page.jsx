"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaDownload, FaEye, FaReceipt, FaCreditCard, FaMoneyBillWave, FaWallet, FaCalendar, FaExchangeAlt, FaPlus, FaFileInvoice } from "react-icons/fa";

export default function InvoiceMainPage() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [activeTable, setActiveTable] = useState("payments");
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch from your API endpoints
        // Example:
        // const paymentsResponse = await fetch('/api/payments');
        // const paymentsData = await paymentsResponse.json();
        // setPayments(paymentsData);
        
        // const invoicesResponse = await fetch('/api/invoices');
        // const invoicesData = await invoicesResponse.json();
        // setInvoices(invoicesData);
        
        // const quotationsResponse = await fetch('/api/quotations');
        // const quotationsData = await quotationsResponse.json();
        // setQuotations(quotationsData);

        // For now, setting empty arrays since we're removing static data
        setPayments([]);
        setInvoices([]);
        setQuotations([]);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set empty arrays on error as well
        setPayments([]);
        setInvoices([]);
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on active table and filters
  const filteredData = payments.filter(item => {
    const matchesSearch = item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
      unpaid: { color: "bg-red-100 text-red-800", label: "Unpaid" },
      partial: { color: "bg-blue-100 text-blue-800", label: "Partial" },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      overdue: { color: "bg-red-100 text-red-800", label: "Overdue" },
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      sent: { color: "bg-blue-100 text-blue-800", label: "Sent" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" }
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
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

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

  const AddInvoiceButton = () => (
    <button
      onClick={() => setShowAddInvoice(true)}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
    >
      <FaFileInvoice className="mr-2" />
      Create Invoice
    </button>
  );

  // Add Payment Modal
  const AddPaymentModal = () => {
    const [formData, setFormData] = useState({
      invoiceId: "",
      clientName: "",
      amount: "",
      paymentMethod: "credit",
      date: new Date().toISOString().split('T')[0],
      notes: ""
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Here you would typically send the data to your API
        console.log("Adding payment:", formData);
        
        // Update invoice amount paid and status
        if (formData.invoiceId) {
          const invoice = invoices.find(inv => inv.id === parseInt(formData.invoiceId));
          if (invoice) {
            const newAmountPaid = invoice.amountPaid + parseFloat(formData.amount);
            const newAmountDue = invoice.total - newAmountPaid;
            const newStatus = newAmountDue <= 0 ? 'paid' : newAmountPaid > 0 ? 'partial' : 'unpaid';
            
            // Update invoice (in real app, this would be an API call)
            const updatedInvoices = invoices.map(inv => 
              inv.id === parseInt(formData.invoiceId) 
                ? { ...inv, amountPaid: newAmountPaid, amountDue: newAmountDue, status: newStatus }
                : inv
            );
            setInvoices(updatedInvoices);
          }
        }
        
        alert("Payment added successfully!");
        setShowAddPayment(false);
        // Reset form
        setFormData({
          invoiceId: "",
          clientName: "",
          amount: "",
          paymentMethod: "credit",
          date: new Date().toISOString().split('T')[0],
          notes: ""
        });

        // Refresh payments data
        // const paymentsResponse = await fetch('/api/payments');
        // const paymentsData = await paymentsResponse.json();
        // setPayments(paymentsData);
        
      } catch (error) {
        console.error("Error adding payment:", error);
        alert("Error adding payment. Please try again.");
      }
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
                Invoice
              </label>
              <select
                name="invoiceId"
                value={formData.invoiceId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Invoice</option>
                {invoices.filter(inv => inv.status !== 'paid').map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {invoice.clientName} - ${invoice.amountDue} due
                  </option>
                ))}
              </select>
            </div>
            
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

  // Add Invoice Modal
  const AddInvoiceModal = () => {
    const [formData, setFormData] = useState({
      quotationId: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: "Net 30",
      notes: ""
    });

    const calculateTotals = (items, tax, discount) => {
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      const total = subtotal + tax - discount;
      return { subtotal, total };
    };

    const handleItemChange = (index, field, value) => {
      const updatedItems = [...formData.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'rate') {
        const quantity = field === 'quantity' ? parseFloat(value) : updatedItems[index].quantity;
        const rate = field === 'rate' ? parseFloat(value) : updatedItems[index].rate;
        updatedItems[index].amount = quantity * rate;
      }
      
      const { subtotal, total } = calculateTotals(updatedItems, formData.tax, formData.discount);
      setFormData(prev => ({ ...prev, items: updatedItems, subtotal, total }));
    };

    const addItem = () => {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { description: "", quantity: 1, rate: 0, amount: 0 }]
      }));
    };

    const removeItem = (index) => {
      if (formData.items.length > 1) {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        const { subtotal, total } = calculateTotals(updatedItems, formData.tax, formData.discount);
        setFormData(prev => ({ ...prev, items: updatedItems, subtotal, total }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Generate invoice number
        const invoiceNumber = `INV-${String(invoices.length + 1).padStart(6, '0')}`;
        
        const newInvoice = {
          id: invoices.length + 2001,
          invoiceNumber,
          quotationId: formData.quotationId || null,
          quotationNumber: formData.quotationId ? quotations.find(q => q.id === parseInt(formData.quotationId))?.quotationNumber : null,
          ...formData,
          amountDue: formData.total,
          amountPaid: 0,
          status: 'unpaid'
        };
        
        // In a real app, you would send this to your API
        // await fetch('/api/invoices', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newInvoice)
        // });

        setInvoices(prev => [...prev, newInvoice]);
        alert("Invoice created successfully!");
        setShowAddInvoice(false);

        // Refresh invoices data
        // const invoicesResponse = await fetch('/api/invoices');
        // const invoicesData = await invoicesResponse.json();
        // setInvoices(invoicesData);
        
      } catch (error) {
        console.error("Error creating invoice:", error);
        alert("Error creating invoice. Please try again.");
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'tax' || name === 'discount') {
        const { subtotal, total } = calculateTotals(formData.items, 
          name === 'tax' ? parseFloat(value) : formData.tax,
          name === 'discount' ? parseFloat(value) : formData.discount
        );
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0, subtotal, total }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    };

    if (!showAddInvoice) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Create New Invoice</h3>
            <button
              onClick={() => setShowAddInvoice(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quotation
                </label>
                <select
                  name="quotationId"
                  value={formData.quotationId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Quotation (Optional)</option>
                  {quotations.filter(q => q.status === 'approved').map(quotation => (
                    <option key={quotation.id} value={quotation.id}>
                      {quotation.quotationNumber} - {quotation.clientName} - ${quotation.total}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Due on receipt">Due on receipt</option>
                  <option value="Net 7">Net 7</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Client Email
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="client@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Phone
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Items</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
              
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                        step="0.01"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.amount}
                        readOnly
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-1">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${formData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                    step="0.01"
                    className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    step="0.01"
                    className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${formData.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddInvoice(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Create Invoice
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
      {/* Modals */}
      <AddPaymentModal />
      <AddInvoiceModal />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTable === "payments" ? "Invoice" : "Sales Transaction History"}
          </h1>
          <p className="text-gray-600">
            {activeTable === "payments" 
              ? "View all balance and sales transactions history" 
              : "View complete transaction history including adjustments and refunds"}
          </p>
        </div>
        <div className="flex gap-3">
          <AddInvoiceButton />
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
                    : `No ${activeTable} data available`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}