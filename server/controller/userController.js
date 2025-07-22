model = require("../model/userModel");

exports.getAllUsers = async (req, res) => {
    try {
      const users = await model.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  };
