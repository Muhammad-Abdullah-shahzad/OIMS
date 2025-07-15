// model/employeeModel.js
const database = require("../Database/database");

// Add a new employee
exports.addEmployeeModel = async (
  employee_id,
  firstName,
  lastName,
  email,
  phoneNumber,
  designation,
  cnic,
  address,
  salary,
  bank_account,
  hire_date
) => {
  const pool = database.pool;
  const query = `
    INSERT INTO employees (employee_id,firstName, lastName, email, phoneNumber, designation,cnic,address,salary,bank_account,hire_date)
    VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ? ,?)
  `;
  const values = [
    employee_id,
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
  ];
  await pool.query(query, values);
};

// Delete employee by ID
exports.deleteEmployeeModel = async (id, employee_id) => {
  const pool = await database.pool;
  await pool.query("DELETE FROM employees WHERE id = ? and employee_id = ? ", [
    id,
    employee_id,
  ]);
};

// Update employee
exports.updateEmployeeModel = async (id, updatedFields) => {
  const pool = await database.pool;

  // Validate input
  if (!id) throw new Error("Employee ID is required for update.");
  if (!updatedFields || typeof updatedFields !== 'object' || Object.keys(updatedFields).length === 0) {
    throw new Error("No fields provided for update.");
  }

  // Sanitize salary field if present and convert it *in-place*
  if ('salary' in updatedFields) {
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
  const setClause = keys.map(key => `${key} = ?`).join(', ');

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
    "SELECT id,firstName,lastName,employee_id,designation,cnic,address,salary,phoneNumber,hire_date,bank_account,email FROM employees"
  );
  return rows;
};
