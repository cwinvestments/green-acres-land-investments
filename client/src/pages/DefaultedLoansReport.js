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
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-page-title">📊 Defaulted Loans Report</h1>
        <button onClick={() => navigate('/admin/loans')} className="btn btn-secondary" style={{ width: '100%' }}>
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
                <th style={{ padding: '15px', textAlign: 'right' }}>Acquisition Cost</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Total Paid</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Balance Lost</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Recovery Costs</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Net Recovery</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Property Status</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => {
                const acquisitionCost = parseFloat(loan.property_acquisition_cost || 0);
                const totalPaid = parseFloat(loan.total_paid || 0);
                const recoveryCosts = parseFloat(loan.recovery_costs || 0);
                const propertyProfit = totalPaid - acquisitionCost - recoveryCosts;
                
                return (
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
                      {loan.property_apn && <div style={{ fontSize: '0.85rem', color: '#999' }}>APN: {loan.property_apn}</div>}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      {loan.default_date ? new Date(loan.default_date).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>
                      ${formatCurrency(acquisitionCost)}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: 'var(--forest-green)' }}>
                      ${formatCurrency(totalPaid)}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', color: '#dc3545', fontWeight: '600' }}>
                      ${formatCurrency(loan.balance_remaining)}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', color: '#dc3545' }}>
                      ${formatCurrency(recoveryCosts)}
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
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor: loan.property_status === 'available' ? '#ffc107' : loan.property_status === 'sold' ? 'var(--forest-green)' : '#666',
                        color: 'white'
                      }}>
                        {loan.property_status === 'available' ? 'Available' : 
                         loan.property_status === 'sold' ? 'Resold' :
                         loan.property_status === 'pending' ? 'Pending' :
                         loan.property_status}
                      </div>
                      {propertyProfit !== 0 && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          marginTop: '5px',
                          color: propertyProfit >= 0 ? 'var(--forest-green)' : '#dc3545',
                          fontWeight: '600'
                        }}>
                          {propertyProfit >= 0 ? '+' : '-'}${formatCurrency(Math.abs(propertyProfit))} {propertyProfit >= 0 ? 'profit' : 'loss'}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.9rem', color: '#666', maxWidth: '200px' }}>
                      {loan.default_notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Property Lifecycle Analysis */}
      {loans.length > 0 && (
        <div className="card" style={{ marginTop: '30px', padding: '30px' }}>
          <h2 style={{ color: 'var(--forest-green)', marginBottom: '20px' }}>🏘️ Property Lifecycle Analysis</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            This section tracks each property's complete financial journey, including all customers who have purchased it.
          </p>
          
          {/* Group loans by property */}
          {(() => {
            const propertyMap = {};
            loans.forEach(loan => {
              const propId = loan.property_id;
              if (!propertyMap[propId]) {
                propertyMap[propId] = {
                  property_id: propId,
                  property_title: loan.property_title,
                  property_apn: loan.property_apn,
                  property_status: loan.property_status,
                  acquisition_cost: parseFloat(loan.property_acquisition_cost || 0),
                  loans: []
                };
              }
              propertyMap[propId].loans.push(loan);
            });

            return Object.values(propertyMap).map(property => {
              const totalPaid = property.loans.reduce((sum, l) => sum + parseFloat(l.total_paid || 0), 0);
              const totalRecoveryCosts = property.loans.reduce((sum, l) => sum + parseFloat(l.recovery_costs || 0), 0);
              const netProfit = totalPaid - property.acquisition_cost - totalRecoveryCosts;
              const timesDefaulted = property.loans.length;

              return (
                <div key={property.property_id} style={{ 
                  border: '2px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  marginBottom: '20px',
                  backgroundColor: netProfit >= 0 ? '#f0f8f0' : '#fff5f5'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: 'var(--forest-green)' }}>
                        {property.property_title}
                      </h3>
                      {property.property_apn && (
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>APN: {property.property_apn}</div>
                      )}
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                        Defaulted {timesDefaulted} time{timesDefaulted > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      backgroundColor: property.property_status === 'available' ? '#ffc107' : property.property_status === 'sold' ? 'var(--forest-green)' : '#666',
                      color: 'white'
                    }}>
                      {property.property_status === 'available' ? '🏷️ Available for Resale' : 
                       property.property_status === 'sold' ? '✅ Resold' :
                       property.property_status === 'pending' ? '⏳ Pending' :
                       property.property_status}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '15px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Acquisition Cost</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>
                        ${formatCurrency(property.acquisition_cost)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Total Collected</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                        ${formatCurrency(totalPaid)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Recovery Costs</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>
                        ${formatCurrency(totalRecoveryCosts)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Net Profit/Loss</div>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: netProfit >= 0 ? 'var(--forest-green)' : '#dc3545'
                      }}>
                        {netProfit >= 0 ? '+' : ''}${formatCurrency(netProfit)}
                      </div>
                    </div>
                  </div>

                  {/* Show breakdown by customer */}
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px', color: '#666' }}>
                      Customer History:
                    </div>
                    {property.loans.map((loan, idx) => (
                      <div key={loan.id} style={{ 
                        fontSize: '0.85rem', 
                        color: '#666',
                        marginBottom: '5px',
                        paddingLeft: '10px',
                        borderLeft: '3px solid #ddd'
                      }}>
                        {idx + 1}. {loan.first_name} {loan.last_name} - Paid ${formatCurrency(loan.total_paid || 0)} 
                        (Defaulted {loan.default_date ? new Date(loan.default_date).toLocaleDateString() : 'N/A'})
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
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