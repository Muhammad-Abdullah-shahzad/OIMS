import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Users, Link as LinkIcon, Unlink } from 'lucide-react';
import '../styles/projectModule.css'; // Import the new vanilla CSS file

// --- Utility Functions ---
const validateProjectForm = (formData) => {
    const errors = {};
    if (!formData.title) errors.title = 'Project Title is required.';
    if (!formData.client_id) errors.client_id = 'Client is required.';
    if (!formData.start_date) errors.start_date = 'Start Date is required.';
    if (!formData.end_date) errors.end_date = 'End Date is required.';
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
        errors.end_date = 'End Date cannot be before Start Date.';
    }
    if (isNaN(parseFloat(formData.budget)) || parseFloat(formData.budget) <= 0) {
        errors.budget = 'Valid Budget is required and must be a positive number.';
    }
    return errors;
};

const validateAssignmentForm = (formData) => {
    const errors = {};
    if (!formData.employee_id) errors.employee_id = 'Employee is required.';
    if (!formData.role_in_project) errors.role_in_project = 'Role in Project is required.';
    if (!formData.assigned_date) errors.assigned_date = 'Assigned Date is required.';
    return errors;
};

// --- ProjectManagement Component ---
const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]); // To fetch clients for the form dropdown
    const [employees, setEmployees] = useState([]); // To fetch employees for assignment
    const [assignedEmployees, setAssignedEmployees] = useState([]); // Employees assigned to a specific project

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState(''); // 'create', 'edit', 'delete', 'assign', 'view_assignments'
    const [selectedProject, setSelectedProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client_id: '',
        start_date: '',
        end_date: '',
        status: 'ongoing',
        budget: '',
    });
    const [assignmentFormData, setAssignmentFormData] = useState({
        project_id: '',
        employee_id: '',
        role_in_project: '',
        assigned_date: '',
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Base URL for your Express.js API
    const API_BASE_URL = 'http://localhost:5000'; // Base for all APIs

    // Fetch Projects
    const fetchProjects = useCallback(async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/project/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProjects(data);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setError('Failed to load projects. Please try again.');
            showToastMessage('Failed to load projects.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Clients (for dropdown in project form)
    const fetchClients = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/client/all`, { // Assuming an API for all clients
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setClients(data);
        } catch (err) {
            console.error('Failed to fetch clients:', err);
            showToastMessage('Failed to load clients for project form.', 'error');
        }
    }, []);

    // Fetch Employees (for dropdown in assignment form)
    const fetchEmployees = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/employee/all`, { // Assuming an API for all employees
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEmployees(data);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            showToastMessage('Failed to load employees for assignment.', 'error');
        }
    }, []);

    // Fetch Assigned Employees for a Specific Project
    const fetchAssignedEmployees = useCallback(async (projectId) => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/project/${projectId}/employee`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAssignedEmployees(data);
        } catch (err) {
            console.error(`Failed to fetch assigned employees for project ${projectId}:`, err);
            showToastMessage('Failed to load assigned employees.', 'error');
            setAssignedEmployees([]); // Clear previous assignments on error
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchProjects();
        fetchClients();
        fetchEmployees();
    }, [fetchProjects, fetchClients, fetchEmployees]);

    // Toast message timeout
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000); // Hide toast after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Show Toast Message Helper
    const showToastMessage = (message, type) => {
        setToast({ show: true, message, type });
    };

    // Handle Form Input Changes for Project Form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle Form Input Changes for Assignment Form
    const handleAssignmentChange = (e) => {
        const { name, value } = e.target;
        setAssignmentFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Open Modal for Create/Edit/Delete/Assign
    const openModal = (mode, project = null) => {
        setModalMode(mode);
        setSelectedProject(project);
        setValidationErrors({}); // Clear previous validation errors

        if (mode === 'create') {
            setFormData({
                title: '',
                description: '',
                client_id: '',
                start_date: '',
                end_date: '',
                status: 'ongoing',
                budget: '',
            });
        } else if (mode === 'edit' && project) {
            const formattedStartDate = project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '';
            const formattedEndDate = project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '';
            setFormData({
                ...project,
                client_id: project.client_id || '', // Ensure client_id is set for dropdown
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                budget: project.budget != null ? String(project.budget) : '',
            });
        } else if (mode === 'assign' && project) {
            setAssignmentFormData({
                project_id: project.id,
                employee_id: '',
                role_in_project: '',
                assigned_date: new Date().toISOString().split('T')[0], // Default to current date
            });
        } else if (mode === 'view_assignments' && project) {
            fetchAssignedEmployees(project.id);
        }
        setShowModal(true);
    };

    // Close Modal
    const closeModal = () => {
        setShowModal(false);
        setModalMode('');
        setSelectedProject(null);
        setValidationErrors({});
        setAssignedEmployees([]); // Clear assigned employees when closing assignment view
    };

    // Handle Create/Update Project Submission
    const handleProjectSubmit = async (e) => {
        e.preventDefault();

        const dataToSubmit = { ...formData };
        if (dataToSubmit.budget === '') {
            dataToSubmit.budget = null;
        } else {
            dataToSubmit.budget = parseFloat(dataToSubmit.budget);
        }
        // Format dates to YYYY/MM/DD if needed by backend, otherwise keep ISO string from input
        dataToSubmit.start_date = dataToSubmit.start_date.replace(/-/g, '/');
        dataToSubmit.end_date = dataToSubmit.end_date.replace(/-/g, '/');

        const errors = validateProjectForm(dataToSubmit);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showToastMessage('Please correct the form errors.', 'error');
            return;
        }

        setLoading(true);
        try {
            let response;
            const token = localStorage.token;
            if (modalMode === 'create') {
                response = await fetch(`${API_BASE_URL}/project/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dataToSubmit),
                });
            } else if (modalMode === 'edit' && selectedProject) {
                response = await fetch(`${API_BASE_URL}/project/update/${selectedProject.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dataToSubmit),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage(`Project ${modalMode === 'create' ? 'added' : 'updated'} successfully!`, 'success');
            closeModal();
            fetchProjects(); // Re-fetch data to update the list
        } catch (err) {
            console.error(`Failed to ${modalMode} project:`, err);
            setError(`Failed to ${modalMode} project: ${err.message}`);
            showToastMessage(`Failed to ${modalMode} project.`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete Project
    const handleDeleteProject = async () => {
        if (!selectedProject) return;

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/project/delete/${selectedProject.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage('Project deleted successfully!', 'success');
            closeModal();
            fetchProjects(); // Re-fetch data to update the list
        } catch (err) {
            console.error('Failed to delete project:', err);
            setError(`Failed to delete project: ${err.message}`);
            showToastMessage('Failed to delete project.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Assign Employee to Project
    const handleAssignEmployee = async (e) => {
        e.preventDefault();

        const dataToSubmit = { ...assignmentFormData };
        dataToSubmit.assigned_date = dataToSubmit.assigned_date.replace(/-/g, '/');

        const errors = validateAssignmentForm(dataToSubmit);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showToastMessage('Please correct the assignment form errors.', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/project/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(dataToSubmit),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage('Employee assigned to project successfully!', 'success');
            // Re-fetch assigned employees for the current project view
            if (selectedProject) {
                fetchAssignedEmployees(selectedProject.id);
            }
            // Clear assignment form data after successful assignment
            setAssignmentFormData({
                project_id: selectedProject ? selectedProject.id : '',
                employee_id: '',
                role_in_project: '',
                assigned_date: new Date().toISOString().split('T')[0],
            });
            setValidationErrors({}); // Clear validation errors for assignment form
        } catch (err) {
            console.error('Failed to assign employee:', err);
            setError(`Failed to assign employee: ${err.message}`);
            showToastMessage(`Failed to assign employee: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Deassign Employee from Project
    const handleDeassignEmployee = async (projectAssignmentId) => {
        setLoading(true);
        try {
            const token = localStorage.token;
            // Assuming your backend has a route like DELETE /project/assign/remove/:assignmentId
            // The API provided is PUT http://localhost:5000/project/assign/update/2/employee/2
            // This suggests an update to an assignment, not a deletion of the assignment itself.
            // If `project_assignments` id is `projectAssignmentId`, a DELETE to that ID would be more typical for de-assignment.
            // For now, I'll use a placeholder assuming a DELETE route for assignment ID.
            // If the backend truly only supports a PUT to "update" an assignment (e.g., setting is_active to false),
            // this logic would need to change.
            // Given the schema "is_active BOOLEAN DEFAULT TRUE", a PUT to set it to FALSE would be logical for deassign.
            // Let's assume for now a direct DELETE for simplicity, but note the API discrepancy.
            // If `project/assign/update/2/employee/2` is to *deactivate* an assignment, the payload would likely be `{ "is_active": false }`.
            // For true de-assignment (deletion), a DELETE route by the `project_assignment` table's `id` is more standard.
            // For the purpose of this component, I will create a hypothetical DELETE route:
            // DELETE http://localhost:5000/project/assign/remove/:assignmentId
            // Or, if the PUT route is meant to de-assign by setting `is_active` to false:
            // PUT http://localhost:5000/project/assign/update/:projectId/employee/:employeeId with { is_active: false }
            // Given the API for update is `PUT http://localhost:5000/project/assign/update/2/employee/2`,
            // and the `project_assignments` table has `id`, `project_id`, `employee_id`, I'll assume:
            // A de-assignment means deleting the `project_assignments` record.
            // So I'll make a DELETE request to `project/assign/remove/:assignmentId`
            // If the backend doesn't have this, it will need to be implemented.
            
            // To properly de-assign, we need the `id` from `project_assignments` table.
            // The `GET http://localhost:5000/project/1/employee` should ideally return `project_assignments.id` as well.
            // Assuming `assignedEmployees` array contains `id` for each assignment record:
            const response = await fetch(`${API_BASE_URL}/project/assign/remove/${projectAssignmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage('Employee deassigned successfully!', 'success');
            // Re-fetch assigned employees for the current project view
            if (selectedProject) {
                fetchAssignedEmployees(selectedProject.id);
            }
        } catch (err) {
            console.error('Failed to deassign employee:', err);
            setError(`Failed to deassign employee: ${err.message}`);
            showToastMessage(`Failed to deassign employee: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };


    // Render Modal Content
    const renderModalContent = () => {
        switch (modalMode) {
            case 'create':
            case 'edit':
                return (
                    <form onSubmit={handleProjectSubmit} className="modal-form">
                        <h2 className="modal-title">
                            {modalMode === 'create' ? 'Add New Project' : 'Edit Project'}
                        </h2>
                        <div className="form-grid">
                            {/* Project Title */}
                            <div className="form-group form-group-full">
                                <label htmlFor="title">Project Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.title ? 'input-error' : ''}`}
                                    required
                                />
                                {validationErrors.title && <p className="error-message">{validationErrors.title}</p>}
                            </div>
                            {/* Client */}
                            <div className="form-group">
                                <label htmlFor="client_id">Client</label>
                                <select
                                    id="client_id"
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleChange}
                                    className={`form-select ${validationErrors.client_id ? 'input-error' : ''}`}
                                    required
                                >
                                    <option value="">Select a Client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name} ({client.company})</option>
                                    ))}
                                </select>
                                {validationErrors.client_id && <p className="error-message">{validationErrors.client_id}</p>}
                            </div>
                            {/* Status */}
                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            {/* Start Date */}
                            <div className="form-group">
                                <label htmlFor="start_date">Start Date</label>
                                <input
                                    type="date"
                                    id="start_date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.start_date ? 'input-error' : ''}`}
                                    required
                                />
                                {validationErrors.start_date && <p className="error-message">{validationErrors.start_date}</p>}
                            </div>
                            {/* End Date */}
                            <div className="form-group">
                                <label htmlFor="end_date">End Date</label>
                                <input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.end_date ? 'input-error' : ''}`}
                                    required
                                />
                                {validationErrors.end_date && <p className="error-message">{validationErrors.end_date}</p>}
                            </div>
                            {/* Budget */}
                            <div className="form-group">
                                <label htmlFor="budget">Budget ($)</label>
                                <input
                                    type="number"
                                    id="budget"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.budget ? 'input-error' : ''}`}
                                    required
                                    step="0.01"
                                    min="0"
                                />
                                {validationErrors.budget && <p className="error-message">{validationErrors.budget}</p>}
                            </div>
                            {/* Description */}
                            <div className="form-group form-group-full">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="form-textarea"
                                ></textarea>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="button button-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="button button-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (modalMode === 'create' ? 'Add Project' : 'Update Project')}
                            </button>
                        </div>
                    </form>
                );
            case 'delete':
                return (
                    <div className="delete-modal-content">
                        <h2 className="modal-title">Confirm Deletion</h2>
                        <p className="modal-text">
                            Are you sure you want to delete project{' '}
                            <span className="project-title-display">"{selectedProject?.title}"</span> (ID: {selectedProject?.id})?
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="button button-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteProject}
                                className="button button-danger"
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                );
            case 'assign':
                return (
                    <div className="assign-modal-content">
                        <h2 className="modal-title">Assign Employee to "{selectedProject?.title}"</h2>
                        <form onSubmit={handleAssignEmployee}>
                            <div className="assign-form-grid">
                                {/* Employee */}
                                <div className="form-group assign-form-group-full">
                                    <label htmlFor="employee_id">Employee</label>
                                    <select
                                        id="employee_id"
                                        name="employee_id"
                                        value={assignmentFormData.employee_id}
                                        onChange={handleAssignmentChange}
                                        className={`form-select ${validationErrors.employee_id ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Select an Employee</option>
                                        {employees.map(employee => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.firstName} {employee.lastName} ({employee.designation})
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.employee_id && <p className="error-message">{validationErrors.employee_id}</p>}
                                </div>
                                {/* Role in Project */}
                                <div className="form-group">
                                    <label htmlFor="role_in_project">Role in Project</label>
                                    <input
                                        type="text"
                                        id="role_in_project"
                                        name="role_in_project"
                                        value={assignmentFormData.role_in_project}
                                        onChange={handleAssignmentChange}
                                        className={`form-input ${validationErrors.role_in_project ? 'input-error' : ''}`}
                                        required
                                    />
                                    {validationErrors.role_in_project && <p className="error-message">{validationErrors.role_in_project}</p>}
                                </div>
                                {/* Assigned Date */}
                                <div className="form-group">
                                    <label htmlFor="assigned_date">Assigned Date</label>
                                    <input
                                        type="date"
                                        id="assigned_date"
                                        name="assigned_date"
                                        value={assignmentFormData.assigned_date}
                                        onChange={handleAssignmentChange}
                                        className={`form-input ${validationErrors.assigned_date ? 'input-error' : ''}`}
                                        required
                                    />
                                    {validationErrors.assigned_date && <p className="error-message">{validationErrors.assigned_date}</p>}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="button button-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Assigning...' : 'Assign Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'view_assignments':
                return (
                    <div className="assign-modal-content">
                        <h2 className="modal-title">Employees Assigned to "{selectedProject?.title}"</h2>
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p className="loading-text">Loading assignments...</p>
                            </div>
                        ) : assignedEmployees.length === 0 ? (
                            <div className="no-data-found">
                                <p>No employees assigned to this project yet.</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="employee-assignment-table">
                                    <thead>
                                        <tr>
                                            <th>Employee Name</th>
                                            <th>Designation</th>
                                            <th>Role in Project</th>
                                            <th>Assigned Date</th>
                                            <th style={{width: '80px'}}>Actions</th> {/* Fixed width for action column */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignedEmployees.map((assignment) => (
                                            <tr key={assignment.assignment_id}>
                                                <td>{assignment.firstName} {assignment.lastName}</td>
                                                <td>{assignment.designation}</td>
                                                <td>{assignment.role_in_project}</td>
                                                <td>{assignment.assigned_date ? new Date(assignment.assigned_date).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeassignEmployee(assignment.assignment_id)}
                                                        className="deassign-button"
                                                        title="Deassign Employee"
                                                        disabled={loading}
                                                    >
                                                        <Unlink size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="button button-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading && !projects.length && !error) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading projects...</p>
            </div>
        );
    }

    if (error && !projects.length) {
        return (
            <div className="error-container">
                <AlertCircle size={48} className="error-icon" />
                <p className="error-message-large">Error: {error}</p>
                <button
                    onClick={fetchProjects}
                    className="button button-primary"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="project-management-container">
            <h1 className="main-title">Project Management</h1>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast-notification ${toast.type === 'success' ? 'toast-success' : 'toast-error'} ${toast.show ? 'toast-show' : ''}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{toast.message}</span>
                    <button onClick={() => setToast({ ...toast, show: false })} className="toast-close-button">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="add-project-section">
                <button
                    onClick={() => openModal('create')}
                    className="button button-primary add-project-button"
                >
                    <Plus size={20} className="button-icon" /> Add New Project
                </button>
            </div>

            <h2 className="section-title">Active Projects</h2>
            {projects.length === 0 && !loading && !error ? (
                <div className="no-data-found">
                    <p>No projects found. Click "Add New Project" to get started!</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="table-header">Project ID</th>
                                <th className="table-header">Title</th>
                                <th className="table-header">Client</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Budget</th>
                                <th className="table-header">Start Date</th>
                                <th className="table-header">End Date</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id} className="table-row">
                                    <td className="table-data font-medium">{project.id}</td>
                                    <td className="table-data">{project.title}</td>
                                    <td className="table-data">{project.client_name} ({project.client_company})</td>
                                    <td className="table-data">
                                        <span className={`status-badge status-${project.status.replace('_', '-')}`}>
                                            {project.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="table-data">${parseFloat(project.budget).toLocaleString()}</td>
                                    <td className="table-data">
                                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="table-data">
                                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="table-data table-actions">
                                        <div className="action-buttons-group">
                                            <button
                                                onClick={() => openModal('edit', project)}
                                                className="action-button edit-button"
                                                title="Edit Project"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal('delete', project)}
                                                className="action-button delete-button"
                                                title="Delete Project"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal('assign', project)}
                                                className="action-button assign-button"
                                                title="Assign Employee"
                                            >
                                                <LinkIcon size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal('view_assignments', project)}
                                                className="action-button button-secondary" // Reusing secondary button style
                                                title="View Assigned Employees"
                                            >
                                                <Users size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Overlay */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scaleIn">
                        <button
                            onClick={closeModal}
                            className="modal-close-button"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectManagement;