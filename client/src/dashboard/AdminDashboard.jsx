import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    LayoutDashboard, Users, Briefcase, Folder, DollarSign, TrendingUp, TrendingDown,
    Banknote, Receipt, ClipboardList, Award, Menu, X, Info, Loader, AlertCircle , CheckCircle
} from 'lucide-react';
import '../styles/adminDashboard.css'; // New CSS file for this dashboard
import { useNavigate } from 'react-router-dom';

// Define a color palette for charts - consistent with other dashboards
const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F97316', '#10B981', '#3B82F6', '#EF4444', '#6B7280', '#D97706', '#8B5CF6', '#FACC15', '#A78BFA'];

// Utility function to format currency
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return parseFloat(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Helper to get month name
const getMonthName = (monthNumber) => {
    const date = new Date(2000, monthNumber - 1, 1); // Use a dummy date
    return date.toLocaleString('en-US', { month: 'short' });
};

const SuperAdminDashboard = () => {
   const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [selectedSection, setSelectedSection] = useState('overview'); // Default to overview
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // State for mobile sidebar

    const API_BASE_URL = 'http://localhost:5000/admin'; // Your API base URL

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

            const result = await response.json(); 

            if (!response.ok) {
                // If response is not OK (e.g., 4xx, 5xx status), throw an error with the message from the backend
                throw result;
            }

            // If response is OK (2xx status), check if 'data' property exists and set it
            if (result) { // Admin dashboard API directly returns data, not nested under 'data' or 'success'
                setDashboardData(result); // Set the entire result as dashboardData
            } else {
                // If 'data' property is missing in a 200 OK response, it's an unexpected format
                throw new Error(result.message || 'Unexpected data format from admin dashboard API.');
            }
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            console.error('Failed to fetch admin dashboard data:', err);
            setError(`Failed to load admin dashboard data: ${err.message}`);
            showToastMessage('Failed to load dashboard data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToastMessage]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Prepare data for charts based on the provided JSON structure
    const monthlyIncomeChartData = dashboardData?.monthlyIncome?.map(item => ({
        name: `${getMonthName(item.month)} ${item.year}`,
        "Total Income": parseFloat(item.income || 0)
    })) || [];

    const monthlyExpensesChartData = dashboardData?.monthlyExpenses?.map(item => ({
        name: `${getMonthName(item.month)} ${item.year}`,
        "Total Expenses": parseFloat(item.expense || 0)
    })) || [];

    const salaryDisbursementChartData = dashboardData?.salaryDisbursement?.map(item => ({
        name: `${getMonthName(item.month)} ${item.year}`,
        "Total Salaries Disbursed": parseFloat(item.total_salaries || 0)
    })) || [];

    const projectStatusSummaryChartData = dashboardData?.projectStatusSummary?.map(item => ({
        name: item.status.replace(/_/g, ' '),
        value: item.project_count,
        total_budget: parseFloat(item.total_budget || 0)
    })) || [];

    const expenseCategorySummaryChartData = dashboardData?.expenseCategorySummary?.map(item => ({
        name: item.category.replace(/_/g, ' '),
        value: parseFloat(item.total_amount || 0)
    })) || [];

    const monthlyProfitChartData = dashboardData?.monthlyProfit?.map(item => ({
        name: `${getMonthName(item.month)} ${item.year}`,
        "Total Income": parseFloat(item.total_income || 0),
        "Total Expense": parseFloat(item.total_expense || 0),
        "Profit": parseFloat(item.profit || 0)
    })) || [];

    // Function to render content based on selected section
    const renderContent = () => {
        if (loading) {
            return (
                <div className="dashboard-loading-container">
                    <Loader size={48} className="dashboard-spinner" />
                    <p className="dashboard-loading-text">Loading admin dashboard data...</p>
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
                    <p className="dashboard-no-data-text">No admin dashboard data available.</p>
                </div>
            );
        }

        switch (selectedSection) {
            case 'overview':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Super Admin Overview</h1>
                            <p className="subtitle-text">Key metrics and overall performance at a glance.</p>
                        </div>
                        <div className="dashboard-cards-grid">
                            <div className="dashboard-card primary-card">
                                <p className="card-title">Total Clients</p>
                                <div className="card-content">
                                    <Users size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.stats?.total_clients || 0}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card secondary-card">
                                <p className="card-title">Total Employees</p>
                                <div className="card-content">
                                    <Briefcase size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.stats?.total_employees || 0}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card info-card">
                                <p className="card-title">Total Projects</p>
                                <div className="card-content">
                                    <Folder size={32} className="card-icon" />
                                    <h3 className="card-value">{dashboardData.stats?.total_projects || 0}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card success-card">
                                <p className="card-title">Total Income</p>
                                <div className="card-content">
                                    <TrendingUp size={32} className="card-icon" />
                                    <h3 className="card-value">{formatCurrency(dashboardData.stats?.total_income || 0)}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card danger-card">
                                <p className="card-title">Total Expenses</p>
                                <div className="card-content">
                                    <TrendingDown size={32} className="card-icon" />
                                    <h3 className="card-value">{formatCurrency(dashboardData.stats?.total_expense_amount || 0)}</h3>
                                </div>
                            </div>
                            <div className="dashboard-card primary-card">
                                <p className="card-title">Total Salary Paid</p>
                                <div className="card-content">
                                    <Banknote size={32} className="card-icon" />
                                    <h3 className="card-value">{formatCurrency(dashboardData.stats?.total_salary_paid || 0)}</h3>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'monthly-income':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Monthly Income Trends</h1>
                            <p className="subtitle-text">Visualize your company's income over time.</p>
                        </div>
                        {monthlyIncomeChartData.length > 0 ? (
                            <div className="chart-card full-width-chart">
                                <h2 className="chart-title">Monthly Income</h2>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={monthlyIncomeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                                        <YAxis tickFormatter={formatCurrency} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                        <Line type="monotone" dataKey="Total Income" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="dashboard-no-data">
                                <Info size={48} className="dashboard-info-icon" />
                                <p className="dashboard-no-data-text">No monthly income data available.</p>
                            </div>
                        )}
                    </>
                );
            case 'monthly-expenses':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Monthly Expenses Trends</h1>
                            <p className="subtitle-text">Track your company's expenditures month by month.</p>
                        </div>
                        {monthlyExpensesChartData.length > 0 ? (
                            <div className="chart-card full-width-chart">
                                <h2 className="chart-title">Monthly Expenses</h2>
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={monthlyExpensesChartData} margin={{ top: 10, right: 0, left: 40, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                                        <YAxis tickFormatter={formatCurrency} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Area type="monotone" dataKey="Total Expenses" stroke={COLORS[3]} fillOpacity={1} fill="url(#colorExpense)" />
                                        <defs>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS[3]} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={COLORS[3]} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="dashboard-no-data">
                                <Info size={48} className="dashboard-info-icon" />
                                <p className="dashboard-no-data-text">No monthly expenses data available.</p>
                            </div>
                        )}
                    </>
                );
            case 'salary-disbursement':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Salary Disbursement Overview</h1>
                            <p className="subtitle-text">Monthly breakdown of salary payments.</p>
                        </div>
                        {salaryDisbursementChartData.length > 0 ? (
                            <div className="chart-card full-width-chart">
                                <h2 className="chart-title">Monthly Salary Disbursement</h2>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={salaryDisbursementChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                                        <YAxis tickFormatter={formatCurrency} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="Total Salaries Disbursed" fill={COLORS[4]} barSize={30} radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="dashboard-no-data">
                                <Info size={48} className="dashboard-info-icon" />
                                <p className="dashboard-no-data-text">No salary disbursement data available.</p>
                            </div>
                        )}
                    </>
                );
            case 'project-status':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Project Status Summary</h1>
                            <p className="subtitle-text">Distribution of projects by their current status.</p>
                        </div>
                        {projectStatusSummaryChartData.length > 0 ? (
                            <div className="chart-card">
                                <h2 className="chart-title">Projects by Status</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <Pie
                                            data={projectStatusSummaryChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {projectStatusSummaryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name, props) => [`${value} projects`, name]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="dashboard-no-data">
                                <Info size={48} className="dashboard-info-icon" />
                                <p className="dashboard-no-data-text">No project status data available.</p>
                            </div>
                        )}
                    </>
                );
            case 'expense-categories':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Expenses by Category</h1>
                            <p className="subtitle-text">Breakdown of expenditures across different categories.</p>
                        </div>
                        {expenseCategorySummaryChartData.length > 0 ? (
                            <div className="chart-card">
                                <h2 className="chart-title">Expense Categories</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <Pie
                                            data={expenseCategorySummaryChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {expenseCategorySummaryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="dashboard-no-data">
                                <Info size={48} className="dashboard-info-icon" />
                                <p className="dashboard-no-data-text">No expense category data available.</p>
                            </div>
                        )}
                    </>
                );
            case 'top-clients':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Top Clients</h1>
                            <p className="subtitle-text">Clients by total payments received.</p>
                        </div>
                        {dashboardData?.topClients && dashboardData.topClients.length > 0 ? (
                            <div className="table-responsive">
                                <h2 className="section-title">Top Clients by Payment</h2>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="table-header">Client Name</th>
                                            <th className="table-header">Total Paid Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.topClients.map((client, index) => (
                                            <tr key={index} className="table-row">
                                                <td className="table-data">{client.client_name}</td>
                                                <td className="table-data">{formatCurrency(client.total_paid)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="dashboard-no-data">
                                <Info size={48} className="dashboard-info-icon" />
                                <p className="dashboard-no-data-text">No top clients data available.</p>
                            </div>
                        )}
                    </>
                );
            case 'monthly-profit':
                 return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Monthly Profit/Loss</h1>
                            <p className="subtitle-text">Analyze your company's profitability over time.</p>
                        </div>
                        {monthlyProfitChartData.length > 0 ? (
                            <div className="chart-card full-width-chart">
                                <h2 className="chart-title">Monthly Profit/Loss Trend</h2>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={monthlyProfitChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                                        <YAxis tickFormatter={formatCurrency} />
                                        <Tooltip formatter={(value, name) => [`${name}: ${formatCurrency(value)}`]} />
                                        <Legend />
                                        <Line type="monotone" dataKey="Total Income" stroke={COLORS[5]} strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="Total Expense" stroke={COLORS[6]} strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="Profit" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="dashboard-no-data">
                                <Info size={48} className="dashboard-info-icon" />
                                <p className="dashboard-no-data-text">No monthly profit data available.</p>
                            </div>
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Hamburger Menu (visible only on mobile/tablet) */}
            <div className="hamburger-menu" onClick={() => setIsMobileSidebarOpen(true)}>
                <Menu size={28} />
            </div>

            {/* Mobile Sidebar Overlay (visible when mobile sidebar is open) */}
            {isMobileSidebarOpen && (
                <div className="mobile-sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)}></div>
            )}

            {/* Mobile Sliding Sidebar */}
            <aside className={`mobile-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
                <div className="mobile-sidebar-header">
                    <h2 className="sidebar-header-title">Admin Panel</h2>
                    <X size={28} className="close-icon" onClick={() => setIsMobileSidebarOpen(false)} />
                </div>
                <ul className="sidebar-nav">
                    <li>
                        <button
                            className={`sidebar-button ${selectedSection === 'overview' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('overview'); setIsMobileSidebarOpen(false); }}
                        >
                            <LayoutDashboard size={20} className="sidebar-nav-icon" />
                            Overview
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-button ${selectedSection === 'monthly-income' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('monthly-income'); setIsMobileSidebarOpen(false); }}
                        >
                            <TrendingUp size={20} className="sidebar-nav-icon" />
                             Monthly Income
                        </button>
                    </li>
                     <li>
                        <button
                            className={`sidebar-button ${selectedSection === 'monthly-expenses' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('monthly-expenses'); setIsMobileSidebarOpen(false); }}
                        >
                            <TrendingDown size={20} className="sidebar-nav-icon" />
                            Monthly Expenses
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-button ${selectedSection === 'salary-disbursement' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('salary-disbursement'); setIsMobileSidebarOpen(false); }}
                        >
                            <Banknote size={20} className="sidebar-nav-icon" />
                            Salary Disbursement
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-button ${selectedSection === 'project-status' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('project-status'); setIsMobileSidebarOpen(false); }}
                        >
                            <ClipboardList size={20} className="sidebar-nav-icon" />
                            Project Status
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-button ${selectedSection === 'expense-categories' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('expense-categories'); setIsMobileSidebarOpen(false); }}
                        >
                            <Receipt size={20} className="sidebar-nav-icon" />
                            Expense Categories
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-button ${selectedSection === 'top-clients' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('top-clients'); setIsMobileSidebarOpen(false); }}
                        >
                            <Award size={20} className="sidebar-nav-icon" />
                            Top Clients
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-button ${selectedSection === 'monthly-profit' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('monthly-profit'); setIsMobileSidebarOpen(false); }}
                        >
                            <DollarSign size={20} className="sidebar-nav-icon" />
                            Monthly Profit
                        </button>
                    </li>
                </ul>
            </aside>

            <div className="dashboard-wrapper">
                {/* Desktop Sidebar */}
                <aside className="sidebar-desktop">
                    <h2 className="sidebar-header-title">Admin Dashboard</h2>
                    <ul className="sidebar-nav">
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'overview' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('overview')}
                            >
                                <LayoutDashboard size={20} className="sidebar-nav-icon" />
                                Overview
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'monthly-income' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('monthly-income')}
                            >
                                <TrendingUp size={20} className="sidebar-nav-icon" />
                                Monthly Income
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'monthly-expenses' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('monthly-expenses')}
                            >
                                <TrendingDown size={20} className="sidebar-nav-icon" />
                                Monthly Expenses
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'salary-disbursement' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('salary-disbursement')}
                            >
                                <Banknote size={20} className="sidebar-nav-icon" />
                                Salary Disbursement
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'project-status' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('project-status')}
                            >
                                <ClipboardList size={20} className="sidebar-nav-icon" />
                                Project Status
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'expense-categories' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('expense-categories')}
                            >
                                <Receipt size={20} className="sidebar-nav-icon" />
                                Expense Categories
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'top-clients' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('top-clients')}
                            >
                                <Award size={20} className="sidebar-nav-icon" />
                                Top Clients
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-button ${selectedSection === 'monthly-profit' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('monthly-profit')}
                            >
                                <DollarSign size={20} className="sidebar-nav-icon" />
                                Monthly Profit
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* Main Content Area */}
                <main className="main-content-area">
                    {renderContent()}
                </main>
            </div>

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
        </div>
    );
};

export default SuperAdminDashboard;
