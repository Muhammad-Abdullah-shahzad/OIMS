import EmployeeDashboard from "../dashboard/HRDashboard";
import React from "react";
import NavBar from "../components/navbar";

function HRDashboardPage(){
    return(
        <>
        <NavBar navLinks={[
        {
            name:"Home",
            path:"/"
        },
        {
            name:"HR Section",
            path:"/hr"
        }
       ]}/>
        <EmployeeDashboard/>
        </>
    )
}
export default HRDashboardPage