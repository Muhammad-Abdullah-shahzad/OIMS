import "../styles/Table.scss";
import {Edit , Trash2 , LinkIcon , Users} from "lucide-react"
import EmployeeProfile from "../EmployeeProfile/EmployeeProfile";


// () => openModal("edit", employee)

// () => openModal("delete", employee)

//  openModal('assign', project

//  openModal('view_assignments', project)
function Table({ thead =[], datakeys=[], data=[], showProfile, onProfileClick=()=>{}, actions={} }) {
    const { onEditClick =()=>{}, onDeleteClick=()=>{}, onAssignmentClick=()=>{}, onViewAssignmentClick=()=>{} } = actions;
    const { edit, del, assign, viewAssign } = actions;
    function isValidDate(val) {
        const d = new Date(val);
        return d instanceof Date && !isNaN(d.getTime());
      }
      

    return (
        <div className="employee-table-container">
            <table className="employee-table">
                <thead>
                    <tr>
                        {showProfile && (
                            <th className="table-header rounded-tl">Profile</th>
                        )}

                        {thead.map((header) => (
                            <th className="table-header rounded-tl">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                  
                    {data.map((tdata , index) => (
                        <tr key={tdata.id} className="table-row">
                              {showProfile && (
                        <td
                            className="table-data font-medium profile-cell"
                            onClick={()=>onProfileClick(index)}
                        >
                            <EmployeeProfile
                                profileImageUrl={tdata.profile_image_url}
                            />

                        </td>

                    )}
                            {
                               datakeys.map((key) => {
                                const value = tdata[key];
                              
                                if (value instanceof Date) {
                                  return <td className="table-data">{value.toLocaleDateString()}</td>;
                                } 
                                else if (typeof value ==="number"){
                                    return <td className="table-data">{value}</td>
                                }

                                else if (typeof value ==="string" && value.includes("ORA")){
                                    return <td className="table-data">{value}</td>
                                }
                                else if (typeof value === "object" && value !== null) {
                                    
                                  return <td className="table-data">{Object.keys(value).length > 0 ? Object.keys(value).join(","):"No Data"}</td>; {/* or JSON.stringify(value) */}
                                } else if(isNaN(new Date(value))){
                                  return <td className="table-data">{value}</td>;
                                }
                                else if (isValidDate(value)){
                                    return <td className="table-data">{new Date(value).toLocaleDateString()}</td>;
                                }
                                else if (typeof value ==="string" && value.includes("{")){
                                    return <td className="table-data">{Object.keys(JSON.parse(value)).length > 0 ? Object.keys(JSON.parse(value)).join(","):"No Data"}</td>; {/* or JSON.stringify(value) */} 
                                }
                              })
                              
                            }
                            <td className="table-data table-actions">
                                <div className="action-buttons-group">

                                    {

                                        edit &&
                                        <button
                                            onClick={()=>onEditClick(index)}
                                            className="action-button edit-button"
                                            title="Edit Employee"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    }
                                    {
                                        del &&
                                        <button
                                            onClick={()=>onDeleteClick(index)}
                                            className="action-button delete-button"
                                            title="Delete Employee"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                     
                                    }
                                    {
                                          assign &&
                                       
                                          <button
                                          onClick={() =>onAssignmentClick(index)}
                                          className="action-button assign-button"
                                          title="Assign Employee"
                                      >
                                          <LinkIcon size={18} />
                                      </button> 
   
                                    }
                                    { viewAssign &&
                                        <button
                                        onClick={() =>onViewAssignmentClick(index)}
                                        className="action-button button-secondary"
                                        title="View Assigned Employees"
                                    >
                                        <Users size={18} />
                                    </button>

                                    }
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default Table;