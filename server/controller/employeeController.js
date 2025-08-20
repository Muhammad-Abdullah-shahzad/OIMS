// controller/employeeController.js
const employeeModel = require("../model/employeeModel");

exports.addNewEmployeeController = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, designation , cnic , address , salary , bank_account, hire_date, employee_id , location , department , bank_name} = req.body;
  if (!firstName || !lastName || !email || !phoneNumber || !designation || !cnic || !address || !salary || !bank_account  || !hire_date || !employee_id  || !location , !department , !bank_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await employeeModel.addEmployeeModel(employee_id,firstName, lastName, email, phoneNumber, designation,cnic,address,salary,bank_account,hire_date , location, department , bank_name);
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
    res.status(200).json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("Update Employee Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllEmployeeController = async (req, res) => {
  try {
    const employees = await employeeModel.getAllEmployeesModel();
    console.log("employees date sent to front end ",employees);
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
    employeeDashboard.employeesByDesignation = await employeeModel.getEmployeesByDesignation();

    // Additional HR stats
    employeeDashboard.activeInactiveCount = await employeeModel.getActiveInactiveCount();
    employeeDashboard.monthlyHiredEmployees = await employeeModel.getMonthlyHiredEmployees();
    employeeDashboard.salarySummary = await employeeModel.getSalarySummary();
    employeeDashboard.recentHires = await employeeModel.getRecentHires();

    res.status(200).json({
      success: true,
      data: employeeDashboard
    });
  } catch (error) {
    console.error("HR Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee dashboard stats",
      error: error.message
    });
  }
};
