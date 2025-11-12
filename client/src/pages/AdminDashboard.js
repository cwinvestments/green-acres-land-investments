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

      {/* Performance Indicators */}
      <h2 style={{ marginBottom: '20px' }}>📊 Performance Overview</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: '#666', fontSize: '14px' }}>Revenue (Last 30 Days)</h4>
            <span style={{ fontSize: '20px' }}>
              {stats.revenueTrend === 'up' && '📈'}
              {stats.revenueTrend === 'down' && '📉'}
              {stats.revenueTrend === 'flat' && '➡️'}
            </span>
          </div>
          <h3 style={{ 
            fontSize: '28px', 
            margin: '0', 
            color: stats.revenueTrend === 'up' ? 'var(--forest-green)' : stats.revenueTrend === 'down' ? '#dc3545' : '#666' 
          }}>
            ${loading ? '-' : stats.revenueLast30Days.toFixed(2)}
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
            {stats.revenueTrend === 'up' && 'Trending up vs. previous period'}
            {stats.revenueTrend === 'down' && 'Trending down vs. previous period'}
            {stats.revenueTrend === 'flat' && 'Stable vs. previous period'}
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Collection Rate</h4>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <h3 style={{ 
              fontSize: '28px', 
              margin: '0', 
              color: stats.collectionRate >= 90 ? 'var(--forest-green)' : stats.collectionRate >= 75 ? '#ffc107' : '#dc3545' 
            }}>
              {loading ? '-' : stats.collectionRate}%
            </h3>
            <span style={{ fontSize: '16px' }}>
              {stats.collectionRate >= 90 && '✅'}
              {stats.collectionRate >= 75 && stats.collectionRate < 90 && '⚠️'}
              {stats.collectionRate < 75 && '🚨'}
            </span>
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>On-time payment rate (90 days)</p>
        </div>

        <div className="card" style={{ padding: '20px', backgroundColor: stats.overdueLoans > 0 ? '#fff3cd' : 'white', border: stats.overdueLoans > 0 ? '2px solid #ffc107' : '1px solid #ddd' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Overdue Loans</h4>
          <h3 style={{ 
            fontSize: '28px', 
            margin: '0', 
            color: stats.overdueLoans === 0 ? 'var(--forest-green)' : '#ffc107' 
          }}>
            {loading ? '-' : stats.overdueLoans}
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
            {stats.overdueLoans === 0 ? 'All payments current 🎉' : 'Requires attention'}
          </p>
        </div>

        <div className="card" style={{ padding: '20px', backgroundColor: stats.loansInDefault > 0 ? '#f8d7da' : 'white', border: stats.loansInDefault > 0 ? '2px solid #dc3545' : '1px solid #ddd' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>In Default</h4>
          <h3 style={{ 
            fontSize: '28px', 
            margin: '0', 
            color: stats.loansInDefault === 0 ? 'var(--forest-green)' : '#dc3545' 
          }}>
            {loading ? '-' : stats.loansInDefault}
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
            {stats.loansInDefault === 0 ? 'No defaults 🎉' : 'Notices sent'}
          </p>
        </div>
      </div>

      {/* Upcoming Tax Deadlines */}
      {stats.taxDeadlines && stats.taxDeadlines.length > 0 && (
        <>
          <h2 style={{ marginBottom: '20px' }}>📅 Upcoming Tax Deadlines (Next 60 Days)</h2>
          <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
            {stats.taxDeadlines.map((deadline, idx) => {
              const date1 = deadline.tax_payment_1_date ? new Date(deadline.tax_payment_1_date) : null;
              const date2 = deadline.tax_payment_2_date ? new Date(deadline.tax_payment_2_date) : null;
              const now = new Date();
              const sixtyDaysFromNow = new Date();
              sixtyDaysFromNow.setDate(now.getDate() + 60);

              const upcomingDate1 = date1 && date1 >= now && date1 <= sixtyDaysFromNow;
              const upcomingDate2 = date2 && date2 >= now && date2 <= sixtyDaysFromNow;

              return (
                <div key={idx} style={{ 
                  padding: '12px 0', 
                  borderBottom: idx < stats.taxDeadlines.length - 1 ? '1px solid #eee' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{deadline.title}</strong>
                    {upcomingDate1 && (
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                        Payment 1: {date1.toLocaleDateString()} - ${parseFloat(deadline.tax_payment_1_amount).toFixed(2)}
                      </div>
                    )}
                    {upcomingDate2 && (
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                        Payment 2: {date2.toLocaleDateString()} - ${parseFloat(deadline.tax_payment_2_amount).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/admin/properties`)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '14px' }}
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

        <div className="card" style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', minHeight: '200px' }} onClick={() => navigate('/admin/states')}>
          <h2 style={{ margin: '0 0 10px 0' }}>🗺️ State Management</h2>
          <p style={{ color: '#666', marginBottom: '15px', flexGrow: 1 }}>
            Manage states shown on public site
          </p>
          <button className="btn btn-primary">Manage States</button>
        </div>
      </div>      
    </div>
  );
}

export default AdminDashboard;