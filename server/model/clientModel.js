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
  
// Update client
exports.updateClientModel = async (id, updateData) => {
    const fields = [];
    const values = [];
  
    for (const key in updateData) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
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







