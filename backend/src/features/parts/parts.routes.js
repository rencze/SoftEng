const express = require("express");
const router = express.Router();

const {
  fetchParts,
  fetchPart,
  createPartController,
  updatePartController,
  deletePartController,
  fetchPartHistory,
  fetchAllHistory,
    stockInPartController, // Add this
  bulkStockInController, // Add this
} = require("./parts.controller");

// ✅ Stock-in routes (add these BEFORE the dynamic routes)
router.post("/:id/stock-in", stockInPartController);
router.post("/bulk/stock-in", bulkStockInController);

router.get("/history/all", fetchAllHistory);   // ✅ static first
router.get("/:id/history", fetchPartHistory);  // ✅ also static before :id
router.get("/", fetchParts);

router.post("/", createPartController);
router.put("/:id", updatePartController);
router.delete("/:id", deletePartController);
router.get("/:id", fetchPart);                 // ✅ dynamic last

module.exports = router;
