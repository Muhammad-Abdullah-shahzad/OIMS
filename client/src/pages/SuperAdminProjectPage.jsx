import NavBar from "../components/navbar";
import ProjectManagement from "../projectMangement/projectManegment";
export default function SuperAdminProjectPage(){
    return (
        <>
         <NavBar
        navLinks={[
          {
            name: "Home",
            path: "/",
          },
          {
            name: "Human Resource",
            path: "/s-hr",
          },
          {
            name: "Finance",
            path: "/s-fm",
          },
          {
            name: "Projects",
            path: "/s-pm",
          },
          {
            name:"Dashboard",
            path: "/s-dashboard"
          }
        ]}
      />
       <ProjectManagement/>
        </>
    )
}