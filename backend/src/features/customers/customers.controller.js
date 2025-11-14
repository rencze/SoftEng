const { getAllCustomers, addCustomer, removeCustomer } = require("./customers.model");

// Fetch all customers
async function fetchCustomers(_req, res) {
  try {
    const customers = await getAllCustomers();
    res.json(customers);
  } catch (err) {
    console.error("Fetch customers error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Add customer manually
async function addCustomerController(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const result = await addCustomer(userId);
    res.status(201).json({ message: "Customer added successfully", result });
  } catch (err) {
    console.error("Add customer error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Remove customer manually
async function removeCustomerController(req, res) {
  try {
    const { userId } = req.params;
    const result = await removeCustomer(userId);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer removed successfully" });
  } catch (err) {
    console.error("Remove customer error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { fetchCustomers, addCustomerController, removeCustomerController };
