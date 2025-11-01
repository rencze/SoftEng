"use client";

import React from "react";

export default function QuotationPreviewModal({ isOpen, onClose, quotation }) {
  if (!isOpen) return null;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none print:overflow-visible">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">Quotation Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl print:hidden"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 print:p-4 text-sm text-gray-800">
          {/* Company Header */}
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">Car Aircon Services</h1>
              <p className="text-gray-600 text-sm">123 Main Street, City, Country</p>
              <p className="text-gray-600 text-sm">
                Email: info@caraircon.com | Phone: +63 900 123 4567
              </p>
            </div>
            <div className="text-right text-sm">
              <h2 className="text-xl font-semibold">QUOTATION</h2>
              <p>Quotation #: {quotation?.quotationNumber || "QTN-2502"}</p>
              <p>Booking #: {quotation?.bookingNumber || "BK-2025-558"}</p>
              <p>Date: {quotation?.date || "28/10/2025"}</p>
              <p>Validity: {quotation?.validity || "30"} Days</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Customer Details</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-medium w-1/3">Name:</td>
                  <td>{quotation?.customerName || "John Doe"}</td>
                </tr>
                <tr>
                  <td className="font-medium">Email:</td>
                  <td>{quotation?.customerEmail || "john@example.com"}</td>
                </tr>
                <tr>
                  <td className="font-medium">Phone:</td>
                  <td>{quotation?.customerPhone || "+1 (555) 123-4567"}</td>
                </tr>
                <tr>
                  <td className="font-medium">Address:</td>
                  <td>{quotation?.customerAddress || "Enter customer address"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Services */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Services</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Service Name</th>
                  <th className="border px-2 py-1 text-left">Description</th>
                  <th className="border px-2 py-1 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {quotation?.services?.length ? (
                  quotation.services.map((s, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{s.name}</td>
                      <td className="border px-2 py-1">{s.description}</td>
                      <td className="border px-2 py-1 text-right">₱{s.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-2">
                      No services added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Service Packages */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Service Packages</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Package Name</th>
                  <th className="border px-2 py-1 text-left">Description</th>
                  <th className="border px-2 py-1 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {quotation?.packages?.length ? (
                  quotation.packages.map((p, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{p.name}</td>
                      <td className="border px-2 py-1">{p.description}</td>
                      <td className="border px-2 py-1 text-right">₱{p.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-2">
                      No service packages added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Parts */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Custom Parts</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Part Name</th>
                  <th className="border px-2 py-1 text-left">Description</th>
                  <th className="border px-2 py-1 text-right">Unit Price</th>
                  <th className="border px-2 py-1 text-right">Qty</th>
                  <th className="border px-2 py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation?.parts?.length ? (
                  quotation.parts.map((p, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{p.name}</td>
                      <td className="border px-2 py-1">{p.description}</td>
                      <td className="border px-2 py-1 text-right">₱{p.unitPrice}</td>
                      <td className="border px-2 py-1 text-right">{p.qty}</td>
                      <td className="border px-2 py-1 text-right">
                        ₱{(p.unitPrice * p.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-2">
                      No custom parts added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Additional Notes</h3>
            <p className="italic text-gray-700">
              {quotation?.notes || "Enter any additional notes, terms, or conditions for this quotation..."}
            </p>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <table className="w-1/2 text-sm">
                <tbody>
                  <tr>
                    <td>Services:</td>
                    <td className="text-right">₱{quotation?.servicesTotal || 0}</td>
                  </tr>
                  <tr>
                    <td>Service Packages:</td>
                    <td className="text-right">₱{quotation?.packagesTotal || 0}</td>
                  </tr>
                  <tr>
                    <td>Custom Parts:</td>
                    <td className="text-right">₱{quotation?.partsTotal || 0}</td>
                  </tr>
                  <tr>
                    <td>Labor Cost:</td>
                    <td className="text-right">₱{quotation?.laborCost || 0}</td>
                  </tr>
                  <tr>
                    <td>Subtotal:</td>
                    <td className="text-right">₱{quotation?.subtotal || 0}</td>
                  </tr>
                  <tr>
                    <td>Discount ({quotation?.discount || 0}%):</td>
                    <td className="text-right text-red-500">
                      -₱{quotation?.discountValue || 0}
                    </td>
                  </tr>
                  <tr>
                    <td>Tax (10%):</td>
                    <td className="text-right">₱{quotation?.tax || 0}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-base">Total:</td>
                    <td className="text-right font-bold text-lg">
                      ₱{quotation?.total || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 text-xs mt-10 border-t pt-3">
            <p>Thank you for choosing Car Aircon Services!</p>
            <p>This is a system-generated quotation. No signature required.</p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 border-t p-4 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
