import FinanceManagement from "../financeMangement/financeManager";
import Navbar from "../components/navbar"
export default function FinanceManager(){
    return(
        <>
        <Navbar navLinks={[
        {
            name:"Home",
            path:"/"
        },
        {
            name:"Dashboard",
            path:"/fm-dashboard"
        }
       ]}/>
        <FinanceManagement/>
        </>
    )
}