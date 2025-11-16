import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeLoans: 0,
    totalCustomers: 0,
    overdueLoans: 0,
    loansInDefault: 0,
    revenueLast30Days: 0,
    revenueTrend: 'flat',
    collectionRate: 0,
    taxDeadlines: []
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
    <div className="admin-dashboard-container">
      {/* Admin Header */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header-text">
          <h1 className="admin-page-title">🌿 Green Acres Admin</h1>
          <p>
            Welcome back, {admin.firstName} {admin.lastName}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn admin-logout-btn"
        >
          Logout
        </button>
      </div>

      {/* Quick Stats */}
      <div className="admin-stats-grid">
        <div className="card admin-stat-card">
          <h3 className="admin-stat-number">
            {loading ? '-' : stats.totalProperties}
          </h3>
          <p className="admin-stat-label">Total Properties</p>
        </div>
        <div className="card admin-stat-card">
          <h3 className="admin-stat-number">
            {loading ? '-' : stats.activeLoans}
          </h3>
          <p className="admin-stat-label">Active Loans</p>
        </div>
        <div className="card admin-stat-card">
          <h3 className="admin-stat-number">
            {loading ? '-' : stats.totalCustomers}
          </h3>
          <p className="admin-stat-label">Total Customers</p>
        </div>
      </div>

      {/* Performance Indicators */}
      <h2 className="admin-section-title">📊 Performance Overview</h2>
      <div className="admin-performance-grid">
        <div className="card admin-performance-card">
          <div className="admin-performance-header">
            <h4>Revenue (Last 30 Days)</h4>
            <span>
              {stats.revenueTrend === 'up' && '📈'}
              {stats.revenueTrend === 'down' && '📉'}
              {stats.revenueTrend === 'flat' && '➡️'}
            </span>
          </div>
          <h3 className="admin-performance-number" style={{ 
            color: stats.revenueTrend === 'up' ? 'var(--forest-green)' : stats.revenueTrend === 'down' ? '#dc3545' : '#666' 
          }}>
            ${loading ? '-' : stats.revenueLast30Days.toFixed(2)}
          </h3>
          <p className="admin-performance-subtitle">
            {stats.revenueTrend === 'up' && 'Trending up vs. previous period'}
            {stats.revenueTrend === 'down' && 'Trending down vs. previous period'}
            {stats.revenueTrend === 'flat' && 'Stable vs. previous period'}
          </p>
        </div>

        <div className="card admin-performance-card">
          <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Collection Rate</h4>
          <div className="admin-performance-flex">
            <h3 className="admin-performance-number" style={{ 
              color: stats.collectionRate >= 90 ? 'var(--forest-green)' : stats.collectionRate >= 75 ? '#ffc107' : '#dc3545' 
            }}>
              {loading ? '-' : stats.collectionRate}%
            </h3>
            <span className="admin-performance-icon">
              {stats.collectionRate >= 90 && '✅'}
              {stats.collectionRate >= 75 && stats.collectionRate < 90 && '⚠️'}
              {stats.collectionRate < 75 && '🚨'}
            </span>
          </div>
          <p className="admin-performance-subtitle">On-time payment rate (30 days)</p>
        </div>

        <div className="card admin-performance-card" style={{ 
          backgroundColor: stats.overdueLoans > 0 ? '#fff3cd' : 'white', 
          border: stats.overdueLoans > 0 ? '2px solid #ffc107' : '1px solid #ddd' 
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Overdue Loans</h4>
          <h3 className="admin-performance-number" style={{ 
            color: stats.overdueLoans === 0 ? 'var(--forest-green)' : '#ffc107' 
          }}>
            {loading ? '-' : stats.overdueLoans}
          </h3>
          <p className="admin-performance-subtitle">
            {stats.overdueLoans === 0 ? 'All payments current 🎉' : 'Requires attention'}
          </p>
        </div>

        <div className="card admin-performance-card" style={{ 
          backgroundColor: stats.loansInDefault > 0 ? '#f8d7da' : 'white', 
          border: stats.loansInDefault > 0 ? '2px solid #dc3545' : '1px solid #ddd' 
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>In Default</h4>
          <h3 className="admin-performance-number" style={{ 
            color: stats.loansInDefault === 0 ? 'var(--forest-green)' : '#dc3545' 
          }}>
            {loading ? '-' : stats.loansInDefault}
          </h3>
          <p className="admin-performance-subtitle">
            {stats.loansInDefault === 0 ? 'No defaults 🎉' : 'Notices sent'}
          </p>
        </div>
      </div>

      {/* Upcoming Tax Deadlines */}
      {stats.taxDeadlines && stats.taxDeadlines.length > 0 && (
        <>
          <h2 className="admin-section-title">📅 Upcoming Tax Deadlines (Next 60 Days)</h2>
          <div className="card admin-tax-deadlines-card">
            {stats.taxDeadlines.map((deadline, idx) => {
              const date1 = deadline.tax_payment_1_date ? new Date(deadline.tax_payment_1_date) : null;
              const date2 = deadline.tax_payment_2_date ? new Date(deadline.tax_payment_2_date) : null;
              const now = new Date();
              const sixtyDaysFromNow = new Date();
              sixtyDaysFromNow.setDate(now.getDate() + 60);

              const upcomingDate1 = date1 && date1 >= now && date1 <= sixtyDaysFromNow;
              const upcomingDate2 = date2 && date2 >= now && date2 <= sixtyDaysFromNow;

              return (
                <div key={idx} className="admin-tax-deadline-item">
                  <div className="admin-tax-deadline-info">
                    <strong>{deadline.title}</strong>
                    {upcomingDate1 && (
                      <div className="admin-tax-deadline-payment">
                        Payment 1: {date1.toLocaleDateString()} - ${parseFloat(deadline.tax_payment_1_amount).toFixed(2)}
                      </div>
                    )}
                    {upcomingDate2 && (
                      <div className="admin-tax-deadline-payment">
                        Payment 2: {date2.toLocaleDateString()} - ${parseFloat(deadline.tax_payment_2_amount).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/admin/properties/${deadline.id}`)}
                    className="btn btn-secondary admin-tax-deadline-btn"
                  >
                    View Property
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Admin Menu */}
      <div className="admin-menu-grid">
        <div className="card admin-menu-card" onClick={() => navigate('/admin/properties')}>
          <h2>🏘️ Property Management</h2>
          <p>
            Add, edit, and manage property listings
          </p>
          <button className="btn btn-primary">Manage Properties</button>
        </div>

        <div className="card admin-menu-card" onClick={() => navigate('/admin/customers')}>
          <h2>👥 Customer Management</h2>
          <p>
            View and manage customer accounts
          </p>
          <button className="btn btn-primary">Manage Customers</button>
        </div>

        <div className="card admin-menu-card" onClick={() => navigate('/admin/loans')}>
          <h2>💰 Loan Management</h2>
          <p>
            Track loans, payments, and balances
          </p>
          <button className="btn btn-primary">Manage Loans</button>
        </div>

        <div className="card admin-menu-card" onClick={() => navigate('/admin/payments')}>
          <h2>💳 Payment Tracking</h2>
          <p>
            View payment history and reports
          </p>
          <button className="btn btn-primary">View Payments</button>
        </div>

        <div className="card admin-menu-card" onClick={() => navigate('/admin/reports')}>
          <h2>📊 Financial Reports</h2>
          <p>
            Revenue, tax escrow, HOA tracking, and analytics
          </p>
          <button className="btn btn-primary">View Reports</button>
        </div>

        <div className="card admin-menu-card" onClick={() => navigate('/admin/tax-summary')}>
          <h2>💼 Income Tax Summary</h2>
          <p>
            Annual tax report, quarterly breakdown, CPA export
          </p>
          <button className="btn btn-primary">View Tax Report</button>
        </div>

        <div className="card admin-menu-card" onClick={() => navigate('/admin/states')}>
          <h2>🗺️ State Management</h2>
          <p>
            Manage states shown on public site
          </p>
          <button className="btn btn-primary">Manage States</button>
        </div>
      </div>      
    </div>
  );
}

export default AdminDashboard;