const projectModel = require("../model/projectModel")
exports.getAllProjectsController = async (req, res) => {
    try {
      const projects = await projectModel.getAllProjectsModel();
      res.status(200).json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

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
  

  exports.addNewProjectController = async (req, res) => {
    try {
      const projectData = req.body;
      const result = await projectModel.addNewProjectModel(projectData);
      res.status(201).json({ message: "Project created", projectId: result.insertId });
    } catch (error) {
      console.error("Error adding new project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  exports.updateProjectDetailsController = async (req, res) => {
    try {
      const { projectId } = req.params;
      const updatedData = req.body;
      const result = await projectModel.updateProjectModel(projectId, updatedData);
      res.status(200).json({ message: "Project updated" });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  exports.deleteProjectController = async (req, res) => {
    try {
      const { projectId } = req.params;
      await projectModel.deleteProjectModel(projectId);
      res.status(200).json({ message: "Project deleted" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  exports.assignProjectController = async (req, res) => {
    try {
      const assignmentData = req.body;
      const result = await projectModel.assignProjectToEmployeeModel(assignmentData);
      res.status(200).json({ message: "Employee assigned to project" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
exports.updateProjectAssignmentController = async (req,res)=>{
    const { projectId , employeeId } = req.params;
    
    const updatedFields = req.body;
  
    try {
      await projectModel.updateProjectAssignModel(projectId,employeeId,updatedFields);
      res.json({ message: "Employee updated successfully" });
    } catch (err) {
      console.error("Update Employee Error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
}

exports.getProjectDetails = ()=>{
    }

  



