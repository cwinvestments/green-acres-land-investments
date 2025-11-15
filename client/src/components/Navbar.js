import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <img 
            src="/images/green-acres-horizontal.svg" 
            alt="Green Acres Land Investments" 
            className="nav-logo-desktop"
          />
          <img 
            src="/images/green-acres-icon.svg" 
            alt="Green Acres" 
            className="nav-logo-mobile"
          />
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/properties" className="nav-link">Properties</Link>
          <Link to="/sold-properties" className="nav-link">Recent Sales</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/account-settings" className="nav-link">Account Settings</Link>
              <button onClick={handleLogout} className="nav-link btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link btn-register">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;