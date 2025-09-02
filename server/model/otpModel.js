const db = require("../Database/database").pool;

// Invalidate old OTPs for user
async function invalidateOtps(userId) {
  await db.query("UPDATE OTP SET isUsed = 1 WHERE user_id = ? AND isUsed = 0", [userId]);
}

// Insert new OTP
async function insertOtp(userId, otp) {
  await db.query(
    "INSERT INTO OTP (user_id, otp, expiresAt) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))",
    [userId, otp]
  );
}

// Verify OTP
async function verifyOtp(userId, otp) {
  const [rows] = await db.query(
    "SELECT * FROM OTP WHERE user_id = ? AND otp = ? AND isUsed = 0 AND expiresAt > NOW()",
    [userId, otp]
  );
  return rows[0];
}

// Mark OTP as used
async function markOtpUsed(tokenId) {
  await db.query("UPDATE OTP SET isUsed = 1 WHERE token_id = ?", [tokenId]);
}

module.exports = { invalidateOtps, insertOtp, verifyOtp, markOtpUsed };
