import NavBar from "../components/navbar";
export default function SuperAdminDashboardPage() {
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
            path: "/s-p",
          },
          {
            name:"Dashboard",
            path: "/s-dashboard"
          }
        ]}
      />
    </>
  );
}
