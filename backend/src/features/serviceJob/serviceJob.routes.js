const express = require("express");
const router = express.Router();

const {
  fetchServiceJobs,
  fetchServiceJob,
  createServiceJobController,
  updateServiceJobController,
  deleteServiceJobController,
  updateServiceJobStatusController,
  assignTechnicianController,
  removeTechnicianController,
  fetchServiceJobTechnicians,
  addWorkLogController,
  fetchServiceJobWorkLogs,
  updateWorkLogController,
  deleteWorkLogController,
  fetchServiceJobsByStatus,
  fetchServiceJobsByTechnician
} = require("./serviceJob.controller");

// 🔹 Main service job routes
router.get("/", fetchServiceJobs);
router.post("/", createServiceJobController);
router.get("/status/:status", fetchServiceJobsByStatus);
router.get("/technician/:technicianId", fetchServiceJobsByTechnician);

// 🔹 Single service job routes
router.get("/:id", fetchServiceJob);
router.put("/:id", updateServiceJobController);
router.delete("/:id", deleteServiceJobController);
router.patch("/:id/status", updateServiceJobStatusController);

// 🔹 Technician assignment routes
router.get("/:id/technicians", fetchServiceJobTechnicians);
router.post("/:id/technicians", assignTechnicianController);
router.delete("/:id/technicians", removeTechnicianController);

// 🔹 Work log routes
router.get("/:id/worklogs", fetchServiceJobWorkLogs);
router.post("/:id/worklogs", addWorkLogController);
router.put("/worklogs/:workLogId", updateWorkLogController);
router.delete("/worklogs/:workLogId", deleteWorkLogController);

module.exports = router;