const db = require("../Database/database").pool

exports.addNewClientModel = async (clientData) => {
    
    const {
      name, company, email, phone, whatsapp,
      address, city, country, contract_file = "not provided", is_active
    } = clientData;
  
    const sql = `
      INSERT INTO clients 
      (name, company, email, phone, whatsapp, address, city, country, contract_file, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      name, company, email, phone, whatsapp,
      address, city, country || "Pakistan", contract_file, is_active ?? true
    ];
  
    const [result] = await db.query(sql, values);
    return result.insertId;
  };
  
  function formatMySQLDate(date) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  }
  
// Update client
exports.updateClientModel = async (id, updateData) => {
  // Remove unwanted keys without overwriting the whole object
  if (updateData.created_at) {
    updateData.created_at = formatMySQLDate(updateData.created_at);
  }

  if (updateData.updated_at) {
    updateData.updated_at = formatMySQLDate(updateData.updated_at);
  }

  const fields = [];
  const values = [];

  for (const key in updateData) {
    fields.push(`${key} = ?`);
    values.push(updateData[key]);
  }

  // Safety check: ensure we have something to update
  if (fields.length === 0) {
    throw new Error("No valid fields provided for update");
  }

  values.push(id); // for WHERE clause

  const sql = `UPDATE clients SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await db.query(sql, values);
  return result;
};
  
// Delete client
exports.deleteClientModel = async (id) => {
    const sql = `DELETE FROM clients WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result;
  };


// Get all active clients
exports.getAllClients = async () => {
  const sql = `
    SELECT * FROM clients
    WHERE is_active = TRUE
    ORDER BY created_at DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
};







