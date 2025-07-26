import NavBar from "../components/navbar";
import FinanceManager from "../financeMangement/financeManager";
export default function SuperAdminFinancePage() {
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
      <FinanceManager />
    </>
  );
}
