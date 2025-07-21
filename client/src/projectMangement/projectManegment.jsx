import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Users, Link as LinkIcon, Unlink, Building } from 'lucide-react';
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

// New: Validate Client Form
const validateClientForm = (formData) => {
    const errors = {};
    if (!formData.name) errors.name = 'Client Name is required.';
    if (!formData.email) {
        errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email address is invalid.';
    }
    if (!formData.phone && !formData.whatsapp) {
        errors.phone = 'Either Phone or WhatsApp is required.';
        errors.whatsapp = 'Either Phone or WhatsApp is required.';
    }
    return errors;
};

// --- ProjectManagement Component ---
const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]); // To fetch clients for the form dropdown and display
    const [employees, setEmployees] = useState([]); // To fetch employees for assignment
    const [assignedEmployees, setAssignedEmployees] = useState([]); // Employees assigned to a specific project

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState(''); // 'create', 'edit', 'delete', 'assign', 'view_assignments', 'create_client', 'edit_client', 'delete_client'
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null); // New: For client operations

    const [formData, setFormData] = useState({ // Project Form Data
        title: '',
        description: '',
        client_id: '',
        start_date: '',
        end_date: '',
        status: 'ongoing',
        budget: '',
    });
    const [assignmentFormData, setAssignmentFormData] = useState({ // Assignment Form Data
        project_id: '',
        employee_id: '',
        role_in_project: '',
        assigned_date: '',
    });
    const [clientFormData, setClientFormData] = useState({ // New: Client Form Data
        name: '',
        company: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        city: '',
        country: 'Pakistan',
        contract_file: '',
        is_active: true,
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

    // Fetch Clients (for dropdown in project form and for client management section)
    const fetchClients = useCallback(async () => {
        const token = localStorage.getItem("token");
        setLoading(true); // Set loading for client fetch as well
        try {
            const response = await fetch(`${API_BASE_URL}/client/all`, { // Assuming an API for all clients
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json(); // Try to parse error message
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json(); // Get the full response object

            if (result.success && Array.isArray(result.data)) {
                setClients(result.data);
            } else {
                throw new Error(result.message || 'Unexpected data format from client API.');
            }
        } catch (err) {
            console.error('Failed to fetch clients:', err);
            showToastMessage('Failed to load clients.', 'error');
            setError('Failed to load clients. Please try again.'); // Set error for client section
        } finally {
            setLoading(false); // End loading for client fetch
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

    // New: Handle Form Input Changes for Client Form
    const handleClientChange = (e) => {
        const { name, value, type, checked } = e.target;
        setClientFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Open Modal for Create/Edit/Delete/Assign/Client Operations
    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setValidationErrors({}); // Clear previous validation errors
        setAssignedEmployees([]); // Clear assigned employees when opening any other modal

        if (mode.includes('project')) { // Project related modals
            setSelectedProject(item);
            if (mode === 'create') {
                setFormData({
                    title: '', description: '', client_id: '',
                    start_date: '', end_date: '', status: 'ongoing', budget: '',
                });
            } else if (mode === 'edit' && item) {
                const formattedStartDate = item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '';
                const formattedEndDate = item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '';
                setFormData({
                    ...item, client_id: item.client_id || '',
                    start_date: formattedStartDate, end_date: formattedEndDate,
                    budget: item.budget != null ? String(item.budget) : '',
                });
            } else if (mode === 'assign' && item) {
                setAssignmentFormData({
                    project_id: item.id, employee_id: '', role_in_project: '',
                    assigned_date: new Date().toISOString().split('T')[0],
                });
            } else if (mode === 'view_assignments' && item) {
                fetchAssignedEmployees(item.id);
            }
        } else if (mode.includes('client')) { // New: Client related modals
            setSelectedClient(item);
            if (mode === 'create_client') {
                setClientFormData({
                    name: '', company: '', email: '', phone: '', whatsapp: '',
                    address: '', city: '', country: 'Pakistan', contract_file: '', is_active: true,
                });
            } else if (mode === 'edit_client' && item) {
                setClientFormData({ ...item });
            }
        }
        setShowModal(true);
    };

    // Close Modal
    const closeModal = () => {
        setShowModal(false);
        setModalMode('');
        setSelectedProject(null);
        setSelectedClient(null); // Clear selected client
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
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(dataToSubmit),
                });
            } else if (modalMode === 'edit' && selectedProject) {
                response = await fetch(`${API_BASE_URL}/project/update/${selectedProject.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                body: JSON.stringify(dataToSubmit),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage('Employee assigned to project successfully!', 'success');
            if (selectedProject) {
                fetchAssignedEmployees(selectedProject.id);
            }
            setAssignmentFormData({
                project_id: selectedProject ? selectedProject.id : '', employee_id: '',
                role_in_project: '', assigned_date: new Date().toISOString().split('T')[0],
            });
            setValidationErrors({});
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
            const response = await fetch(`${API_BASE_URL}/project/assign/remove/${projectAssignmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage('Employee deassigned successfully!', 'success');
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

    // New: Handle Add Client Submission
    const handleAddClient = async (e) => {
        e.preventDefault();
        const errors = validateClientForm(clientFormData);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showToastMessage('Please correct the form errors.', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/client/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                body: JSON.stringify(clientFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage('Client added successfully!', 'success');
            closeModal();
            fetchClients(); // Re-fetch clients to update the list
        } catch (err) {
            console.error('Failed to add client:', err);
            setError(`Failed to add client: ${err.message}`);
            showToastMessage(`Failed to add client: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // New: Handle Edit Client Submission
    const handleEditClient = async (e) => {
        e.preventDefault();
        if (!selectedClient) return;
        
        const errors = validateClientForm(clientFormData);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showToastMessage('Please correct the form errors.', 'error');
            return;
        } 
     console.log("clients data sending to backend ",clientFormData);
        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/client/edit/${selectedClient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                body: JSON.stringify(clientFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage('Client updated successfully!', 'success');
            closeModal();
            fetchClients(); // Re-fetch clients to update the list
        } catch (err) {
            console.error('Failed to edit client:', err);
            setError(`Failed to edit client: ${err.message}`);
            showToastMessage(`Failed to edit client: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // New: Handle Delete Client
    const handleDeleteClient = async () => {
        if (!selectedClient) return;

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/client/delete/${selectedClient.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage('Client deleted successfully!', 'success');
            closeModal();
            fetchClients(); // Re-fetch clients to update the list
        } catch (err) {
            console.error('Failed to delete client:', err);
            setError(`Failed to delete client: ${err.message}`);
            showToastMessage('Failed to delete client.', 'error');
        } finally {
            setLoading(false);
        }
    };


    // Render Modal Content
    const renderModalContent = () => {
        // Determine if the current modal is a client-related form
        const isClientFormModal = modalMode === 'create_client' || modalMode === 'edit_client';
        // Conditionally apply a class for client forms to adjust width
        const modalContentClasses = `modal-content animate-scaleIn ${isClientFormModal ? 'modal-content-client' : ''}`;

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
                                    type="text" id="title" name="title" value={formData.title}
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
                                    id="client_id" name="client_id" value={formData.client_id}
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
                                    id="status" name="status" value={formData.status}
                                    onChange={handleChange} className="form-select"
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
                                    type="date" id="start_date" name="start_date" value={formData.start_date}
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
                                    type="date" id="end_date" name="end_date" value={formData.end_date}
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
                                    type="number" id="budget" name="budget" value={formData.budget}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.budget ? 'input-error' : ''}`}
                                    required step="0.01" min="0"
                                />
                                {validationErrors.budget && <p className="error-message">{validationErrors.budget}</p>}
                            </div>
                            {/* Description */}
                            <div className="form-group form-group-full">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description" name="description" value={formData.description}
                                    onChange={handleChange} rows="3" className="form-textarea"
                                ></textarea>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" onClick={closeModal} className="button button-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="button button-primary" disabled={loading}>
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
                            <button type="button" onClick={closeModal} className="button button-secondary">
                                Cancel
                            </button>
                            <button type="button" onClick={handleDeleteProject} className="button button-danger" disabled={loading}>
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
                                        id="employee_id" name="employee_id" value={assignmentFormData.employee_id}
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
                                        type="text" id="role_in_project" name="role_in_project"
                                        value={assignmentFormData.role_in_project} onChange={handleAssignmentChange}
                                        className={`form-input ${validationErrors.role_in_project ? 'input-error' : ''}`}
                                        required
                                    />
                                    {validationErrors.role_in_project && <p className="error-message">{validationErrors.role_in_project}</p>}
                                </div>
                                {/* Assigned Date */}
                                <div className="form-group">
                                    <label htmlFor="assigned_date">Assigned Date</label>
                                    <input
                                        type="date" id="assigned_date" name="assigned_date"
                                        value={assignmentFormData.assigned_date} onChange={handleAssignmentChange}
                                        className={`form-input ${validationErrors.assigned_date ? 'input-error' : ''}`}
                                        required
                                    />
                                    {validationErrors.assigned_date && <p className="error-message">{validationErrors.assigned_date}</p>}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="button button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="button button-primary" disabled={loading}>
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
                                            <th style={{ width: '80px' }}>Actions</th>
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
                            <button type="button" onClick={closeModal} className="button button-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                );
            // New: Client Modals
            case 'create_client':
            case 'edit_client':
                const isEditClient = modalMode === 'edit_client';
                return (
                    <form onSubmit={isEditClient ? handleEditClient : handleAddClient} className="modal-form">
                        <h2 className="modal-title">
                            {isEditClient ? 'Edit Client' : 'Add New Client'}
                        </h2>
                        <div className="form-grid">
                            <div className="form-group form-group-full">
                                <label htmlFor="clientName">Client Name</label>
                                <input
                                    type="text" id="clientName" name="name" value={clientFormData.name}
                                    onChange={handleClientChange}
                                    className={`form-input ${validationErrors.name ? 'input-error' : ''}`}
                                    required
                                />
                                {validationErrors.name && <p className="error-message">{validationErrors.name}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="clientCompany">Company</label>
                                <input
                                    type="text" id="clientCompany" name="company" value={clientFormData.company}
                                    onChange={handleClientChange} className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="clientEmail">Email</label>
                                <input
                                    type="email" id="clientEmail" name="email" value={clientFormData.email}
                                    onChange={handleClientChange}
                                    className={`form-input ${validationErrors.email ? 'input-error' : ''}`}
                                    required
                                />
                                {validationErrors.email && <p className="error-message">{validationErrors.email}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="clientPhone">Phone</label>
                                <input
                                    type="tel" id="clientPhone" name="phone" value={clientFormData.phone}
                                    onChange={handleClientChange}
                                    className={`form-input ${validationErrors.phone ? 'input-error' : ''}`}
                                />
                                {validationErrors.phone && <p className="error-message">{validationErrors.phone}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="clientWhatsapp">WhatsApp</label>
                                <input
                                    type="tel" id="clientWhatsapp" name="whatsapp" value={clientFormData.whatsapp}
                                    onChange={handleClientChange}
                                    className={`form-input ${validationErrors.whatsapp ? 'input-error' : ''}`}
                                />
                                {validationErrors.whatsapp && <p className="error-message">{validationErrors.whatsapp}</p>}
                            </div>
                            <div className="form-group form-group-full">
                                <label htmlFor="clientAddress">Address</label>
                                <textarea
                                    id="clientAddress" name="address" value={clientFormData.address}
                                    onChange={handleClientChange} rows="2" className="form-textarea"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="clientCity">City</label>
                                <input
                                    type="text" id="clientCity" name="city" value={clientFormData.city}
                                    onChange={handleClientChange} className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="clientCountry">Country</label>
                                <input
                                    type="text" id="clientCountry" name="country" value={clientFormData.country}
                                    onChange={handleClientChange} className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="clientContractFile">Contract File URL</label>
                                <input
                                    type="text" id="clientContractFile" name="contract_file" value={clientFormData.contract_file}
                                    onChange={handleClientChange} className="form-input"
                                />
                            </div>
                            <div className="form-group form-group-full checkbox-group">
                                <input
                                    type="checkbox" id="clientIsActive" name="is_active" checked={clientFormData.is_active}
                                    onChange={handleClientChange} className="form-checkbox"
                                />
                                <label htmlFor="clientIsActive">Is Active</label>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" onClick={closeModal} className="button button-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="button button-primary" disabled={loading}>
                                {loading ? 'Saving...' : (isEditClient ? 'Update Client' : 'Add Client')}
                            </button>
                        </div>
                    </form>
                );
            case 'delete_client':
                return (
                    <div className="delete-modal-content">
                        <h2 className="modal-title">Confirm Client Deletion</h2>
                        <p className="modal-text">
                            Are you sure you want to delete client{' '}
                            <span className="project-title-display">"{selectedClient?.name}"</span> (ID: {selectedClient?.id})?
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button type="button" onClick={closeModal} className="button button-secondary">
                                Cancel
                            </button>
                            <button type="button" onClick={handleDeleteClient} className="button button-danger" disabled={loading}>
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading && !projects.length && !clients.length && !error) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading data...</p>
            </div>
        );
    }

    if (error && !projects.length && !clients.length) {
        return (
            <div className="error-container">
                <AlertCircle size={48} className="error-icon" />
                <p className="error-message-large">Error: {error}</p>
                <button
                    onClick={() => { fetchProjects(); fetchClients(); }} // Retry both fetches
                    className="button button-primary"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="project-management-container">
            <h1 className="main-title">Project & Client Management</h1>

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

            {/* Project Management Section */}
            <div className="section-header-with-button">
                <h2 className="section-title">Project Management</h2>
                <button
                    onClick={() => openModal('create')}
                    className="button button-primary add-project-button"
                >
                    <Plus size={20} className="button-icon" /> Add New Project
                </button>
            </div>

            {projects.length === 0 && !loading && !error && (modalMode !== 'create' && modalMode !== 'edit') ? (
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
                                                className="action-button button-secondary"
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

            {/* New: Client Management Section */}
            <div className="section-header-with-button" style={{ marginTop: '3rem' }}>
                <h2 className="section-title">Client Management</h2>
                <button
                    onClick={() => openModal('create_client')}
                    className="button button-primary add-project-button"
                >
                    <Plus size={20} className="button-icon" /> Add New Client
                </button>
            </div>

            {clients.length === 0 && !loading && !error && (modalMode !== 'create_client' && modalMode !== 'edit_client') ? (
                <div className="no-data-found">
                    <p>No clients found. Click "Add New Client" to get started!</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="table-header">Client ID</th>
                                <th className="table-header">Name</th>
                                <th className="table-header">Company</th>
                                <th className="table-header">Email</th>
                                <th className="table-header">Phone</th>
                                <th className="table-header">City</th>
                                <th className="table-header">Country</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id} className="table-row">
                                    <td className="table-data font-medium">{client.id}</td>
                                    <td className="table-data">{client.name}</td>
                                    <td className="table-data">{client.company || 'N/A'}</td>
                                    <td className="table-data">{client.email}</td>
                                    <td className="table-data">{client.phone || client.whatsapp || 'N/A'}</td>
                                    <td className="table-data">{client.city || 'N/A'}</td>
                                    <td className="table-data">{client.country || 'N/A'}</td>
                                    <td className="table-data">
                                        <span className={`status-badge status-${client.is_active ? 'completed' : 'cancelled'}`}>
                                            {client.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="table-data table-actions">
                                        <div className="action-buttons-group">
                                            <button
                                                onClick={() => openModal('edit_client', client)}
                                                className="action-button edit-button"
                                                title="Edit Client"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal('delete_client', client)}
                                                className="action-button delete-button"
                                                title="Delete Client"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            {client.contract_file && (
                                                <a
                                                    href={client.contract_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="action-button button-secondary"
                                                    title="View Contract"
                                                >
                                                    <Building size={18} /> {/* Using Building icon for contract */}
                                                </a>
                                            )}
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
                    {/* The class is now dynamically applied here */}
                    <div className={renderModalContent()?.props?.className?.includes('modal-content-client') ? 'modal-content animate-scaleIn modal-content-client' : 'modal-content animate-scaleIn'}>
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
