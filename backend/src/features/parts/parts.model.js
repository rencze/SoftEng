const db = require("../../config/db");

// Get all parts with inventory quantity
async function getAllParts() {
  const [rows] = await db.query(`
    SELECT p.partId, p.partName, p.partDescription, p.unitPrice, IFNULL(i.quantity, 0) AS quantity
    FROM parts p
    LEFT JOIN inventory i ON p.partId = i.partId
  `);
  return rows;
}

// Get single part by ID
async function getPartById(id) {
  const [rows] = await db.query(`
    SELECT p.partId, p.partName, p.partDescription, p.unitPrice, IFNULL(i.quantity, 0) AS quantity
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

  return getPartById(partId);
}

// Update part
async function updatePart(id, { partName, partDescription, unitPrice, quantity }) {
  await db.query(
    "UPDATE parts SET partName = ?, partDescription = ?, unitPrice = ? WHERE partId = ?",
    [partName, partDescription || null, unitPrice, id]
  );

  if (quantity !== undefined) {
    await db.query(
      "UPDATE inventory SET quantity = ? WHERE partId = ?",
      [quantity, id]
    );
  }

  return getPartById(id);
}

// Delete part
async function deletePart(id) {
  await db.query("DELETE FROM parts WHERE partId = ?", [id]);
  return { message: "Part deleted successfully" };
}

module.exports = {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  deletePart,
};
