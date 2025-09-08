// EmployeeProfileCard.jsx
import React from 'react';
import { 
    X, 
    Mail, 
    Phone, 
    IdCard, 
    Banknote, 
    MapPin, 
    Building, 
    User, 
    Calendar,
    Wallet,
    Laptop,
    HandCoins,
} from 'lucide-react';
import styles from "../styles/employeeDetailsProfileCard.module.scss";

const EmployeeProfileCard = ({ employee, onClose , onProfileClick }) => {
    if (!employee) {
        return null;
    }

    return (
        <div className={styles.profileCardOverlay} onClick={onClose}>
            <div className={styles.profileCardContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.profileCardCloseBtn} onClick={onClose}>
                    <X size={20} />
                </button>
                
                <div className={styles.profileCardLayout}>
                    <div className={styles.profileHeader}>
                        <img 
                            onClick={onProfileClick}
                            src={employee.profile_image_url || 'https://techboard.com.au/wp-content/uploads/2020/01/no-profile-image-png-3.png'}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            className={styles.profileImage}
                        />
                        <h2 className={styles.profileName}>{employee.firstName} {employee.lastName}</h2>
                        <p className={styles.profileDesignation}>{employee.designation}</p>
                    </div>

                    <div className={styles.profileDetailsGrid}>
                        <div className={styles.detailItem}>
                            <div className={styles.detailIcon}><IdCard size={16} /></div>
                            <div>
                                <strong>Employee ID:</strong> <span>{employee.employee_id}</span>
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailIcon}><Mail size={16} /></div>
                            <div>
                                <strong>Email:</strong> <span>{employee.email}</span>
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailIcon}><Phone size={16} /></div>
                            <div>
                                <strong>Phone:</strong> <span>{employee.phoneNumber}</span>
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailIcon}><User size={16} /></div>
                            <div>
                                <strong>CNIC:</strong> <span>{employee.cnic}</span>
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailIcon}><MapPin size={16} /></div>
                            <div>
                                <strong>Address:</strong> <span>{employee.address || 'N/A'}</span>
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailIcon}><Banknote size={16} /></div>
                            <div>
                                <strong>Salary:</strong> <span>${parseFloat(employee.salary).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailIcon}><Calendar size={16} /></div>
                            <div>
                                <strong>Hire Date:</strong> <span>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailIcon}><Building size={16} /></div>
                            <div>
                                <strong>Department:</strong> <span>{employee.department || 'N/A'}</span>
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailIcon}><MapPin size={16} /></div>
                            <div>
                                <strong>Location:</strong> <span>{employee.location || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.detailsSection}>
                    <h3><Banknote size={20} className={styles.sectionIcon} /> Bank Details</h3>
                    <p><strong>Bank Name:</strong> {employee.bank_name || 'N/A'}</p>
                    <p><strong>Account:</strong> {employee.bank_account || 'N/A'}</p>
                </div>
                
                <div className={styles.detailsSection}>
                    <h3><HandCoins size={20} className={styles.sectionIcon} /> Allowances</h3>
                    <ul className={styles.detailsList}>
                        {employee.alownces && Object.keys((employee.alownces)).length > 0 ? (
                            Object.entries((employee.alownces)).map(([name, amount]) => (
                                <li key={name}>{name}: ${amount}</li>
                            ))
                        ) : (
                            <li>No allowances.</li>
                        )}
                    </ul>
                </div>

                <div className={styles.detailsSection}>
                    <h3><Laptop size={20} className={styles.sectionIcon} /> Resources</h3>
                    <ul className={styles.detailsList}>
                        {employee.resources && Object.keys((employee.resources)).length > 0 ? (
                            Object.keys((employee.resources)).map((name) => (
                                <li key={name}>{name}</li>
                            ))
                        ) : (
                            <li>No resources allocated.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfileCard;