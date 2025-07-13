const express = require("express");
const router = express.Router();

const salaryController = require("../controller/salaryController")

router.get("/all",salaryController.getAllSalaryController)
router.get("/:employeeId",salaryController.getEmployeeSalaryController)
router.post("/add",salaryController.addSalaryController)
router.delete("/delete/:paymentId",salaryController.deleteSalaryrecordController)
router.put("/edit/:paymentId",salaryController.updateSalaryController)
router.get("/report/:employeeId",salaryController.generateReportController)

module.exports = router









