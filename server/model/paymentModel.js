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
    project_id, client_id, amount, payment_date, payment_method,
    payment_status, reference_number, invoice_file, notes,
  } = payment;

  const [result] = await pool.query(`
    INSERT INTO payments (
      project_id, client_id, amount, payment_date, payment_method,
      payment_status, reference_number, invoice_file, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [project_id, client_id, amount, payment_date, payment_method,
      payment_status, reference_number, invoice_file, notes]);

  return result.insertId;
};

exports.updatePaymentModel = async (id, updates) => {
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






