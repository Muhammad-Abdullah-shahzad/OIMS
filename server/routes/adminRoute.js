const express = require("express");

const router = express.Router();

const {authenticateToken} = require("../middleware/verifyJWT");

const {authenticateRoles} = require("../middleware/authenticateRole");

const adminController = require("../controller/adminController");

router.get("/dashboard",authenticateToken,authenticateRoles("super_admin"),adminController.getDashboardData);

module.exports = router;