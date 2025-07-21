import React, { useState, useEffect, useCallback } from 'react';
// Assuming you have lucide-react installed for icons
import { Plus, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/employeeModule.css'; // Import the vanilla CSS file

// --- Utility Functions (could be in a separate utils file) ---
const validateEmployeeForm = (formData) => {
    const errors = {};
    if (!formData.firstName) errors.firstName = 'First Name is required.';
    if (!formData.lastName) errors.lastName = 'Last Name is required.';
    if (!formData.designation) errors.designation = 'Designation is required.';
    // Ensure salary is a number and greater than 0, allowing 0 if appropriate for your business logic
    if (isNaN(parseFloat(formData.salary)) || parseFloat(formData.salary) < 0) { // Changed to < 0 to allow 0 salary if needed
        errors.salary = 'Valid Salary is required and must be a non-negative number.';
    }
    if (!formData.employee_id) errors.employee_id = 'Employee ID is required.';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format.';
    if (formData.phoneNumber && !/^\+?[0-9\s-]{7,20}$/.test(formData.phoneNumber)) errors.phoneNumber = 'Invalid phone number format.';
    if (formData.cnic && !/^[0-9]{5}-?[0-9]{7}-?[0-9]{1}$/.test(formData.cnic)) errors.cnic = 'Invalid CNIC format (e.g., 12345-1234567-1).';
    if (formData.hire_date && isNaN(new Date(formData.hire_date).getTime())) errors.hire_date = 'Invalid hire date.'; // Use getTime() to check for valid date

    return errors;
};

// --- EmployeeManagement Component ---
const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState(''); // 'create', 'edit', 'delete'
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: '',
        firstName: '',
        lastName: '',
        designation: '',
        email: '',
        phoneNumber: '',
        cnic: '',
        address: '',
        salary: '', // Keep as string for input, convert to number before sending
        bank_account: '',
        hire_date: '',
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // Base URL for your Express.js API
    const API_BASE_URL = 'http://localhost:5000/employee'; // Adjust if your API is on a different base path

    // Fetch Employees
    const fetchEmployees = useCallback(async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/all`,{
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
            setError('Failed to load employees. Please try again.');
            showToastMessage('Failed to load employees.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

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

    // Handle Form Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        // For salary, ensure it's either a valid number string or an empty string
        // We'll parse it to a float just before sending to the API in handleSubmit
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error for the field as user types
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Open Modal for Create/Edit/Delete
    const openModal = (mode, employee = null) => {
        setModalMode(mode);
        setSelectedEmployee(employee);
        setValidationErrors({}); // Clear previous validation errors
        if (mode === 'create') {
            setFormData({
                employee_id: '',
                firstName: '',
                lastName: '',
                designation: '',
                email: '',
                phoneNumber: '',
                cnic: '',
                address: '',
                salary: '', // Keep as empty string for new employee
                bank_account: '',
                hire_date: '',
            });
        } else if (mode === 'edit' && employee) {
            // Format hire_date for input[type="date"]
            const formattedHireDate = employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : '';
            // Ensure salary is a string for the input field, even if it's a number from the API
            setFormData({ 
                ...employee, 
                hire_date: formattedHireDate, 
                salary: employee.salary != null ? String(employee.salary) : '' // Convert to string, handle null/undefined
            });
        }
        setShowModal(true);
    };

    // Close Modal
    const closeModal = () => {
        setShowModal(false);
        setModalMode('');
        setSelectedEmployee(null);
        setValidationErrors({});
    };

    // Handle Create/Update Employee Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare data for submission, converting salary to a number or null
        const dataToSubmit = { ...formData };
        if (dataToSubmit.salary === '') {
            dataToSubmit.salary = null; // Send null if empty, assuming your DB allows NULL
        } else {
            dataToSubmit.salary = parseFloat(dataToSubmit.salary);
        }

        const errors = validateEmployeeForm(dataToSubmit); // Validate the prepared data
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
                response = await fetch(`${API_BASE_URL}/add`, {
                    method: 'POST',
                    headers: { 
                    'Content-Type': 'application/json',
                    "Authorization":`Bearer ${token}`
                 },
                    body: JSON.stringify(dataToSubmit), // Use dataToSubmit
                });
            } else if (modalMode === 'edit' && selectedEmployee) {
                
                // console.log("data that we are sending to update employee route",dataToSubmit); // Use dataToSubmit
                const token = localStorage.token
                // console.log("selected employee ",selectedEmployee);
                response = await fetch(`${API_BASE_URL}/update/${parseInt(selectedEmployee.id)}`, {
                    method: 'PUT',
                    headers: { 
                    'Content-Type': 'application/json',
                    "Authorization":`Bearer ${token}`
                 },
                    body: JSON.stringify(dataToSubmit), // Use dataToSubmit
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage(`Employee ${modalMode === 'create' ? 'added' : 'updated'} successfully!`, 'success');
            closeModal();
            fetchEmployees(); // Re-fetch data to update the list
        } catch (err) {
            console.error(`Failed to ${modalMode} employee:`, err);
            setError(`Failed to ${modalMode} employee: ${err.message}`);
            showToastMessage(`Failed to ${modalMode} employee.`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete Employee
    const handleDelete = async () => {
        if (!selectedEmployee) return;

        setLoading(true);
        try {
            const token = localStorage.token;
            
            const response = await fetch(`${API_BASE_URL}/remove/${selectedEmployee.id}`, {
                method: 'DELETE',
                headers: { // DELETE requests can also have headers
                    'Authorization': `Bearer ${token}`,
                   
                }
               
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToastMessage('Employee deleted successfully!', 'success');
            closeModal();
            fetchEmployees(); // Re-fetch data to update the list
        } catch (err) {
            console.error('Failed to delete employee:', err);
            setError(`Failed to delete employee: ${err.message}`);
            showToastMessage('Failed to delete employee.', 'error');
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
                    <form onSubmit={handleSubmit} className="modal-form">
                        <h2 className="modal-title">
                            {modalMode === 'create' ? 'Add New Employee' : 'Edit Employee'}
                        </h2>
                        <div className="form-grid">
                            {/* Employee ID */}
                            <div className="form-group">
                                <label htmlFor="employee_id">Employee ID</label>
                                <input
                                    type="text"
                                    id="employee_id"
                                    name="employee_id"
                                    value={formData.employee_id}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.employee_id ? 'input-error' : ''}`}
                                    required
                                />
                                {validationErrors.employee_id && <p className="error-message">{validationErrors.employee_id}</p>}
                            </div>
                            {/* First Name */}
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.firstName ? 'input-error' : ''}`}
                                    required
                                />
                                {validationErrors.firstName && <p className="error-message">{validationErrors.firstName}</p>}
                            </div>
                            {/* Last Name */}
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.lastName ? 'input-error' : ''}`}
                                    required
                                />
                                {validationErrors.lastName && <p className="error-message">{validationErrors.lastName}</p>}
                            </div>
                            {/* Designation */}
                            <div className="form-group">
                                <label htmlFor="designation">Designation</label>
                                <input
                                    type="text"
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.designation ? 'input-error' : ''}`}
                                    required
                                />
                                {validationErrors.designation && <p className="error-message">{validationErrors.designation}</p>}
                            </div>
                            {/* Email */}
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.email ? 'input-error' : ''}`}
                                />
                                {validationErrors.email && <p className="error-message">{validationErrors.email}</p>}
                            </div>
                            {/* Phone Number */}
                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.phoneNumber ? 'input-error' : ''}`}
                                />
                                {validationErrors.phoneNumber && <p className="error-message">{validationErrors.phoneNumber}</p>}
                            </div>
                            {/* CNIC */}
                            <div className="form-group">
                                <label htmlFor="cnic">CNIC</label>
                                <input
                                    type="text"
                                    id="cnic"
                                    name="cnic"
                                    value={formData.cnic}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.cnic ? 'input-error' : ''}`}
                                />
                                {validationErrors.cnic && <p className="error-message">{validationErrors.cnic}</p>}
                            </div>
                            {/* Salary */}
                            <div className="form-group">
                                <label htmlFor="salary">Salary</label>
                                <input
                                    type="number"
                                    id="salary"
                                    name="salary"
                                    value={formData.salary} // Keep as string for input
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.salary ? 'input-error' : ''}`}
                                    required
                                    step="0.01"
                                />
                                {validationErrors.salary && <p className="error-message">{validationErrors.salary}</p>}
                            </div>
                            {/* Bank Account */}
                            <div className="form-group">
                                <label htmlFor="bank_account">Bank Account</label>
                                <input
                                    type="text"
                                    id="bank_account"
                                    name="bank_account"
                                    value={formData.bank_account}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            {/* Hire Date */}
                            <div className="form-group">
                                <label htmlFor="hire_date">Hire Date</label>
                                <input
                                    type="date"
                                    id="hire_date"
                                    name="hire_date"
                                    value={formData.hire_date}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.hire_date ? 'input-error' : ''}`}
                                />
                                {validationErrors.hire_date && <p className="error-message">{validationErrors.hire_date}</p>}
                            </div>
                            {/* Address */}
                            <div className="form-group-full">
                                <label htmlFor="address">Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="form-input"
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
                                {loading ? 'Saving...' : (modalMode === 'create' ? 'Add Employee' : 'Update Employee')}
                            </button>
                        </div>
                    </form>
                );
            case 'delete':
                return (
                    <div className="delete-modal-content">
                        <h2 className="modal-title">Confirm Deletion</h2>
                        <p className="modal-text">
                            Are you sure you want to delete employee{' '}
                            <span className="employee-name">{selectedEmployee?.firstName} {selectedEmployee?.lastName}</span> (ID: {selectedEmployee?.employee_id})?
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
                                onClick={handleDelete}
                                className="button button-danger"
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading && !employees.length && !error) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading employees...</p>
            </div>
        );
    }

    if (error && !employees.length) {
        return (
            <div className="error-container">
                <AlertCircle size={48} className="error-icon" />
                <p className="error-message-large">Error: {error}</p>
                <button
                    onClick={fetchEmployees}
                    className="button button-primary"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="employee-management-container">
            <h1 className="main-title">Employee Management</h1>

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

            <div className="add-employee-section">
                <button
                    onClick={() => openModal('create')}
                    className="button button-primary add-employee-button"
                >
                    <Plus size={20} className="button-icon" /> Add New Employee
                </button>
            </div>

            {employees.length === 0 && !loading && !error ? (
                <div className="no-employees-found">
                    <p className="no-employees-text">No employees found. Click "Add New Employee" to get started!</p>
                </div>
            ) : (
                <div className="employee-table-container">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th className="table-header rounded-tl">Employee ID</th>
                                <th className="table-header">Name</th>
                                <th className="table-header">Designation</th>
                                <th className="table-header">Email</th>
                                <th className="table-header">Phone</th>
                                <th className="table-header">Salary</th>
                                <th className="table-header">Hire Date</th>
                                <th className="table-header rounded-tr">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee.id} className="table-row">
                                    <td className="table-data font-medium">{employee.employee_id}</td>
                                    <td className="table-data">{employee.firstName} {employee.lastName}</td>
                                    <td className="table-data">{employee.designation}</td>
                                    <td className="table-data">{employee.email}</td>
                                    <td className="table-data">{employee.phoneNumber}</td>
                                    <td className="table-data">${parseFloat(employee.salary).toLocaleString()}</td>
                                    <td className="table-data">
                                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="table-data table-actions">
                                        <div className="action-buttons-group">
                                            <button
                                                onClick={() => openModal('edit', employee)}
                                                className="action-button edit-button"
                                                title="Edit Employee"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal('delete', employee)}
                                                className="action-button delete-button"
                                                title="Delete Employee"
                                            >
                                                <Trash2 size={18} />
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

export default EmployeeManagement;
