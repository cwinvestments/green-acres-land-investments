import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../api';

function AdminLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [loanToDefault, setLoanToDefault] = useState(null);
  const [defaultData, setDefaultData] = useState({
    recovery_costs: '',
    notes: ''
  });
  
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeToSend, setNoticeToSend] = useState(null);
  
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualPaymentLoan, setManualPaymentLoan] = useState(null);
  const [manualPaymentData, setManualPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    notes: ''
  });

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/loans`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load loans');
      }

      const data = await response.json();
      setLoans(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (loan) => {
    if (loan.status !== 'active') return false;
    if (!loan.next_payment_date) return false;
    
    const nextPayment = new Date(loan.next_payment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return nextPayment < today;
  };

  const getDaysOverdue = (loan) => {
    if (!isOverdue(loan)) return 0;
    
    const nextPayment = new Date(loan.next_payment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - nextPayment;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const handleArchiveLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to archive this loan? This will hide it from the main loan list.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/loans/${loanId}/archive`,
        {
          method: 'PUT',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to archive loan');
      }

      alert('Loan archived successfully');
      loadLoans();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnarchiveLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to unarchive this loan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/loans/${loanId}/unarchive`,
        {
          method: 'PUT',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unarchive loan');
      }

      alert('Loan unarchived successfully');
      loadLoans();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReactivateLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to reactivate this loan? This will remove the default status.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/loans/${loanId}/reactivate`,
        {
          method: 'PUT',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reactivate loan');
      }

      alert('Loan reactivated successfully');
      loadLoans();
    } catch (err) {
      alert(err.message);
    }
  };

  const openDefaultModal = (loan) => {
    setLoanToDefault(loan);
    setDefaultData({
      recovery_costs: '',
      notes: ''
    });
    setShowDefaultModal(true);
  };

  const openNoticeModal = (loan) => {
    setNoticeToSend(loan);
    setShowNoticeModal(true);
  };

  const openManualPaymentModal = (loan) => {
    setManualPaymentLoan(loan);
    setManualPaymentData({
      amount: '',
      payment_method: 'cash',
      notes: ''
    });
    setShowManualPaymentModal(true);
  };

  const handleDefaultLoan = async (e) => {
    e.preventDefault();
    
    if (!loanToDefault) return;

    const recoveryCosts = parseFloat(defaultData.recovery_costs) || 0;

    if (!window.confirm(
      `Mark loan as defaulted?\n\n` +
      `Balance: $${formatCurrency(loanToDefault.balance_remaining)}\n` +
      `Recovery Costs: $${recoveryCosts.toFixed(2)}\n` +
      `Net Recovery: $${(loanToDefault.balance_remaining - recoveryCosts).toFixed(2)}\n\n` +
      `This action should only be taken after the cure period has passed.`
    )) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/loans/${loanToDefault.id}/default`,
        {
          method: 'PUT',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recovery_costs: recoveryCosts,
            notes: defaultData.notes
          })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to mark loan as defaulted');
      }

      const result = await response.json();
      
      alert(`Loan marked as defaulted. Net recovery: $${result.netRecovery.toFixed(2)}`);
      setShowDefaultModal(false);
      setLoanToDefault(null);
      loadLoans();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendNotice = async () => {
    if (!noticeToSend) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/loans/${noticeToSend.id}/send-notice`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send notice');
      }

      alert('Notice sent successfully! The customer will receive an email notification.');
      setShowNoticeModal(false);
      setNoticeToSend(null);
      loadLoans();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecordManualPayment = async (e) => {
    e.preventDefault();
    
    if (!manualPaymentLoan) return;
    
    const amount = parseFloat(manualPaymentData.amount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (amount > manualPaymentLoan.balance_remaining) {
      if (!window.confirm(`Payment amount ($${amount.toFixed(2)}) exceeds balance ($${formatCurrency(manualPaymentLoan.balance_remaining)}). Continue?`)) {
        return;
      }
    }

    if (!window.confirm(`Record ${manualPaymentData.payment_method} payment of $${parseFloat(manualPaymentData.amount).toFixed(2)} for ${manualPaymentLoan.property_title}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/loans/${manualPaymentLoan.id}/manual-payment`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: parseFloat(manualPaymentData.amount),
            payment_method: manualPaymentData.payment_method,
            notes: manualPaymentData.notes
          })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to record payment');
      }

      const result = await response.json();
      
      alert(`Payment recorded successfully!\n\nNew Balance: $${result.newBalance.toFixed(2)}${result.paidOff ? '\n\n🎉 LOAN PAID OFF!' : ''}`);
      setShowManualPaymentModal(false);
      setManualPaymentLoan(null);
      loadLoans();
    } catch (err) {
      alert(err.message || 'Failed to record payment');
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
      <div className="admin-loans-error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const activeCount = loans.filter(l => l.status === 'active' && !isOverdue(l)).length;
  const overdueCount = loans.filter(l => isOverdue(l)).length;
  const paidOffCount = loans.filter(l => l.status === 'paid_off').length;

  const filteredLoans = loans.filter(loan => {
    // Apply status filter
    let matchesFilter = false;
    if (filter === 'all') matchesFilter = true;
    else if (filter === 'active') matchesFilter = loan.status === 'active' && !isOverdue(loan);
    else if (filter === 'overdue') matchesFilter = isOverdue(loan);
    else if (filter === 'paid_off') matchesFilter = loan.status === 'paid_off';
    else if (filter === 'defaulted') matchesFilter = loan.status === 'defaulted';
    else if (filter === 'archived') matchesFilter = loan.status === 'archived';

    if (!matchesFilter) return false;

    // Apply search filter
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      loan.customer_name?.toLowerCase().includes(search) ||
      loan.customer_email?.toLowerCase().includes(search) ||
      loan.property_title?.toLowerCase().includes(search) ||
      loan.property_location?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="admin-loans-container">
      <div className="admin-loans-header">
        <h1>Loan Management</h1>
        <div className="admin-loans-header-buttons">
          <button onClick={() => navigate('/admin/loans/create-custom')} className="btn admin-loans-btn-create">
            ✨ Create Custom Loan
          </button>
          <button onClick={() => navigate('/admin/loans/import')} className="btn admin-loans-btn-import">
            📥 Import Existing Loan
          </button>
          <button onClick={() => navigate('/admin/loans/defaulted')} className="btn admin-loans-btn-defaulted">
            📊 Defaulted Loans Report
          </button>
          <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-summary admin-loans-summary">
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

      {/* Filters & Search */}
      <div className="admin-loans-filters">
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
        >
          Overdue ({overdueCount})
        </button>
        <button
          onClick={() => setFilter('paid_off')}
          className={`btn ${filter === 'paid_off' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Paid Off ({paidOffCount})
        </button>
        <button
          onClick={() => setFilter('defaulted')}
          className={`btn ${filter === 'defaulted' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Defaulted
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`btn ${filter === 'archived' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Archived
        </button>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer name, email, or property..."
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
      <div className="desktop-only admin-loans-table-container">
        <table className="admin-table admin-loans-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Property</th>
              <th>Balance</th>
              <th>Cure Amount</th>
              <th>Monthly</th>
              <th>Due Date</th>
              <th>ROI</th>
              <th>Alerts</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan) => {
              const overdueStatus = isOverdue(loan);
              const daysOverdue = getDaysOverdue(loan);

              return (
                <tr key={loan.id}>
                  <td className="admin-loans-table-customer">
                    <div className="admin-loans-table-customer-name">
                      {loan.customer_name}
                    </div>
                    <div className="admin-loans-table-customer-email">
                      {loan.customer_email}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      {loan.customer_phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{loan.property_title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{loan.property_location}</div>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--forest-green)', textAlign: 'right' }}>
                    ${formatCurrency(loan.balance_remaining)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {overdueStatus ? (
                      <span style={{ 
                        fontWeight: 'bold',
                        color: daysOverdue >= 30 ? '#dc3545' : daysOverdue >= 15 ? '#ff6b00' : '#ffc107',
                        fontSize: '15px'
                      }}>
                        ${formatCurrency(loan.cure_amount || 0)}
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>${formatCurrency(loan.monthly_payment)}</td>
                  <td style={{ fontSize: '13px' }}>
                    {loan.next_payment_date
                      ? new Date(loan.next_payment_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'}
                    {overdueStatus && (
                      <div style={{ 
                        color: daysOverdue >= 30 ? '#dc3545' : daysOverdue >= 15 ? '#ff6b00' : '#ffc107',
                        fontWeight: 'bold', 
                        fontSize: '11px',
                        marginTop: '2px'
                      }}>
                        {daysOverdue}d late
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                    {loan.property_acquisition_cost && loan.property_price ? (
                      <span style={{ 
                        color: loan.property_price > loan.property_acquisition_cost ? 'var(--forest-green)' : '#dc3545'
                      }}>
                        {(((loan.property_price - loan.property_acquisition_cost) / loan.property_acquisition_cost) * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: '10px',
                      minWidth: '280px'
                    }}>
                      {/* Buttons Section */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                        {(loan.status === 'active' || loan.status === 'defaulted') && (
                          <>
                            <button
                              onClick={() => navigate(`/admin/loans/${loan.id}`)}
                              className="btn btn-small"
                              style={{ padding: '6px 14px', fontSize: '13px' }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => openManualPaymentModal(loan)}
                              className="btn btn-small"
                              style={{ backgroundColor: '#10b981', color: 'white', padding: '6px 14px', fontSize: '13px' }}
                            >
                              💵 Pay
                            </button>
                            {loan.status === 'active' && overdueStatus && !loan.notice_sent_date && (
                              <button
                                onClick={() => openNoticeModal(loan)}
                                className="btn btn-small"
                                style={{ backgroundColor: '#ffc107', color: '#333', padding: '6px 14px', fontSize: '13px' }}
                              >
                                Notice
                              </button>
                            )}
                            {loan.notice_sent_date && loan.status === 'active' && (
                              <button
                                onClick={() => openDefaultModal(loan)}
                                className="btn btn-small"
                                style={{ backgroundColor: '#dc3545', color: 'white', padding: '6px 14px', fontSize: '13px' }}
                              >
                                ⚠️ Default
                              </button>
                            )}
                          </>
                        )}

                        {loan.status === 'defaulted' && (
                          <button
                            onClick={() => handleReactivateLoan(loan.id)}
                            className="btn btn-small"
                            style={{ backgroundColor: '#2196F3', color: 'white', padding: '6px 14px', fontSize: '13px' }}
                          >
                            Reactivate
                          </button>
                        )}

                        {loan.status === 'paid_off' && (
                          <button
                            onClick={() => navigate(`/admin/loans/${loan.id}`)}
                            className="btn btn-small"
                            style={{ padding: '6px 14px', fontSize: '13px' }}
                          >
                            View
                          </button>
                        )}

                        {loan.status === 'archived' && (
                          <>
                            <button
                              onClick={() => navigate(`/admin/loans/${loan.id}`)}
                              className="btn btn-small"
                              style={{ padding: '6px 14px', fontSize: '13px' }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleUnarchiveLoan(loan.id)}
                              className="btn btn-small"
                              style={{ backgroundColor: '#2196F3', color: 'white', padding: '6px 14px', fontSize: '13px' }}
                            >
                              Unarchive
                            </button>
                          </>
                        )}
                      </div>

                      {/* Contract Section */}
                      {loan.status === 'active' && (
                        <div style={{ width: '100%' }}>
                          {loan.contract_signed_date ? (
                            <>
                              <select
                                value={loan.deed_type || ''}
                                onChange={(e) => {
                                  // Handle deed type change
                                }}
                                style={{
                                  width: '100%',
                                  padding: '6px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  marginBottom: '6px'
                                }}
                              >
                                <option value="">Select Deed Type</option>
                                <option value="Special Warranty">Special Warranty</option>
                                <option value="Quitclaim">Quitclaim</option>
                                <option value="General Warranty">General Warranty</option>
                              </select>
                              {!loan.contract_fully_executed && (
                                <>
                                  <button
                                    onClick={() => {
                                      // Handle generate contract
                                    }}
                                    className="btn btn-small"
                                    style={{ 
                                      backgroundColor: 'var(--forest-green)', 
                                      color: 'white',
                                      width: '100%',
                                      marginBottom: '6px',
                                      padding: '6px',
                                      fontSize: '12px'
                                    }}
                                  >
                                    📄 Generate Contract
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Handle mark executed
                                    }}
                                    className="btn btn-small"
                                    style={{ 
                                      backgroundColor: '#10b981', 
                                      color: 'white',
                                      width: '100%',
                                      padding: '6px',
                                      fontSize: '12px'
                                    }}
                                  >
                                    ✅ Fully Executed
                                  </button>
                                </>
                              )}
                              {loan.contract_fully_executed && (
                                <>
                                  <div style={{
                                    padding: '8px',
                                    backgroundColor: '#d4edda',
                                    borderRadius: '4px',
                                    marginBottom: '6px',
                                    fontSize: '11px',
                                    textAlign: 'center',
                                    color: '#155724',
                                    fontWeight: 'bold'
                                  }}>
                                    ✅ Fully Executed
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Handle download contract
                                    }}
                                    className="btn btn-small"
                                    style={{ 
                                      backgroundColor: '#6c757d', 
                                      color: 'white',
                                      width: '100%',
                                      marginBottom: '6px',
                                      padding: '6px',
                                      fontSize: '12px'
                                    }}
                                  >
                                    📥 Download Contract
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Handle delete contract
                                    }}
                                    className="btn btn-small"
                                    style={{ 
                                      backgroundColor: '#dc3545', 
                                      color: 'white',
                                      width: '100%',
                                      marginBottom: '6px',
                                      padding: '6px',
                                      fontSize: '12px'
                                    }}
                                  >
                                    🗑️ Delete Contract
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <div style={{
                              padding: '8px',
                              backgroundColor: '#fff3cd',
                              border: '1px solid #ffc107',
                              borderRadius: '4px',
                              fontSize: '11px',
                              textAlign: 'center',
                              color: '#856404'
                            }}>
                              Awaiting signature
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notice Info */}
                      {loan.notice_sent_date && loan.status === 'active' && (
                        <div style={{
                          fontSize: '11px',
                          color: '#dc3545',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          padding: '6px',
                          backgroundColor: '#ffebee',
                          borderRadius: '4px',
                          width: '100%'
                        }}>
                          Notice: {new Date(loan.notice_sent_date).toLocaleDateString()}
                        </div>
                      )}

                      {/* Archive/Delete Buttons */}
                      {loan.status !== 'archived' && (
                        <button
                          onClick={() => handleArchiveLoan(loan.id)}
                          className="btn btn-small"
                          style={{ 
                            backgroundColor: '#6c757d', 
                            color: 'white',
                            width: '100%',
                            padding: '6px',
                            fontSize: '12px'
                          }}
                        >
                          🗄️ Archive
                        </button>
                      )}
                      {(loan.status === 'archived' || loan.status === 'paid_off' || loan.status === 'defaulted') && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to permanently delete this loan? This cannot be undone.')) {
                              // Handle delete
                            }
                          }}
                          className="btn btn-small"
                          style={{ 
                            backgroundColor: '#dc3545', 
                            color: 'white',
                            width: '100%',
                            padding: '6px',
                            fontSize: '12px'
                          }}
                        >
                          🗑️ Delete Loan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-only admin-loans-mobile-cards">
        {filteredLoans.map((loan) => {
          const overdueStatus = isOverdue(loan);
          const daysOverdue = getDaysOverdue(loan);

          return (
            <div key={loan.id} className="card admin-loans-mobile-card">
              <div className="admin-loans-mobile-header">
                <div className="admin-loans-mobile-customer">
                  <div className="admin-loans-mobile-customer-name">
                    {loan.customer_name}
                  </div>
                  <div className="admin-loans-mobile-customer-email">
                    {loan.customer_email}
                  </div>
                </div>
                <div className="admin-loans-mobile-status">
                  <span className={`status-badge status-${loan.status}`}>
                    {loan.status === 'paid_off' ? 'Paid Off' : 
                     loan.status === 'defaulted' ? 'Defaulted' :
                     loan.status === 'archived' ? 'Archived' :
                     overdueStatus ? 'Overdue' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="admin-loans-mobile-property">
                {loan.property_title}
              </div>

              <div className="admin-loans-mobile-grid">
                <div>
                  <div className="admin-loans-mobile-item-label">Balance</div>
                  <div className="admin-loans-mobile-item-value">${formatCurrency(loan.balance_remaining)}</div>
                </div>
                <div>
                  <div className="admin-loans-mobile-item-label">Monthly</div>
                  <div className="admin-loans-mobile-item-value">${formatCurrency(loan.monthly_payment)}</div>
                </div>
                <div>
                  <div className="admin-loans-mobile-item-label">Next Payment</div>
                  <div className="admin-loans-mobile-item-value">
                    {loan.next_payment_date
                      ? new Date(loan.next_payment_date).toLocaleDateString()
                      : 'N/A'}
                    {overdueStatus && (
                      <div style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '11px' }}>
                        {daysOverdue} days overdue
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="admin-loans-mobile-item-label">ROI</div>
                  <div className="admin-loans-mobile-item-value">
                    {loan.property_acquisition_cost && loan.property_price ? (
                      <span style={{ 
                        color: loan.property_price > loan.property_acquisition_cost ? 'var(--forest-green)' : '#dc3545'
                      }}>
                        {(((loan.property_price - loan.property_acquisition_cost) / loan.property_acquisition_cost) * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>—</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-loans-mobile-actions">
                {(loan.status === 'active' || loan.status === 'defaulted') && (
                  <>
                    <button
                      onClick={() => navigate(`/admin/loans/${loan.id}`)}
                      className="btn btn-full-width"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openManualPaymentModal(loan)}
                      className="btn btn-full-width"
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                    >
                      Record Payment
                    </button>
                    {loan.status === 'active' && overdueStatus && !loan.notice_sent_date && (
                      <button
                        onClick={() => openNoticeModal(loan)}
                        className="btn btn-full-width"
                        style={{ backgroundColor: '#ffc107', color: '#333' }}
                      >
                        Send Notice
                      </button>
                    )}
                    {loan.notice_sent_date && loan.status === 'active' && (
                      <>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#dc3545', 
                          fontWeight: 'bold',
                          textAlign: 'center',
                          padding: '8px',
                          backgroundColor: '#ffebee',
                          borderRadius: '4px',
                          marginTop: '8px'
                        }}>
                          Notice Sent: {new Date(loan.notice_sent_date).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => openDefaultModal(loan)}
                          className="btn btn-full-width"
                          style={{ backgroundColor: '#dc3545', color: 'white' }}
                        >
                          Mark as Defaulted
                        </button>
                      </>
                    )}
                  </>
                )}
                {loan.status === 'defaulted' && (
                  <button
                    onClick={() => handleReactivateLoan(loan.id)}
                    className="btn btn-full-width"
                    style={{ backgroundColor: '#2196F3', color: 'white' }}
                  >
                    Reactivate
                  </button>
                )}
                {loan.status === 'paid_off' && (
                  <button
                    onClick={() => navigate(`/admin/loans/${loan.id}`)}
                    className="btn btn-full-width"
                  >
                    View Details
                  </button>
                )}
                {loan.status === 'archived' && (
                  <>
                    <button
                      onClick={() => navigate(`/admin/loans/${loan.id}`)}
                      className="btn btn-full-width"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleUnarchiveLoan(loan.id)}
                      className="btn btn-full-width"
                      style={{ backgroundColor: '#2196F3', color: 'white' }}
                    >
                      Unarchive
                    </button>
                  </>
                )}
                {loan.status !== 'archived' && (
                  <button
                    onClick={() => handleArchiveLoan(loan.id)}
                    className="btn btn-full-width"
                    style={{ backgroundColor: '#6c757d', color: 'white' }}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLoans.length === 0 && (
        <div className="empty-state">
          <p>No loans found for this filter</p>
        </div>
      )}

      {/* Default Loan Modal */}
      {showDefaultModal && loanToDefault && (
        <div className="admin-loans-modal-overlay">
          <div className="admin-loans-modal-content">
            <div className="admin-loans-modal-header">
              <h2>⚠️ Mark Loan as Defaulted</h2>
              <button 
                onClick={() => setShowDefaultModal(false)}
                className="admin-loans-modal-close"
              >
                ×
              </button>
            </div>

            <div className="admin-loans-modal-warning">
              <div className="admin-loans-modal-warning-title">
                ⚠️ WARNING: This action is serious
              </div>
              <p className="admin-loans-modal-warning-text">
                Marking a loan as defaulted means the customer has failed to cure the default after receiving a notice. 
                This will:
              </p>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                <li className="admin-loans-modal-warning-text">Change the loan status to "Defaulted"</li>
                <li className="admin-loans-modal-warning-text">Record the property as recovered</li>
                <li className="admin-loans-modal-warning-text">Track recovery costs and net recovery</li>
                <li className="admin-loans-modal-warning-text">Be reported on your Defaulted Loans Report</li>
              </ul>
            </div>

            <form onSubmit={handleDefaultLoan}>
              <div className="admin-loans-modal-info">
                <div className="admin-loans-modal-info-row">
                  <span className="admin-loans-modal-info-label">Customer:</span>
                  <span>{loanToDefault.customer_name}</span>
                </div>
                <div className="admin-loans-modal-info-row">
                  <span className="admin-loans-modal-info-label">Property:</span>
                  <span>{loanToDefault.property_title}</span>
                </div>
                <div className="admin-loans-modal-info-row">
                  <span className="admin-loans-modal-info-label">Balance:</span>
                  <span>${formatCurrency(loanToDefault.balance_remaining)}</span>
                </div>
                <div className="admin-loans-modal-info-row">
                  <span className="admin-loans-modal-info-label">Days Overdue:</span>
                  <span>{getDaysOverdue(loanToDefault)}</span>
                </div>
                <div className="admin-loans-modal-info-row">
                  <span className="admin-loans-modal-info-label">Notice Sent:</span>
                  <span>
                    {loanToDefault.notice_sent_date 
                      ? new Date(loanToDefault.notice_sent_date).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Recovery Costs</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={defaultData.recovery_costs}
                  onChange={(e) => setDefaultData({ ...defaultData, recovery_costs: e.target.value })}
                  placeholder="Legal, repo, cleanup costs"
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Total costs incurred to recover the property
                </small>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={defaultData.notes}
                  onChange={(e) => setDefaultData({ ...defaultData, notes: e.target.value })}
                  placeholder="Additional notes about the default"
                  rows="3"
                />
              </div>

              <div className="admin-loans-modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowDefaultModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn admin-loans-modal-btn-confirm"
                >
                  Mark as Defaulted
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeModal && noticeToSend && (
        <div className="admin-loans-modal-overlay">
          <div className="admin-loans-modal-content">
            <div className="admin-loans-modal-header">
              <h2>📧 Send Default Notice</h2>
              <button 
                onClick={() => setShowNoticeModal(false)}
                className="admin-loans-modal-close"
              >
                ×
              </button>
            </div>

            <div className="admin-loans-modal-warning">
              <div className="admin-loans-modal-warning-title">
                📧 Notice Details
              </div>
              <p className="admin-loans-modal-warning-text">
                This will send a formal default notice to the customer via email. The notice will include:
              </p>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                <li className="admin-loans-modal-warning-text">Current amount due</li>
                <li className="admin-loans-modal-warning-text">30-day cure period deadline</li>
                <li className="admin-loans-modal-warning-text">Consequences of non-payment</li>
                <li className="admin-loans-modal-warning-text">Payment instructions</li>
              </ul>
            </div>

            <div className="admin-loans-modal-info">
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Customer:</span>
                <span>{noticeToSend.customer_name}</span>
              </div>
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Email:</span>
                <span>{noticeToSend.customer_email}</span>
              </div>
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Property:</span>
                <span>{noticeToSend.property_title}</span>
              </div>
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Balance:</span>
                <span>${formatCurrency(noticeToSend.balance_remaining)}</span>
              </div>
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Days Overdue:</span>
                <span>{getDaysOverdue(noticeToSend)}</span>
              </div>
            </div>

            <div className="admin-loans-modal-buttons">
              <button
                onClick={() => setShowNoticeModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotice}
                className="btn admin-loans-modal-btn-send"
              >
                Send Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {showManualPaymentModal && manualPaymentLoan && (
        <div className="admin-loans-modal-overlay">
          <div className="admin-loans-modal-content">
            <div className="admin-loans-modal-header">
              <h2>💵 Record Manual Payment</h2>
              <button 
                onClick={() => setShowManualPaymentModal(false)}
                className="admin-loans-modal-close"
              >
                ×
              </button>
            </div>

            <div className="admin-loans-modal-info">
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Customer:</span>
                <span>{manualPaymentLoan.customer_name}</span>
              </div>
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Property:</span>
                <span>{manualPaymentLoan.property_title}</span>
              </div>
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Current Balance:</span>
                <span>${formatCurrency(manualPaymentLoan.balance_remaining)}</span>
              </div>
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Regular Payment:</span>
                <span>${formatCurrency(manualPaymentLoan.monthly_payment)}</span>
              </div>
            </div>

            <form onSubmit={handleRecordManualPayment}>
              <div className="form-group">
                <label>Payment Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={manualPaymentData.amount}
                  onChange={(e) => setManualPaymentData({ ...manualPaymentData, amount: e.target.value })}
                  placeholder="Enter payment amount"
                  required
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Enter the amount received from the customer
                </small>
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={manualPaymentData.payment_method}
                  onChange={(e) => setManualPaymentData({ ...manualPaymentData, payment_method: e.target.value })}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="money_order">Money Order</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={manualPaymentData.notes}
                  onChange={(e) => setManualPaymentData({ ...manualPaymentData, notes: e.target.value })}
                  placeholder="Check number, transaction details, etc."
                  rows="3"
                />
              </div>

              <div className="admin-loans-modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowManualPaymentModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn admin-loans-modal-btn-send"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLoans;