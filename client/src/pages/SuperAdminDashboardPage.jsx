import SuperAdminDashboard from "../dashboard/AdminDashboard";
import NavBar from "../components/navbar";

export default function SuperAdminDashboardPage(){
    return (
        <>
        <NavBar
        navLinks={[
         
        ]}

        showProfile={true}
        hamburgerShow={false}
      />
        <SuperAdminDashboard/>
        </>
    )
}