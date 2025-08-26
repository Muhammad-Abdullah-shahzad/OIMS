const projectModel = require("../model/projectModel");
const paymentModel = require("../model/paymentModel");
const {userActivityLogger} = require("../model/userActivityLogModel");

// Get all projects
exports.getAllProjectsController = async (req, res) => {
  try {
    const projects = await projectModel.getAllProjectsModel();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get employees assigned to a specific project
exports.getProjectEmployees = async (req, res) => {
  try {
    const { projectId } = req.params;
    const employees = await projectModel.getProjectEmployeesModel(projectId);
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching project employees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add new project
exports.addNewProjectController = async (req, res) => {
  try {
    const projectData = req.body;
    const result = await projectModel.addNewProjectModel(projectData);

    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "INSERT",
      tableName: "projects",
      newData: projectData,
      actionDetails: `${req.user.email} created a new project (ID: ${result.insertId})`
    });

    res.status(201).json({ message: "Project created", projectId: result.insertId });
  } catch (error) {
    console.error("Error adding new project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update project
exports.updateProjectDetailsController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updatedData = req.body;
    await projectModel.updateProjectModel(projectId, updatedData);

    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "UPDATE",
      tableName: "projects",
      newData: updatedData,
      actionDetails: `${req.user.email} updated project ID: ${projectId}`
    });

    res.status(200).json({ message: "Project updated" });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete project
exports.deleteProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;
    await projectModel.deleteProjectModel(projectId);

    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "DELETE",
      tableName: "projects",
      newData: {},
      actionDetails: `${req.user.email} deleted project ID: ${projectId}`
    });

    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Assign project to employee
exports.assignProjectController = async (req, res) => {
  try {
    const assignmentData = req.body;
    const result = await projectModel.assignProjectToEmployeeModel(assignmentData);

    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "INSERT",
      tableName: "project_assignments",
      newData: assignmentData,
      actionDetails: `${req.user.email} assigned employee ID ${assignmentData.employee_id} to project ID ${assignmentData.project_id}`
    });

    res.status(200).json({ message: "Employee assigned to project" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update project assignment
exports.updateProjectAssignmentController = async (req, res) => {
  const { projectId, employeeId } = req.params;
  const updatedFields = req.body;

  try {
    await projectModel.updateProjectAssignModel(projectId, employeeId, updatedFields);

    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "UPDATE",
      tableName: "project_assignments",
      newData: updatedFields,
      actionDetails: `${req.user.email} updated assignment of employee ID ${employeeId} in project ID ${projectId}`
    });

    res.json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("Update Employee Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete project assignment
exports.deleteAssignmentController = async (req, res) => {
  try {
    const { employeeId, projectId } = req.params;
    const result = await projectModel.deleteAssignment(employeeId, projectId);

    if (result.affectedRows > 0) {
      await userActivityLogger({
        userEmail: req.user.email,
        actionType: "DELETE",
        tableName: "project_assignments",
        newData: {},
        actionDetails: `${req.user.email} removed employee ID ${employeeId} from project ID ${projectId}`
      });

      res.status(200).json({ message: "Assignment deleted successfully" });
    } else {
      res.status(400).json({ message: "Assignment not deleted" });
    }
  } catch (error) {
    console.log("Error deleting assignment:", error);
    res.status(404).json({ message: "Failed to delete assignment" });
  }
};

// Get dashboard data
exports.getDashboardController = async (req, res) => {
  const dashboard = {};
  try {
    dashboard.totalProjects = await projectModel.getTotalProjectsModel();
    dashboard.ongoingProjects = await projectModel.getTotalOngoingProjectsModel();
    dashboard.completedProjects = await projectModel.getTotalCompletedProjectsModel();
    dashboard.holdProjects = await projectModel.getTotalHoldProjectsModel();
    dashboard.cancelledProjects = await projectModel.getTotalCancelProjectsModel();

    dashboard.totalAssignedProjects = await projectModel.getTotalAssignedProjectsModel();
    dashboard.totalAssignedEmployees = await projectModel.getTotalAssignedEmployeesModel();
    dashboard.totalOngoingBudget = await projectModel.getTotalOngoingBudgetModel();
    dashboard.upcomingDeadlines = await projectModel.getUpcomingDeadlinesModel();
    dashboard.projectsWithPendingPayments = await paymentModel.getPaymentSlipDataModel();
    dashboard.topProjectsByBudget = await projectModel.getTopProjectsByBudgetModel();

    res.status(200).json(dashboard);
  } catch (error) {
    console.log("Error in getDashboardController:", error);
    res.status(415).json({ message: "Failed to get project manager dashboard" });
  }
};

// Stub for project details (not implemented)
exports.getProjectDetails = () => {};
