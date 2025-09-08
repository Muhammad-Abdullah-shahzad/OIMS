// EmployeeManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Assuming you have lucide-react installed for icons
import { Plus, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import "../styles/employeeModule.css"

import EmployeeProfile from '../EmployeeProfile/EmployeeProfile.jsx';

import EmployeeProfileCard from '../EmployeeProfile/EmployeeProfileCard.jsx';

import ImageUploaderComponent from '../EmployeeProfile/EmployeeProfileUploader.jsx';

import Table from '../Table/Table.jsx';
// --- Utility Functions (could be in a separate utils file) ---

const validateEmployeeForm = (formData) => {
    const errors = {};
    if (!formData.firstName) errors.firstName = 'First Name is required.';
    if (!formData.lastName) errors.lastName = 'Last Name is required.';
    if (!formData.designation) errors.designation = 'Designation is required.';
    // Ensure salary is a number and greater than 0, allowing 0 if appropriate for your business logic
    if (isNaN(parseFloat(formData.salary)) || parseFloat(formData.salary) < 0) {
        errors.salary = 'Valid Salary is required and must be a non-negative number.';
    }
    // if (!formData.employee_id) errors.employee_id = 'Employee ID is required.';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format.';
    if (formData.phoneNumber && !/^\+?[0-9\s-]{7,20}$/.test(formData.phoneNumber)) errors.phoneNumber = 'Invalid phone number format.';
    if (formData.cnic && !/^[0-9]{5}-?[0-9]{7}-?[0-9]{1}$/.test(formData.cnic)) errors.cnic = 'Invalid CNIC format (e.g., 12345-1234567-1).';
    if (formData.hire_date && isNaN(new Date(formData.hire_date).getTime())) errors.hire_date = 'Invalid hire date.'; // Use getTime() to check for valid date

    return errors;
};

// --- EmployeeManagement Component ---
const EmployeeManagement = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [designations, setDesignations] = useState([]); // New state for designations
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState(''); // 'create', 'edit', 'delete', 'designation'
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
        location: '',
        department: '',
        bank_name: '',
        is_active:1
    });

    // New states for allowances and resources
    const [allowances, setAllowances] = useState({});
    const [resources, setResources] = useState({});
    const [currentAllowanceName, setCurrentAllowanceName] = useState('');
    const [currentAllowanceAmount, setCurrentAllowanceAmount] = useState('');
    const [currentResourceName, setCurrentResourceName] = useState('');

    const [validationErrors, setValidationErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // New state for adding/deleting designations
    const [newDesignationTitle, setNewDesignationTitle] = useState('');
    const [newDesignationDescription, setNewDesignationDescription] = useState('');
    const [designationErrors, setDesignationErrors] = useState({});
        // state of current profile clicked
        const [currentProfile,setCurrentProfile] = useState({
            profile_id:null,
            employeeId:null
        });
        
        // New states for profile card
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [profileCardEmployee, setProfileCardEmployee] = useState(null);
    const [showImageUploader,setImageUploader] = useState(false);

    // Base URL for your Express.js API
    const API_BASE_URL = 'http://localhost:5000/employee'; // Adjust if your API is on a different base path

    const openProfileCard = (employee) => {
        setProfileCardEmployee(employee);
        setShowProfileCard(true);
    };

    const closeProfileCard = () => {
        setShowProfileCard(false);
        setProfileCardEmployee(null);
    };

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
                throw await response.json();
            }
            let data = await response.json();
            data = data.map((item)=>{
                item.id= "ORA-" + item.id;

                return item;
            })
            setEmployees(data);
            console.log("employees date comming from backend " , data);
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            console.error('Failed to fetch employees:', err);
            setError('Failed to load employees. Please try again.');
            showToastMessage('Failed to load employees.', 'error');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Fetch Designations
    const fetchDesignations = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/designation`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            const data = await response.json();
            setDesignations(data);
        } catch (err) {
            if (err.tokenVerified === false) {
                navigate("/login");
            }
            console.error('Failed to fetch designations:', err);
            showToastMessage('Failed to load designations.', 'error');
        }
    }, [navigate]);

    useEffect(() => {
        fetchEmployees();
        fetchDesignations();
    }, [fetchEmployees, fetchDesignations]);

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

    // Handle adding a new allowance
    const handleAddAllowance = () => {
        if (currentAllowanceName && currentAllowanceAmount) {
            setAllowances(prev => ({
                ...prev,
                [currentAllowanceName]: parseFloat(currentAllowanceAmount)
            }));
            setCurrentAllowanceName('');
            setCurrentAllowanceAmount('');
        }
    };

    // Handle removing an allowance
    const handleRemoveAllowance = (name) => {
        setAllowances(prev => {
            const newAllowances = { ...prev };
            delete newAllowances[name];
            return newAllowances;
        });
    };

    // Handle adding a new resource
    const handleAddResource = () => {
        if (currentResourceName) {
            setResources(prev => ({
                ...prev,
                [currentResourceName]: true // Use a boolean to indicate presence
            }));
            setCurrentResourceName('');
        }
    };

    // Handle removing a resource
    const handleRemoveResource = (name) => {
        setResources(prev => {
            const newResources = { ...prev };
            delete newResources[name];
            return newResources;
        });
    };
    
    // Handle Add Designation
    const handleAddDesignation = async () => {
        setDesignationErrors({});
        if (!newDesignationTitle) {
            setDesignationErrors({ title: 'Designation title is required.' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/add/designation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: newDesignationTitle, description: newDesignationDescription }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            showToastMessage('Designation added successfully!', 'success');
            setNewDesignationTitle('');
            setNewDesignationDescription('');
            fetchDesignations();
        } catch (err) {
            console.error('Failed to add designation:', err);
            showToastMessage(`Failed to add designation: ${err.message || 'Unknown error'}`, 'error');
            setDesignationErrors({ title: err.message || 'Failed to add designation.' });
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete Designation
    const handleDeleteDesignation = async (designationId) => {
        if (!window.confirm("Are you sure you want to delete this designation? This cannot be undone.")) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/delete/designation/${designationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            showToastMessage('Designation deleted successfully!', 'success');
            fetchDesignations();
        } catch (err) {
            console.error('Failed to delete designation:', err);
            showToastMessage(`Failed to delete designation: ${err.message || 'Unknown error'}`, 'error');
        } finally {
            setLoading(false);
        }
    };


    // Open Modal for Create/Edit/Delete/Designation
    const openModal = (mode, employee = null) => {
        setModalMode(mode);
        setSelectedEmployee(employee);
        setValidationErrors({}); // Clear previous validation errors
        setAllowances({}); // Reset allowances state
        setResources({}); // Reset resources state
        setDesignationErrors({}); // Clear designation errors

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
                location: '',
                department: '',
                bank_name: ''
            })
        } else if (mode === 'edit' && employee) {
            // console.log("employee data you want to edit " , employee);
            // Format hire_date for input[type="date"]
            const formattedHireDate = employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : '';
            // Ensure salary is a string for the input field, even if it's a number from the API
            setFormData({ 
                ...employee, 
                hire_date: formattedHireDate, 
                salary: employee.salary != null ? String(employee.salary) : ''
            });

            // Set allowances and resources from the employee data
            try {
                if (employee.alownces) {
                    // console.log("date type of alownces " ,typeof employee.alownces);
                    // setAllowances(JSON.parse(employee.alownces));
                    setAllowances(employee.alownces);
                }
                if (employee.resources) {
                    // Assuming resources is stored as a simple JSON object like { "Laptop": true, "Mobile Phone": true }
                    // console.log("date type of resources " ,typeof employee.resources);
                   
                    // setResources(JSON.parse(employee.resources));
                    setResources(employee.resources);
                }
            } catch (e) {
                console.error("Failed to parse JSON for allowances or resources", e);
            }
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

        // Add allowances and resources to the data to submit
        dataToSubmit.alownces = JSON.stringify(allowances);
        dataToSubmit.resources = JSON.stringify(resources);

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
                response = await fetch(`${API_BASE_URL}/update/${parseInt(selectedEmployee.id.slice(4))}`, {
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
                throw errorData;
            }

            showToastMessage(`Employee ${modalMode === 'create' ? 'added' : 'updated'} successfully!`, 'success');
            closeModal();
            fetchEmployees(); // Re-fetch data to update the list
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
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
                throw errorData;
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
                                <select
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.designation ? 'input-error' : ''}`}
                                    required
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map((designation) => (
                                        <option key={designation.id} value={designation.title}>
                                            {designation.title}
                                        </option>
                                    ))}
                                </select>
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
                                   required
                                    type="date"
                                    id="hire_date"
                                    name="hire_date"
                                    value={formData.hire_date}
                                    onChange={handleChange}
                                    className={`form-input ${validationErrors.hire_date ? 'input-error' : ''}`}
                                />
                                {validationErrors.hire_date && <p className="error-message">{validationErrors.hire_date}</p>}
                            </div>

                             {/* Location */}
                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <select
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Select Location</option>
                                    <option value="onsite">Onsite</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                            {/* Department */}
                            <div className="form-group">
                                <label htmlFor="department">Department</label>
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Select Department</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Human Resources">Human Resources</option>
                                    <option value="Finance">Finance</option>
                                </select>
                            </div>
                            {/* Bank Name */}
                            <div className="form-group">
                                <label htmlFor="bank_name">Bank Name</label>
                                <select
                                    id="bank_name"
                                    name="bank_name"
                                    value={formData.bank_name}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Select Bank</option>
                                    <option value="HBL">HBL</option>
                                    <option value="Meezan Bank">Meezan Bank</option>
                                    <option value="Allied Bank">Allied Bank</option>
                                    <option value="Bank Alfalah">Bank Alfalah</option>
                                    <option value="MCB Bank">MCB Bank</option>
                                </select>
                            </div>
                            {/* Employee Status */}
                            <div className="form-group">
                                {console.log(formData)}
                                <label htmlFor="is_active">Employee Status</label>
                                <select
                                    id="is_active"
                                    name="is_active"
                                    value={formData.is_active}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Select Status</option>
                                    <option value="1">Active</option>
                                    <option value="0">In Active</option>
                                
                                </select>
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

                            {/* Allowances Section */}
                            <div className="form-group-full">
                                <label>Allowances</label>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="form-input flex-grow"
                                        value={currentAllowanceName}
                                        onChange={(e) => setCurrentAllowanceName(e.target.value)}
                                    >
                                        <option value="">Select Allowance</option>
                                        <option value="House Allowance">House Allowance</option>
                                        <option value="Travel Allowance">Travel Allowance</option>
                                        <option value="Medical Allowance">Medical Allowance</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        className="form-input w-28"
                                        value={currentAllowanceAmount}
                                        onChange={(e) => setCurrentAllowanceAmount(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddAllowance}
                                        className="button button-primary px-3 py-1 text-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {Object.entries(allowances).map(([name, amount]) => (
                                        <div key={name} className="badge-item bg-blue-100 text-blue-800 flex items-center gap-1">
                                            <span>{name}: ${amount}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveAllowance(name)}
                                                className="remove-button text-blue-600 hover:text-blue-900"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Resources Section */}
                            <div className="form-group-full">
                                <label>Resources</label>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="form-input flex-grow"
                                        value={currentResourceName}
                                        onChange={(e) => setCurrentResourceName(e.target.value)}
                                    >
                                        <option value="">Select Resource</option>
                                        <option value="Laptop">Laptop</option>
                                        <option value="Mobile Phone">Mobile Phone</option>
                                        <option value="Tablet">Tablet</option>
                                        <option value="Company Vehicle">Company Vehicle</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleAddResource}
                                        className="button button-primary px-3 py-1 text-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {Object.keys(resources).map(name => (
                                        <div key={name} className="badge-item bg-green-100 text-green-800 flex items-center gap-1">
                                            <span>{name}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveResource(name)}
                                                className="remove-button text-green-600 hover:text-green-900"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
                            <span className="employee-name">{selectedEmployee?.firstName} {selectedEmployee?.lastName}</span> (ID: {selectedEmployee?.id})?
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
            case 'designations':
                return (
                    <div className="designation-management-modal">
                        <h2 className="modal-title">Manage Designations</h2>
                        <div className="designation-form-section">
                            <div className="form-group">
                                <label htmlFor="newDesignationTitle">New Designation Title</label>
                                <input
                                    type="text"
                                    id="newDesignationTitle"
                                    value={newDesignationTitle}
                                    onChange={(e) => setNewDesignationTitle(e.target.value)}
                                    className={`form-input ${designationErrors.title ? 'input-error' : ''}`}
                                    placeholder="e.g., Senior Software Engineer"
                                />
                                {designationErrors.title && <p className="error-message">{designationErrors.title}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="newDesignationDescription">Description (Optional)</label>
                                <textarea
                                    id="newDesignationDescription"
                                    value={newDesignationDescription}
                                    onChange={(e) => setNewDesignationDescription(e.target.value)}
                                    className="form-input"
                                    rows="2"
                                    placeholder="Brief description of the role."
                                ></textarea>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddDesignation}
                                className="button button-primary mt-2"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Designation'}
                            </button>
                        </div>
                        <div className="designation-list-section mt-4">
                            <h3 className="list-title">Existing Designations</h3>
                            {designations.length === 0 ? (
                                <p className="no-designations-found">No designations found.</p>
                            ) : (
                                <ul className="designation-list">
                                    {designations.map((designation) => (
                                        <li key={designation.id} className="designation-list-item">
                                            <span>{designation.title}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDesignation(designation.id)}
                                                className="action-button delete-button"
                                                title="Delete Designation"
                                                disabled={loading}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
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
                 <button
                    onClick={() => openModal('designations')}
                    className="button designation-button"
                >
                    <Edit size={20} className="button-icon " /> Manage Designations
                </button>
            </div>
     {console.log(employees)}
            {employees.length === 0 && !loading && !error ? (
                <div className="no-employees-found">
                    <p className="no-employees-text">No employees found. Click "Add New Employee" to get started!</p>
                </div>
            ) : (
              <Table
              showProfile={true}
              onProfileClick={
                (i) => {
                    setCurrentProfile({
                      ...currentProfile,
                      employeeId: employees[i].id,
                      profile_id: employees[i].profile_id,
                    });
                    openProfileCard(employees[i]);
                  }}
              data={employees}
              thead={["EmployeeId","First Name","Last Name","Designation","Salary","Department","Email","Allownces","Resources","cnic","hire date", "Bank Account","Actions"]}
               datakeys = {[
              "id",   // EmployeeId
                "firstName",     // First Name
                "lastName",      // Last Name
                "designation",
                'salary',   // Designation
                "department",    // Department
                "email",         // Email
                "alownces",      // Allownces
                "resources",     // Resources
                "cnic",          // cnic
                "hire_date",     // hire date
                "bank_account"   // Bank Account
              ]}
              
               actions={{
                edit:true,
                onEditClick:(employeeNo) => openModal("edit", employees[employeeNo]),
                del:true,
                onDeleteClick:(employeeNo) => openModal("delete", employees[employeeNo])
               }}  
              /> 
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
            
            {showProfileCard && (
                <EmployeeProfileCard 
                    employee={profileCardEmployee} 
                    onClose={closeProfileCard}
                    onProfileClick={()=>{
                        closeProfileCard();
                        setImageUploader(true);
                    }}
                />
            )}
           { showImageUploader && (
                <ImageUploaderComponent 
                onUploadSuccess = {()=> {
                  fetchEmployees();
                }}
                 onCancel={()=>{
                    setImageUploader(false)
                 }}
                 profileData={currentProfile}
                 />
            )}
        </div>
    );
};

export default EmployeeManagement;