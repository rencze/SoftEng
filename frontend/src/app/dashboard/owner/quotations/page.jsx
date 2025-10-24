"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaSearch,
  FaFilter,
  FaFilePdf,
  FaPrint,
  FaCalendarAlt,
  FaUser,
  FaBuilding,
  FaDollarSign,
  FaFileAlt,
  FaTimes,
  FaChevronDown,
  FaSave 
} from "react-icons/fa";

// Main Quotations Page Component
export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load sample data
  useEffect(() => {
    const sampleData = [
      {
        quotationId: 1,
        quotationNumber: "QTN-001",
        bookingId: 101,
        bookingNumber: "BK-2024-001",
        customerName: "John Smith",
        total: 1250.00,
        status: "Approved",
        date: "2024-01-15",
        validity: 30
      },
      {
        quotationId: 2,
        quotationNumber: "QTN-002",
        bookingId: 102,
        bookingNumber: "BK-2024-002",
        customerName: "Sarah Johnson",

        total: 850.50,
        status: "Pending",
        date: "2024-01-16",
        validity: 15
      },
      {
        quotationId: 3,
        quotationNumber: "QTN-003",
        bookingId: 103,
        bookingNumber: "BK-2024-003",
        customerName: "Mike Wilson",
  
        total: 2100.75,
        status: "Draft",
        date: "2024-01-17",
        validity: 30
      }
    ];
    setQuotations(sampleData);
  }, []);

  const filteredQuotations = quotations.filter(quote => 
    quote.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(quote => 
    statusFilter === "all" || quote.status === statusFilter
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Quotations
            </h1>
            <p className="text-gray-600 flex items-center">
              <FaFileAlt className="mr-2" />
              Manage and create customer quotations
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="mr-2" />
            Create Quotation
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotations, customers, or booking numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quotation Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Reference
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {filteredQuotations.map((quotation) => (
                <tr key={quotation.quotationId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {quotation.quotationNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(quotation.date).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                      {quotation.bookingNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {quotation.customerName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${quotation.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                      {quotation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedQuotation(quotation)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEye />
                      </button>
                      <button className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors">
                        <FaFilePdf />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuotations.length === 0 && (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No quotations found</p>
            <p className="text-gray-400 mt-2">Create your first quotation to get started</p>
          </div>
        )}
      </div>

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <CreateQuotationModal 
          onClose={() => setShowCreateModal(false)}
          onSave={(newQuotation) => {
            setQuotations(prev => [newQuotation, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* View Quotation Modal */}
      {selectedQuotation && (
        <ViewQuotationModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
        />
      )}
    </div>
  );
}

// Create Quotation Modal Component
function CreateQuotationModal({ onClose, onSave }) {
  const [quotation, setQuotation] = useState({
    quotationNumber: `QTN-${Date.now().toString().slice(-4)}`,
    bookingNumber: `BK-${new Date().getFullYear()}-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    customerName: "",
    email: "",
    phone: "",
    address: "",
    validity: 30,
    notes: "",
    laborCost: 0,
    partsCost: 0,
    workTimeEstimation: 0,
    items: []
  });

  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0
  });

  // Calculate totals
  const itemsSubtotal = quotation.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemDiscount = itemTotal * (item.discount / 100);
    return sum + (itemTotal - itemDiscount);
  }, 0);

  const subtotal = itemsSubtotal + (quotation.laborCost || 0) + (quotation.partsCost || 0);
  const taxRate = 0.1;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice < 0) {
      alert("Please fill all item fields correctly");
      return;
    }

    setQuotation(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem, id: Date.now() }]
    }));

    setNewItem({
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0
    });
  };

  const removeItem = (id) => {
    setQuotation(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

 const handleQuotationChange = (e) => {
  const { name, value } = e.target;
  // Convert numeric fields to numbers
  const numericFields = ["laborCost", "partsCost", "workTimeEstimation", "validity"];
  const newValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;

  setQuotation((prev) => ({
    ...prev,
    [name]: newValue,
  }));
};


  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!quotation.customerName) {
      alert("Please fill customer details");
      return;
    }

    const newQuotation = {
      ...quotation,
      quotationId: Date.now(),
      subtotal,
      tax,
      total,
      status: "Draft",
      createdAt: new Date().toISOString()
    };

    onSave(newQuotation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Quotation</h2>
              <p className="text-blue-100">Fill in the details below to create a new quotation</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Customer & Booking Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Customer Details
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={quotation.customerName}
                      onChange={handleQuotationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>


                  <div className="grid grid-cols-2 gap-4"> 
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FaCalendarAlt className="mr-2 text-green-600" />
                  Quotation & Booking Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quotation Number
                    </label>
                    <input
                      type="text"
                      name="quotationNumber"
                      value={quotation.quotationNumber}
                      onChange={handleQuotationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Number
                    </label>
                    <input
                      type="text"
                      name="bookingNumber"
                      value={quotation.bookingNumber}
                      onChange={handleQuotationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono"
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={quotation.date}
                      onChange={handleQuotationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Validity (Days)
                    </label>
                    <input
                      type="number"
                      name="validity"
                      value={quotation.validity}
                      onChange={handleQuotationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Labor Cost
                    </label>
                    <input
                      type="number"
                      name="laborCost"
                      value={quotation.laborCost}
                      onChange={handleQuotationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parts Cost
                    </label>
                    <input
                      type="number"
                      name="partsCost"
                      value={quotation.partsCost}
                      onChange={handleQuotationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Time Estimation (hours)
                  </label>
                  <input
                    type="number"
                    name="workTimeEstimation"
                    value={quotation.workTimeEstimation}
                    onChange={handleQuotationChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaDollarSign className="mr-2 text-green-600" />
                Quotation Items
              </h3>

              {/* Add Item Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={newItem.description}
                      onChange={handleItemChange}
                      placeholder="Item description"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={newItem.quantity}
                      onChange={handleItemChange}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      name="unitPrice"
                      value={newItem.unitPrice}
                      onChange={handleItemChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        name="discount"
                        value={newItem.discount}
                        onChange={handleItemChange}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="bg-gray-200 px-3 py-2 rounded-r-lg text-sm flex items-center">%</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={addItem}
                      className="w-full bg-green-600 text-white rounded-lg px-3 py-2 hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quotation.items.map((item) => {
                      const itemTotal = item.quantity * item.unitPrice;
                      const itemDiscount = itemTotal * (item.discount / 100);
                      const finalTotal = itemTotal - itemDiscount;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{item.description}</td>
                          <td className="px-4 py-3 text-sm">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">{item.discount}%</td>
                          <td className="px-4 py-3 text-sm font-medium">${finalTotal.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-800 p-1 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {quotation.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <FaFileAlt className="mx-auto text-3xl text-gray-300 mb-3" />
                    <p>No items added yet</p>
                    <p className="text-sm text-gray-400">Add items using the form above</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary and Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
                  <textarea
                    name="notes"
                    value={quotation.notes}
                    onChange={handleQuotationChange}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter any additional notes, terms, or conditions for this quotation..."
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-0">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items Subtotal:</span>
                    <span className="font-medium">${itemsSubtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Labor Cost:</span>
                    <span className="font-medium">${quotation.laborCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Parts Cost:</span>
                    <span className="font-medium">${quotation.partsCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-700 font-medium">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-3 text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                  >
                    <FaSave className="mr-2" />
                    Save Quotation
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full bg-gray-500 text-white rounded-lg px-4 py-3 hover:bg-gray-600 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// View Quotation Modal Component
function ViewQuotationModal({ quotation, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quotation Details</h2>
              <p className="text-green-100">{quotation.quotationNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {quotation.customerName}</p>
                <p><strong>Email:</strong> {quotation.email}</p>
                <p><strong>Phone:</strong> {quotation.phone}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quotation Details</h3>
              <div className="space-y-2">
                <p><strong>Booking Reference:</strong> {quotation.bookingNumber}</p>
                <p><strong>Date:</strong> {new Date(quotation.date).toLocaleDateString()}</p>
                <p><strong>Validity:</strong> {quotation.validity} days</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    quotation.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    quotation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quotation.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">${quotation.total.toFixed(2)}</p>
              <p className="text-gray-600">Total Amount</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FaFilePdf className="mr-2" />
              Export PDF
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FaPrint className="mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



// "use client";
// import { useState, useEffect } from "react";
// import {
//   FaPlus,
//   FaTrash,
//   FaSave,
//   FaFilePdf,
//   FaPrint,
//   FaCalendarAlt,
//   FaUser,
//   FaBuilding,
//   FaDollarSign,
//   FaPercent,
//   FaFileAlt
// } from "react-icons/fa";

// export default function CreateQuotationPage() {
//   const [quotation, setQuotation] = useState({
//     quotationNumber: "",
//     date: new Date().toISOString().split('T')[0],
//     customerName: "",
//     company: "",
//     email: "",
//     phone: "",
//     address: "",
//     validity: 30,
//     notes: "",
//     items: []
//   });

//   const [newItem, setNewItem] = useState({
//     description: "",
//     quantity: 1,
//     unitPrice: 0,
//     discount: 0
//   });

//   // Calculate totals
//   const subtotal = quotation.items.reduce((sum, item) => {
//     const itemTotal = item.quantity * item.unitPrice;
//     const itemDiscount = itemTotal * (item.discount / 100);
//     return sum + (itemTotal - itemDiscount);
//   }, 0);

//   const taxRate = 0.1; // 10%
//   const tax = subtotal * taxRate;
//   const total = subtotal + tax;

//   // Add item to quotation
//   const addItem = () => {
//     if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice < 0) {
//       alert("Please fill all item fields correctly");
//       return;
//     }

//     setQuotation(prev => ({
//       ...prev,
//       items: [...prev.items, { ...newItem, id: Date.now() }]
//     }));

//     setNewItem({
//       description: "",
//       quantity: 1,
//       unitPrice: 0,
//       discount: 0
//     });
//   };

//   // Remove item
//   const removeItem = (id) => {
//     setQuotation(prev => ({
//       ...prev,
//       items: prev.items.filter(item => item.id !== id)
//     }));
//   };

//   // Handle quotation field changes
//   const handleQuotationChange = (e) => {
//     const { name, value } = e.target;
//     setQuotation(prev => ({ ...prev, [name]: value }));
//   };

//   // Handle item field changes
//   const handleItemChange = (e) => {
//     const { name, value } = e.target;
//     setNewItem(prev => ({ ...prev, [name]: value }));
//   };

//   // Save quotation
//   const saveQuotation = async () => {
//     if (!quotation.customerName || quotation.items.length === 0) {
//       alert("Please fill customer details and add at least one item");
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:3001/api/quotations", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...quotation,
//           subtotal,
//           tax,
//           total,
//           status: "draft"
//         })
//       });

//       if (res.ok) {
//         alert("Quotation saved successfully!");
//         // Reset form or redirect
//       } else {
//         alert("Failed to save quotation");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error saving quotation");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
//               Create Quotation
//             </h1>
//             <p className="text-gray-600 flex items-center">
//               <FaFileAlt className="mr-2" />
//               Create a new quotation for your customer
//             </p>
//           </div>
//           <div className="flex space-x-3">
//             <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <FaPrint className="mr-2" />
//               Print
//             </button>
//             <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <FaFilePdf className="mr-2" />
//               Export PDF
//             </button>
//             <button 
//               onClick={saveQuotation}
//               className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
//             >
//               <FaSave className="mr-2" />
//               Save Quotation
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Customer Details - Top Section */}
//         <div className="lg:col-span-3">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold mb-4 flex items-center">
//               <FaUser className="mr-2 text-blue-600" />
//               Customer & Quotation Details
//             </h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Quotation Number
//                 </label>
//                 <input
//                   type="text"
//                   name="quotationNumber"
//                   value={quotation.quotationNumber}
//                   onChange={handleQuotationChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="QTN-001"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                   <FaCalendarAlt className="mr-1" />
//                   Date
//                 </label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={quotation.date}
//                   onChange={handleQuotationChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Customer Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="customerName"
//                   value={quotation.customerName}
//                   onChange={handleQuotationChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="John Doe"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                   <FaBuilding className="mr-1" />
//                   Company
//                 </label>
//                 <input
//                   type="text"
//                   name="company"
//                   value={quotation.company}
//                   onChange={handleQuotationChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Company Name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={quotation.email}
//                   onChange={handleQuotationChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="customer@email.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={quotation.phone}
//                   onChange={handleQuotationChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="+1 (555) 000-0000"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Address
//                 </label>
//                 <textarea
//                   name="address"
//                   value={quotation.address}
//                   onChange={handleQuotationChange}
//                   rows={2}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Customer address..."
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Items Section - Bottom */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold mb-4 flex items-center">
//               <FaDollarSign className="mr-2 text-green-600" />
//               Quotation Items
//             </h2>

//             {/* Add Item Form */}
//             <div className="bg-gray-50 rounded-lg p-4 mb-6">
//               <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
//                 <div className="md:col-span-5">
//                   <input
//                     type="text"
//                     name="description"
//                     value={newItem.description}
//                     onChange={handleItemChange}
//                     placeholder="Item description"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <input
//                     type="number"
//                     name="quantity"
//                     value={newItem.quantity}
//                     onChange={handleItemChange}
//                     min="1"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <input
//                     type="number"
//                     name="unitPrice"
//                     value={newItem.unitPrice}
//                     onChange={handleItemChange}
//                     min="0"
//                     step="0.01"
//                     placeholder="0.00"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <div className="flex">
//                     <input
//                       type="number"
//                       name="discount"
//                       value={newItem.discount}
//                       onChange={handleItemChange}
//                       min="0"
//                       max="100"
//                       placeholder="0"
//                       className="w-full border border-gray-300 rounded-l-lg px-3 py-2 text-sm"
//                     />
//                     <span className="bg-gray-200 px-3 py-2 rounded-r-lg text-sm">%</span>
//                   </div>
//                 </div>
//                 <div className="md:col-span-1">
//                   <button
//                     onClick={addItem}
//                     className="w-full bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors"
//                   >
//                     <FaPlus />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Items List */}
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {quotation.items.map((item) => {
//                     const itemTotal = item.quantity * item.unitPrice;
//                     const itemDiscount = itemTotal * (item.discount / 100);
//                     const finalTotal = itemTotal - itemDiscount;

//                     return (
//                       <tr key={item.id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 text-sm">{item.description}</td>
//                         <td className="px-4 py-3 text-sm">{item.quantity}</td>
//                         <td className="px-4 py-3 text-sm">${item.unitPrice.toFixed(2)}</td>
//                         <td className="px-4 py-3 text-sm">{item.discount}%</td>
//                         <td className="px-4 py-3 text-sm font-medium">${finalTotal.toFixed(2)}</td>
//                         <td className="px-4 py-3">
//                           <button
//                             onClick={() => removeItem(item.id)}
//                             className="text-red-600 hover:text-red-800 p-1"
//                           >
//                             <FaTrash />
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>

//               {quotation.items.length === 0 && (
//                 <div className="text-center py-8 text-gray-500">
//                   No items added yet. Start by adding items above.
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Summary Section */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
//             <h2 className="text-xl font-semibold mb-4">Summary</h2>
            
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Subtotal:</span>
//                 <span className="font-medium">${subtotal.toFixed(2)}</span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tax (10%):</span>
//                 <span className="font-medium">${tax.toFixed(2)}</span>
//               </div>
              
//               <div className="border-t pt-3 flex justify-between text-lg font-bold">
//                 <span>Total:</span>
//                 <span className="text-blue-600">${total.toFixed(2)}</span>
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Validity (Days)
//                 </label>
//                 <input
//                   type="number"
//                   name="validity"
//                   value={quotation.validity}
//                   onChange={handleQuotationChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                   min="1"
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Notes
//                 </label>
//                 <textarea
//                   name="notes"
//                   value={quotation.notes}
//                   onChange={handleQuotationChange}
//                   rows={4}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                   placeholder="Additional notes..."
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }