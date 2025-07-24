const db = require("../Database/database").pool;

/**
 * Get all projects with their client details.
 * @returns {Promise<Array>} List of projects
 */
const getAllProjectsModel = async () => {
  try {
    const [projects] = await db.query(`
      SELECT 
        p.*, 
        c.name AS client_name, 
        c.company AS client_company 
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `);
    return projects;
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    throw new Error("Failed to fetch projects");
  }
};

/**
 * Get employees assigned to a specific project.
 * @param {number} projectId 
 * @returns {Promise<Array>} List of employees
 */
const getProjectEmployeesModel = async (projectId) => {
  if (!projectId) throw new Error("Project ID is required");

  try {
    const [employees] = await db.query(`
      SELECT 
        e.id, e.employee_id, e.firstName,e.lastName,e.designation, pa.project_id,
        pa.role_in_project, pa.assigned_date
      FROM project_assignments pa
      JOIN employees e ON pa.employee_id = e.id
      WHERE pa.project_id = ?
    `, [projectId]);
    console.log("employee assigned to project",employees);
    return employees;
  } catch (error) {
    console.error("Error in getProjectEmployees:", error);
    throw new Error("Failed to fetch project employees");
  }
};

/**
 * Add a new project.
 * @param {Object} data 
 * @returns {Promise<Object>} Insert result
 */
