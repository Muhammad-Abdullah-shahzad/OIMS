const paymentModel = require("../model/paymentModel");
const { convertPaymentJSONToPDF } = require("../utility/convertPaymentJSONToPDF");
const {userActivityLogger} = require("../model/userActivityLogModel");

// Get all payments
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

    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "INSERT",
      tableName: "payments",
      newData: paymentData,
      actionDetails: `${req.user.email} added a new payment (ID: ${inserted.insertId})`
    });

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

    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "UPDATE",
      tableName: "payments",
      newData: updates,
      actionDetails: `${req.user.email} updated payment with ID: ${paymentId}`
    });

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

    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "DELETE",
      tableName: "payments",
      newData: {},
      actionDetails: `${req.user.email} deleted payment with ID: ${paymentId}`
    });

    res.status(200).json({ message: "Payment deleted" });
  } catch (err) {
    console.error("Error in deletePaymentController:", err);
    res.status(500).json({ error: "Failed to delete payment" });
  }
};

// Generate payment slip PDF
exports.getPaymentSlipController = async (req, res) => {
  try {
    const clientId = req.body.client_id;
    const slip = await paymentModel.getPaymentSlipDataModel(clientId);

    const slipBuffer = await convertPaymentJSONToPDF(slip);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=monthly_expense_report.pdf");
    res.send(slipBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};
