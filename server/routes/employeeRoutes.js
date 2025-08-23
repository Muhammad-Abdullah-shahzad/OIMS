const express = require("express");

const router = express.Router();

const {authenticateToken} = require("../middleware/verifyJWT");

const {authenticateRoles} = require("../middleware/authenticateRole")

const employeeController = require("../controller/employeeController")


router.post("/add",authenticateToken,authenticateRoles("hr_manager","super_admin"), employeeController.addNewEmployeeController);

router.delete("/remove/:id",authenticateToken,authenticateRoles("hr_manager","super_admin"), employeeController.deleteEmployeeController);

router.put("/update/:id",authenticateToken,authenticateRoles("hr_manager","super_admin"),employeeController.updateEmployeeInfoController);

router.get("/all",employeeController.getAllEmployeeController);

router.get("/dashboard",authenticateToken,authenticateRoles("hr_manager","super_admin"),employeeController.getDashboardStatsController)

router.get("/designation",employeeController.getAllDesignationsController);

router.post("/add/designation",employeeController.addNewDesignationController);

router.delete("/delete/designation/:designationId",employeeController.deleteDesignationController);

module.exports = router