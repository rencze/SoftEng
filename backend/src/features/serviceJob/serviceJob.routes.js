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
  fetchServiceJobsByTechnician,
  searchServiceJobsController,
  fetchServiceJobSummary,

} = require("./serviceJob.controller");

// ===============================
// 🔹 SERVICE JOB MAIN ROUTES
// ===============================
router.get("/", fetchServiceJobs);                    // Get all service jobs
router.get("/search", searchServiceJobsController);   // Search service jobs
router.get("/summary", fetchServiceJobSummary);       // Get service job summary
router.post("/", createServiceJobController);         // Create new service job

// ===============================
// 🔹 SERVICE JOB FILTER ROUTES
// ===============================
router.get("/status/:status", fetchServiceJobsByStatus);              // Get jobs by status
router.get("/technician/:technicianId", fetchServiceJobsByTechnician); // Get jobs by technician

// ===============================
// 🔹 SINGLE SERVICE JOB ROUTES
// ===============================
router.get("/:id", fetchServiceJob);                      // Get single service job
router.put("/:id", updateServiceJobController);           // Update service job
router.delete("/:id", deleteServiceJobController);        // Delete service job
router.patch("/:id/status", updateServiceJobStatusController); // Update job status

// ===============================
// 🔹 TECHNICIAN ASSIGNMENT ROUTES
// ===============================
router.get("/:id/technicians", fetchServiceJobTechnicians);    // Get job technicians
router.post("/:id/technicians", assignTechnicianController);   // Assign technician
router.delete("/:id/technicians", removeTechnicianController); // Remove technician

// ===============================
// 🔹 WORK LOG ROUTES
// ===============================
router.get("/:id/worklogs", fetchServiceJobWorkLogs);          // Get job work logs
router.post("/:id/worklogs", addWorkLogController);            // Add work log
router.put("/worklogs/:workLogId", updateWorkLogController);   // Update work log
router.delete("/worklogs/:workLogId", deleteWorkLogController); // Delete work log




module.exports = router;