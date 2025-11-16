import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Modal states
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [loanToDefault, setLoanToDefault] = useState(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeToSend, setNoticeToSend] = useState(null);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualPaymentLoan, setManualPaymentLoan] = useState(null);
  const [manualPaymentAmount, setManualPaymentAmount] = useState('');

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
    setShowDefaultModal(true);
  };

  const openNoticeModal = (loan) => {
    setNoticeToSend(loan);
    setShowNoticeModal(true);
  };

  const openManualPaymentModal = (loan) => {
    setManualPaymentLoan(loan);
    setManualPaymentAmount('');
    setShowManualPaymentModal(true);
  };

  const handleDefaultLoan = async () => {
    if (!loanToDefault) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/loans/${loanToDefault.id}/default`,
        {
          method: 'PUT',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark loan as defaulted');
      }

      alert('Loan marked as defaulted successfully');
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
    
    const amount = parseFloat(manualPaymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (amount > manualPaymentLoan.balance_remaining) {
      if (!window.confirm(`Payment amount ($${amount.toFixed(2)}) exceeds balance ($${manualPaymentLoan.balance_remaining.toFixed(2)}). Continue?`)) {
        return;
      }
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
          body: JSON.stringify({ amount })
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

      {/* Filters */}
      <div className="admin-loans-filters">
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Loans ({loans.length})
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
      </div>

      {/* Desktop Table View */}
      <div className="desktop-only admin-loans-table-container">
        <table className="admin-table admin-loans-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Property</th>
              <th>Original Amount</th>
              <th>Balance</th>
              <th>Monthly Payment</th>
              <th>Next Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans
              .filter(loan => {
                if (filter === 'all') return true;
                if (filter === 'active') return loan.status === 'active' && !isOverdue(loan);
                if (filter === 'overdue') return isOverdue(loan);
                if (filter === 'paid_off') return loan.status === 'paid_off';
                if (filter === 'defaulted') return loan.status === 'defaulted';
                if (filter === 'archived') return loan.status === 'archived';
                return true;
              })
              .map((loan) => {
                const overdue = isOverdue(loan);
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
                    </td>
                    <td>{loan.property_title}</td>
                    <td className="admin-loans-table-amount">
                      ${loan.original_loan_amount?.toFixed(2)}
                    </td>
                    <td className="admin-loans-table-amount">
                      ${loan.balance_remaining?.toFixed(2)}
                    </td>
                    <td className="admin-loans-table-value">
                      ${loan.monthly_payment?.toFixed(2)}
                    </td>
                    <td className="admin-loans-table-date">
                      {loan.next_payment_date
                        ? new Date(loan.next_payment_date).toLocaleDateString()
                        : 'N/A'}
                      {overdue && (
                        <div style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '11px' }}>
                          {daysOverdue} days overdue
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${loan.status}`}>
                        {loan.status === 'paid_off' ? 'Paid Off' : 
                         loan.status === 'defaulted' ? 'Defaulted' :
                         loan.status === 'archived' ? 'Archived' :
                         overdue ? 'Overdue' : 'Active'}
                      </span>
                    </td>
                    <td className="admin-loans-table-actions">
                      {loan.status === 'active' && (
                        <>
                          <button
                            onClick={() => navigate(`/admin/loans/${loan.id}`)}
                            className="btn btn-small"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => openManualPaymentModal(loan)}
                            className="btn btn-small"
                            style={{ backgroundColor: '#10b981', color: 'white' }}
                          >
                            Record Payment
                          </button>
                          {overdue && !loan.notice_sent_date && (
                            <button
                              onClick={() => openNoticeModal(loan)}
                              className="btn btn-small"
                              style={{ backgroundColor: '#ffc107', color: '#333' }}
                            >
                              Send Notice
                            </button>
                          )}
                          {loan.notice_sent_date && (
                            <>
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#dc3545', 
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '4px',
                                backgroundColor: '#ffebee',
                                borderRadius: '4px'
                              }}>
                                Notice Sent: {new Date(loan.notice_sent_date).toLocaleDateString()}
                              </div>
                              <button
                                onClick={() => openDefaultModal(loan)}
                                className="btn btn-small"
                                style={{ backgroundColor: '#dc3545', color: 'white' }}
                              >
                                Mark as Defaulted
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleArchiveLoan(loan.id)}
                            className="btn btn-small"
                            style={{ backgroundColor: '#6c757d', color: 'white' }}
                          >
                            Archive
                          </button>
                        </>
                      )}
                      {loan.status === 'paid_off' && (
                        <>
                          <button
                            onClick={() => navigate(`/admin/loans/${loan.id}`)}
                            className="btn btn-small"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleArchiveLoan(loan.id)}
                            className="btn btn-small"
                            style={{ backgroundColor: '#6c757d', color: 'white' }}
                          >
                            Archive
                          </button>
                        </>
                      )}
                      {loan.status === 'defaulted' && (
                        <>
                          <button
                            onClick={() => navigate(`/admin/loans/${loan.id}`)}
                            className="btn btn-small"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => openManualPaymentModal(loan)}
                            className="btn btn-small"
                            style={{ backgroundColor: '#10b981', color: 'white' }}
                          >
                            Record Payment
                          </button>
                          <button
                            onClick={() => handleReactivateLoan(loan.id)}
                            className="btn btn-small"
                            style={{ backgroundColor: '#2196F3', color: 'white' }}
                          >
                            Reactivate
                          </button>
                          <button
                            onClick={() => handleArchiveLoan(loan.id)}
                            className="btn btn-small"
                            style={{ backgroundColor: '#6c757d', color: 'white' }}
                          >
                            Archive
                          </button>
                        </>
                      )}
                      {loan.status === 'archived' && (
                        <>
                          <button
                            onClick={() => navigate(`/admin/loans/${loan.id}`)}
                            className="btn btn-small"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleUnarchiveLoan(loan.id)}
                            className="btn btn-small"
                            style={{ backgroundColor: '#2196F3', color: 'white' }}
                          >
                            Unarchive
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-only admin-loans-mobile-cards">
        {loans
          .filter(loan => {
            if (filter === 'all') return true;
            if (filter === 'active') return loan.status === 'active' && !isOverdue(loan);
            if (filter === 'overdue') return isOverdue(loan);
            if (filter === 'paid_off') return loan.status === 'paid_off';
            if (filter === 'defaulted') return loan.status === 'defaulted';
            if (filter === 'archived') return loan.status === 'archived';
            return true;
          })
          .map((loan) => {
            const overdue = isOverdue(loan);
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
                       overdue ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                </div>

                <div className="admin-loans-mobile-property">
                  {loan.property_title}
                </div>

                <div className="admin-loans-mobile-grid">
                  <div>
                    <div className="admin-loans-mobile-item-label">Original Amount</div>
                    <div className="admin-loans-mobile-item-value">${loan.original_loan_amount?.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="admin-loans-mobile-item-label">Balance</div>
                    <div className="admin-loans-mobile-item-value">${loan.balance_remaining?.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="admin-loans-mobile-item-label">Monthly Payment</div>
                    <div className="admin-loans-mobile-item-value">${loan.monthly_payment?.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="admin-loans-mobile-item-label">Next Payment</div>
                    <div className="admin-loans-mobile-item-value">
                      {loan.next_payment_date
                        ? new Date(loan.next_payment_date).toLocaleDateString()
                        : 'N/A'}
                      {overdue && (
                        <div style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '11px' }}>
                          {daysOverdue} days overdue
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-loans-mobile-actions">
                  {loan.status === 'active' && (
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
                      {overdue && !loan.notice_sent_date && (
                        <button
                          onClick={() => openNoticeModal(loan)}
                          className="btn btn-full-width"
                          style={{ backgroundColor: '#ffc107', color: '#333' }}
                        >
                          Send Notice
                        </button>
                      )}
                      {loan.notice_sent_date && (
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
                      <button
                        onClick={() => handleArchiveLoan(loan.id)}
                        className="btn btn-full-width"
                        style={{ backgroundColor: '#6c757d', color: 'white' }}
                      >
                        Archive
                      </button>
                    </>
                  )}
                  {loan.status === 'paid_off' && (
                    <>
                      <button
                        onClick={() => navigate(`/admin/loans/${loan.id}`)}
                        className="btn btn-full-width"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleArchiveLoan(loan.id)}
                        className="btn btn-full-width"
                        style={{ backgroundColor: '#6c757d', color: 'white' }}
                      >
                        Archive
                      </button>
                    </>
                  )}
                  {loan.status === 'defaulted' && (
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
                      <button
                        onClick={() => handleReactivateLoan(loan.id)}
                        className="btn btn-full-width"
                        style={{ backgroundColor: '#2196F3', color: 'white' }}
                      >
                        Reactivate
                      </button>
                      <button
                        onClick={() => handleArchiveLoan(loan.id)}
                        className="btn btn-full-width"
                        style={{ backgroundColor: '#6c757d', color: 'white' }}
                      >
                        Archive
                      </button>
                    </>
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
                </div>
              </div>
            );
          })}
      </div>

      {loans.filter(loan => {
        if (filter === 'all') return true;
        if (filter === 'active') return loan.status === 'active' && !isOverdue(loan);
        if (filter === 'overdue') return isOverdue(loan);
        if (filter === 'paid_off') return loan.status === 'paid_off';
        if (filter === 'defaulted') return loan.status === 'defaulted';
        if (filter === 'archived') return loan.status === 'archived';
        return true;
      }).length === 0 && (
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
                <li className="admin-loans-modal-warning-text">Keep the loan visible for tracking purposes</li>
                <li className="admin-loans-modal-warning-text">Allow you to still record payments if customer resumes paying</li>
                <li className="admin-loans-modal-warning-text">Be reported on your Defaulted Loans Report</li>
              </ul>
            </div>

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
                <span>${loanToDefault.balance_remaining?.toFixed(2)}</span>
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

            <div className="admin-loans-modal-buttons">
              <button
                onClick={() => setShowDefaultModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDefaultLoan}
                className="btn admin-loans-modal-btn-confirm"
              >
                Mark as Defaulted
              </button>
            </div>
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
                <span>${noticeToSend.balance_remaining?.toFixed(2)}</span>
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
                <span>${manualPaymentLoan.balance_remaining?.toFixed(2)}</span>
              </div>
              <div className="admin-loans-modal-info-row">
                <span className="admin-loans-modal-info-label">Regular Payment:</span>
                <span>${manualPaymentLoan.monthly_payment?.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleRecordManualPayment}>
              <div className="form-group">
                <label>Payment Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={manualPaymentAmount}
                  onChange={(e) => setManualPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  required
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Enter the amount received from the customer
                </small>
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