const addNewProjectModel = async (data) => {
  const {
    title,
    description,
    client_id,
    start_date,
    end_date,
    budget
  } = data;

  if (!title || !client_id) {
    throw new Error("Title and client_id are required");
  }

  try {
    const [result] = await db.query(`
      INSERT INTO projects (
        title, description, client_id, start_date, end_date, budget
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [title, description, client_id, start_date, end_date, budget]);

    return result;
  } catch (error) {
    console.error("Error in addNewProject:", error);
    throw new Error("Failed to add project");
  }
};

/**
 * Update an existing project by ID.
 * @param {number} projectId 
 * @param {Object} updates 
 * @returns {Promise<Object>} Update result
 */
const updateProjectModel = async (projectId, updates) => {
  if (!projectId || !updates || typeof updates !== "object") {
    throw new Error("Invalid project update input");
  }

  const fields = [];
  const values = [];

  // Define allowed columns for the projects table based on your CREATE TABLE statement
  const allowedColumns = [
    'title',
    'description',
    'client_id',
    'start_date',
    'end_date',
    'status',
    'budget'
  ];

  for (const key in updates) {
    // Only include keys that are in the allowedColumns list
    if (allowedColumns.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    // If no valid fields are provided for update after filtering
    throw new Error("No valid fields to update");
  }

  const query = `
    UPDATE projects 
    SET ${fields.join(", ")} 
    WHERE id = ?
  `;
  values.push(projectId); // Add the projectId to the values array for the WHERE clause

  try {
    const [result] = await db.query(query, values);
    return result;
  } catch (error) {
    console.error("Error in updateProject:", error);
    // Re-throw a more generic error for the caller
    throw new Error("Failed to update project");
  }
};
/**
 * Delete a project by ID.
 * @param {number} projectId 
 * @returns {Promise<Object>} Delete result
 */
const deleteProjectModel = async (projectId) => {
  if (!projectId) throw new Error("Project ID is required");

  try {
    const [result] = await db.query(
      `DELETE FROM projects WHERE id = ?`,
      [projectId]
    );
    return result;
  } catch (error) {
    console.error("Error in deleteProject:", error);
    throw new Error("Failed to delete project");
  }
};
/**
 * Assign an employee to a project.
 * @param {Object} data - assignment info
 * @param {number} data.project_id - ID of the project
 * @param {number} data.employee_id - ID of the employee
 * @param {string} [data.role_in_project] - Optional role
 * @param {string} [data.assigned_date] - Optional assignment date
 * @returns {Promise<Object>} MySQL insert result
 */
const assignProjectToEmployeeModel = async (data) => {
    const { project_id, employee_id, role_in_project = null, assigned_date = null } = data;
  
    if (!project_id || !employee_id) {
      throw new Error("project_id and employee_id are required");
    }
  
    try {
      const [result] = await db.query(`
        INSERT INTO project_assignments (
          project_id, employee_id, role_in_project, assigned_date
        ) VALUES (?, ?, ?, ?)
      `, [project_id, employee_id, role_in_project, assigned_date]);
  
      return result;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error("This employee is already assigned to the project");
      }
      console.error("Error in assignProjectToEmployee:", error);
      throw new Error("Failed to assign project to employee");
    }
  };
/** 
 @param {Object} updatedFields
 @param {number} projectId
 @param {number} employeeId
 @return {Promise<Object>}

*/
const updateProjectAssignModel = async (projectId,employeeId, updatedFields) => {
    
  
    const keys = Object.keys(updatedFields);
    
    const values = Object.values(updatedFields);
  
    if (keys.length === 0) {
      throw new Error("No fields provided for update.");
    }
  
    // Build dynamic SET clause like: "firstName = ?, email = ?"
    const setClause = keys.join("=?,") + "=?";
  
    const query = `UPDATE project_assignments SET ${setClause} WHERE project_id = ?
    and employee_id = ?
    `;
    values.push(projectId);
    values.push(employeeId)
    // Add ID as last param
  
    await db.query(query, values);
  };  



  /**
   * Get total number of projects
   */
  const getTotalProjectsModel = async () => {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM projects`);
    return rows[0].total;
  };
  
  /**
   * Get total number of ongoing projects
   */
  const getTotalOngoingProjectsModel = async () => {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM projects WHERE status = 'ongoing'`);
    return rows[0].total;
  };
  
  /**
   * Get total number of completed projects
   */
  const getTotalCompletedProjectsModel = async () => {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM projects WHERE status = 'completed'`);
    return rows[0].total;
  };
  
  /**
   * Get total number of hold projects
   */
  const getTotalHoldProjectsModel = async () => {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM projects WHERE status = 'hold'`);
    return rows[0].total;
  };
  
  /**
   * Get total number of cancelled projects
   */
  const getTotalCancelProjectsModel = async () => {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM projects WHERE status = 'cancelled'`);
    return rows[0].total;
  };
  
  /**
   * Get total number of distinct assigned projects
   */
  const getTotalAssignedProjectsModel = async () => {
    const [rows] = await db.query(`SELECT COUNT(DISTINCT project_id) AS total FROM project_assignments`);
    return rows[0].total;
  };
  
  /**
   * Get total number of distinct assigned employees
   */
  const getTotalAssignedEmployeesModel = async () => {
    const [rows] = await db.query(`SELECT COUNT(DISTINCT employee_id) AS total FROM project_assignments`);
    return rows[0].total;
  };
  
  /**
   * Get total budget of ongoing projects
   */
  const getTotalOngoingBudgetModel = async () => {
    const [rows] = await db.query(`SELECT IFNULL(SUM(budget), 0) AS total FROM projects WHERE status = 'ongoing'`);
    return rows[0].total;
  };
  
  /**
   * Get projects with deadlines within the next 7 days
   */
  const getUpcomingDeadlinesModel = async () => {
    const [rows] = await db.query(`
      SELECT id, title, end_date 
      FROM projects 
      WHERE status = 'ongoing' AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY end_date ASC
    `);
    return rows;
  };
  
  /**
   * Get projects with pending payments
   */
  const getProjectsWithPendingPaymentsModel = async () => {
    const [rows] = await db.query(`
      SELECT 
        p.id AS project_id,
        p.title AS project_title,
        c.name AS client_name,
        p.budget AS total_budget,
        IFNULL(SUM(py.paidAmount), 0) AS total_paid,
        (p.budget - IFNULL(SUM(py.paidAmount), 0)) AS remaining,
        CASE
          WHEN IFNULL(SUM(py.paidAmount), 0) = 0 THEN 'unpaid'
          WHEN IFNULL(SUM(py.paidAmount), 0) < p.budget THEN 'partial'
          WHEN IFNULL(SUM(py.paidAmount), 0) >= p.budget THEN 'paid'
        END AS payment_status
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      LEFT JOIN payments py ON p.id = py.project_id
      GROUP BY p.id
      HAVING payment_status IN ('unpaid', 'partial')
      ORDER BY remaining DESC
    `);
    return rows;
  };
  
  /**
   * Get top 3 projects by budget
   */
  const getTopProjectsByBudgetModel = async () => {
    const [rows] = await db.query(`
      SELECT id, title, budget
      FROM projects
      ORDER BY budget DESC
      LIMIT 3
    `);
    return rows;
  };

  const deleteAssignment = async (employeeId,projectId) =>{
   [result] = await db.query(
    `
    DELETE FROM project_assignments 
    WHERE employee_id = ? and project_id = ?
    ` , [employeeId,projectId])

    return result;
  }

module.exports = {
  getAllProjectsModel,
  getProjectEmployeesModel,
  addNewProjectModel,
  updateProjectModel,
  deleteProjectModel,
  assignProjectToEmployeeModel,
  updateProjectAssignModel,
  deleteAssignment,
  getTotalProjectsModel,
  getTotalOngoingProjectsModel,
  getTotalCompletedProjectsModel,
  getTotalHoldProjectsModel,
  getTotalCancelProjectsModel,
  getTotalAssignedProjectsModel,
  getTotalAssignedEmployeesModel,
  getTotalOngoingBudgetModel,
  getUpcomingDeadlinesModel,
  getProjectsWithPendingPaymentsModel,
  getTopProjectsByBudgetModel
};
