const salaryModel = require("../model/salaryModel");
const convertSalaryJsonToPdf = require("../utility/salarySlipGenerator");
const {userActivityLogger} = require("../model/userActivityLogModel");

// GET all salary payments
exports.getAllSalaryController = async (req, res) => {
  try {
    const salaries = await salaryModel.getAllSalaries();
    res.status(200).json({ success: true, data: salaries });
  } catch (err) {
    console.error("Error fetching salaries:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get specific employee salary
exports.getEmployeeSalaryController = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const salary = await salaryModel.getSalary(employeeId);
    res.status(200).json({ success: true, data: salary });
  } catch (err) {
    console.error("Error fetching employee salary:", err);
    res.status(400).json({
      success: false,
      message: "Failed to get employee salary"
    });
  }
};

// ADD new salary record
exports.addSalaryController = async (req, res) => {
  try {
    const {
      employee_id,
      salary_month,
      salary_year,
      amount,
      payment_date,
      payment_method,
      reference_number,
      notes
    } = req.body;

    if (
      !employee_id ||
      !salary_month ||
      !salary_year ||
      !amount ||
      !payment_date ||
      !payment_method
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const result = await salaryModel.addSalary({
      employee_id,
      salary_month,
      salary_year,
      amount,
      payment_date,
      payment_method,
      reference_number,
      notes,
    });

    // Log user activity
    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "INSERT",
      tableName: "salaries",
      newData: req.body,
      actionDetails: `${req.user.email} added salary for employee ID ${employee_id} (${salary_month}-${salary_year})`
    });

    res.status(201).json({ success: true, message: "Salary record added", id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ success: false, message: "Salary for this month already exists" });
    } else {
      console.error("Error adding salary:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
};

// UPDATE salary record
exports.updateSalaryController = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const fieldsToUpdate = req.body;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ success: false, message: "No fields provided for update" });
    }

    const result = await salaryModel.updateSalary(paymentId, fieldsToUpdate);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }

    // Log user activity
    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "UPDATE",
      tableName: "salaries",
      newData: fieldsToUpdate,
      actionDetails: `${req.user.email} updated salary record ID ${paymentId}`
    });

    res.status(200).json({ success: true, message: "Salary record updated" });
  } catch (err) {
    console.error("Error updating salary:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// DELETE salary record
exports.deleteSalaryrecordController = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const result = await salaryModel.deleteSalary(paymentId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }

    // Log user activity
    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "DELETE",
      tableName: "salaries",
      newData: {},
      actionDetails: `${req.user.email} deleted salary record ID ${paymentId}`
    });

    res.status(200).json({ success: true, message: "Salary record deleted" });
  } catch (err) {
    console.error("Error deleting salary:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Generate salary slip (PDF)
exports.generateReportController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.body;

    const [employeeSalaryData] = await salaryModel.getSalary(employeeId, month, year);

    if (!employeeSalaryData || Object.keys(employeeSalaryData).length === 0) {
      return res.status(404).json({ message: "No salary data found" });
    }

    const dummyPayslipData = {
      companyName: "Oradigitals Consultants",
      slipTitle: `Pay Slip, ${new Date(employeeSalaryData.payment_date).toLocaleDateString()}`,
      employeeDetails: [
        { label: "EMPLOYEE ID", value: 'ORA-0' + employeeSalaryData.employee_id },
        { label: "NAME", value: employeeSalaryData.employee_name },
        { label: "DESIGNATION", value: employeeSalaryData.designation },
        { label: "LOCATION", value: employeeSalaryData.location },
        { label: "DEPARTMENT", value: employeeSalaryData.department },
      ],
      jobDetails: [
        { label: "DAYS WORKED", value: "30.00" },
        { label: "DOJ", value: new Date(employeeSalaryData.hire_date).toLocaleDateString() },
        { label: "PAY THROUGH", value: employeeSalaryData.payment_method.split("_").join(" ") },
        { label: "BANK NAME", value: employeeSalaryData.bank_name },
      ],
      earnings: [
        { description: "Basic Salary", current: "150,000.00", ytd: "1,800,000.00" },
        { description: "Housing Allowance", current: "30,000.00", ytd: "360,000.00" },
        { description: "Transport Allowance", current: "15,000.00", ytd: "180,000.00" },
        { description: "Bonus", current: "10,000.00", ytd: "10,000.00" },
      ],
      deductions: [
        { description: "Income Tax", current: "25,000.00", ytd: "300,000.00" },
        { description: "Provident Fund", current: "8,000.00", ytd: "96,000.00" },
      ],
      grossEarnings: "205,000.00",
      totalDeductions: "33,000.00",
      netPay: "172,000.00",
      netPayWords: "Pakistan Rupee One Lakh Seventy-Two Thousand Only",
      notes: "This is a dummy salary slip for testing purposes. All figures are fictional and should not be used for any official documentation.\n\nThis is a computer generated document and does not require a signature."
    };

    const pdfBuffer = await convertSalaryJsonToPdf(dummyPayslipData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${employeeSalaryData.employee_name}-salary-slip-Oradigitals.pdf`
    );

    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error.message);
    res.status(500).json({ message: "Error generating salary slip" });
  }
};
