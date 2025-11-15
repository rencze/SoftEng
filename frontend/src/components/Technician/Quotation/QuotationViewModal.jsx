"use client";

import React, { useRef, useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

const API_BASE = "http://localhost:3001";

export default function QuotationViewModal({ isOpen, onClose, quotation }) {
  const [fullQuotation, setFullQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const pdfRef = useRef();

  // Fetch complete quotation data when modal opens
  useEffect(() => {
    if (isOpen && quotation) {
      fetchFullQuotation();
    }
  }, [isOpen, quotation]);

  const fetchFullQuotation = async () => {
    if (!quotation?.quotationId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/quotations/${quotation.quotationId}`);
      if (!response.ok) throw new Error("Failed to fetch quotation details");
      const data = await response.json();
      setFullQuotation(data);
    } catch (error) {
      console.error("Error fetching quotation details:", error);
      // Fallback to the basic quotation data
      setFullQuotation(quotation);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Use fullQuotation if available, otherwise fallback to basic quotation
  const displayQuotation = fullQuotation || quotation;

  // Calculate totals based on the actual quotation data structure
  const servicesSubtotal =
    displayQuotation?.services?.reduce((sum, service) => {
      const quantity = service.quantity || 1;
      return sum + (service.price || 0) * quantity;
    }, 0) || 0;

  const servicePackagesSubtotal =
    displayQuotation?.servicePackages?.reduce((sum, pkg) => {
      const quantity = pkg.quantity || 1;
      return sum + (pkg.price || 0) * quantity;
    }, 0) || 0;

  const customPartsSubtotal =
    displayQuotation?.customParts?.reduce((sum, part) => {
      const quantity = part.quantity || 1;
      const unitPrice = part.unitPrice || 0;
      return sum + quantity * unitPrice;
    }, 0) || 0;

  const laborCost = displayQuotation?.laborCost || 0;
  const discount = displayQuotation?.discount || 0;

  const subtotal =
    servicesSubtotal +
    servicePackagesSubtotal +
    customPartsSubtotal +
    laborCost;

  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const handlePrint = () => window.print();

  // Export to PDF function
  const handleExportPDF = () => {
    const element = pdfRef.current;

    const options = {
      margin: 0.5,
      filename: `quotation-${displayQuotation?.quotationId || "document"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  // Helper functions for customer data
  const getCustomerName = (quotation) => {
    return quotation?.guestName || quotation?.customerName || quotation?.displayName || 'Unknown Customer';
  };

  const getCustomerEmail = (quotation) => {
    return quotation?.guestEmail || quotation?.email || quotation?.displayEmail || 'N/A';
  };

  const getCustomerPhone = (quotation) => {
    return quotation?.guestContact || quotation?.phone || quotation?.displayContact || 'N/A';
  };

  const getCustomerAddress = (quotation) => {
    return quotation?.address || 'No address provided';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading quotation details...</p>
        </div>
      </div>
    );
  }

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
        <div ref={pdfRef} className="p-6 print:p-4 text-sm text-gray-800">

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
              <p>Date: {new Date(displayQuotation?.createdAt || Date.now()).toLocaleDateString()}</p>
              <p>Validity: {displayQuotation?.validity || "30"} Days</p>
              <p>Status: {displayQuotation?.status || "Unknown"}</p>
              {displayQuotation?.bookingId && (
                <p className="font-semibold text-blue-600">Reference: BK-00{displayQuotation.bookingId}</p>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Customer Details</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-medium w-1/3">Name:</td>
                  <td>{getCustomerName(displayQuotation)}</td>
                </tr>
                <tr>
                  <td className="font-medium">Email:</td>
                  <td>{getCustomerEmail(displayQuotation)}</td>
                </tr>
                <tr>
                  <td className="font-medium">Phone:</td>
                  <td>{getCustomerPhone(displayQuotation)}</td>
                </tr>
                <tr>
                  <td className="font-medium">Address:</td>
                  <td>{getCustomerAddress(displayQuotation)}</td>
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
                  <th className="border px-2 py-1 text-right">Quantity</th>
                  <th className="border px-2 py-1 text-right">Price</th>
                  <th className="border px-2 py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {displayQuotation?.services?.length ? (
                  displayQuotation.services.map((service, index) => {
                    const total = (service.price || 0) * (service.quantity || 1);
                    return (
                      <tr key={index}>
                        <td className="border px-2 py-1">{service.serviceName || service.servicesName || 'Unknown Service'}</td>
                        <td className="border px-2 py-1">{service.serviceDescription || service.servicesDescription || 'No description'}</td>
                        <td className="border px-2 py-1 text-right">{service.quantity || 1}</td>
                        <td className="border px-2 py-1 text-right">₱{(service.price || 0).toFixed(2)}</td>
                        <td className="border px-2 py-1 text-right">₱{total.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-2">
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
                  <th className="border px-2 py-1 text-right">Quantity</th>
                  <th className="border px-2 py-1 text-right">Price</th>
                  <th className="border px-2 py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {displayQuotation?.servicePackages?.length ? (
                  displayQuotation.servicePackages.map((pkg, index) => {
                    const total = (pkg.price || 0) * (pkg.quantity || 1);
                    return (
                      <tr key={index}>
                        <td className="border px-2 py-1">{pkg.packageName || 'Unknown Package'}</td>
                        <td className="border px-2 py-1">{pkg.packageDescription || 'No description'}</td>
                        <td className="border px-2 py-1 text-right">{pkg.quantity || 1}</td>
                        <td className="border px-2 py-1 text-right">₱{(pkg.price || 0).toFixed(2)}</td>
                        <td className="border px-2 py-1 text-right">₱{total.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-2">
                      No service packages added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Custom Parts */}
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
                {displayQuotation?.customParts?.length ? (
                  displayQuotation.customParts.map((part, index) => {
                    const total = (part.quantity || 0) * (part.unitPrice || 0);
                    return (
                      <tr key={index}>
                        <td className="border px-2 py-1">{part.partName || 'Unknown Part'}</td>
                        <td className="border px-2 py-1">{part.partDescription || 'No description'}</td>
                        <td className="border px-2 py-1 text-right">₱₱{(Number(part.unitPrice) || 0).toFixed(2)}</td>
                        <td className="border px-2 py-1 text-right">{part.quantity || 1}</td>
                        <td className="border px-2 py-1 text-right">₱{total.toFixed(2)}</td>
                      </tr>
                    );
                  })
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
            <p className="italic text-gray-700">{displayQuotation?.notes || "N/A"}</p>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <table className="w-1/2 text-sm">
                <tbody>
                  <tr>
                    <td>Services:</td>
                    <td className="text-right">₱{servicesSubtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Service Packages:</td>
                    <td className="text-right">₱{servicePackagesSubtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Custom Parts:</td>
                    <td className="text-right">₱{customPartsSubtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Labor Cost:</td>
                    <td className="text-right">₱{laborCost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Subtotal:</td>
                    <td className="text-right">₱{subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Discount ({discount}%):</td>
                    <td className="text-right text-red-500">
                      -₱{discountAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-base">Total:</td>
                    <td className="text-right font-bold text-lg">
                      ₱{total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 text-xs mt-10 border-t pt-3">
            <p>Thank you for choosing Car Aircon Services!</p>
            <p>This document is a system-generated quotation and does not require a signature.</p>
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

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Export as PDF
          </button>
        </div>

      </div>
    </div>
  );
}