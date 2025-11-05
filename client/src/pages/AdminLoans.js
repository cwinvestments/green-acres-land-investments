import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../api';

function AdminLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    filterLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loans, filter, searchTerm]);

  const loadLoans = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }

      const data = await response.json();
      setLoans(data);
    } catch (err) {
      setError('Failed to load loans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = useCallback(() => {
    let filtered = [...loans];

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(loan => loan.status === 'active' && !isOverdue(loan));
    } else if (filter === 'overdue') {
      filtered = filtered.filter(loan => isOverdue(loan));
    } else if (filter === 'paid_off') {
      filtered = filtered.filter(loan => loan.status === 'paid_off');
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.first_name?.toLowerCase().includes(search) ||
        loan.last_name?.toLowerCase().includes(search) ||
        loan.email?.toLowerCase().includes(search) ||
        loan.property_title?.toLowerCase().includes(search)
      );
    }

    setFilteredLoans(filtered);
  }, [loans, filter, searchTerm]);

  const isOverdue = (loan) => {
    if (!loan.next_payment_date || loan.status !== 'active') return false;
    const today = new Date();
    const dueDate = new Date(loan.next_payment_date);
    return dueDate < today;
  };

  const getDaysOverdue = (loan) => {
    if (!loan.next_payment_date) return 0;
    const today = new Date();
    const dueDate = new Date(loan.next_payment_date);
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const toggleAlert = async (loanId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'enable' : 'disable'} alerts for this loan?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loanId}/toggle-alert`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle alert');
      }

      // Reload loans
      loadLoans();
    } catch (err) {
      alert('Failed to update alert status');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading loans...</p>
      </div>
    );
  }

  if (error) {
    return (
    <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const activeCount = loans.filter(l => l.status === 'active' && !isOverdue(l)).length;
  const overdueCount = loans.filter(l => isOverdue(l)).length;
  const paidOffCount = loans.filter(l => l.status === 'paid_off').length;

  return (
    <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Loan Management</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-summary" style={{ marginBottom: '2rem' }}>
        <div className="summary-card">
          <h3>Active Loans</h3>
          <p className="summary-number">{activeCount}</p>
        </div>
        <div className="summary-card">
          <h3>Overdue</h3>
          <p className="summary-number" style={{ color: '#dc3545' }}>{overdueCount}</p>
        </div>
        <div className="summary-card">
          <h3>Paid Off</h3>
          <p className="summary-number">{paidOffCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All ({loans.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`btn ${filter === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
            style={filter === 'overdue' ? { backgroundColor: '#dc3545' } : {}}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setFilter('paid_off')}
            className={`btn ${filter === 'paid_off' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Paid Off ({paidOffCount})
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by customer name, email, or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1',
            minWidth: '250px',
            padding: '0.5rem',
            border: '2px solid var(--border-color)',
            borderRadius: '5px'
          }}
        />
      </div>

      {/* Desktop Table View */}
      <div className="desktop-only">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Property</th>
              <th>Balance</th>
              <th>Monthly</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Profit</th>
              <th>ROI</th>
              <th>Alerts</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map(loan => {
              const daysOverdue = getDaysOverdue(loan);
              const overdueStatus = isOverdue(loan);

              return (
                <tr key={loan.id} style={{ backgroundColor: overdueStatus ? '#fff5f5' : 'white' }}>
                  <td>
                    <div style={{ fontWeight: '600' }}>
                      {loan.first_name} {loan.last_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{loan.email}</div>
                    {loan.phone && <div style={{ fontSize: '0.85rem', color: '#666' }}>{loan.phone}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{loan.property_title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{loan.property_location}</div>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--forest-green)' }}>
                    ${formatCurrency(loan.balance_remaining)}
                  </td>
                  <td>${formatCurrency(loan.monthly_payment)}</td>
                  <td>
                    {loan.next_payment_date && loan.status === 'active' ? (
                      <div>
                        <div>{new Date(loan.next_payment_date.split('T')[0].replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        {overdueStatus && (
                          <div style={{ fontSize: '0.85rem', color: '#dc3545', fontWeight: '600' }}>
                            {daysOverdue} days late
                          </div>
                        )}
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`status-badge status-${loan.status}`}>
                      {loan.status === 'active' ? 'Active' : 'Paid Off'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {loan.property_acquisition_cost ? (
                      <span style={{ 
                        color: (loan.property_price - loan.property_acquisition_cost) >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        ${formatCurrency(loan.property_price - loan.property_acquisition_cost)}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {loan.property_acquisition_cost ? (
                      <span style={{ fontWeight: '600', color: 'var(--sandy-gold)' }}>
                        {(((loan.property_price - loan.property_acquisition_cost) / loan.property_acquisition_cost) * 100).toFixed(1)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {loan.status === 'active' && (
                      <button
                        onClick={() => toggleAlert(loan.id, loan.alerts_disabled)}
                        className="btn btn-small"
                        style={{
                          backgroundColor: loan.alerts_disabled ? '#ffc107' : 'var(--forest-green)',
                          color: 'white'
                        }}
                      >
                        {loan.alerts_disabled ? '🔕 Off' : '🔔 On'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-only">
        {filteredLoans.map(loan => {
          const daysOverdue = getDaysOverdue(loan);
          const overdueStatus = isOverdue(loan);

          return (
            <div
              key={loan.id}
              style={{
                background: overdueStatus ? '#fff5f5' : 'white',
                border: overdueStatus ? '2px solid #dc3545' : '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px'
              }}
            >
              {overdueStatus && (
                <div style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: '14px'
                }}>
                  🚨 {daysOverdue} Days Overdue
                </div>
              )}

              <div style={{ marginBottom: '10px', borderBottom: '2px solid var(--forest-green)', paddingBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--forest-green)' }}>
                  {loan.first_name} {loan.last_name}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>{loan.email}</div>
                {loan.phone && <div style={{ fontSize: '14px', color: '#666' }}>{loan.phone}</div>}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: '600' }}>{loan.property_title}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{loan.property_location}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Balance</div>
                  <div style={{ fontWeight: '600', color: 'var(--forest-green)' }}>
                    ${formatCurrency(loan.balance_remaining)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Monthly</div>
                  <div style={{ fontWeight: '600' }}>${formatCurrency(loan.monthly_payment)}</div>
                </div>
                {loan.next_payment_date && loan.status === 'active' && (
                  <>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Due Date</div>
                      <div style={{ fontWeight: '600' }}>
                        {new Date(loan.next_payment_date.split('T')[0].replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Status</div>
                      <span className={`status-badge status-${loan.status}`}>
                        {loan.status === 'active' ? 'Active' : 'Paid Off'}
                      </span>
                    </div>
                  </>
                )}
                {loan.property_acquisition_cost && (
                  <>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Profit</div>
                      <div style={{ 
                        fontWeight: '600',
                        color: (loan.property_price - loan.property_acquisition_cost) >= 0 ? '#10b981' : '#ef4444'
                      }}>
                        ${formatCurrency(loan.property_price - loan.property_acquisition_cost)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>ROI</div>
                      <div style={{ fontWeight: '600', color: 'var(--sandy-gold)' }}>
                        {(((loan.property_price - loan.property_acquisition_cost) / loan.property_acquisition_cost) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </>
                )}
              </div>

              {loan.status === 'active' && (
                <button
                  onClick={() => toggleAlert(loan.id, loan.alerts_disabled)}
                  className="btn btn-full-width"
                  style={{
                    backgroundColor: loan.alerts_disabled ? '#ffc107' : 'var(--forest-green)',
                    color: 'white',
                    marginTop: '10px'
                  }}
                >
                  {loan.alerts_disabled ? '🔕 Alerts Off - Click to Enable' : '🔔 Alerts On - Click to Disable'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filteredLoans.length === 0 && (
        <div className="empty-state">
          <p>No loans found matching your filters.</p>
        </div>
      )}
    </div>
  );
}

export default AdminLoans;