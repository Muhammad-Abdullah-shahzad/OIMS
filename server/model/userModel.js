const database = require("../Database/database");

exports.findUserByEmail = async (email) => {
  const pool = await database.pool;
  const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return result[0];
};

exports.createUser = async (email, hashedPassword, firstName, lastName ) => {
  const pool = await database.pool;
  await pool.query(
    "INSERT INTO users (email, password_hash, firstName , lastName,role) VALUES (?, ?, ?,?,?)",
    [email, hashedPassword, firstName, lastName ,"not_assigned"]
  );
};

exports.getAllUsers = async () => {
    const pool = await database.pool;
    const [rows] = await pool.query(
      `SELECT id, firstName, lastName, email, role, is_active, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    return rows;
  };