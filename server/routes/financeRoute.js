const express = require("express");
const {authenticateToken} = require("../middleware/verifyJWT");
const {authenticateRoles} = require("../middleware/authenticateRole");
const financeController = require("../controller/financeController");

const router = express.Router();

router.get("/dashboard",authenticateToken,authenticateRoles("super_admin","finance_manager"),financeController.getFinancedashboardData)

module.exports = router;


