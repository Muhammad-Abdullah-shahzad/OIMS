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
exports.getSalary = async (employeeId) => {
    const [rows] = await db.pool.execute(`
      SELECT 
        s.*, 
        CONCAT(e.firstName, ' ', e.lastName) AS employee_name,
        e.designation,
        e.employee_id AS system_employee_id
      FROM salary_payments s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.employee_id = ?
      ORDER BY s.salary_year DESC, s.salary_month DESC
    `, [employeeId]);
  
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
