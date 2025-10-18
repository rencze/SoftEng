"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaFilePdf,
  FaPrint,
  FaCalendarAlt,
  FaUser,
  FaBuilding,
  FaDollarSign,
  FaPercent,
  FaFileAlt
} from "react-icons/fa";

export default function CreateQuotationPage() {
  const [quotation, setQuotation] = useState({
    quotationNumber: "",
    date: new Date().toISOString().split('T')[0],
    customerName: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    validity: 30,
    notes: "",
    items: []
  });

  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0
  });

  // Calculate totals
  const subtotal = quotation.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemDiscount = itemTotal * (item.discount / 100);
    return sum + (itemTotal - itemDiscount);
  }, 0);

  const taxRate = 0.1; // 10%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Add item to quotation
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

  // Remove item
  const removeItem = (id) => {
    setQuotation(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Handle quotation field changes
  const handleQuotationChange = (e) => {
    const { name, value } = e.target;
    setQuotation(prev => ({ ...prev, [name]: value }));
  };

  // Handle item field changes
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  // Save quotation
  const saveQuotation = async () => {
    if (!quotation.customerName || quotation.items.length === 0) {
      alert("Please fill customer details and add at least one item");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quotation,
          subtotal,
          tax,
          total,
          status: "draft"
        })
      });

      if (res.ok) {
        alert("Quotation saved successfully!");
        // Reset form or redirect
      } else {
        alert("Failed to save quotation");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving quotation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Create Quotation
            </h1>
            <p className="text-gray-600 flex items-center">
              <FaFileAlt className="mr-2" />
              Create a new quotation for your customer
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FaPrint className="mr-2" />
              Print
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FaFilePdf className="mr-2" />
              Export PDF
            </button>
            <button 
              onClick={saveQuotation}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <FaSave className="mr-2" />
              Save Quotation
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details - Top Section */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-600" />
              Customer & Quotation Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quotation Number
                </label>
                <input
                  type="text"
                  name="quotationNumber"
                  value={quotation.quotationNumber}
                  onChange={handleQuotationChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="QTN-001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaCalendarAlt className="mr-1" />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaBuilding className="mr-1" />
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={quotation.company}
                  onChange={handleQuotationChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={quotation.email}
                  onChange={handleQuotationChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={quotation.phone}
                  onChange={handleQuotationChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={quotation.address}
                  onChange={handleQuotationChange}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Customer address..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Section - Bottom */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaDollarSign className="mr-2 text-green-600" />
              Quotation Items
            </h2>

            {/* Add Item Form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5">
                  <input
                    type="text"
                    name="description"
                    value={newItem.description}
                    onChange={handleItemChange}
                    placeholder="Item description"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    name="quantity"
                    value={newItem.quantity}
                    onChange={handleItemChange}
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    name="unitPrice"
                    value={newItem.unitPrice}
                    onChange={handleItemChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex">
                    <input
                      type="number"
                      name="discount"
                      value={newItem.discount}
                      onChange={handleItemChange}
                      min="0"
                      max="100"
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-l-lg px-3 py-2 text-sm"
                    />
                    <span className="bg-gray-200 px-3 py-2 rounded-r-lg text-sm">%</span>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <button
                    onClick={addItem}
                    className="w-full bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors"
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
                            className="text-red-600 hover:text-red-800 p-1"
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
                <div className="text-center py-8 text-gray-500">
                  No items added yet. Start by adding items above.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validity (Days)
                </label>
                <input
                  type="number"
                  name="validity"
                  value={quotation.validity}
                  onChange={handleQuotationChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={quotation.notes}
                  onChange={handleQuotationChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}