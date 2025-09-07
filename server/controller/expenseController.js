const expenseModel = require("../model/expenseModel");
const { generatePdfFromJson } = require("../utility/convertJSONtoPdf");
const {userActivityLogger} = require("../model/userActivityLogModel"); // 👈 Import logger

// 1. Get All Expenses
exports.getAllExpenseController = async (req, res) => {
  try {
    const expenses = await expenseModel.getAllExpenses();
    res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve expenses" });
  }
};

// 2. Add New Expense
exports.addNewExpensecontroller = async (req, res) => {
  try {
    const expenseData = req.body;
    const expenseId = await expenseModel.addExpense(expenseData);

    // Log INSERT action
    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "INSERT",
      tableName: "expenses",
      newData: expenseData,
      actionDetails: `${req.user.email} added a new expense (ID: ${expenseId})`
    });

    res.status(201).json({ success: true, message: "Expense added", expenseId });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ success: false, message: "Failed to add expense" });
  }
};

// 3. Update Expense
exports.updateExpenseController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updated = await expenseModel.updateExpense(id, updatedData);

    if (!updated) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    // Log UPDATE action
    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "UPDATE",
      tableName: "expenses",
      newData: updatedData,
      actionDetails: `${req.user.email} updated expense (ID: ${id})`
    });

    res.status(200).json({ success: true, message: "Expense updated" });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ success: false, message: "Failed to update expense" });
  }
};

// 4. Delete Expense
exports.deleteExpenseController = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await expenseModel.deleteExpense(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    // Log DELETE action
    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "DELETE",
      tableName: "expenses",
      newData: {},
      actionDetails: `${req.user.email} deleted expense (ID: ${id})`
    });

    res.status(200).json({ success: true, message: "Expense deleted" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ success: false, message: "Failed to delete expense" });
  }
};

// 5. Get Monthly Expense Report
exports.getExpenseReportController = async (req, res) => {
  try {
    let report = {};
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    if (!startDate || !endDate) {
      report = await expenseModel.getMonthlyExpenseReport();
    } else {
      report = await expenseModel.getMonthlyExpenseReport(startDate, endDate);
    }

    const pdfBuffer = await generatePdfFromJson(report, "Expense Report Slip", "OraDigital");

    // Log REPORT GENERATION action for future not now 
    // await userActivityLogger({
    //   userEmail: req.user.email,
    //   actionType: "REPORT",
    //   tableName: "expenses",
    //   newData: { startDate, endDate },
    //   actionDetails: `${req.user.email} generated a monthly expense report${startDate && endDate ? ` from ${startDate} to ${endDate}` : ""}`
    // });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=monthly_expense_report.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
};
