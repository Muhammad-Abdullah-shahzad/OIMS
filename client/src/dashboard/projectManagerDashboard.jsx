import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell // Added for potential future use or if a pie chart makes sense for some data
} from 'recharts';
import {
    LayoutDashboard, FolderKanban, Clock, DollarSign, Users, CheckCircle, AlertCircle, Loader, Info, X,
    CalendarCheck, ClipboardList, TrendingUp // Lucide icons for new sections
} from 'lucide-react';
import '../styles/projectdashboard.css'; // New CSS file for this dashboard

// Define a color palette for charts
const COLORS = ['#6366F1', '#20B2AA', '#FF7F50', '#8A2BE2', '#6A5ACD', '#6B8E23', '#DC143C', '#F59E0B', '#10B981'];

// Utility function to format currency
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    // Ensure value is treated as a number, as it might come as a string from backend
    return parseFloat(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const ProjectDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [selectedSection, setSelectedSection] = useState('overview'); // Default section

    const API_BASE_URL = 'http://localhost:5000'; // Base URL for your API

    // Helper function to show toast messages
    const showToastMessage = useCallback((message, type) => {
        setToast({ show: true, message, type });
    }, []);

    // Function to fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log('Attempting to fetch project dashboard data...');
        try {
            const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
            console.log('Auth Token:', token ? 'Present' : 'Missing');

            const response = await fetch(`${API_BASE_URL}/project/pro-dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('API Response Status:', response.status);
            if (!response.ok) { // This checks for HTTP errors (4xx, 5xx)
                const errorData = await response.json();
                console.error('Backend Error Data:', errorData);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json(); // Parse the JSON response
            console.log('Full API Response Result:', result); // Log the entire parsed response

            // --- START OF CHANGE ---
            // The API response for pro-dashboard is a direct object, not wrapped in { success: true, data: ... }
            if (result && typeof result === 'object' && result !== null) {
                setDashboardData(result); // Directly set the result as dashboardData
                console.log('Dashboard data set:', result);
            } else {
                // This block handles cases where the response is not the expected object structure
                console.error('Unexpected data format from project dashboard API:', result);
                throw new Error('Unexpected data format from project dashboard API.');
            }
            // --- END OF CHANGE ---

        } catch (err) {
            console.error('Caught error during fetchDashboardData:', err);
            setError('Failed to load project dashboard data. Please try again.');
            showToastMessage('Failed to load dashboard data.', 'error');
        } finally {
            setLoading(false);
            console.log('Finished fetching project dashboard data. Loading set to false.');
        }
    }, [showToastMessage]);

    // Fetch data on component mount and when selectedSection changes to 'overview'
    useEffect(() => {
        if (selectedSection === 'overview') {
            fetchDashboardData();
        }
    }, [selectedSection, fetchDashboardData]);

    // Toast message timeout
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

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
                    <button onClick={fetchDashboardData} className="dashboard-retry-button">
                        Retry
                    </button>
                </div>
            );
        }

        // Specific 'no data' messages when data is explicitly empty after loading
        // This check should only happen if not loading and no error, and dashboardData is null
        if (!dashboardData) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No project dashboard data available.</p>
                </div>
            );
        }

        // Specific no data messages for individual sections if their data is empty
        if (selectedSection === 'upcoming-deadlines' && (!dashboardData.upcomingDeadlines || dashboardData.upcomingDeadlines.length === 0)) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No upcoming deadlines found.</p>
                </div>
            );
        }
        if (selectedSection === 'pending-payments' && (!dashboardData.projectsWithPendingPayments || dashboardData.projectsWithPendingPayments.length === 0)) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No projects with pending payments found.</p>
                </div>
            );
        }
        if (selectedSection === 'top-projects' && (!dashboardData.topProjectsByBudget || dashboardData.topProjectsByBudget.length === 0)) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No top projects by budget data available.</p>
                </div>
            );
        }

        return null; // No status to show, data is ready for the selected section
    };

    // Main render function for content area
    const renderContent = () => {
        const status = renderStatusContent();
        if (status) {
            return status;
        }

        // If data is available and no loading/error, render the specific content
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
                        <h1 className="content-section-title">Project Manager Dashboard</h1>
                        <div className="dashboard-cards-grid">
                            <div className="dashboard-card primary-card">
                                <p className="card-title">Total Projects</p>
                                <div className="card-content">
                                    <FolderKanban size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.totalProjects}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card secondary-card">
                                <p className="card-title">Ongoing Projects</p>
                                <div className="card-content">
                                    <Clock size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.ongoingProjects}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card success-card">
                                <p className="card-title">Completed Projects</p>
                                <div className="card-content">
                                    <CheckCircle size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.completedProjects}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card info-card">
                                <p className="card-title">Projects On Hold</p>
                                <div className="card-content">
                                    <Info size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.holdProjects}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card danger-card">
                                <p className="card-title">Cancelled Projects</p>
                                <div className="card-content">
                                    <X size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.cancelledProjects}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card primary-card">
                                <p className="card-title">Total Assigned Projects</p>
                                <div className="card-content">
                                    <Users size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.totalAssignedProjects}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card secondary-card">
                                <p className="card-title">Total Assigned Employees</p>
                                <div className="card-content">
                                    <Users size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.totalAssignedEmployees}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card info-card">
                                <p className="card-title">Total Ongoing Budget</p>
                                <div className="card-content">
                                    <DollarSign size={32} className="card-icon" />
                                    <h3 className="card-value">{formatCurrency(dashboardData.totalOngoingBudget)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedSection === 'upcoming-deadlines' && dashboardData && dashboardData.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0 && (
                    <div className="content-section">
                        <h1 className="content-section-title">Upcoming Deadlines</h1>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="table-header">Project Title</th>
                                        <th className="table-header">Client Name</th>
                                        <th className="table-header">End Date</th>
                                        <th className="table-header">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.upcomingDeadlines.map((project) => (
                                        <tr key={project.project_id} className="table-row">
                                            <td className="table-data">{project.project_title}</td>
                                            <td className="table-data">{project.client_name}</td>
                                            <td className="table-data">
                                                {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="table-data">
                                                <span className={`status-badge status-${project.status.replace('_', '-')}`}>
                                                    {project.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedSection === 'pending-payments' && dashboardData && dashboardData.projectsWithPendingPayments && dashboardData.projectsWithPendingPayments.length > 0 && (
                    <div className="content-section">
                        <h1 className="content-section-title">Projects with Pending Payments</h1>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="table-header">Project Title</th>
                                        <th className="table-header">Client Name</th>
                                        <th className="table-header">Total Budget</th>
                                        <th className="table-header">Total Paid</th>
                                        <th className="table-header">Remaining</th>
                                        <th className="table-header">Payment Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.projectsWithPendingPayments.map((project) => (
                                        <tr key={project.project_id} className="table-row">
                                            <td className="table-data">{project.project_title}</td>
                                            <td className="table-data">{project.client_name}</td>
                                            <td className="table-data">{formatCurrency(project.total_project_amount)}</td>
                                            <td className="table-data">{formatCurrency(project.total_paid_amount)}</td>
                                            <td className="table-data">{formatCurrency(project.remaining_amount)}</td>
                                            <td className="table-data">
                                                <span className={`status-badge payment-status-${project.payment_status}`}>
                                                    {project.payment_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedSection === 'top-projects' && dashboardData && dashboardData.topProjectsByBudget && dashboardData.topProjectsByBudget.length > 0 && (
                    <div className="content-section">
                        <h1 className="content-section-title">Top Projects by Budget</h1>
                        <div className="chart-container full-width-chart">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={dashboardData.topProjectsByBudget}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                    <XAxis dataKey="title" angle={-15} textAnchor="end" height={60} interval={0} /> {/* Rotate labels for long titles */}
                                    <YAxis tickFormatter={formatCurrency} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="budget" fill="#6366F1" barSize={40} radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
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
                    <h3>Project Hub</h3>
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
                                className={`sidebar-button ${selectedSection === 'upcoming-deadlines' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('upcoming-deadlines')}
                            >
                                <CalendarCheck size={20} />
                                <span>Upcoming Deadlines</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'pending-payments' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('pending-payments')}
                            >
                                <ClipboardList size={20} />
                                <span>Pending Payments</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'top-projects' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('top-projects')}
                            >
                                <TrendingUp size={20} />
                                <span>Top Projects by Budget</span>
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

export default ProjectDashboard;
