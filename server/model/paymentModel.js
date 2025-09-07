const pool = require("../Database/database").pool; // Your MySQL pool connection

exports.getAllPaymentsModel = async () => {
  const [rows] = await pool.query(`
    SELECT p.*, pr.title AS project_title, c.name AS client_name
    FROM payments p
    JOIN projects pr ON p.project_id = pr.id
    JOIN clients c ON p.client_id = c.id
    ORDER BY p.payment_date DESC
  `);
  return rows;
};

exports.addPaymentModel = async (payment) => {
  const {
    project_id, client_id, paidAmount, payment_date, payment_method,
    payment_status, reference_number, invoice_file, notes,
  } = payment;

  const [result] = await pool.query(`
    INSERT INTO payments (
      project_id, client_id, paidAmount, payment_date, payment_method,
      payment_status, reference_number, invoice_file, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [project_id, client_id, paidAmount, payment_date, payment_method,
      payment_status, reference_number, invoice_file, notes]);

  return result.insertId;
};

exports.updatePaymentModel = async (id, updates) => {
    if(updates?.project_title){
      delete updates.project_title
    }
    if(updates?.client_name){
      delete updates.client_name;
    }
    if(updates?.updated_at){
      delete updates.updated_at;
    }
    if(updates?.created_at){
      delete updates.created_at;
    }

  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);

  const [result] = await pool.query(`UPDATE payments SET ${fields} WHERE id = ?`, [...values, id]);
  return result.affectedRows;
};

exports.deletePaymentModel = async (id) => {
  await pool.query("DELETE FROM payments WHERE id = ?", [id]);
};

exports.getPaymentSlipDataModel = async (id) => {
  let query = `
  SELECT 
  p.id AS project_id,
  p.title AS project_title,
  c.id AS client_id,
  c.name AS client_name,
  p.budget AS total_project_amount,
  IFNULL(SUM(py.paidAmount), 0) AS total_paid_amount,
  (p.budget - IFNULL(SUM(py.paidAmount), 0)) AS remaining_amount,
  CASE
      WHEN IFNULL(SUM(py.paidAmount), 0) = 0 THEN 'unpaid'
      WHEN IFNULL(SUM(py.paidAmount), 0) < p.budget THEN 'partial'
      WHEN IFNULL(SUM(py.paidAmount), 0) >= p.budget THEN 'paid'
  END AS payment_status
FROM projects p
JOIN clients c ON p.client_id = c.id
LEFT JOIN payments py ON p.id = py.project_id

`;

  const params = [];

  // If client_id is provided, filter the data
  if (id) {
    query += " WHERE c.id = ?";
    params.push(id);
  }

  query += `
    GROUP BY p.id, p.title, c.id, c.name, p.budget
    ORDER BY p.id DESC;
  `;

  const [rows] = await pool.execute(query, params);
  return rows;
};

exports.getMonthlyIncome = async () => {
  const [rows] = await pool.query(`
    SELECT 
        MONTH(payment_date) AS month,
        YEAR(payment_date) AS year,
        SUM(paidAmount) AS monthly_income
    FROM payments 
    WHERE payment_status = 'paid'
    GROUP BY MONTH(payment_date), YEAR(payment_date)
    ORDER BY year DESC, month DESC
  `);
  return rows;
};

// Get payment status summary by project
exports.getProjectPaymentSummary = async () => {
  const [rows] = await pool.query(`
    SELECT
        p.id AS project_id,
        p.title AS project_title,
        c.id AS client_id,
        c.name AS client_name,
        p.budget AS total_project_amount,
        IFNULL(SUM(py.paidAmount), 0) AS total_paid_amount,
        (p.budget - IFNULL(SUM(py.paidAmount), 0)) AS remaining_amount,
        CASE
            WHEN IFNULL(SUM(py.paidAmount), 0) = 0 THEN 'unpaid'
            WHEN IFNULL(SUM(py.paidAmount), 0) < p.budget THEN 'partial'
            WHEN IFNULL(SUM(py.paidAmount), 0) >= p.budget THEN 'paid'
        END AS payment_status
    FROM projects p
    JOIN clients c ON p.client_id = c.id
    LEFT JOIN payments py ON p.id = py.project_id
    GROUP BY p.id, p.title, c.id, c.name, p.budget
    ORDER BY p.id
  `);
  return rows;
};

// Get pending payments
exports.getPendingPayments = async () => {
  const [rows] = await pool.query(`
    SELECT 
        p.title AS project_title,
        c.name AS client_name,
        py.paidAmount,
        py.payment_date,
        py.payment_status
    FROM payments py
    JOIN projects p ON py.project_id = p.id
    JOIN clients c ON py.client_id = c.id
    WHERE py.payment_status IN ('unpaid', 'partial')
    ORDER BY py.payment_date DESC
  `);
  return rows;
};

// Get top paying clients
exports.getTopPayingClients = async () => {
  const [rows] = await pool.query(`
    SELECT 
        c.name AS client_name,
        c.company,
        SUM(p.paidAmount) AS total_paid
    FROM clients c
    JOIN payments p ON c.id = p.client_id
    WHERE p.payment_status = 'paid'
    GROUP BY c.id, c.name, c.company
    ORDER BY total_paid DESC
  `);
  return rows;
};




