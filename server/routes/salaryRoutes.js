const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middleware/verifyJWT")
const {authenticateRoles} = require("../middleware/authenticateRole")

const salaryController = require("../controller/salaryController")

router.get("/all",authenticateToken,authenticateRoles("finance_manager","super_admin"),salaryController.getAllSalaryController)

router.get("/:employeeId",authenticateToken,authenticateRoles("finance_manager","super_admin"),salaryController.getEmployeeSalaryController)

router.post("/add",authenticateToken,authenticateRoles("finance_manager","super_admin"),salaryController.addSalaryController)

router.delete("/delete/:paymentId",authenticateToken,authenticateRoles("finance_manager","super_admin"),salaryController.deleteSalaryrecordController)

router.put("/edit/:paymentId",authenticateToken,authenticateRoles("finance_manager","super_admin"),salaryController.updateSalaryController)

router.post("/report/:employeeId",authenticateToken,authenticateRoles("finance_manager","super_admin"),salaryController.generateReportController)

module.exports = router









