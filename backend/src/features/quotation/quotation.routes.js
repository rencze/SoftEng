const express = require("express");
const router = express.Router();

const {
  fetchQuotations,
  fetchQuotation,
  createQuotationController,
  updateQuotationController,
  deleteQuotationController,
  approveQuotationController,
  rejectQuotationController,
  addServiceController,
  fetchQuotationServices,
  removeServiceController,
  addPackageController,
  fetchQuotationPackages,
  removePackageController,
  fetchCustomerQuotations,
  fetchTechnicianQuotations,
} = require("./quotation.controller");

// 🔹 Static routes first
router.get("/", fetchQuotations);
router.post("/", createQuotationController);
router.get("/customer/:customerId", fetchCustomerQuotations);
router.get("/technician/:technicianId", fetchTechnicianQuotations);

// 🔹 Quotation management routes
router.get("/:id", fetchQuotation);
router.put("/:id", updateQuotationController);
router.delete("/:id", deleteQuotationController);
router.patch("/:id/approve", approveQuotationController);
router.patch("/:id/reject", rejectQuotationController);

// 🔹 Quotation services routes
router.get("/:id/services", fetchQuotationServices);
router.post("/:id/services", addServiceController);
router.delete("/:id/services", removeServiceController);

// 🔹 Quotation packages routes
router.get("/:id/packages", fetchQuotationPackages);
router.post("/:id/packages", addPackageController);
router.delete("/:id/packages", removePackageController);

module.exports = router;