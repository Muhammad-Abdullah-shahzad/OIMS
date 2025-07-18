import ProjectManagement from "../projectMangement/projectManegment";
import React from "react";
import NavBar from "../components/navbar";

function ProjectManagementPage() {
  return (
    <>
      <NavBar dashboardRoute={"/pm-dashboard"} />
      <ProjectManagement />
    </>
  );
}

export default ProjectManagementPage;
