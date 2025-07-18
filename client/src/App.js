import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import HRSection from './components/employee';
import HRDashboard from './dashboard/HRDashboard';

import ProjectManagement from './projectMangement/projectManegment';



import FinanceDashboard from './dashboard/FinanceDashboard';


function App() {
  return (
    
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

          {/* hr manager routes fizza baji kindly dont change it*/}
        <Route path='/hr' element={<HRSection/>} /> 
        <Route path='/hr-dashboard' element={<HRDashboard/>} /> 
           {/* project manager routes */}
          <Route path='/pm'element={<ProjectManagement/>} />       
        {/* Dashboards */}
        {/* <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} /> */}
        <Route path="/dashboard/hr" element={<HRDashboard />} />
        <Route path="/dashboard/finance" element={<FinanceDashboard />} />
        {/* <Route path="/dashboard/project" element={<ProjectDashboard />} /> */}
      </Routes>
    
  );
}

export default App;
