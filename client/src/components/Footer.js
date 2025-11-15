import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--forest-green)',
      color: 'white',
      padding: '3rem 1rem 1rem',
      marginTop: '4rem'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Company */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--sandy-gold)', fontSize: '1.1rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>
                  About Us
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/contact" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Properties */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--sandy-gold)', fontSize: '1.1rem' }}>Properties</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/properties" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>
                  Browse Properties
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/sold-properties" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>
                  Sold Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--sandy-gold)', fontSize: '1.1rem' }}>Account</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>
                  Login
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>
                  Register
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--sandy-gold)', fontSize: '1.1rem' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/privacy" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>
                  Privacy Policy
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/terms" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: 0, marginBottom: '0.5rem' }}>
            © {new Date().getFullYear()} Green Acres Land Investments, LLC. All rights reserved.
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
            Making land ownership accessible to everyone.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;