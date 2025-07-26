import FinanceDashboard from "../dashboard/FinanceDashboard";
import NavBar from "../components/navbar";

export default function FinanceDashboardPage() {
  return <>
  <NavBar navLinks={[
        {
            name:"Home",
            path:"/"
        },
        {
            name:"Finance Manager",
            path:"/fm"
        }
       ]}/>
      <FinanceDashboard/> 
  </>;
}
