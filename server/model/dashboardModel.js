const db = require("../Database/database").pool;



// 1. Total Ongoing Projects
exports.getTotalProjectsModel = async () => {
  const [rows] = await db.execute(`
    SELECT COUNT(*) AS totalOngoingProjects 
    FROM projects 
    WHERE status = 'ongoing'
  `);
  return rows[0].totalOngoingProjects || 0;
};

// 2. Total Active Clients
exports.getTotalClientsModel = async () => {
  const [rows] = await db.execute(`
    SELECT COUNT(*) AS totalClients 
    FROM clients 
    WHERE is_active = TRUE
  `);
  return rows[0].totalClients || 0;
};

// 3. Total Active Employees
exports.getTotalEmployeesModel = async () => {
  const [rows] = await db.execute(`
    SELECT COUNT(*) AS totalEmployees 
    FROM employees 
    WHERE is_active = TRUE
  `);
  return rows[0].totalEmployees || 0;
};

// 4. Total Revenue (Paid Payments Only)
exports.getTotalRevenueModel = async () => {
  const [rows] = await db.execute(`
    SELECT SUM(amount) AS totalRevenue 
    FROM payments 
    WHERE payment_status = 'paid'
  `);
  return rows[0].totalRevenue || 0;
};

// 5. Total Expenses (General + Salary)
exports.getTotalExpenseModel = async () => {
  const [rows] = await db.execute(`
    SELECT 
      (SELECT IFNULL(SUM(amount), 0) FROM expenses) +
      (SELECT IFNULL(SUM(amount), 0) FROM salary_payments) AS totalExpense
  `);
  return rows[0].totalExpense || 0;
};

// Monthly Expense (current month)
exports.getMonthlyExpenseModel = async () => {
    const [rows] = await db.execute(`
      SELECT 
        month,
        year,
        SUM(total) AS monthlyExpense
      FROM (
        -- From expenses
        SELECT 
          MONTH(expense_date) AS month,
          YEAR(expense_date) AS year,
          SUM(amount) AS total
        FROM expenses
        GROUP BY YEAR(expense_date), MONTH(expense_date)
  
        UNION ALL
  
        -- From salary payments
        SELECT 
          salary_month AS month,
          salary_year AS year,
          SUM(amount) AS total
        FROM salary_payments
        GROUP BY salary_year, salary_month
      ) AS combined
      GROUP BY year, month
      ORDER BY year DESC, month DESC
    `);
  
    return rows;
  };
  
  
  // Yearly Expense (current year)
  exports.getYearlyExpenseModel = async () => {
    const [rows] = await db.execute(`
      SELECT 
        year,
        SUM(total) AS yearlyExpense
      FROM (
        -- Group from expenses
        SELECT 
          YEAR(expense_date) AS year,
          SUM(amount) AS total
        FROM expenses
        GROUP BY YEAR(expense_date)
  
        UNION ALL
  
        -- Group from salary payments
        SELECT 
          salary_year AS year,
          SUM(amount) AS total
        FROM salary_payments
        GROUP BY salary_year
      ) AS combined
      GROUP BY year
      ORDER BY year DESC
    `);
  
    return rows;
  };
  

