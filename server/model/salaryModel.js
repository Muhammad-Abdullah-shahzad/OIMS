const db = require("../Database/database");

// GET all salary payments with employee info
exports.getAllSalaries = async () => {
  const [rows] = await db.pool.execute(`
    SELECT 
      s.*, 
      CONCAT(e.firstName, ' ', e.lastName) AS employee_name, 
      e.designation,
      e.employee_id AS system_employee_id
    FROM salary_payments s
    JOIN employees e ON s.employee_id = e.id
    ORDER BY s.salary_year DESC, s.salary_month DESC
  `);
  return rows;
};
exports.getSalary = async (employeeId,month,year) => {

    const [rows] = await db.pool.execute(`
      SELECT 
        s.*, 
        CONCAT(e.firstName, ' ', e.lastName) AS employee_name,
        e.designation,
        e.employee_id AS system_employee_id,
        e.location,
        e.department,
        e.bank_name,
        e.alownces,
        e.resources,
        e.hire_date
      FROM salary_payments s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.employee_id = ? AND MONTH(s.payment_date) = ? AND YEAR(s.payment_date) = ? 
      ORDER BY s.salary_year DESC, s.salary_month DESC
      `, [employeeId,month,year]);

    return rows;

  };


  
  
// ADD a new salary record
exports.addSalary = async (data) => {
  const {
    employee_id,
    salary_month,
    salary_year,
    amount,
    payment_date,
    payment_method,
    reference_number,
    notes
  } = data;

  const [result] = await db.pool.execute(`
    INSERT INTO salary_payments (
      employee_id, salary_month, salary_year,
      amount, payment_date, payment_method,
      reference_number, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    employee_id,
    salary_month,
    salary_year,
    amount,
    payment_date,
    payment_method,
    reference_number,
    notes
  ]);

  return result;
};

// UPDATE salary record by ID with partial fields
exports.updateSalary = async (id, fields) => {
  if(fields.employee_name){
   delete fields.employee_name;
  }
  if(fields.designation){
   delete fields.designation;
  }

  
  if(fields.updated_at){
   delete fields.updated_at;
  }
  
  if(fields.created_at){
   delete fields.created_at;
  }
  
  if ("system_employee_id" in fields) {
    delete fields.system_employee_id;
  }

  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) {
    throw new Error("No fields provided");
  }

  const setClause = keys.map(key => `${key} = ?`).join(", ");

  const sql = `
    UPDATE salary_payments
    SET ${setClause}
    WHERE id = ?
  `;

  const [result] = await db.pool.execute(sql, [...values, id]);
  return result;
};

// DELETE salary record by ID
exports.deleteSalary = async (id) => {
  const [result] = await db.pool.execute(`
    DELETE FROM salary_payments WHERE id = ?
  `, [id]);
  return result;
};


exports.getEmployeeSalarySummary = async () => {
  const [rows] = await db.pool.query(`
    SELECT 
        e.firstName,
        e.lastName,
        e.designation,
        e.salary AS monthly_salary,
        COUNT(sp.id) AS months_paid,
        SUM(sp.amount) AS total_paid
    FROM employees e
    LEFT JOIN salary_payments sp ON e.id = sp.employee_id
    GROUP BY e.id, e.firstName, e.lastName, e.designation, e.salary
    ORDER BY e.salary DESC
  `);
  return rows;
};

// Get monthly salary disbursement
exports.getMonthlySalaryReport = async () => {
  const [rows] = await db.pool.query(`
    SELECT 
        salary_month,
        salary_year,
        SUM(amount) AS total_salaries
    FROM salary_payments 
    GROUP BY salary_month, salary_year
    ORDER BY salary_year DESC, salary_month DESC
  `);
  return rows;
};