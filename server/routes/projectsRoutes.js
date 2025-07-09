const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController")


router.get('/all',projectController.getAllProjectsController)
router.get('/:projectId/employee',projectController.getProjectEmployees)
router.post('/add',projectController.addNewProjectController)
router.put('/update/:projectId',projectController.updateProjectDetailsController)
router.delete('/delete/:projectId',projectController.deleteProjectController)
router.get("/:projectID",projectController.getProjectDetails)
router.post("/assign",projectController.assignProjectController)
router.put("/assign/update/:projectId/employee/:employeeId",projectController.updateProjectAssignmentController)


module.exports = router;
