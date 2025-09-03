// controllers/otpController.js
const otpModel = require("../model/otpModel");
const { generateOtp } = require("../utility/otpGenerator");
const { sendMail } = require("../utility/mailer");

// Request OTP
exports.requestOtp = async (req, res) => {
  try {
    const { userId, email } = req.body;
    console.log("userId ",userId , "email ",email);
    if (!userId || !email) {
      return res.status(400).json({ message: "User ID and Email required" });
    }
  

    // Invalidate all old OTPs
    await otpModel.invalidateOtps(userId);

    // Generate new OTP
    const otp = generateOtp(); // e.g. "234567"

    // Insert new OTP
    await otpModel.insertOtp(userId, otp);

    // Send OTP via email
    await sendMail(
      email,
      "Your OTP Code",
      `Your OTP code is: ${otp}\n\nIt will expire in 5 minutes.`
    );

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    console.log("data send to verify otp userId ", "otp: " , otp);
    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP required" });
    }

    const otpRecord = await otpModel.verifyOtp(userId, otp);

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Invalidate OTPs after successful verification
    await otpModel.invalidateOtps(userId);

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
