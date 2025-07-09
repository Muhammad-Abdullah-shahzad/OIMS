const paymentModel = require("../model/paymentModel");

// Get all payments with project and client info
exports.getAllPaymentController = async (req, res) => {
  try {
    const result = await paymentModel.getAllPaymentsModel();
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllPaymentController:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

// Add new payment
exports.addNewPaymentController = async (req, res) => {
  try {
    const paymentData = req.body;
    const inserted = await paymentModel.addPaymentModel(paymentData);
    res.status(201).json({ message: "Payment added", inserted });
  } catch (err) {
    console.error("Error in addNewPaymentController:", err);
    res.status(500).json({ error: "Failed to add payment" });
  }
};

// Update a payment
exports.updatePaymentController = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const updates = req.body;
    const updated = await paymentModel.updatePaymentModel(paymentId, updates);
    res.status(200).json({ message: "Payment updated", updated });
  } catch (err) {
    console.error("Error in updatePaymentController:", err);
    res.status(500).json({ error: "Failed to update payment" });
  }
};

// Delete a payment
exports.deletePaymentController = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    await paymentModel.deletePaymentModel(paymentId);
    res.status(200).json({ message: "Payment deleted" });
  } catch (err) {
    console.error("Error in deletePaymentController:", err);
    res.status(500).json({ error: "Failed to delete payment" });
  }
};
