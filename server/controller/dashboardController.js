const dashboardModel = require("../model/dashboardModel");

exports.getDashboardStatsController = async (req, res) => {
  try {
    const dashboardStatistics = {}
  // if any trannsaction fails we will give error to ensure atomicity

    dashboardStatistics.totalOngoingProjects = await dashboardModel.getTotalProjectsModel();
    dashboardStatistics.totalClients = await dashboardModel.getTotalClientsModel();
    dashboardStatistics.totalEmployees = await dashboardModel.getTotalEmployeesModel();
    dashboardStatistics.totalRevenue = await dashboardModel.getTotalRevenueModel();
    dashboardStatistics.totalExpense = await dashboardModel.getTotalExpenseModel();
    dashboardStatistics.profit = dashboardStatistics.totalRevenue - dashboardStatistics.totalExpense;
    dashboardStatistics.monthlyExpense =  await dashboardModel.getMonthlyExpenseModel();
    dashboardStatistics.yearlyExpense = await dashboardModel.getYearlyExpenseModel();

    res.status(200).json(dashboardStatistics);

  } catch (error) {
     res.status(400).json({
        message : "failed to get dashboard statistics"
     })
  }
};
