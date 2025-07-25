import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    DollarSign, TrendingUp, TrendingDown, Users, Briefcase, Calendar,
    CheckCircle, AlertCircle, Loader, Info, X,
    LayoutDashboard, // For main dashboard overview
    Wallet, // For payments
    Receipt, // For expenses
    Banknote, // For salaries
    Menu // For mobile hamburger menu
} from 'lucide-react';
import '../styles/financeDashboard.css'; // New CSS file for this dashboard

// Define a color palette for charts
const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F97316', '#10B981', '#3B82F6', '#EF4444', '#6B7280', '#D97706'];

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

const FinanceDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [selectedSection, setSelectedSection] = useState('overview'); // Default to overview
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // State for mobile sidebar

    const API_BASE_URL = 'http://localhost:5000'; // Your API base URL

    const showToastMessage = useCallback((message, type) => {
        setToast({ show: true, message, type });
    }, []);

    const fetchFinanceDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/finance/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json(); 

            if (!response.ok) {
                // If response is not OK (e.g., 4xx, 5xx status), throw an error with the message from the backend
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            // If response is OK (2xx status), check if 'data' property exists and set it
            if (result.data) { // <--- CHANGED THIS CONDITION
                setDashboardData(result.data);
            } else {
                // If 'data' property is missing in a 200 OK response, it's an unexpected format
                throw new Error(result.message || 'Unexpected data format from finance dashboard API: "data" property missing.');
            }
        } catch (err) {
            console.error('Failed to fetch finance dashboard data:', err);
            setError(`Failed to load finance dashboard data: ${err.message}`);
            showToastMessage('Failed to load dashboard data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToastMessage]);

    useEffect(() => {
        fetchFinanceDashboardData();
    }, [fetchFinanceDashboardData]);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Prepare data for charts (these remain the same as before)
    const monthlySalariesChartData = dashboardData?.salary?.monthlySalaries?.map(item => ({
        name: `${getMonthName(item.salary_month)} ${item.salary_year}`,
        "Total Salaries": parseFloat(item.total_salaries)
    })) || [];

    const salarySummaryChartData = dashboardData?.salary?.salarySummary?.map(item => ({
        name: `${item.firstName} ${item.lastName}`,
        "Monthly Salary": parseFloat(item.monthly_salary),
        "Total Paid": parseFloat(item.total_paid || 0) // Ensure 0 if null/undefined
    })) || [];

    const monthlyExpensesChartData = dashboardData?.expense?.monthlyExpenses?.map(item => ({
        name: `${getMonthName(item.month)} ${item.year}`,
        "Monthly Expenses": parseFloat(item.monthly_expenses)
    })) || [];

    const yearlyExpensesChartData = dashboardData?.expense?.yearlyExpenses?.map(item => ({
        name: String(item.year),
        "Total Expenses": parseFloat(item.total_expense)
    })) || [];

    const expenseByCategoryChartData = dashboardData?.expense?.expenseByCategory?.map(item => ({
        name: item.category.replace(/_/g, ' '),
        value: parseFloat(item.total_amount)
    })) || [];

    const projectPaymentSummaryChartData = dashboardData?.payment?.projectPaymentSummary?.map(item => ({
        name: item.project_title,
        "Total Project Amount": parseFloat(item.total_project_amount),
        "Total Paid Amount": parseFloat(item.total_paid_amount),
        "Remaining Amount": parseFloat(item.remaining_amount)
    })) || [];

    // Function to render content based on selected section
    const renderContent = () => {
        if (loading) {
            return (
                <div className="dashboard-loading-container">
                    <Loader size={48} className="dashboard-spinner" />
                    <p className="dashboard-loading-text">Loading finance dashboard data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="dashboard-error-container">
                    <AlertCircle size={48} className="dashboard-error-icon" />
                    <p className="dashboard-error-message">Error: {error}</p>
                    <button onClick={fetchFinanceDashboardData} className="dashboard-retry-button">
                        Retry
                    </button>
                </div>
            );
        }

        if (!dashboardData) {
            return (
                <div className="dashboard-no-data">
                    <Info size={48} className="dashboard-info-icon" />
                    <p className="dashboard-no-data-text">No finance dashboard data available.</p>
                </div>
            );
        }

        switch (selectedSection) {
            case 'overview':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Finance Dashboard Overview</h1>
                            <p className="subtitle-text">A quick glance at your financial health.</p>
                        </div>
                        {/* Overall Financial Summary Cards */}
                        <div className="dashboard-cards-grid">
                            <div className="dashboard-card primary-card">
                                <p className="card-title">Total Salaries Paid (Current Month)</p>
                                <div className="card-content">
                                    <DollarSign size={32} className="card-icon" />
                                    <h3 className="card-value">
                                        {formatCurrency(dashboardData?.salary?.monthlySalaries?.[0]?.total_salaries || 0)}
                                    </h3>
                                </div>
                            </div>
                            <div className="dashboard-card success-card">
                                <p className="card-title">Total Expenses (Current Year)</p>
                                <div className="card-content">
                                    <TrendingDown size={32} className="card-icon" />
                                    <h3 className="card-value">
                                        {formatCurrency(dashboardData?.expense?.yearlyExpenses?.[0]?.total_expense || 0)}
                                    </h3>
                                </div>
                            </div>
                            {/* Add more overview cards here if needed */}
                        </div>
                    </>
                );
            case 'salary':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Salary Overview</h1>
                            <p className="subtitle-text">Detailed insights into salary payments.</p>
                        </div>
                        <div className="charts-grid">
                            {/* Monthly Salaries Chart */}
                            {monthlySalariesChartData.length > 0 && (
                                <div className="chart-card">
                                    <h2 className="chart-title">Monthly Salaries Paid</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={monthlySalariesChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                            <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                                            <YAxis tickFormatter={formatCurrency} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Total Salaries" fill={COLORS[0]} barSize={30} radius={[10, 10, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Salary Summary by Employee Chart */}
                            {salarySummaryChartData.length > 0 && (
                                <div className="chart-card">
                                    <h2 className="chart-title">Employee Salary Summary</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={salarySummaryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                            <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                                            <YAxis tickFormatter={formatCurrency} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Monthly Salary" fill={COLORS[1]} barSize={20} radius={[10, 10, 0, 0]} />
                                            <Bar dataKey="Total Paid" fill={COLORS[2]} barSize={20} radius={[10, 10, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </>
                );
            case 'expense':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Expense Overview</h1>
                            <p className="subtitle-text">Track and analyze your company's expenditures.</p>
                        </div>
                        <div className="charts-grid">
                            {/* Monthly Expenses Chart */}
                            {monthlyExpensesChartData.length > 0 && (
                                <div className="chart-card">
                                    <h2 className="chart-title">Monthly Expenses</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={monthlyExpensesChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                            <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                                            <YAxis tickFormatter={formatCurrency} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Monthly Expenses" fill={COLORS[3]} barSize={30} radius={[10, 10, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Yearly Expenses Chart */}
                            {yearlyExpensesChartData.length > 0 && (
                                <div className="chart-card">
                                    <h2 className="chart-title">Yearly Expenses</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={yearlyExpensesChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={formatCurrency} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Total Expenses" fill={COLORS[4]} barSize={30} radius={[10, 10, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Expense by Category Pie Chart */}
                            {expenseByCategoryChartData.length > 0 && (
                                <div className="chart-card">
                                    <h2 className="chart-title">Expenses by Category</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                            <Pie
                                                data={expenseByCategoryChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {expenseByCategoryChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </>
                );
            case 'payment':
                return (
                    <>
                        <div className="header-section">
                            <h1 className="main-title">Payment Overview</h1>
                            <p className="subtitle-text">Summaries of project payments and income.</p>
                        </div>
                        <div className="charts-grid">
                            {/* Project Payment Summary Chart */}
                            {projectPaymentSummaryChartData.length > 0 && (
                                <div className="chart-card full-width-chart">
                                    <h2 className="chart-title">Project Payment Summary</h2>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={projectPaymentSummaryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                            <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                                            <YAxis tickFormatter={formatCurrency} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Total Project Amount" fill={COLORS[5]} barSize={20} radius={[10, 10, 0, 0]} />
                                            <Bar dataKey="Total Paid Amount" fill={COLORS[6]} barSize={20} radius={[10, 10, 0, 0]} />
                                            <Bar dataKey="Remaining Amount" fill={COLORS[7]} barSize={20} radius={[10, 10, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            {/* You could add a Monthly Income chart here if your API provides that data */}
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="finance-dashboard-container">
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
                    <h2 className="sidebar-header-title">Finance Panel</h2>
                    <X size={28} className="close-icon" onClick={() => setIsMobileSidebarOpen(false)} />
                </div>
                <ul className="sidebar-nav">
                    <li>
                        <button
                            className={`sidebar-nav-link ${selectedSection === 'overview' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('overview'); setIsMobileSidebarOpen(false); }}
                        >
                            <LayoutDashboard size={20} className="sidebar-nav-icon" />
                            Overview
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-nav-link ${selectedSection === 'salary' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('salary'); setIsMobileSidebarOpen(false); }}
                        >
                            <Banknote size={20} className="sidebar-nav-icon" />
                            Salaries
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-nav-link ${selectedSection === 'expense' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('expense'); setIsMobileSidebarOpen(false); }}
                        >
                            <Receipt size={20} className="sidebar-nav-icon" />
                            Expenses
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-nav-link ${selectedSection === 'payment' ? 'active' : ''}`}
                            onClick={() => { setSelectedSection('payment'); setIsMobileSidebarOpen(false); }}
                        >
                            <Wallet size={20} className="sidebar-nav-icon" />
                            Payments
                        </button>
                    </li>
                </ul>
            </aside>

            <div className="dashboard-wrapper">
                {/* Desktop Sidebar */}
                <aside className="sidebar-desktop">
                    <h2 className="sidebar-header-title">Finance Dashboard</h2>
                    <ul className="sidebar-nav">
                        <li>
                            <button
                                className={`sidebar-nav-link ${selectedSection === 'overview' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('overview')}
                            >
                                <LayoutDashboard size={20} className="sidebar-nav-icon" />
                                Overview
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-nav-link ${selectedSection === 'salary' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('salary')}
                            >
                                <Banknote size={20} className="sidebar-nav-icon" />
                                Salaries
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-nav-link ${selectedSection === 'expense' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('expense')}
                            >
                                <Receipt size={20} className="sidebar-nav-icon" />
                                Expenses
                            </button>
                        </li>
                        <li>
                            <button
                                className={`sidebar-nav-link ${selectedSection === 'payment' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('payment')}
                            >
                                <Wallet size={20} className="sidebar-nav-icon" />
                                Payments
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

export default FinanceDashboard;
