import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeLoans: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');

    if (!adminToken || !adminUser) {
      navigate('/admin/login');
      return;
    }

    setAdmin(JSON.parse(adminUser));
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Admin Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'var(--light-green)',
        borderRadius: '8px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>🌿 Green Acres Admin</h1>
          <p style={{ margin: 0, color: '#666' }}>
            Welcome back, {admin.firstName} {admin.lastName}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn"
          style={{ backgroundColor: '#dc3545', color: 'white' }}
        >
          Logout
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', color: 'var(--forest-green)' }}>
            {loading ? '-' : stats.totalProperties}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>Total Properties</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', color: 'var(--forest-green)' }}>
            {loading ? '-' : stats.activeLoans}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>Active Loans</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', color: 'var(--forest-green)' }}>
            {loading ? '-' : stats.totalCustomers}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>Total Customers</p>
        </div>
      </div>

      {/* Admin Menu */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div className="card" style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', minHeight: '200px' }} onClick={() => navigate('/admin/properties')}>
          <h2 style={{ margin: '0 0 10px 0' }}>🏘️ Property Management</h2>
          <p style={{ color: '#666', marginBottom: '15px', flexGrow: 1 }}>
            Add, edit, and manage property listings
          </p>
          <button className="btn btn-primary">Manage Properties</button>
        </div>

        <div className="card" style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', minHeight: '200px' }} onClick={() => navigate('/admin/customers')}>
          <h2 style={{ margin: '0 0 10px 0' }}>👥 Customer Management</h2>
          <p style={{ color: '#666', marginBottom: '15px', flexGrow: 1 }}>
            View and manage customer accounts
          </p>
          <button className="btn btn-primary">Manage Customers</button>
        </div>

        <div className="card" style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', minHeight: '200px' }} onClick={() => navigate('/admin/loans')}>
          <h2 style={{ margin: '0 0 10px 0' }}>💰 Loan Management</h2>
          <p style={{ color: '#666', marginBottom: '15px', flexGrow: 1 }}>
            Track loans, payments, and balances
          </p>
          <button className="btn btn-primary">Manage Loans</button>
        </div>

        <div className="card" style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', minHeight: '200px' }} onClick={() => navigate('/admin/payments')}>
          <h2 style={{ margin: '0 0 10px 0' }}>💳 Payment Tracking</h2>
          <p style={{ color: '#666', marginBottom: '15px', flexGrow: 1 }}>
            View payment history and reports
          </p>
          <button className="btn btn-primary">View Payments</button>
        </div>

        <div className="card" style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', minHeight: '200px' }} onClick={() => navigate('/admin/reports')}>
          <h2 style={{ margin: '0 0 10px 0' }}>📊 Financial Reports</h2>
          <p style={{ color: '#666', marginBottom: '15px', flexGrow: 1 }}>
            Revenue, tax escrow, HOA tracking, and analytics
          </p>
          <button className="btn btn-primary">View Reports</button>
        </div>

        <div className="card" style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', minHeight: '200px' }} onClick={() => navigate('/admin/tax-summary')}>
          <h2 style={{ margin: '0 0 10px 0' }}>💼 Income Tax Summary</h2>
          <p style={{ color: '#666', marginBottom: '15px', flexGrow: 1 }}>
            Annual tax report, quarterly breakdown, CPA export
          </p>
          <button className="btn btn-primary">View Tax Report</button>
        </div>
      </div>      
    </div>
  );
}

export default AdminDashboard;