  const db = require("../Database/database"); // your MySQL pool setup

  exports.getOverallStats = async () => {

  const pool = await db.pool;

  const [[clients]] = await pool.query(`SELECT COUNT(*) as total_clients FROM clients WHERE is_active = 1`);  
  const [[employees]] = await pool.query(`SELECT COUNT(*) as total_employees FROM employees WHERE is_active = 1`);
  const [[projects]] = await pool.query(`SELECT COUNT(*) as total_projects FROM projects`);
  const [[expenses]] = await pool.query(`SELECT IFNULL(SUM(amount), 0) as total_expense_amount FROM expenses`);
  const [[salaries]] = await pool.query(`SELECT IFNULL(SUM(amount), 0) as total_salary_paid FROM salary_payments`);
  const [[income]] = await pool.query(`SELECT IFNULL(SUM(paidAmount), 0) as total_income FROM payments WHERE payment_status = 'paid'`);
  const [[Expense_Row]] = await pool.query(`SELECT IFNULL(SUM(amount), 0) AS total
  FROM expenses
  WHERE MONTH(expense_date) = MONTH(CURRENT_DATE())
    AND YEAR(expense_date) = YEAR(CURRENT_DATE());`);
  const [[Payment_Row]] = await pool.query
    (`SELECT IFNULL(SUM(paidAmount), 0) AS total_payments
     FROM payments
     WHERE MONTH(payment_date) = MONTH(CURRENT_DATE())
     AND YEAR(payment_date) = YEAR(CURRENT_DATE());
  `);
  const [[Salary_Row]] = await pool.query(`
  select ifnull(sum(amount),0) as Total from salary_payments where salary_month = month(curdate()) and salary_year = year(curdate()) 
  `)

  return {
    total_clients: clients.total_clients,
    total_employees: employees.total_employees,
    total_projects: projects.total_projects,
    total_expense_amount: expenses.total_expense_amount,
    total_salary_paid: salaries.total_salary_paid,
    total_income: income.total_income,
    total_expense_curr_month:Expense_Row.total,
    total_payments_curr_month:Payment_Row.total_payments,
    total_salary_curr_month:Salary_Row.Total
  };

};

exports.getMonthlyIncome = async () => {
  const pool = await db.pool;
  const [rows] = await pool.query(`
    SELECT 
      MONTH(payment_date) AS month,
      YEAR(payment_date) AS year,
      SUM(paidAmount) AS income
    FROM payments
    WHERE payment_status = 'paid'
    GROUP BY year, month
    ORDER BY year DESC, month DESC
    LIMIT 12
  `);
  return rows;
};

exports.getMonthlyExpenses = async () => {
    const pool = await db.pool;
  
    const [rows] = await pool.query(`
      SELECT 
        combined.year,
        combined.month,
        SUM(combined.total_amount) AS expense
      FROM (
        -- From expenses table
        SELECT 
          YEAR(expense_date) AS year,
          MONTH(expense_date) AS month,
          amount AS total_amount
        FROM expenses
  
        UNION ALL
  
        -- From salary_payments table
        SELECT 
          salary_year AS year,
          salary_month AS month,
          amount AS total_amount
        FROM salary_payments
      ) AS combined
      GROUP BY combined.year, combined.month
      ORDER BY combined.year DESC, combined.month DESC
      LIMIT 12
    `);
  
    return rows;
  };


  exports.getMonthlyProfit = async () => {
    const pool = await db.pool;
  
    const [rows] = await pool.query(`
      SELECT 
        year,
        month,
        SUM(income) AS total_income,
        SUM(expense) AS total_expense,
        (SUM(income) - SUM(expense)) AS profit
      FROM (
        -- Income from payments
        SELECT 
          YEAR(payment_date) AS year,
          MONTH(payment_date) AS month,
          SUM(paidAmount) AS income,
          0 AS expense
        FROM payments
        WHERE payment_status = 'paid'
        GROUP BY year, month
  
        UNION ALL
  
        -- Operational expenses
        SELECT 
          YEAR(expense_date) AS year,
          MONTH(expense_date) AS month,
          0 AS income,
          SUM(amount) AS expense
        FROM expenses
        GROUP BY year, month
  
        UNION ALL
  
        -- Salaries
        SELECT 
          salary_year AS year,
          salary_month AS month,
          0 AS income,
          SUM(amount) AS expense
        FROM salary_payments
        GROUP BY salary_year, salary_month
      ) AS combined
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 12
    `);
  
    return rows.reverse(); // so frontend gets [oldest ➝ newest]
  };
  
  

exports.getSalaryDisbursement = async () => {
  const pool = await db.pool;
  const [rows] = await pool.query(`
    SELECT 
      salary_month AS month,
      salary_year AS year,
      SUM(amount) AS total_salaries
    FROM salary_payments 
    GROUP BY salary_year, salary_month
    ORDER BY salary_year DESC, salary_month DESC
    LIMIT 12
  `);
  return rows;
};

exports.getProjectStatusSummary = async () => {
  const pool = await db.pool;
  const [rows] = await pool.query(`
    SELECT 
      status,
      COUNT(*) AS project_count,
      SUM(budget) AS total_budget
    FROM projects
    GROUP BY status
  `);
  return rows;
};

exports.getExpenseCategorySummary = async () => {
  const pool = await db.pool;
  const [rows] = await pool.query(`
    SELECT 
      category,
      COUNT(*) AS expense_count,
      SUM(amount) AS total_amount
    FROM expenses
    GROUP BY category
    ORDER BY total_amount DESC
  `);
  return rows;
};

exports.getTopPayingClients = async () => {

  const pool = await db.pool;

  const [rows] = await pool.query(`

  SELECT 
      c.name AS client_name,
      c.company,
      SUM(p.paidAmount) AS total_paid
    FROM clients c
    JOIN payments p ON c.id = p.client_id
    WHERE p.payment_status = 'paid'
    GROUP BY c.id
    ORDER BY total_paid DESC
    LIMIT 5

    `);

  return rows;

};
