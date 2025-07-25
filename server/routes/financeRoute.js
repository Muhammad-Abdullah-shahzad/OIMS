const express = require("express");
const financeController = require("../controller/financeController");

const router = express.Router();

router.get("/dashboard",financeController.getFinancedashboardData)


module.exports = router;


