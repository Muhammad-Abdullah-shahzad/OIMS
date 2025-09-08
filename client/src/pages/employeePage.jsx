import EmployeeManagement from "../components/employee";
import NavBar from "../components/navbar";
import React from "react";
function EmployeePage( ) {
    return(
       <>
       <NavBar navLinks={[
        {
            name:"Home",
            path:"/"
        },
        {
            name:"Dashboard",
            path:"/hr-dashboard"
        }
       ]}
       hamburgerShow={true}
       />
       
        <EmployeeManagement/>
       </>
    )
}

export default EmployeePage;