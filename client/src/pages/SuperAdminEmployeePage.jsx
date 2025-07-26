import NavBar from "../components/navbar";
import EmployeeManagement from "../components/employee";

export default function SuperAdminEmployeePage() {
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
      <EmployeeManagement />
    </>
  );
}
