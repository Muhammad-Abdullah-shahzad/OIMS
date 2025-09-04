const userModel = require("../model/userModel");
const passwordModel = require("../model/passwordModel");
const bycrypt = require("bcrypt");

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findUserByEmail(email);

    if (user && user.length > 0) {
      res.status(200).json({
        userId: user[0].id,
        email: user[0].email,
      });
    } else {
      res.status(404).json({ message: "User not registered" });
    }
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const hashPassword = await bycrypt.hash(password, 10);
    const result = await userModel.updateUserPassword(userId, hashPassword);
    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "user password updated succesfully",
      });
    } else {
      res.status(400).json({ message: "failed to update user password" });
    }
  } catch (error) {
    console.error("Error in resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
