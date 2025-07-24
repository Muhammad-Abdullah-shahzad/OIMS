const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController")
const {authenticateToken} = require("../middleware/verifyJWT")
const {authenticateRoles} = require("../middleware/authenticateRole")

router.get('/pro-dashboard', projectController.getDashboardController)

router.get('/all',authenticateToken,authenticateRoles("project_manager","super_admin"),projectController.getAllProjectsController)

router.get('/:projectId/employee',authenticateToken,authenticateRoles("project_manager","super_admin"),projectController.getProjectEmployees)

router.post('/add',authenticateToken,authenticateRoles("project_manager","super_admin"),projectController.addNewProjectController)

router.put('/update/:projectId',authenticateToken,authenticateRoles("project_manager","super_admin"),projectController.updateProjectDetailsController)

router.delete('/delete/:projectId',authenticateToken,authenticateRoles("project_manager","super_admin"),projectController.deleteProjectController)

router.get("/:projectID",authenticateToken,authenticateRoles("project_manager","super_admin"),projectController.getProjectDetails)

router.post("/assign",authenticateToken,authenticateRoles("project_manager","super_admin"),projectController.assignProjectController)

router.put("/assign/update/:projectId/employee/:employeeId",authenticateToken,authenticateRoles("project_manager","super_admin"),projectController.updateProjectAssignmentController)

router.delete("/assign/remove/:employeeId/:projectId", projectController.deleteAssignmentController)


module.exports = router;
