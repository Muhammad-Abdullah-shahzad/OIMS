import EmployeeManagement from "../components/employee";
import NavBar from "../components/navbar";
import React from "react";
function EmployeePage(){
    return(
       <>
       <NavBar/>
        <EmployeeManagement/>
       </>
    )
}

export default EmployeePage