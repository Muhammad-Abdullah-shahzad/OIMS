// src/components/NavBar.jsx
import React, { useState } from 'react';
import './NavBar.css';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from "../assets/company-logo.jpg"
const NavBar = ({navLinks,showProfile,hamburgerShow}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogin,setIsLogin] = useState(true);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  function setButtonText () {
    if(isLogin){
      return 'log out';
    }
    return 'log in';
  } 
function setPath(){
  if(isLogin){
   return  ''
  }
  return '/login'
}
  return (
    <nav className="navbar">
      <div className="navbar-logo"><img src={logo} alt="company-logo" />OraDigitals</div>
  {  hamburgerShow &&
      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>
}
<div className='profile-login-wrapper'>
{<div  ><Link className='btn btn-login' to={setPath()} onClick={()=>{
        if(localStorage.token){
          localStorage.clear();
          setIsLogin(false);
        }
      }}>{setButtonText()}</Link></div>}
       { showProfile && <div><img className='profile-pic' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs0kuP0c0x-YkpABSxft8P0lyh_OsHC6zHow&s" alt="" /></div>}
</div>{
  navLinks.length > 0 &&
      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
     
     
        {
          navLinks.map((navLink,index)=>{
              return <li  ><Link  to={navLink.path} onClick={closeMenu}>{navLink.name}</Link></li>
          })
        }
      
      </ul>
}
    </nav>
  );
};

export default NavBar;
