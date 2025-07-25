const salaryModel = require("../model/salaryModel");
const expenseModel = require("../model/expenseModel");
const paymentModel = require("../model/paymentModel");

exports.getFinancedashboardData = async (req, res) => {
  const FinanceDashboard = {};

  try {
    // Salary Data
    const allSalaries = await salaryModel.getAllSalaries();
    const salarySummary = await salaryModel.getEmployeeSalarySummary();
    const monthlySalaries = await salaryModel.getMonthlySalaryReport();

    // Expense Data
    const allExpenses = await expenseModel.getAllExpenses();
    const monthlyExpenses = await expenseModel.getMonthlyExpenses();
    const yearlyExpenses = await expenseModel.getYearlyExpenses();
    const expenseByCategory = await expenseModel.getExpenseCategorySummary();

    // Payment Data
    const allPayments = await paymentModel.getAllPaymentsModel();
    const monthlyIncome = await paymentModel.getMonthlyIncome();
    const projectPaymentSummary = await paymentModel.getProjectPaymentSummary();
    const pendingPayments = await paymentModel.getPendingPayments();
    const topPayingClients = await paymentModel.getTopPayingClients();

    // Build the FinanceDashboard Object
    FinanceDashboard.salary = {
      allSalaries,
      salarySummary,
      monthlySalaries,
    };

    FinanceDashboard.expense = {
      allExpenses,
      monthlyExpenses,
      yearlyExpenses,
      expenseByCategory,
    };

    FinanceDashboard.payment = {
      allPayments,
      monthlyIncome,
      projectPaymentSummary,
      pendingPayments,
      topPayingClients,
    };

    return res.status(200).json({
      message: "Finance dashboard data fetched successfully",
      data: FinanceDashboard,
    });

  } catch (error) {
    console.error("Error fetching finance dashboard data:", error);
    return res.status(500).json({
      message: "Internal server error while fetching finance dashboard data",
      error: error.message,
    });
  }
};
