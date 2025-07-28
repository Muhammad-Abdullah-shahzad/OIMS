const dashboardModel = require("../model/adminModel")
exports.getDashboardData = async (req, res) => {
    try {
      const [
        stats,
        monthlyIncome,
        monthlyExpenses,
        salaryDisbursement,
        projectStatusSummary,
        expenseCategorySummary,
        topClients,
        monthlyProfit
      ] = await Promise.all([
        dashboardModel.getOverallStats(),
        dashboardModel.getMonthlyIncome(),
        dashboardModel.getMonthlyExpenses(),
        dashboardModel.getSalaryDisbursement(),
        dashboardModel.getProjectStatusSummary(),
        dashboardModel.getExpenseCategorySummary(),
        dashboardModel.getTopPayingClients(),
        dashboardModel.getMonthlyProfit()
      ]);
  
      res.status(200).json({
        success: true,
        stats,
        monthlyIncome,              // line chart
        monthlyExpenses,            // area chart
        salaryDisbursement,         // bar chart
        projectStatusSummary,       // pie chart
        expenseCategorySummary,     // pie or donut
        topClients,                 // leaderboard
        monthlyProfit               // 📈 profit line chart
      });
    } catch (err) {
      console.error("Dashboard Error:", err);
      res.status(500).json({ success: false, message: "Failed to load dashboard data" });
    }
  };
  