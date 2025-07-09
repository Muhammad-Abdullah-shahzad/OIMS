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



