const express = require('express');
const router = express.Router();
const {authenticateToken} = require("../middleware/verifyJWT");
const {authenticateRoles} = require("../middleware/authenticateRole")
const profileController = require('../controller/profileController');

// Get profile by userId
router.get('/:userId',authenticateToken,authenticateRoles("super_admin"), profileController.getProfile);

// Edit profile by profileId
router.put('/edit/:profileId', authenticateToken,authenticateRoles("super_admin") , profileController.editProfile);

module.exports = router;
