const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middleware/verifyJWT")
const {authenticateRoles} = require("../middleware/authenticateRole")

const employeeController = require("../controller/employeeController")


router.post("/add",authenticateToken,authenticateRoles("project_manager","super_admin"), employeeController.addNewEmployeeController);
router.delete("/remove/:id",authenticateToken,authenticateRoles("project_manager","super_admin"), employeeController.deleteEmployeeController);
router.put("/update/:id",authenticateToken,authenticateRoles("project_manager","super_admin"), employeeController.updateEmployeeInfoController);
router.get("/all",authenticateToken,authenticateRoles("project_manager","super_admin"), employeeController.getAllEmployeeController);







module.exports = router