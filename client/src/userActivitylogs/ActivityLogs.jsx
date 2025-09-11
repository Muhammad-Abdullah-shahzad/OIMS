// ActivityLogs.jsx
import { useState, useEffect } from "react";
import "../styles/userActivityLogs.scss";

export default function UserActivityLogs() {
  const [allLogs, setAllLogs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);

  // Filter state
  const [userEmailFilter, setUserEmailFilter] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("All");
  const [tableNameFilter, setTableNameFilter] = useState("All");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const BASE_URL = `https://oimsapi.oradigitals.com`;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${BASE_URL}/activitylogs`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllLogs(data);
        setLogs(data); // Initially, display all logs
        
        // Extract unique table names for the filter dropdown
        const uniqueTables = [...new Set(data.map(log => log.tableName))];
        setTables(uniqueTables);

      } catch (e) {
        setError("Failed to fetch logs. Please check the API server.");
        console.error("Fetching error: ", e);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getLogTypeDisplay = (log) => {
    let typeClass = "";
    let displayText = log.actionType;

    switch (log.actionType) {
      case "INSERT":
        typeClass = "log-type-INSERT";
        displayText = "INSERT";
        break;
      case "UPDATE":
        typeClass = "log-type-UPDATE";
        displayText = "EDIT";
        break;
      case "DELETE":
        typeClass = "log-type-DELETE";
        displayText = "DELETE";
        break;
      default:
        typeClass = "log-type-OTHER";
        displayText = log.actionType;
        break;
    }
    
    // Check if actionDetails contains login/logout keywords
    if (log.actionDetails.toLowerCase().includes("login")) {
        typeClass = "log-type-LOGIN";
        displayText = "login";
    } else if (log.actionDetails.toLowerCase().includes("logout")) {
        typeClass = "log-type-LOGOUT";
        displayText = "logout";
    }

    return <span className={`log-type-tag ${typeClass}`}>{displayText}</span>;
  };
  const handleFilter = () => {
    const fromDate = fromDateFilter ? new Date(fromDateFilter) : null;
    const toDate = toDateFilter ? new Date(toDateFilter) : null;
  
    if (fromDate) fromDate.setHours(0, 0, 0, 0);               // start of the day
    if (toDate) toDate.setHours(23, 59, 59, 999);              // end of the day
  
    const filtered = allLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
  
      const userEmailMatch =
        log.userEmail.toLowerCase().includes(userEmailFilter.toLowerCase());
  
      const actionTypeMatch =
        actionTypeFilter === "All" || log.actionType === actionTypeFilter;
  
      const tableNameMatch =
        tableNameFilter === "All" || log.tableName === tableNameFilter;
  
      const fromDateMatch = !fromDate || logDate >= fromDate;
      const toDateMatch = !toDate || logDate <= toDate;
  
      return (
        userEmailMatch &&
        actionTypeMatch &&
        tableNameMatch &&
        fromDateMatch &&
        toDateMatch
      );
    });
  
    setLogs(filtered);
  };
  

  const handleShowDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };
  
  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedLog(null);
  };

  if (loading) {
    return <div className="loading">Loading activity logs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="activity-logs-container">
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="user-filter">USER</label>
          <input 
            id="user-filter" 
            type="text" 
            placeholder="Type email" 
            value={userEmailFilter} 
            onChange={(e) => setUserEmailFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="log-type-filter">LOG TYPE</label>
          <select 
            id="log-type-filter" 
            value={actionTypeFilter} 
            onChange={(e) => setActionTypeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="table-filter">TABLE</label>
          <select 
            id="table-filter"
            value={tableNameFilter}
            onChange={(e) => setTableNameFilter(e.target.value)}
          >
            <option value="All">All</option>
            {tables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="from-date">FROM DATE</label>
          <input 
            id="from-date" 
            type="date" 
            value={fromDateFilter} 
            onChange={(e) => setFromDateFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="to-date">TO DATE</label>
          <input 
            id="to-date" 
            type="date" 
            value={toDateFilter} 
            onChange={(e) => setToDateFilter(e.target.value)}
          />
        </div>
        <button className="filter-button-logs" onClick={handleFilter}>FILTER</button>
      </div>
<div className="tableWrapper">
      <table className="logs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>DATE</th>
            <th>LOG TYPE</th>
            <th>DONE BY</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{formatDate(log.timestamp)}</td>
              <td>{getLogTypeDisplay(log)}</td>
              <td>{log.userEmail}</td>
              <td>
                {(log.actionType === "UPDATE" || log.actionType === "INSERT") && (
                  <button 
                    className="show-button"
                    onClick={() => handleShowDetails(log)}
                  >
                    SHOW
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      {showDetailsModal && selectedLog && (
        <div className="modal-overlay-logs" onClick={closeModal}>
          <div className="modal-content-logs" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>&times;</button>
            <h3>Action Details: {selectedLog.actionDetails}</h3>
            {/* Displaying newData if available, otherwise a message */}
            {selectedLog.newData ? (
              <>
                <h4>New Data:</h4>
                <pre>
                  {JSON.stringify(selectedLog.newData, null, 2)}
                </pre>
              </>
            ) : (
              <p>No new data available for this log.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}