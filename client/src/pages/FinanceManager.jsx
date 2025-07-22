import FinanceManagement from "../financeMangement/financeManager";
import Navbar from "../components/navbar"
export default function FinanceManager(){
    return(
        <>
        <Navbar dashboardRoute={"/fm-dashboard"} />
        <FinanceManagement/>
        </>
    )
}