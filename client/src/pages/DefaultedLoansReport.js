import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../api';

function DefaultedLoansReport() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDefaultedLoans();
  }, []);

  const loadDefaultedLoans = async () => {
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
      // Filter for defaulted loans only
      const defaultedLoans = data.filter(loan => loan.status === 'defaulted');
      setLoans(defaultedLoans);
    } catch (err) {
      setError('Failed to load defaulted loans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalRecoveryCosts = loans.reduce((sum, loan) => sum + parseFloat(loan.recovery_costs || 0), 0);
  const totalNetRecovery = loans.reduce((sum, loan) => sum + parseFloat(loan.net_recovery || 0), 0);
  const totalBalanceLost = loans.reduce((sum, loan) => sum + parseFloat(loan.balance_remaining || 0), 0);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading defaulted loans report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '95%', margin: '0 auto' }}>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '95%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>📊 Defaulted Loans Report</h1>
        <button onClick={() => navigate('/admin/loans')} className="btn btn-secondary">
          ← Back to Loan Management
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Total Defaulted Loans</h3>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#dc3545' }}>
            {loans.length}
          </p>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Total Recovery Costs</h3>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#dc3545' }}>
            ${formatCurrency(totalRecoveryCosts)}
          </p>
          <small style={{ color: '#999' }}>Legal, repo, cleanup</small>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Net Recovery</h3>
          <p style={{ 
            margin: 0, 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: totalNetRecovery >= 0 ? 'var(--forest-green)' : '#dc3545'
          }}>
            ${formatCurrency(totalNetRecovery)}
          </p>
          <small style={{ color: '#999' }}>Amount kept after costs</small>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Balance Lost</h3>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#dc3545' }}>
            ${formatCurrency(totalBalanceLost)}
          </p>
          <small style={{ color: '#999' }}>Remaining unpaid balance</small>
        </div>
      </div>

      {/* Defaulted Loans Table */}
      {loans.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--forest-green)', marginBottom: '10px' }}>🎉 No Defaulted Loans</h3>
          <p style={{ color: '#666' }}>All your loans are either active or paid off!</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Property</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Default Date</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Original Balance</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Balance Lost</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Recovery Costs</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Net Recovery</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '600' }}>
                      {loan.first_name} {loan.last_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{loan.email}</div>
                    {loan.phone && <div style={{ fontSize: '0.85rem', color: '#666' }}>{loan.phone}</div>}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '600' }}>{loan.property_title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{loan.property_location}</div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {loan.default_date ? new Date(loan.default_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>
                    ${formatCurrency(loan.loan_amount)}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#dc3545', fontWeight: '600' }}>
                    ${formatCurrency(loan.balance_remaining)}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#dc3545' }}>
                    ${formatCurrency(loan.recovery_costs || 0)}
                  </td>
                  <td style={{ 
                    padding: '15px', 
                    textAlign: 'right', 
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: (loan.net_recovery || 0) >= 0 ? 'var(--forest-green)' : '#dc3545'
                  }}>
                    ${formatCurrency(loan.net_recovery || 0)}
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.9rem', color: '#666', maxWidth: '200px' }}>
                    {loan.default_notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Analysis Section */}
      {loans.length > 0 && (
        <div className="card" style={{ marginTop: '30px', padding: '30px' }}>
          <h2 style={{ color: 'var(--forest-green)', marginBottom: '20px' }}>📈 Financial Analysis</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#666', marginBottom: '10px' }}>Default Rate</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545', margin: 0 }}>
                {((loans.length / (loans.length + 0)) * 100).toFixed(1)}%
              </p>
              <small style={{ color: '#999' }}>Of total loans</small>
            </div>

            <div>
              <h4 style={{ color: '#666', marginBottom: '10px' }}>Average Recovery Cost</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545', margin: 0 }}>
                ${formatCurrency(totalRecoveryCosts / loans.length)}
              </p>
              <small style={{ color: '#999' }}>Per defaulted loan</small>
            </div>

            <div>
              <h4 style={{ color: '#666', marginBottom: '10px' }}>Recovery Rate</h4>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                margin: 0,
                color: totalNetRecovery >= 0 ? 'var(--forest-green)' : '#dc3545'
              }}>
                {totalBalanceLost > 0 
                  ? ((totalNetRecovery / totalBalanceLost) * 100).toFixed(1) 
                  : '0'}%
              </p>
              <small style={{ color: '#999' }}>Net recovery vs balance lost</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DefaultedLoansReport;