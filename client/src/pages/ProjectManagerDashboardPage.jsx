import NavBar from "../components/navbar";
import ProjectDashboard from "../dashboard/projectManagerDashboard";

export default function ProjectDashboardPage(){
    return (        
        <>
        <NavBar navLinks={[
            {
                name:"Home",
                path:"/"
            },
            {
                name:"Projects Section",
                path:"/pm"
            }
           ]}/>
         <ProjectDashboard/>
         </>
    )
}