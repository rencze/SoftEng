const db = require("../../config/db");

// ===============================
// 🔹 PARTS CRUD + INVENTORY LOGIC
// ===============================

// Get all parts with inventory quantity
async function getAllParts() {
  const [rows] = await db.query(`
    SELECT 
      p.partId, 
      p.partName, 
      p.partDescription, 
      p.unitPrice, 
      IFNULL(i.quantity, 0) AS quantity
    FROM parts p
    LEFT JOIN inventory i ON p.partId = i.partId
  `);
  return rows;
}

// Get single part by ID
async function getPartById(id) {
  const [rows] = await db.query(`
    SELECT 
      p.partId, 
      p.partName, 
      p.partDescription, 
      p.unitPrice, 
      IFNULL(i.quantity, 0) AS quantity
    FROM parts p
    LEFT JOIN inventory i ON p.partId = i.partId
    WHERE p.partId = ?
  `, [id]);
  return rows[0];
}

// Create new part
async function createPart({ partName, partDescription, unitPrice, quantity = 0 }) {
  const [result] = await db.query(
    "INSERT INTO parts (partName, partDescription, unitPrice) VALUES (?, ?, ?)",
    [partName, partDescription || null, unitPrice]
  );

  const partId = result.insertId;

  // Add inventory record
  await db.query(
    "INSERT INTO inventory (partId, quantity) VALUES (?, ?)",
    [partId, quantity]
  );

  // Log creation in history
  await createPartHistory({
    partId,
    referenceType: "Stock-in",
    referenceId: null,
    quantityChange: quantity,
    previousQuantity: 0,
    newQuantity: quantity,
    remarks: "Initial stock added",
    technicianId: null,
  });

  return getPartById(partId);
}

// Update part (with quantity tracking + history)
async function updatePart(id, { partName, partDescription, unitPrice, quantity, remarks = null, technicianId = null }) {
  const currentPart = await getPartById(id);

  // Update part info
  await db.query(
    "UPDATE parts SET partName = ?, partDescription = ?, unitPrice = ? WHERE partId = ?",
    [partName, partDescription || null, unitPrice, id]
  );

  let newQuantity = currentPart.quantity;
  let quantityChange = 0;

  if (quantity !== undefined && quantity !== currentPart.quantity) {
    quantityChange = quantity - currentPart.quantity;

    await db.query(
      "UPDATE inventory SET quantity = ? WHERE partId = ?",
      [quantity, id]
    );

    await createPartHistory({
      partId: id,
      referenceType: "Manual Adjustment",
      referenceId: null,
      quantityChange,
      previousQuantity: currentPart.quantity,
      newQuantity: quantity,
      remarks,
      technicianId: technicianId || null, // ✅ fallback
    });

    newQuantity = quantity;
  }

  return getPartById(id);
}

// Delete part
async function deletePart(id) {
  await db.query("DELETE FROM inventory WHERE partId = ?", [id]);
  await db.query("DELETE FROM parts WHERE partId = ?", [id]);
  return { message: "Part deleted successfully" };
}


// Stock-in function (dedicated for stock-in operations)
async function stockInPart(id, { quantityToAdd, remarks = null, technicianId = null }) {
  const currentPart = await getPartById(id);

  if (!currentPart) {
    throw new Error("Part not found");
  }

  const quantityChange = quantityToAdd;
  const newQuantity = currentPart.quantity + quantityToAdd;

  // Update inventory quantity
  await db.query(
    "UPDATE inventory SET quantity = ? WHERE partId = ?",
    [newQuantity, id]
  );

  // Log stock-in in history
  await createPartHistory({
    partId: id,
    referenceType: "Stock-in",
    referenceId: null,
    quantityChange,
    previousQuantity: currentPart.quantity,
    newQuantity: newQuantity,
    remarks: remarks || `Stock-in of ${quantityToAdd} units`,
    technicianId: technicianId || null, // ✅ safe fallback
  });

  return getPartById(id);
}

// ===============================
// 🔹 PARTS HISTORY (IN SAME FILE)
// ===============================

// Create history log
async function createPartHistory({
  partId,
  referenceType,
  referenceId = null,
  quantityChange,
  previousQuantity,
  newQuantity,
  remarks = null,
  technicianId = null,
}) {
  await db.query(
    `
    INSERT INTO partsHistory 
      (partId, referenceType, referenceId, quantityChange, previousQuantity, newQuantity, remarks, technicianId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [partId, referenceType, referenceId, quantityChange, previousQuantity, newQuantity, remarks, technicianId]
  );
}

// Get all history (admin view)
async function getAllPartsHistory() {
const [rows] = await db.query(`
  SELECT 
    ph.partHistoryId,
    ph.partId,
    p.partName,
    ph.referenceType,
    ph.referenceId,
    ph.quantityChange,
    ph.previousQuantity,
    ph.newQuantity,
    ph.remarks,
    ph.technicianId,
    CONCAT(u.firstName, ' ', u.lastName) AS technicianName,
    ph.createdAt
  FROM partsHistory ph
  LEFT JOIN parts p ON ph.partId = p.partId
  LEFT JOIN users u ON ph.technicianId = u.userId AND u.roleId = 3
  ORDER BY ph.createdAt DESC
`);
  return rows;
}

// Get history by partId
// Get history by partId
async function getPartHistoryByPartId(partId) {
  const [rows] = await db.query(`
    SELECT 
      ph.partHistoryId,
      ph.partId,
      p.partName,
      ph.referenceType,
      ph.referenceId,
      ph.quantityChange,
      ph.previousQuantity,
      ph.newQuantity,
      ph.remarks,
      ph.technicianId,
      CONCAT(u.firstName, ' ', u.lastName) AS technicianName,
      ph.createdAt
    FROM partsHistory ph
    LEFT JOIN parts p ON ph.partId = p.partId
    LEFT JOIN users u ON ph.technicianId = u.userId AND u.roleId = 3
    WHERE ph.partId = ?
    ORDER BY ph.createdAt DESC
  `, [partId]);
  return rows;
}



// ===============================
// 🔹 EXPORTS
// ===============================
module.exports = {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  deletePart,
  createPartHistory,
  getAllPartsHistory,
  getPartHistoryByPartId,
  stockInPart,
};
