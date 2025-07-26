import ProjectManagement from "../projectMangement/projectManegment";
import React from "react";
import NavBar from "../components/navbar";

function ProjectManagementPage() {
  return (
    <>
      <NavBar navLinks={[
        {
            name:"Home",
            path:"/"
        },
        {
            name:"Dashboard",
            path:"/pm-dashboard"
        }
       ]}/>
      <ProjectManagement />
    </>
  );
}

export default ProjectManagementPage;
