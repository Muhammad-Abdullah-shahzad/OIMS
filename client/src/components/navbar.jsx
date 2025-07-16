// src/components/NavBar.jsx
import React, { useState } from 'react';
import './NavBar.css';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from "../assets/company-logo.jpg"
const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-logo"><img src={logo} alt="company-logo" />OraDigitals</div>

      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/employee-dashboard" onClick={closeMenu}>Dashboard</Link></li>
      </ul>
    </nav>
  );
};

export default NavBar;
