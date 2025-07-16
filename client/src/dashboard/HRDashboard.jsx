import React, { useState, useEffect, useCallback } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import {
    Users, Briefcase, DollarSign, Calendar, TrendingUp, TrendingDown,
    CheckCircle, AlertCircle, Loader, Info,X
} from 'lucide-react';
import '../styles/employeedashboard.css'; // Import the new CSS file

// Define a color palette for charts - UPDATED
const COLORS = ['#6366F1', '#20B2AA', '#FF7F50', '#8A2BE2', '#6A5ACD', '#6B8E23', '#DC143C'];


// Utility function to format currency
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return parseFloat(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const EmployeeDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

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
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch dashboard data.');
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
            showToastMessage('Failed to load dashboard data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToastMessage]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

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

    if (loading) {
        return (
            <div className="dashboard-loading-container">
                <Loader size={48} className="dashboard-spinner" />
                <p className="dashboard-loading-text">Loading dashboard...</p>
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

    if (!dashboardData) {
        return (
            <div className="dashboard-no-data">
                <Info size={48} className="dashboard-info-icon" />
                <p className="dashboard-no-data-text">No dashboard data available.</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Employee Overview Dashboard</h1>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`dashboard-toast-notification ${toast.type === 'success' ? 'toast-success' : 'toast-error'} ${toast.show ? 'toast-show' : ''}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{toast.message}</span>
                    <button onClick={() => setToast({ ...toast, show: false })} className="dashboard-toast-close-button">
                        <X size={18} />
                    </button>
                </div>
            )}

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
                        <h3 className="card-value">{dashboardData.activeInactiveCount.active}</h3>
                    </div>
                </div>

                <div className="dashboard-card secondary-card" id='card-3'>
                <p className="card-title">Inactive Employees</p>
                   
                    <div className="card-content">
                    <Briefcase size={32} className="card-icon" />
                        <h3 className="card-value">{dashboardData.activeInactiveCount.inactive}</h3>
                    </div>
                </div>

                <div className="dashboard-card info-card" id='card-4'>
                <p className="card-title">Min Salary</p>
                   
                    <div className="card-content">
                    <DollarSign size={32} className="card-icon" />
                        <h3 className="card-value">{formatCurrency(dashboardData.salarySummary.minSalary)}</h3>
                    </div>
                </div>
                <div className="dashboard-card info-card" id='card-5'>
                <p className="card-title">Max Salary</p>
                                     
                    <div className="card-content">
                    <DollarSign size={32} className="card-icon" />
                        <h3 className="card-value">{formatCurrency(dashboardData.salarySummary.maxSalary)}</h3>
                    </div>
                </div>
                <div className="dashboard-card info-card" id='card-6'>
                <p className="card-title">Avg Salary</p>
                    <div className="card-content">
                       
                    <DollarSign size={32} className="card-icon" />
                        <h3 className="card-value">{formatCurrency(dashboardData.salarySummary.avgSalary)}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="dashboard-charts-grid">
                <div className="chart-container">
                    <h3 className="chart-title">Employees by Designation</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dashboardData.employeesByDesignation}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="designation"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {dashboardData.employeesByDesignation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3 className="chart-title">Monthly Hired Employees</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={formattedMonthlyHires}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                            <Legend />
                            <Bar dataKey="Hired Employees" fill="#4F46E5" barSize={30} radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Hires Table */}
            <div className="recent-hires-table-container">
                <h3 className="recent-hires-title">Recent Hires</h3>
                {dashboardData.recentHires && dashboardData.recentHires.length > 0 ? (
                    <div className="table-responsive">
                        <table className="recent-hires-table">
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
                ) : (
                    <p className="no-recent-hires">No recent hires to display.</p>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;