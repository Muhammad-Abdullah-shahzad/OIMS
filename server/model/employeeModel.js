// model/employeeModel.js
const database = require("../Database/database");
// Add a new employee
exports.addEmployeeModel = async (
  firstName,
  lastName,
  email,
  phoneNumber,
  designation,
  cnic,
  address,
  salary,
  bank_account,
  hire_date,
  location,
  department,
  bank_name,
  alownces = {},
  resources = {}
) => {
  const pool = database.pool;
  const query = `
    INSERT INTO employees (
      firstName, lastName, email, phoneNumber, designation,
      cnic, address, salary, bank_account, hire_date,
      location, department, bank_name, alownces, resources
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    firstName,
    lastName,
    email,
    String(phoneNumber),
    designation,
    cnic,
    address,
    salary,
    bank_account,
    hire_date,
    location,
    department,
    bank_name,
    alownces,   // ensure JSON format
    resources   // ensure JSON format
  ];

  await pool.query(query, values);
};

// Delete employee by ID
exports.deleteEmployeeModel = async (id) => {
  const pool = await database.pool;
  await pool.query("DELETE FROM employees WHERE id = ?  ", [id]);
};

// Update employee
exports.updateEmployeeModel = async (id, updatedFields) => {
  const pool = await database.pool;

  // Validate input
  if (!id) throw new Error("Employee ID is required for update.");
  if (
    !updatedFields ||
    typeof updatedFields !== "object" ||
    Object.keys(updatedFields).length === 0
  ) {
    throw new Error("No fields provided for update.");
  }

  // Sanitize salary field if present and convert it *in-place*
  if ("salary" in updatedFields) {
    const parsedSalary = parseFloat(updatedFields.salary);
    if (isNaN(parsedSalary)) {
      // If the frontend sends an empty string or non-numeric,
      // it should ideally send 0 (as per the frontend code I provided).
      // If it still results in NaN here, it means a truly invalid string was sent.
      throw new Error("Invalid salary value. Must be a number.");
    }
    updatedFields.salary = parsedSalary; // Update the object property to be a number
  }

  // --- CRITICAL FIX: Extract keys and values *AFTER* processing updatedFields ---
  const keys = Object.keys(updatedFields);
  const values = Object.values(updatedFields);
  // --- END CRITICAL FIX ---

  // Build dynamic SET clause like: "firstName = ?, email = ?"
  const setClause = keys.map((key) => `${key} = ?`).join(", ");

  const query = `UPDATE employees SET ${setClause} WHERE id = ?`;
  values.push(id); // Add ID as last param

  try {
    await pool.query(query, values);
  } catch (dbError) {
    console.error("Database error during employee update:", dbError);
    throw new Error(`Failed to update employee: ${dbError.message}`);
  }
};

// Get all employees
exports.getAllEmployeesModel = async () => {
  const pool = await database.pool;
  const [rows] = await pool.query(
    `SELECT 
    e.id,firstName,e.lastName,e.designation,e.is_active,
    e.cnic,address,e.salary,e.phoneNumber,e.hire_date,e.bank_account,e.email,e.location,
    e.bank_name,e.department,e.resources,e.alownces , p.profile_image_url , p.profile_id
     FROM employees e LEFT JOIN employeeProfiles p on
     e.id = p.employee_id
     where is_active = 1
     `
  );
  return rows;
};

// 1. Total Active Employees
exports.getEmployeeCount = async () => {
  const db = database.pool;
  const [rows] = await db.query(
    "SELECT COUNT(*) AS totalEmployees FROM employees WHERE is_active = TRUE"
  );
  return rows[0].totalEmployees;
};

// 2. Employees by Designation
exports.getEmployeesByDesignation = async () => {
  const db = database.pool;
  const [rows] = await db.query(`
    SELECT designation, COUNT(*) AS count
    FROM employees
    WHERE is_active = TRUE
    GROUP BY designation
  `);
  return rows;
};

// 3. Active vs Inactive Employees
exports.getActiveInactiveCount = async () => {
  const db = database.pool;
  const [rows] = await db.query(`
    SELECT 
      is_active,
      COUNT(*) AS count
    FROM employees
    GROUP BY is_active
  `);
  return {
    active: rows.find((r) => r.is_active === 1)?.count || 0,
    inactive: rows.find((r) => r.is_active === 0)?.count || 0,
  };
};

// 4. Monthly Hired Employees (Last 6 Months)
exports.getMonthlyHiredEmployees = async () => {
  const db = database.pool;
  const [rows] = await db.query(`
    SELECT 
      DATE_FORMAT(hire_date, '%Y-%m') AS month,
      COUNT(*) AS hired_count
    FROM employees
    GROUP BY DATE_FORMAT(hire_date, '%Y-%m')
    ORDER BY DATE_FORMAT(hire_date, '%Y-%m') DESC
  `);
  return rows;
};

// 5. Salary Summary
exports.getSalarySummary = async () => {
  const db = database.pool;
  const [rows] = await db.query(`
    SELECT 
      MIN(salary) AS minSalary,
      MAX(salary) AS maxSalary,
      AVG(salary) AS avgSalary
    FROM employees
    WHERE is_active = TRUE
  `);
  return rows[0];
};

// 6. Recent Hires (Latest 5 Employees)
exports.getRecentHires = async () => {
  const db = database.pool;
  const [rows] = await db.query(`
    SELECT 
      employee_id,
      firstName,
      lastName,
      designation,
      hire_date
    FROM employees
    WHERE is_active = TRUE
    ORDER BY hire_date DESC
    LIMIT 5
  `);
  return rows;
};

// Add a new designation
exports.addDesignationModel = async (title, description) => {
  const pool = database.pool;
  const query = `INSERT INTO designations (title, description) VALUES (?, ?)`;
  const values = [title, description];
  await pool.query(query, values);
};

// Get all designations
exports.getAllDesignationsModel = async () => {
  const pool = database.pool;
  const [rows] = await pool.query(
    "SELECT id, title, description, created_at FROM designations"
  );
  return rows;
};

// Delete designation by ID
exports.deleteDesignationModel = async (id) => {
  const pool = database.pool;
  const [result] = await pool.query("DELETE FROM designations WHERE id = ?", [
    id,
  ]);
  return result.affectedRows;
};

// Check if title exists
exports.designationExists = async (title) => {
  const pool = database.pool;
  const [rows] = await pool.query(
    "SELECT id FROM designations WHERE title = ?",
    [title]
  );
  return rows.length > 0;
};
