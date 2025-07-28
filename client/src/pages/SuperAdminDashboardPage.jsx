import SuperAdminDashboard from "../dashboard/AdminDashboard";
import NavBar from "../components/navbar";

export default function SuperAdminDashboardPage(){
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
            name: "Dashboard",
            path: "/s-dashboard",
          },
        ]}
      />
        <SuperAdminDashboard/>
        </>
    )
}