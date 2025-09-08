const database = require("../Database/database");

exports.findUserByEmail = async (email) => {
  const pool = await database.pool;
  const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return result;
};

exports.createUser = async (email, hashedPassword, firstName, lastName , role="not_assigned" ) => {
  const pool = await database.pool;
  await pool.query(
    "INSERT INTO users (email, password_hash, firstName , lastName,role) VALUES (?, ?, ?,?,?)",
    [email, hashedPassword, firstName, lastName ,role]
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

exports.getUserIdByRoleModel = async (role) => {
  const pool = await database.pool;
  const [rows] =  await pool.query(
      `
    select id from users where role = ?
      `
      , [role]
    );

    console.log(rows);
    return rows[0].id;
}  

exports.updateUserPassword= async (userId,newPasswordHash)=>{
  const pool = await database.pool;
  const [rows] =  await pool.query(
      `update  users set password_hash = ? where id = ?
      `
      ,[newPasswordHash,userId]
    );

    console.log(rows);
    return rows;
}

