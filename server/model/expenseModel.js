const db = require("../Database/database").pool; // Make sure this is your mysql2 pool or connection

// 1. Get all expenses
exports.getAllExpenses = async () => {
  const [rows] = await db.execute(
    `SELECT expenses.* , users.firstName,users.lastName,users.role FROM expenses INNER JOIN users
    on expenses.approved_by = users.id
    ORDER BY expenses.expense_date DESC`
  );
  return rows;
};

// 2. Add new expense
exports.addExpense = async (expenseData) => {
  const {
    category,
    description,
    amount,
    expense_date,
    payment_method,
    approved_by,
    receipt_file,
  } = expenseData;

  const [result] = await db.execute(
    `INSERT INTO expenses 
     (category, description, amount, expense_date, payment_method, approved_by, receipt_file) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      category,
      description,
      amount,
      expense_date,
      payment_method,
      approved_by || null,
      receipt_file || null,
    ]
  );

  return result.insertId;
};

// 3. Update existing expense
exports.updateExpense = async (id, data) => {
  if(data.created_at){
    delete data.created_at;
  }

  if(data.updated_at){
    delete data.updated_at;
  }
  
  if (!id || Object.keys(data).length === 0) return false;

 // Prepare query fragments
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data))  {

    fields.push(`${key} = ?`);
    values.push(value);

  }

  // Final query
  const sql = `UPDATE expenses SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id); // append ID at the end

  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

// 4. Delete expense
exports.deleteExpense = async (id) => {
  const [result] = await db.execute("DELETE FROM expenses WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

// 5. Get  expense report based on month year and starting ending date
exports.getMonthlyExpenseReport = async (startDate = "", endDate = "", condition = "") => {
  let query = `
    SELECT 
      YEAR(expense_date) AS expense_year,
      MONTH(expense_date) AS expense_month,
      SUM(amount) AS total_expense_amount
    FROM expenses
  `;
  
  const queryParams = [];

  // Add WHERE clause conditionally
  if (startDate && endDate) {
    query += ` WHERE expense_date BETWEEN ? AND ? `;
    queryParams.push(startDate, endDate);
  } else if (condition) {
    query += ` ${condition} `;
  }

  query += `
    GROUP BY YEAR(expense_date), MONTH(expense_date)
    ORDER BY YEAR(expense_date) DESC, MONTH(expense_date) DESC
  `;

  const [rows] = await db.execute(query, queryParams);
  return rows;
};
