const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middleware/verifyJWT")
const {authenticateRoles} = require("../middleware/authenticateRole")
const expenseController = require("../controller/expenseController")

router.get("/all",expenseController.getAllExpenseController);
router.get("/get-report",expenseController.getExpenseReportController);
router.post("/add",expenseController.addNewExpensecontroller);
router.put("/edit/:id",expenseController.updateExpenseController);
router.delete("/delete/:id",expenseController.deleteExpenseController);


module.exports = router;













