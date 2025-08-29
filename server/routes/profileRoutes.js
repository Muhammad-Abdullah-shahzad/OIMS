const express = require('express');
const router = express.Router();
const {authenticateToken} = require("../middleware/verifyJWT");
const {authenticateRoles} = require("../middleware/authenticateRole")
const profileController = require('../controller/profileController');

// Get profile by userId
router.get('/:userId',authenticateToken,authenticateRoles("super_admin"), profileController.getProfile);

// Edit profile by profileId
router.put('/edit/:profileId', authenticateToken,authenticateRoles("super_admin") , profileController.editProfile);


//  for employees profile

router.get('/employee/:employeeId', profileController.getEmployeeProfile);

// Edit profile by profileId
router.put('/employee/edit/:profileId', profileController.editEmployeeProfile);

module.exports = router;
