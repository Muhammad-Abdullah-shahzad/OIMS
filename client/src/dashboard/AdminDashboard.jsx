import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

import FinanceManager from "../financeMangement/financeManager.jsx";
import ProjectManagement from "../projectMangement/projectManegment.jsx";
import EmployeeManager from "../components/employee.jsx"
import {
    LayoutDashboard, Users, Briefcase, Folder, DollarSign, TrendingUp, TrendingDown,
    Banknote, Receipt, ClipboardList, Award, Menu, X, Info, Loader, AlertCircle, CheckCircle
} from 'lucide-react';
import styles from '../styles/adminDashboard.module.css'; // Import as CSS Module
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

    const API_BASE_URL = 'https://oimsapi.oradigitals.com/admin'; // Your API base URL

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
            console.log(result);
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
                <div className={styles.dashboardLoadingContainer}>
                    <Loader size={48} className={styles.dashboardSpinner} />
                    <p className={styles.dashboardLoadingText}>Loading admin dashboard data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.dashboardErrorContainer}>
                    <AlertCircle size={48} className={styles.dashboardErrorIcon} />
                    <p className={styles.dashboardErrorMessage}>Error: {error}</p>
                    <button onClick={fetchDashboardData} className={styles.dashboardRetryButton}>
                        Retry
                    </button>
                </div>
            );
        }

        if (!dashboardData) {
            return (
                <div className={styles.dashboardNoData}>
                    <Info size={48} className={styles.dashboardInfoIcon} />
                    <p className={styles.dashboardNoDataText}>No admin dashboard data available.</p>
                </div>
            );
        }

        switch (selectedSection) {
            case 'overview':
                return (
                  <>
                        <div className={styles.headerSection}>
                            <h1 className={styles.mainTitle}>Super Admin Overview</h1>
                            <p className={styles.subtitleText}>Key metrics and overall performance at a glance.</p>
                        </div>
                        <div className={styles.dashboardCardsGrid}>
                            <div className={`${styles.dashboardCard} ${styles.primaryCard}`}>
                                <p className={styles.cardTitle}>{'Total Clients (active)'}</p>
                                <div className={styles.cardContent}>
                                    <Users size={32} className={styles.cardIcon} />
                                    <h3 className={styles.cardValue}>{dashboardData.stats?.total_clients || 0}</h3>
                                </div>
                            </div>
                            <div className={`${styles.dashboardCard} ${styles.secondaryCard}`}>
                                <p className={styles.cardTitle}>{`Total Employees (active)`}</p>
                                <div className={styles.cardContent}>
                                    <Briefcase size={32} className={styles.cardIcon} />
                                    <h3 className={styles.cardValue}>{dashboardData.stats?.total_employees || 0}</h3>
                                </div>
                            </div>
                            <div className={`${styles.dashboardCard} ${styles.infoCard}`}>
                                <p className={styles.cardTitle}>{`Total Projects (ongoing)`}</p>
                                <div className={styles.cardContent}>
                                    <Folder size={32} className={styles.cardIcon} />
                                    <h3 className={styles.cardValue}>{dashboardData.stats?.total_projects || 0}</h3>
                                </div>
                            </div>
                            <div className={`${styles.dashboardCard} ${styles.successCard}`}>
                                <p className={styles.cardTitle}>Total Income</p>
                                <div className={styles.cardContent}>
                                    <TrendingUp size={32} className={styles.cardIcon} />
                                    <h3 className={styles.cardValue}>{formatCurrency(dashboardData.stats?.total_income || 0)}</h3>
                                </div>
                            </div>
                            <div className={`${styles.dashboardCard} ${styles.dangerCard}`}>
                                <p className={styles.cardTitle}>Total Expenses</p>
                                <div className={styles.cardContent}>
                                    <TrendingDown size={32} className={styles.cardIcon} />
                                    <h3 className={styles.cardValue}>{formatCurrency(dashboardData.stats?.total_expense_amount || 0)}</h3>
                                </div>
                            </div>
                            <div className={`${styles.dashboardCard} ${styles.primaryCard}`}>
                                <p className={styles.cardTitle}>Total Salary Paid</p>
                                <div className={styles.cardContent}>
                                    <Banknote size={32} className={styles.cardIcon} />
                                    <h3 className={styles.cardValue}>{formatCurrency(dashboardData.stats?.total_salary_paid || 0)}</h3>
                                </div>
                            </div>
                             
                            <div className={`${styles.dashboardCard} ${styles.primaryCard}`}>
                                <p className={styles.cardTitle}>{`Total Salary (curr month)`}</p>
                                <div className={styles.cardContent}>
                                    <Banknote size={32} className={styles.cardIcon} />
                                    <h3 className={styles.cardValue}>{formatCurrency(dashboardData.stats?.total_salary_curr_month || 0)}</h3>
                                </div>
                            </div>
                        
                            <div className={`${styles.dashboardCard} ${styles.primaryCard}`}>
                                <p className={styles.cardTitle}>{`Total Payments (curr month)`}</p>
                                <div className={styles.cardContent}>
                                <TrendingUp size={32} className={styles.cardIcon} />
                                    <h3 className={styles.cardValue}>{formatCurrency(dashboardData.stats?.total_payments_curr_month || 0)}</h3>
                                </div>
                            </div>

                            <div className={`${styles.dashboardCard} ${styles.dangerCard}`}>
                                <p className={styles.cardTitle}>{`Total Expenses (curr month)`}</p>
                                <div className={styles.cardContent}>
                                    <TrendingDown size={32} className={styles.cardIcon} />
                                    <h3 className={styles.cardValue}>{formatCurrency(dashboardData.stats?.total_expense_curr_month || 0)}</h3>
                                </div>
                            </div>
                        
                        </div>
                        <div className={styles.superAdminOverviewGrid}>
                        {/* <div className={styles.headerSection}>
                            <h1 className={styles.mainTitle}>Monthly Income Trends</h1>
                            <p className={styles.subtitleText}>Visualize your company's income over time.</p>
                        </div> */}
                        {monthlyIncomeChartData.length > 0 ? (
                            <div className={`${styles.chartCard}`}>
                                <h2 className={styles.chartTitle}>Monthly Income</h2>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={monthlyIncomeChartData} margin={{ top: 20, right: 10, left: 37, bottom: 5 }}>
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
                            <div className={styles.dashboardNoData}>
                                <Info size={48} className={styles.dashboardInfoIcon} />
                                <p className={styles.dashboardNoDataText}>No monthly income data available.</p>
                            </div>
                        )}
                          {/* <div className={styles.headerSection}>
                            <h1 className={styles.mainTitle}>Monthly Expenses Trends</h1>
                            <p className={styles.subtitleText}>Track your company's expenditures month by month.</p>
                        </div> */}
                        {monthlyExpensesChartData.length > 0 ? (
                            <div className={`${styles.chartCard}`}>
                                <h2 className={styles.chartTitle}>Monthly Expenses</h2>
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
                            <div className={styles.dashboardNoData}>
                                <Info size={48} className={styles.dashboardInfoIcon} />
                                <p className={styles.dashboardNoDataText}>No monthly expenses data available.</p>
                            </div>
                        )}
                         {/* <div className={styles.headerSection}>
                            <h1 className={styles.mainTitle}>Salary Disbursement Overview</h1>
                            <p className={styles.subtitleText}>Monthly breakdown of salary payments.</p>
                        </div> */}
                        {salaryDisbursementChartData.length > 0 ? (
                            <div className={`${styles.chartCard} `}>
                                <h2 className={styles.chartTitle}>Monthly Salary Disbursement</h2>
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
                            <div className={styles.dashboardNoData}>
                                <Info size={48} className={styles.dashboardInfoIcon} />
                                <p className={styles.dashboardNoDataText}>No salary disbursement data available.</p>
                            </div>
                        )}

{/* <div className={styles.headerSection}>
                            <h1 className={styles.mainTitle}>Project Status Summary</h1>
                            <p className={styles.subtitleText}>Distribution of projects by their current status.</p>
                        </div> */}
                        {projectStatusSummaryChartData.length > 0 ? (
                            <div className={styles.chartCard}>
                                <h2 className={styles.chartTitle}>Projects by Status</h2>
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
                            <div className={styles.dashboardNoData}>
                                <Info size={48} className={styles.dashboardInfoIcon} />
                                <p className={styles.dashboardNoDataText}>No project status data available.</p>
                            </div>
                        )}
                        {/* <div className={styles.headerSection}>
                            <h1 className={styles.mainTitle}>Expenses by Category</h1>
                            <p className={styles.subtitleText}>Breakdown of expenditures across different categories.</p>
                        </div> */}
                        {expenseCategorySummaryChartData.length > 0 ? (
                            <div className={styles.chartCard}>
                                <h2 className={styles.chartTitle}>Expense Categories</h2>
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
                            <div className={styles.dashboardNoData}>
                                <Info size={48} className={styles.dashboardInfoIcon} />
                                <p className={styles.dashboardNoDataText}>No expense category data available.</p>
                            </div>
                        )}
                          {/* <div className={styles.headerSection}>
                            <h1 className={styles.mainTitle}>Top Clients</h1>
                            <p className={styles.subtitleText}>Clients by total payments received.</p>
                        </div> */}
                        {dashboardData?.topClients && dashboardData.topClients.length > 0 ? (
                            <div className={styles.tableResponsive}>
                                <h2 className={styles.sectionTitle}>Top Clients by Payment</h2>
                                <table className={styles.dataTable}>
                                    <thead>
                                        <tr>
                                            <th className={styles.tableHeader}>Client Name</th>
                                            <th className={styles.tableHeader}>Total Paid Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.topClients.map((client, index) => (
                                            <tr key={index} className={styles.tableRow}>
                                                <td className={styles.tableData}>{client.client_name}</td>
                                                <td className={styles.tableData}>{formatCurrency(client.total_paid)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={styles.dashboardNoData}>
                                <Info size={48} className={styles.dashboardInfoIcon} />
                                <p className={styles.dashboardNoDataText}>No top clients data available.</p>
                            </div>
                        )}
                         {/* <div className={styles.headerSection}>
                            <h1 className={styles.mainTitle}>Monthly Profit/Loss</h1>
                            <p className={styles.subtitleText}>Analyze your company's profitability over time.</p>
                        </div> */}
                        {monthlyProfitChartData.length > 0 ? (
                            <div className={`${styles.chartCard} `}>
                                <h2 className={styles.chartTitle}>Monthly Profit/Loss Trend</h2>
                                <ResponsiveContainer height={350}>
                                    <LineChart data={monthlyProfitChartData} margin={{ top: 20, right: 10, left: 37, bottom: 5 }}>
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
                            <div className={styles.dashboardNoData}>
                                <Info size={48} className={styles.dashboardInfoIcon} />
                                <p className={styles.dashboardNoDataText}>No monthly profit data available.</p>
                            </div>
                        )}
                        </div>
                    </>
                );
            case 'finance-management':
                return (
                    <>
                        <FinanceManager/>
                    </>
                );
            case 'employee-management':
                return (
                    <>
                      <EmployeeManager/>
                    </>
                );
            case 'project-management':
                return (
                    <>
                       <ProjectManagement/>
                    </>
                );
       
            default:
                return null;
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            {/* Hamburger Menu (visible only on mobile/tablet) */}
            <div className={styles.hamburgerMenu} onClick={() => setIsMobileSidebarOpen(true)}>
                <Menu size={28} />
            </div>

            {/* Mobile Sidebar Overlay (visible when mobile sidebar is open) */}
            {isMobileSidebarOpen && (
                <div className={styles.mobileSidebarOverlay} onClick={() => setIsMobileSidebarOpen(false)}></div>
            )}

            {/* Mobile Sliding Sidebar */}
            <aside className={`${styles.mobileSidebar} ${isMobileSidebarOpen ? styles.open : ''}`}>
                <div className={styles.mobileSidebarHeader}>
                    <h2 className={styles.sidebarHeaderTitle}>Admin Panel</h2>
                    <X size={28} className={styles.closeIcon} onClick={() => setIsMobileSidebarOpen(false)} />
                </div>
                <ul className={styles.sidebarNav}>
                    <li>
                        <button
                            className={`${styles.sidebarButton} ${selectedSection === 'overview' ? styles.active : ''}`}
                            onClick={() => { setSelectedSection('overview'); setIsMobileSidebarOpen(false); }}
                        >
                            <LayoutDashboard size={20} className={styles.sidebarNavIcon} />
                            Overview
                        </button>
                    </li>
                  
                 
                    <li>
                        <button
                            className={`${styles.sidebarButton} ${selectedSection === 'finance-management' ? styles.active : ''}`}
                            onClick={() => { setSelectedSection('finance-management'); setIsMobileSidebarOpen(false); }}
                        >
                            <Banknote size={20} className={styles.sidebarNavIcon} />
                            Finance Management
                        </button>
                    </li>
                    <li>
                        <button
                            className={`${styles.sidebarButton} ${selectedSection === 'project-management' ? styles.active : ''}`}
                            onClick={() => { setSelectedSection('project-management'); setIsMobileSidebarOpen(false); }}
                        >
                            <ClipboardList size={20} className={styles.sidebarNavIcon} />
                            Project Management
                        </button>
                    </li>
                    
                    <li>
                        <button
                            className={`${styles.sidebarButton} ${selectedSection === 'employee-management' ? styles.active : ''}`}
                            onClick={() => { setSelectedSection('employee-management'); setIsMobileSidebarOpen(false); }}
                        >
                            <Award size={20} className={styles.sidebarNavIcon} />
                            Employee Management
                        </button>
                    </li>
                    
                </ul>
            </aside>

            <div className={styles.dashboardWrapper}>
                {/* Desktop Sidebar */}
                <aside className={styles.sidebarDesktop}>
                    <h2 className={styles.sidebarHeaderTitle}>Admin Dashboard</h2>
                    <ul className={styles.sidebarNav}>
                        <li>
                            <button
                                className={`${styles.sidebarButton} ${selectedSection === 'overview' ? styles.active : ''}`}
                                onClick={() => setSelectedSection('overview')}
                            >
                                <LayoutDashboard size={20} className={styles.sidebarNavIcon} />
                                Overview
                            </button>
                        </li>
                        
                        <li>
                            <button
                                className={`${styles.sidebarButton} ${selectedSection === 'finance-management' ? styles.active : ''}`}
                                onClick={() => setSelectedSection('finance-management')}
                            >
                                <Banknote size={20} className={styles.sidebarNavIcon} />
                                Finance Management
                            </button>
                        </li>
                        <li>
                            <button
                                className={`${styles.sidebarButton} ${selectedSection === 'project-management' ? styles.active : ''}`}
                                onClick={() => setSelectedSection('project-management')}
                            >
                                <ClipboardList size={20} className={styles.sidebarNavIcon} />
                                Project Management
                            </button>
                        </li>
                        
                        <li>
                            <button
                                className={`${styles.sidebarButton} ${selectedSection === 'employee-management' ? styles.active : ''}`}
                                onClick={() => setSelectedSection('employee-management')}
                            >
                                <Award size={20} className={styles.sidebarNavIcon} />
                                Employee Management
                            </button>
                        </li>
                  
                    </ul>
                </aside>

                {/* Main Content Area */}
                <main className={styles.mainContentArea}>
                    {renderContent()}
                </main>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`${styles.dashboardToastNotification} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError} ${toast.show ? styles.toastShow : ''}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{toast.message}</span>
                    <button onClick={() => setToast({ ...toast, show: false })} className={styles.dashboardToastCloseButton}>
                        <X size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
