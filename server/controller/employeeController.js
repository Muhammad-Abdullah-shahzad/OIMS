// controller/employeeController.js
const employeeModel = require("../model/employeeModel");
const {userActivityLogger} = require("../model/userActivityLogModel");

exports.addNewEmployeeController = async (req, res) => {
  // console.log("employee data comming from front end ", req.body);
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    designation,
    cnic,
    address,
    salary,
    bank_account,
    hire_date,
    employee_id,
    location,
    department,
    bank_name,
    alownces,
    resources,
  } = req.body;
  if (
    (!firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !designation ||
      !cnic ||
      !address ||
      !salary ||
      !bank_account ||
      !hire_date ||
      !employee_id ||
      !location,
    !department,
    !bank_name ||!alownces)
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await employeeModel.addEmployeeModel(
      employee_id,
      firstName,
      lastName,
      email,
      phoneNumber,
      designation,
      cnic,
      address,
      salary,
      bank_account,
      hire_date,
      location,
      department,
      bank_name,
      alownces,
      resources
    );

   await userActivityLogger({
    userEmail : req.user.email,
    actionType :"INSERT",     
    tableName : "employees table",
    newData : {
      employee_id,
      firstName,
      lastName,
      email,
      phoneNumber,
      designation,
      cnic,
      address,
      salary,
      bank_account,
      hire_date,
      location,
      department,
      bank_name,
      alownces,
      resources
    },
    actionDetails : `${req.user.email} inserted a new employee `
  });

    res.status(201).json({ message: "Employee added successfully" });
  } catch (err) {
    console.error("Add Employee Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteEmployeeController = async (req, res) => {
  const { id } = req.params;

  // console.log("id and employee_id recieved from front end ",id,employee_id);
  try {
    await employeeModel.deleteEmployeeModel(id);
    
   await userActivityLogger({
    userEmail : req.user.email,
    actionType :"DELETE",     
    tableName : "employees table",
    newData : {} ,
    actionDetails : `${req.user.email} deleted an employee`
  });

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Delete Employee Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateEmployeeInfoController = async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  try {
  await employeeModel.updateEmployeeModel(id, updatedFields);
   
  
  await userActivityLogger({
    userEmail : req.user.email,
    actionType :"UPDATE",     
    tableName : "employees table",
    newData : req.body,
    actionDetails : `${req.user.email} updated an employee `
  });

  res.status(200).json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("Update Employee Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllEmployeeController = async (req, res) => {
  try {
    const employees = await employeeModel.getAllEmployeesModel();
    console.log("employees date sent to front end ", employees);
    res.status(200).json(employees);
  } catch (err) {
    console.error("Get Employees Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDashboardStatsController = async (req, res) => {
  try {
    const employeeDashboard = {};

    // Core Stats
    employeeDashboard.totalEmployees = await employeeModel.getEmployeeCount();
    employeeDashboard.employeesByDesignation =
      await employeeModel.getEmployeesByDesignation();

    // Additional HR stats
    employeeDashboard.activeInactiveCount =
      await employeeModel.getActiveInactiveCount();
    employeeDashboard.monthlyHiredEmployees =
      await employeeModel.getMonthlyHiredEmployees();
    employeeDashboard.salarySummary = await employeeModel.getSalarySummary();
    employeeDashboard.recentHires = await employeeModel.getRecentHires();

    res.status(200).json({
      success: true,
      data: employeeDashboard,
    });
  } catch (error) {
    console.error("HR Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee dashboard stats",
      error: error.message,
    });
  }
};
// Add new designation
exports.addNewDesignationController = async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const exists = await employeeModel.designationExists(title);
    if (exists) {
      return res.status(409).json({ message: "Designation already exists" });
    }

    await employeeModel.addDesignationModel(title, description);

   
    await userActivityLogger({
      userEmail : req.user.email,
      actionType :"INSERT",     
      tableName : "designations table",
      newData : {
        title,
        description
      },
      actionDetails : `${req.user.email} inserted a new designation(title,description) in designations table `
    });
  

    res.status(201).json({ message: "Designation added successfully" });
  } catch (error) {
    console.error("Add Designation Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all designations
exports.getAllDesignationsController = async (req, res) => {
  try {
    const designations = await employeeModel.getAllDesignationsModel();
    res.status(200).json(designations);
  } catch (error) {
    console.error("Get Designations Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a designation
exports.deleteDesignationController = async (req, res) => {
  const { designationId } = req.params;

  try {
    const deleted = await employeeModel.deleteDesignationModel(designationId);
    if (!deleted) {
      return res.status(404).json({ message: "Designation not found" });
    }
    
    
   await userActivityLogger({
    userEmail : req.user.email,
    actionType :"DELETE",     
    tableName : "designations table",
    newData : {},
    actionDetails : `${req.user.email} deleted designation with id ${designationId}`
  });


    res.status(200).json({ message: "Designation deleted successfully" });
  } catch (error) {
    console.error("Delete Designation Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};