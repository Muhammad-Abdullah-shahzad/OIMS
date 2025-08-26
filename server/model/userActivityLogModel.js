const db = require("../Database/database").pool;

async function userActivityLogger({
    userEmail,
    actionType,     // 'INSERT', 'UPDATE', 'DELETE'
    tableName,
    newData = null,
    actionDetails
  }) {
    await db.query(`
      INSERT INTO UserActivityLog (
        userEmail,
        actionType,
        tableName,
        actionDetails,
        newData
      ) VALUES (?, ?, ?, ?,?)
    `, [
      userEmail,
      actionType,
      tableName,
      actionDetails,
      newData ? JSON.stringify(newData) : null
    ]);
  }
  
  const getAllUserActivityLogs = async () => {
    const [rows] = await db.query("SELECT * FROM UserActivityLog ORDER BY timestamp DESC");
    return rows;
  };
  
  module.exports = {userActivityLogger , getAllUserActivityLogs};