const express = require("express");
const router = express.Router();

const {authenticateToken} = require("../middleware/verifyJWT")

const {authenticateRoles} = require("../middleware/authenticateRole")

const expenseController = require("../controller/expenseController")


router.get("/all",authenticateToken,authenticateRoles("finance_manager","super_admin"),expenseController.getAllExpenseController);

router.get("/get-report/:startDate/:endDate",authenticateToken,authenticateRoles("finance_manager","super_admin"),  expenseController.getExpenseReportController);

router.post("/add",authenticateToken,authenticateRoles("finance_manager","super_admin"),  expenseController.addNewExpensecontroller);

router.put("/edit/:id",authenticateToken,authenticateRoles("finance_manager","super_admin"),  expenseController.updateExpenseController);

router.delete("/delete/:id",authenticateToken,authenticateRoles("finance_manager","super_admin"),  expenseController.deleteExpenseController);

router.get("/get-report",authenticateToken,authenticateRoles("finance_manager","super_admin"),  expenseController.getExpenseReportController)

module.exports = router;













