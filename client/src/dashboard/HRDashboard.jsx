import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import {
    Users, Briefcase, DollarSign, Calendar, Info, X, LayoutDashboard, UserPlus, List, PieChartIcon, BarChartIcon, CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import '../styles/employeedashboard.css'; // Import the new CSS file

// Define a color palette for charts - UPDATED
const COLORS = ['#6366F1', '#20B2AA', '#FF7F50', '#8A2BE2', '#6A5ACD', '#6B8E23', '#DC143C'];

// Utility function to format currency
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    // Ensure value is treated as a number, as it might come as a string from backend
    return parseFloat(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [allEmployees, setAllEmployees] = useState([]); // State for all employees
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [selectedSection, setSelectedSection] = useState('overview'); // State to manage active section

    const API_BASE_URL = 'http://localhost:5000/employee'; // Your API base URL

    const showToastMessage = useCallback((message, type) => {
        setToast({ show: true, message, type });
    }, []);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch dashboard data.');
            }
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
            showToastMessage('Failed to load dashboard data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToastMessage]);

    const fetchAllEmployees = useCallback(async () => {
        setLoading(true); // Set loading true when fetching all employees
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/all`, { // Endpoint /all
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            const result = await response.json();
            console.log('API call result for all employees:', result); // Add this for debugging
            setAllEmployees(result);
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            console.error('Failed to fetch all employees:', err);
            setError('Failed to load employee list. Please try again.');
            showToastMessage('Failed to load employee list.', 'error');
        } finally {
            setLoading(false); // Set loading false after this fetch completes
        }
    }, [showToastMessage]);

    useEffect(() => {
        // Fetch dashboard data when component mounts or selectedSection is overview
        if (selectedSection === 'overview') {
            fetchDashboardData();
        }
    }, [selectedSection, fetchDashboardData]); // Dependency on selectedSection to refetch if needed

    useEffect(() => {
        if (selectedSection === 'all-employees') {
            fetchAllEmployees();
        }
    }, [selectedSection, fetchAllEmployees]); // Dependency on selectedSection to refetch if needed

    // Toast message timeout
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Format monthly hired employees data for chart
    const formattedMonthlyHires = dashboardData?.monthlyHiredEmployees?.map(item => ({
        month: new Date(item.month + '-01').toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        'Hired Employees': item.hired_count
    })) || [];

    // Helper to render common loading/error/no data states
    const renderStatusContent = () => {
        if (loading) {
            return (
                <div className="dashboard-loading-container">
                    <Loader size={48} className="dashboard-spinner" />
                    <p className="dashboard-loading-text">Loading data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="dashboard-error-container">
                    <AlertCircle size={48} className="dashboard-error-icon" />
                    <p className="dashboard-error-message">Error: {error}</p>
                    <button onClick={() => {
                        if (selectedSection === 'all-employees') {
                            fetchAllEmployees();
                        } else {
                            fetchDashboardData();
                        }
                    }} className="dashboard-retry-button">
                        Retry
                    </button>
                </div>
            );
        }

        // Specific 'no data' messages when data arrays are explicitly empty after loading
        if (selectedSection === 'overview' && !dashboardData) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No dashboard data available.</p>
                </div>
            );
        }

        if (selectedSection === 'all-employees' && allEmployees.length === 0) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No employee records found.</p>
                </div>
            );
        }

        if (selectedSection === 'employees-by-designation' && (!dashboardData || !dashboardData.employeesByDesignation || dashboardData.employeesByDesignation.length === 0)) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No designation data available.</p>
                </div>
            );
        }

        if (selectedSection === 'monthly-hires' && (formattedMonthlyHires.length === 0)) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No monthly hires data available.</p>
                </div>
            );
        }

        if (selectedSection === 'recent-hires' && (!dashboardData || !dashboardData.recentHires || dashboardData.recentHires.length === 0)) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No recent hires to display.</p>
                </div>
            );
        }

        return null; // No status to show, data is ready for the selected section
    };

    // Main render function for content area
    const renderContent = () => {
        // If there's a loading/error/no-data status to show for the *current* section, render it
        const status = renderStatusContent();
        if (status) {
            return status;
        }

        // Otherwise, render the specific content for the selected section
        return (
            <>
                {/* Toast Notification - display regardless of section */}
                {toast.show && (
                    <div className={`dashboard-toast-notification ${toast.type === 'success' ? 'toast-success' : 'toast-error'} ${toast.show ? 'toast-show' : ''}`}>
                        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span>{toast.message}</span>
                        <button onClick={() => setToast({ ...toast, show: false })} className="dashboard-toast-close-button">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {selectedSection === 'overview' && dashboardData && (
                    <div className="content-section">
                        <h1 className="content-section-title">Employee Overview</h1>
                        {/* Top Level Cards */}
                        <div className="dashboard-cards-grid">
                            <div className="dashboard-card primary-card" id='card-1'>
                                <p className="card-title">Total Employees</p>
                                <div className="card-content">
                                    <Users size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.totalEmployees}</h3>
                                </div>
                            </div>

                            <div className="dashboard-card secondary-card" id='card-2'>
                                <p className="card-title">Active Employees</p>
                                <div className="card-content">
                                    <Briefcase size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.activeInactiveCount?.active || 0}</h3>
                                </div>
                            </div>

                            <div className="dashboard-card secondary-card" id='card-3'>
                                <p className="card-title">Inactive Employees</p>
                                <div className="card-content">
                                    <Briefcase size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.activeInactiveCount?.inactive || 0}</h3>
                                </div>
                            </div>

                            <div className="dashboard-card info-card" id='card-4'>
                                <p className="card-title">Min Salary</p>
                                <div className="card-content">
                                    <DollarSign size={32} className="card-icon" />
                                    <h3 className="card-value">{formatCurrency(dashboardData.salarySummary?.minSalary)}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card info-card" id='card-5'>
                                <p className="card-title">Max Salary</p>
                                <div className="card-content">
                                    <DollarSign size={32} className="card-icon" />
                                    <h3 className="card-value">{formatCurrency(dashboardData.salarySummary?.maxSalary)}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card info-card" id='card-6'>
                                <p className="card-title">Avg Salary</p>
                                <div className="card-content">
                                    <DollarSign size={32} className="card-icon" />
                                    <h3 className="card-value">{formatCurrency(dashboardData.salarySummary?.avgSalary)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedSection === 'employees-by-designation' && dashboardData && dashboardData.employeesByDesignation && dashboardData.employeesByDesignation.length > 0 && (
                    <div className="content-section">
                        <h1 className="content-section-title">Employees by Designation</h1>
                        <div className="chart-container full-width-chart">
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={dashboardData.employeesByDesignation}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="designation"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {dashboardData.employeesByDesignation.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} employees`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {selectedSection === 'monthly-hires' && formattedMonthlyHires.length > 0 && (
                    <div className="content-section">
                        <h1 className="content-section-title">Monthly Hired Employees</h1>
                        <div className="chart-container full-width-chart">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={formattedMonthlyHires}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                    <Tooltip formatter={(value) => `${value} hires`} />
                                    <Legend />
                                    <Bar dataKey="Hired Employees" fill="#4F46E5" barSize={40} radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {selectedSection === 'recent-hires' && dashboardData && dashboardData.recentHires && dashboardData.recentHires.length > 0 && (
                    <div className="content-section">
                        <h1 className="content-section-title">Recent Hires</h1>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="table-header">Employee ID</th>
                                        <th className="table-header">Name</th>
                                        <th className="table-header">Designation</th>
                                        <th className="table-header">Hire Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.recentHires.map((hire, index) => (
                                        <tr key={index} className="table-row">
                                            <td className="table-data">{hire.employee_id}</td>
                                            <td className="table-data">{hire.firstName} {hire.lastName}</td>
                                            <td className="table-data">{hire.designation}</td>
                                            <td className="table-data">
                                                {hire.hire_date ? new Date(hire.hire_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedSection === 'add-employee' && (
                    <div className="content-section">
                        <h1 className="content-section-title">Add New Employee</h1>
                        <p>This section will contain the form for adding a new employee.</p>
                        {/* Placeholder for Add Employee Form */}
                        <div className="form-placeholder">
                            <p>Employee Name: <input type="text" placeholder="Enter name" /></p>
                            <p>Designation: <input type="text" placeholder="Enter designation" /></p>
                            <button className="dashboard-button">Save Employee</button>
                        </div>
                    </div>
                )}

                {selectedSection === 'all-employees' && allEmployees.length > 0 && (
                    <div className="content-section">
                        <h1 className="content-section-title">All Employees</h1>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="table-header">ID</th>
                                        <th className="table-header">Employee ID</th>
                                        <th className="table-header">Name</th>
                                        <th className="table-header">Designation</th>
                                        <th className="table-header">Email</th>
                                        <th className="table-header">Phone</th>
                                        <th className="table-header">Hire Date</th>
                                        <th className="table-header">Salary</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {allEmployees.map((employee) => (
                                        <tr key={employee.id} className="table-row">
                                            <td className="table-data">{employee.id}</td>
                                            <td className="table-data">{employee.employee_id || 'N/A'}</td>
                                            <td className="table-data">{employee.firstName} {employee.lastName}</td>
                                            <td className="table-data">{employee.designation || 'N/A'}</td>
                                            <td className="table-data">{employee.email || 'N/A'}</td>
                                            <td className="table-data">{employee.phoneNumber || 'N/A'}</td>
                                            <td className="table-data">
                                                {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="table-data">{formatCurrency(employee.salary)}</td>
                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h3>Employee HR</h3>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'overview' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('overview')}
                            >
                                <LayoutDashboard size={20} />
                                <span>Overview</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'employees-by-designation' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('employees-by-designation')}
                            >
                                <PieChartIcon size={20} />
                                <span>By Designation</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'monthly-hires' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('monthly-hires')}
                            >
                                <BarChartIcon size={20} />
                                <span>Monthly Hires</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'recent-hires' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('recent-hires')}
                            >
                                <List size={20} />
                                <span>Recent Hires</span>
                            </button>
                        </li>
                        <hr className="sidebar-separator"/>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'add-employee' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('add-employee')}
                            >
                                <UserPlus size={20} />
                                <span>Add Employee</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'all-employees' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('all-employees')}
                            >
                                <List size={20} />
                                <span>All Employees</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="dashboard-main-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default EmployeeDashboard;