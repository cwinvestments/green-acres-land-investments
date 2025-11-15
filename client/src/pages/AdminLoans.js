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
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [defaultingLoan, setDefaultingLoan] = useState(null);
  const [defaultFormData, setDefaultFormData] = useState({
    default_date: new Date().toISOString().split('T')[0],
    recovery_costs: '',
    default_notes: ''
  });
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    notice_date: new Date().toISOString().split('T')[0],
    postal_method: 'Certified Mail with Return Receipt',
    postal_cost: '',
    tracking_number: '',
    notes: ''
  });
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualPaymentLoan, setManualPaymentLoan] = useState(null);
  const [manualPaymentData, setManualPaymentData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    transaction_id: '',
    notes: ''
  });

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

  const loadContract = async (loanId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loanId}/contract`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.error('Failed to load contract:', err);
      return null;
    }
  };

  const filterLoans = useCallback(() => {
    let filtered = [...loans];

    // Apply status filter
    if (filter === 'all') {
      filtered = filtered.filter(loan => loan.status !== 'archived');
    } else if (filter === 'active') {
      filtered = filtered.filter(loan => loan.status === 'active' && !isOverdue(loan));
    } else if (filter === 'overdue') {
      filtered = filtered.filter(loan => isOverdue(loan));
    } else if (filter === 'paid_off') {
      filtered = filtered.filter(loan => loan.status === 'paid_off');
    } else if (filter === 'defaulted') {
      filtered = filtered.filter(loan => loan.status === 'defaulted');
    } else if (filter === 'archived') {
      filtered = filtered.filter(loan => loan.status === 'archived');
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

  const openDefaultModal = (loan) => {
    setDefaultingLoan(loan);
    setDefaultFormData({
      default_date: new Date().toISOString().split('T')[0],
      recovery_costs: '',
      default_notes: ''
    });
    setShowDefaultModal(true);
  };

  const handleDefaultSubmit = async (e) => {
    e.preventDefault();

    if (!window.confirm(`Mark "${defaultingLoan.property_title}" as DEFAULTED?\n\nThis will:\n- Set loan status to Defaulted\n- Set property back to Available\n- Calculate net recovery\n\nContinue?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${defaultingLoan.id}/default`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(defaultFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to mark as defaulted');
      }

      const result = await response.json();
      alert(`Loan marked as defaulted. Net recovery: $${result.netRecovery.toFixed(2)}`);
      setShowDefaultModal(false);
      setDefaultingLoan(null);
      loadLoans();
    } catch (err) {
      alert('Failed to mark loan as defaulted');
      console.error(err);
    }
  };

  const openNoticeModal = (loan) => {
    setSelectedLoan(loan);
    setShowNoticeModal(true);
    setNoticeForm({
      notice_date: new Date().toISOString().split('T')[0],
      postal_method: 'Certified Mail with Return Receipt',
      postal_cost: '',
      tracking_number: '',
      notes: ''
    });
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    
    if (!noticeForm.postal_cost || !noticeForm.tracking_number) {
      alert('Postal cost and tracking number are required');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${selectedLoan.id}/send-notice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(noticeForm)
      });
      
      if (!response.ok) throw new Error('Failed');
      
      alert('Default/Cure Notice recorded successfully!');
      setShowNoticeModal(false);
      loadLoans();
    } catch (err) {
      console.error('Failed to send notice:', err);
      alert('Failed to record notice');
    }
  };

  const waiveLateFee = async (loanId) => {
    if (!window.confirm('Waive late fee for this loan?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loanId}/waive-late-fee`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed');
      
      alert('Late fee waived successfully! Reminder: Inform customer on next call.');
      loadLoans();
    } catch (err) {
      alert('Failed to waive late fee');
    }
  };

  const openManualPaymentModal = (loan) => {
    setManualPaymentLoan(loan);
    setManualPaymentData({
      amount: loan.monthly_payment || '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      transaction_id: '',
      notes: ''
    });
    setShowManualPaymentModal(true);
  };

  const handleManualPaymentSubmit = async (e) => {
    e.preventDefault();

    if (!manualPaymentData.amount || parseFloat(manualPaymentData.amount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (!window.confirm(`Record ${manualPaymentData.payment_method} payment of $${parseFloat(manualPaymentData.amount).toFixed(2)} for ${manualPaymentLoan.property_title}?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${manualPaymentLoan.id}/record-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(manualPaymentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to record payment');
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
    <div style={{ padding: '20px', maxWidth: '95%', margin: '0 auto' }}>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const activeCount = loans.filter(l => l.status === 'active' && !isOverdue(l)).length;
  const overdueCount = loans.filter(l => isOverdue(l)).length;
  const paidOffCount = loans.filter(l => l.status === 'paid_off').length;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Loan Management</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/admin/loans/create-custom')} className="btn" style={{ backgroundColor: '#2c5f2d', color: 'white' }}>
            ✨ Create Custom Loan
          </button>
          <button onClick={() => navigate('/admin/loans/import')} className="btn" style={{ backgroundColor: '#2e7d32', color: 'white' }}>
            📥 Import Existing Loan
          </button>
          <button onClick={() => navigate('/admin/loans/defaulted')} className="btn" style={{ backgroundColor: '#dc3545', color: 'white' }}>
            📊 Defaulted Loans Report
          </button>
          <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
            ← Back to Dashboard
          </button>
        </div>
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
          <button
            onClick={() => setFilter('defaulted')}
            className={`btn ${filter === 'defaulted' ? 'btn-primary' : 'btn-secondary'}`}
            style={filter === 'defaulted' ? { backgroundColor: '#dc3545' } : {}}
          >
            Defaulted ({loans.filter(l => l.status === 'defaulted').length})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`btn ${filter === 'archived' ? 'btn-primary' : 'btn-secondary'}`}
            style={filter === 'archived' ? { backgroundColor: '#6c757d' } : {}}
          >
            Archived ({loans.filter(l => l.status === 'archived').length})
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
      <div className="desktop-only" style={{ width: '100%', overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', minWidth: '1200px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Customer</th>
              <th style={{ textAlign: 'left' }}>Property</th>
              <th style={{ textAlign: 'right' }}>Balance</th>
              <th style={{ textAlign: 'right' }}>Cure Amount</th>
              <th style={{ textAlign: 'right' }}>Monthly</th>
              <th style={{ textAlign: 'center' }}>Due Date</th>
              <th style={{ textAlign: 'center' }}>ROI</th>
              <th style={{ textAlign: 'center' }}>Alerts</th>
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
                  <td style={{ textAlign: 'center' }}>
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
                  <td style={{ textAlign: 'center' }}>
                    {loan.status === 'defaulted' ? (
                      <span style={{ color: '#999' }}>—</span>
                    ) : loan.property_acquisition_cost ? (
                      <span style={{ fontWeight: '600', color: 'var(--sandy-gold)' }}>
                        {(((loan.property_price - loan.property_acquisition_cost) / loan.property_acquisition_cost) * 100).toFixed(1)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {loan.status === 'active' && (
                      <>
                        <div style={{ marginBottom: '5px' }}>
                          <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '3px' }}>Due Day:</label>
                          <select
                            value={loan.payment_due_day || 1}
                            onChange={async (e) => {
                              const newDay = parseInt(e.target.value);
                              if (window.confirm(`Change payment due day to the ${newDay}${newDay === 1 ? 'st' : 'th'}?`)) {
                                try {
                                  const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}/payment-due-day`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                    },
                                    body: JSON.stringify({ payment_due_day: newDay })
                                  });
                                  if (!response.ok) throw new Error('Failed');
                                  loadLoans();
                                } catch (err) {
                                  alert('Failed to update payment due day');
                                }
                              }
                            }}
                            style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                          >
                            <option value="1">1st</option>
                            <option value="15">15th</option>
                          </select>
                        </div>
                        <button
                          onClick={() => toggleAlert(loan.id, loan.alerts_disabled)}
                          className="btn btn-small"
                          style={{
                            backgroundColor: loan.alerts_disabled ? '#ffc107' : 'var(--forest-green)',
                            color: 'white',
                            marginBottom: '5px',
                            width: '100%'
                          }}
                        >
                          {loan.alerts_disabled ? '🔕 Off' : '🔔 On'}
                        </button>
                        {daysOverdue >= 30 && !loan.notice_sent_date && (
                          <button
                            onClick={() => openNoticeModal(loan)}
                            className="btn btn-small"
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              width: '100%',
                              fontSize: '12px',
                              marginBottom: '5px'
                            }}
                          >
                            📨 Send Notice
                          </button>
                        )}
                        {loan.notice_sent_date && (
                          <div style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            borderRadius: '4px',
                            marginBottom: '5px',
                            textAlign: 'center'
                          }}>
                            Notice Sent {new Date(loan.notice_sent_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        {daysOverdue > 7 && (
                          <button
                            onClick={() => waiveLateFee(loan.id)}
                            className="btn btn-small"
                            style={{
                              backgroundColor: '#ffc107',
                              color: 'white',
                              width: '100%',
                              fontSize: '12px',
                              marginBottom: '5px'
                            }}
                          >
                            Waive Late Fee
                          </button>
                        )}
                        <button
                          onClick={() => openManualPaymentModal(loan)}
                          className="btn btn-small"
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            width: '100%',
                            fontSize: '12px',
                            marginBottom: '5px'
                          }}
                        >
                          💵 Record Payment
                        </button>
                        <button
                          onClick={() => openDefaultModal(loan)}
                          className="btn btn-small"
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            width: '100%',
                            fontSize: '12px'
                          }}
                        >
                          ⚠️ Default
                        </button>
                        <div style={{ marginTop: '5px' }}>
                          <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '3px' }}>Deed Type:</label>
                          <select
                            value={loan.deed_type || 'Special Warranty Deed'}
                            onChange={async (e) => {
                              try {
                                const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}/deed-type`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                  },
                                  body: JSON.stringify({ deed_type: e.target.value })
                                });
                                if (!response.ok) throw new Error('Failed');
                                loadLoans();
                              } catch (err) {
                                alert('Failed to update deed type');
                              }
                            }}
                            style={{ width: '100%', padding: '4px', fontSize: '12px', marginBottom: '5px' }}
                          >
                            <option value="Special Warranty Deed">Special Warranty</option>
                            <option value="Quitclaim Deed">Quitclaim</option>
                          </select>
                          <button
                            onClick={async () => {
                              if (!window.confirm('Generate contract for admin review and signature?')) return;
                              try {
                                const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}/generate-contract`, {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                  }
                                });
                                if (!response.ok) throw new Error('Failed');
                                const data = await response.json();
                                alert(data.message);
                                loadLoans();
                              } catch (err) {
                                alert('Failed to generate contract');
                              }
                            }}
                            className="btn btn-small"
                            style={{
                              backgroundColor: '#2c5f2d',
                              color: 'white',
                              width: '100%',
                              fontSize: '12px'
                            }}
                          >
                            📝 Generate Contract
                          </button>
                        </div>
                        {loan.contract_status === 'pending_admin_signature' && (
                          <button
                            onClick={async () => {
                              const contract = await loadContract(loan.id);
                              if (!contract) {
                                alert('Failed to load contract');
                                return;
                              }
                              
                              // Show contract modal
                              const modal = document.createElement('div');
                              modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
                              modal.innerHTML = `
                                <div style="background:white;border-radius:10px;max-width:900px;width:100%;max-height:90vh;display:flex;flex-direction:column;">
                                  <div style="padding:20px;border-bottom:2px solid var(--forest-green);">
                                    <h2 style="margin:0;color:var(--forest-green);">📄 Contract for Deed - Admin Review</h2>
                                  </div>
                                  <div style="padding:20px;overflow-y:auto;flex:1;white-space:pre-wrap;font-family:monospace;font-size:12px;line-height:1.6;background:#f5f5f5;">
${contract.contract_text}
                                  </div>
                                  <div style="padding:20px;border-top:2px solid #e0e0e0;display:flex;flex-direction:column;gap:15px;">
                                    <div style="background:#fff3cd;padding:15px;border-radius:5px;border:2px solid #ffc107;">
                                      <strong>⚠️ Admin Electronic Signature Agreement</strong><br/>
                                      By typing your name below, you agree to sign this Contract for Deed electronically as the seller. This signature will be legally binding.
                                    </div>
                                    <input type="text" id="adminSignatureInput" placeholder="Type your full legal name here" style="padding:12px;border:2px solid var(--forest-green);border-radius:5px;font-size:16px;width:100%;box-sizing:border-box;" />
                                    <div style="display:flex;gap:10px;">
                                      <button id="adminSignBtn" style="flex:1;padding:12px;background:var(--forest-green);color:white;border:none;border-radius:5px;font-size:16px;cursor:pointer;font-weight:600;">
                                        ✍️ Sign Contract
                                      </button>
                                      <button id="adminCancelBtn" style="flex:1;padding:12px;background:#6c757d;color:white;border:none;border-radius:5px;font-size:16px;cursor:pointer;font-weight:600;">
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              `;
                              document.body.appendChild(modal);
                              
                              document.getElementById('adminCancelBtn').onclick = () => {
                                document.body.removeChild(modal);
                              };
                              
                              document.getElementById('adminSignBtn').onclick = async () => {
                                const signature = document.getElementById('adminSignatureInput').value.trim();
                                if (!signature) {
                                  alert('Please enter your full legal name');
                                  return;
                                }
                                
                                try {
                                  document.body.removeChild(modal);
                                  const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}/sign-contract`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                    },
                                    body: JSON.stringify({ signature })
                                  });
                                  if (!response.ok) throw new Error('Failed');
                                  alert('Contract signed! Now awaiting customer signature.');
                                  loadLoans();
                                } catch (err) {
                                  alert('Failed to sign contract');
                                }
                              };
                            }}
                            className="btn btn-small"
                            style={{
                              backgroundColor: '#ffc107',
                              color: '#000',
                              width: '100%',
                              fontSize: '12px',
                              marginTop: '5px',
                              fontWeight: 'bold'
                            }}
                          >
                            📄 Review & Sign Contract
                          </button>
                        )}
                        {loan.contract_status === 'pending_client_signature' && (
                          <div style={{
                            padding: '8px',
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            borderRadius: '4px',
                            marginTop: '5px',
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            ⏳ Awaiting Customer Signature
                          </div>
                        )}
			
                        {loan.contract_status === 'fully_executed' && (
                          <>
                            <div style={{
                              padding: '8px',
                              backgroundColor: '#d4edda',
                              color: '#155724',
                              borderRadius: '4px',
                              marginTop: '5px',
                              textAlign: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              ✅ Fully Executed
                            </div>
                            <button
                              onClick={() => {
                                window.open(`${process.env.REACT_APP_API_URL}/loans/${loan.id}/download-contract`, '_blank');
                              }}
                              className="btn btn-small"
                              style={{
                                backgroundColor: '#6c757d',
                                color: 'white',
                                width: '100%',
                                fontSize: '12px',
                                marginTop: '5px'
                              }}
                            >
                              📄 Download Contract
                            </button>
                          </>
                        )}
                        {(loan.contract_status === 'pending_admin_signature' || loan.contract_status === 'pending_client_signature' || loan.contract_status === 'fully_executed') && (
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete contract for ${loan.property_title}?\n\nThis cannot be undone. Customer will no longer see this contract.`)) return;
                              try {
                                const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}/contract`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                  }
                                });
                                if (!response.ok) throw new Error('Failed');
                                alert('Contract deleted successfully');
                                loadLoans();
                              } catch (err) {
                                alert('Failed to delete contract');
                              }
                            }}
                            className="btn btn-small"
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              width: '100%',
                              fontSize: '12px',
                              marginTop: '5px'
                            }}
                          >
                            🗑️ Delete Contract
                          </button>
                        )}

			{/* Delete Loan Button */}
                        <button
                          onClick={async () => {
                            if (!window.confirm(`⚠️ DELETE ENTIRE LOAN?\n\nThis will permanently delete:\n• The loan record\n• All payment history\n• All associated data\n\nThe customer account will remain.\n\nThis action CANNOT be undone!`)) return;
                            
                            if (!window.confirm(`Are you absolutely sure? Type the loan ID (${loan.id}) to confirm.`) || prompt('Enter loan ID to confirm:') !== loan.id.toString()) {
                              alert('Deletion cancelled');
                              return;
                            }
                            
                            try {
                              const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                }
                              });
                              if (!response.ok) throw new Error('Failed');
                              alert('Loan deleted successfully');
                              loadLoans();
                            } catch (err) {
                              alert('Failed to delete loan');
                            }
                          }}
                          className="btn btn-small"
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            width: '100%',
                            fontSize: '12px',
                            marginTop: '5px'
                          }}
                        >
                          🗑️ Delete Loan
                        </button>
                      </>
                    )}
                    {loan.status === 'defaulted' && (
                      <>
                        <div style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>
                          Defaulted {loan.default_date && `on ${new Date(loan.default_date).toLocaleDateString()}`}
                        </div>
                        
                        {/* Archive Button */}
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Archive this defaulted loan?\n\nLoan ID: ${loan.id}\nProperty: ${loan.property_title}\n\nThis will:\n• Hide from active dashboard\n• Keep ALL data for reports/tax purposes\n• Allow you to review later\n• You can still delete permanently later if needed`)) return;
                            
                            try {
                              const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}/archive`, {
                                method: 'PATCH',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                }
                              });
                              if (!response.ok) throw new Error('Failed');
                              alert('Loan archived successfully');
                              loadLoans();
                            } catch (err) {
                              alert('Failed to archive loan: ' + err.message);
                            }
                          }}
                          className="btn btn-small"
                          style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            width: '100%',
                            fontSize: '12px',
                            marginTop: '5px'
                          }}
                        >
                          📦 Archive Loan
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={async () => {
                            if (!window.confirm(`⚠️ PERMANENTLY DELETE DEFAULTED LOAN?\n\nLoan ID: ${loan.id}\nProperty: ${loan.property_title}\nCustomer: ${loan.first_name} ${loan.last_name}\n\nThis will permanently delete:\n• The loan record\n• All payment history ($${loan.total_paid || 0})\n• Default information\n• All associated data\n\nThe property will be set back to 'available'.\n\nThis action CANNOT be undone!`)) return;
                            
                            if (prompt('Type DELETE to confirm:')?.toUpperCase() !== 'DELETE') {
                              alert('Deletion cancelled');
                              return;
                            }
                            
                            try {
                              const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                }
                              });
                              if (!response.ok) throw new Error('Failed');
                              alert('Defaulted loan deleted successfully. Property set back to available.');
                              loadLoans();
                            } catch (err) {
                              alert('Failed to delete loan: ' + err.message);
                            }
                          }}
                          className="btn btn-small"
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            width: '100%',
                            fontSize: '12px',
                            marginTop: '5px'
                          }}
                        >
                          🗑️ Permanently Delete
                        </button>
                      </>
                    )}
                    {loan.status === 'archived' && (
                      <>
                        <div style={{ color: '#6c757d', fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>
                          Archived {loan.default_date && `(Defaulted ${new Date(loan.default_date).toLocaleDateString()})`}
                        </div>
                        
                        {/* Unarchive Button */}
                        <button
                          onClick={async () => {
                            if (!window.confirm('Restore this loan to Defaulted status?')) return;
                            
                            try {
                              const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}/unarchive`, {
                                method: 'PATCH',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                }
                              });
                              if (!response.ok) throw new Error('Failed');
                              alert('Loan restored to Defaulted status');
                              loadLoans();
                            } catch (err) {
                              alert('Failed to unarchive loan: ' + err.message);
                            }
                          }}
                          className="btn btn-small"
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            width: '100%',
                            fontSize: '12px',
                            marginTop: '5px'
                          }}
                        >
                          ↩️ Unarchive
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={async () => {
                            if (!window.confirm(`⚠️ PERMANENTLY DELETE ARCHIVED LOAN?\n\nLoan ID: ${loan.id}\nProperty: ${loan.property_title}\n\nThis will remove ALL data from reports and database.\n\nThis action CANNOT be undone!`)) return;
                            
                            if (prompt('Type DELETE to confirm:')?.toUpperCase() !== 'DELETE') {
                              alert('Deletion cancelled');
                              return;
                            }
                            
                            try {
                              const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/loans/${loan.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                }
                              });
                              if (!response.ok) throw new Error('Failed');
                              alert('Loan permanently deleted');
                              loadLoans();
                            } catch (err) {
                              alert('Failed to delete loan: ' + err.message);
                            }
                          }}
                          className="btn btn-small"
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            width: '100%',
                            fontSize: '12px',
                            marginTop: '5px'
                          }}
                        >
                          🗑️ Permanently Delete
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
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {overdueStatus ? 'To Cure' : 'Monthly'}
                  </div>
                  <div style={{ 
                    fontWeight: '600',
                    color: overdueStatus ? '#dc3545' : 'inherit'
                  }}>
                    ${formatCurrency(overdueStatus ? (loan.cure_amount || 0) : loan.monthly_payment)}
                  </div>
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
                {loan.property_acquisition_cost && loan.status !== 'defaulted' && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>ROI</div>
                    <div style={{ fontWeight: '600', color: 'var(--sandy-gold)' }}>
                      {(((loan.property_price - loan.property_acquisition_cost) / loan.property_acquisition_cost) * 100).toFixed(1)}%
                    </div>
                  </div>
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

      {/* Default Loan Modal */}
      {showDefaultModal && defaultingLoan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#dc3545' }}>⚠️ Mark Loan as Defaulted</h2>
            
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff5f5', borderRadius: '5px' }}>
              <strong>Property:</strong> {defaultingLoan.property_title}<br/>
              <strong>Customer:</strong> {defaultingLoan.first_name} {defaultingLoan.last_name}<br/>
              <strong>Total Balance Owed:</strong> ${formatCurrency(defaultingLoan.balance_remaining)}<br/>
              {getDaysOverdue(defaultingLoan) > 0 && (
                <>
                  <strong style={{ color: '#dc3545' }}>Amount to Cure Default:</strong>{' '}
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                    ${formatCurrency(defaultingLoan.cure_amount || 0)}
                  </span>
                </>
              )}
            </div>

            <form onSubmit={handleDefaultSubmit}>
              <div className="form-group">
                <label>Default Date *</label>
                <input
                  type="date"
                  value={defaultFormData.default_date}
                  onChange={(e) => setDefaultFormData({...defaultFormData, default_date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Recovery Costs</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Legal fees, cleanup, repo costs, etc."
                  value={defaultFormData.recovery_costs}
                  onChange={(e) => setDefaultFormData({...defaultFormData, recovery_costs: e.target.value})}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Legal fees, repo costs, property cleanup, etc.
                </small>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="4"
                  placeholder="Reason for default, contact attempts, etc."
                  value={defaultFormData.default_notes}
                  onChange={(e) => setDefaultFormData({...defaultFormData, default_notes: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn" style={{ flex: 1, backgroundColor: '#dc3545', color: 'white' }}>
                  Mark as Defaulted
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowDefaultModal(false)} 
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeModal && selectedLoan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>📨 Send Default/Cure Notice</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              <strong>Customer:</strong> {selectedLoan.first_name} {selectedLoan.last_name}<br />
              <strong>Property:</strong> {selectedLoan.property_title}<br />
              <strong>Days Overdue:</strong> {getDaysOverdue(selectedLoan)}
            </p>

            <form onSubmit={handleSendNotice}>
              <div className="form-group">
                <label>Notice Date *</label>
                <input
                  type="date"
                  value={noticeForm.notice_date}
                  onChange={(e) => setNoticeForm({...noticeForm, notice_date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Postal Method *</label>
                <select
                  value={noticeForm.postal_method}
                  onChange={(e) => setNoticeForm({...noticeForm, postal_method: e.target.value})}
                  required
                >
                  <option value="Certified Mail">Certified Mail</option>
                  <option value="Certified Mail with Return Receipt">Certified Mail with Return Receipt</option>
                  <option value="Priority Mail">Priority Mail</option>
                  <option value="Overnight">Overnight</option>
                </select>
              </div>

              <div className="form-group">
                <label>Postal Cost * (Actual cost)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10.50"
                  value={noticeForm.postal_cost}
                  onChange={(e) => setNoticeForm({...noticeForm, postal_cost: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tracking Number *</label>
                <input
                  type="text"
                  placeholder="9400 1000 0000 0000 0000 00"
                  value={noticeForm.tracking_number}
                  onChange={(e) => setNoticeForm({...noticeForm, tracking_number: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="3"
                  placeholder="Customer not responding to calls/emails..."
                  value={noticeForm.notes}
                  onChange={(e) => setNoticeForm({...noticeForm, notes: e.target.value})}
                />
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                <strong>⚠️ This will trigger the following actions:</strong><br />
                <br />
                <strong>Fees Added to Next Payment:</strong><br />
                - Default/Cure Notice Fee: $75.00<br />
                - Postal/Certified Mail: ${noticeForm.postal_cost || '0.00'}<br />
                <br />
                <strong>Customer Deadline:</strong><br />
                - Cure Deadline: {new Date(new Date(noticeForm.notice_date).setDate(new Date(noticeForm.notice_date).getDate() + 7)).toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })} (7 days from notice date)<br />
                <br />
                <strong style={{ color: '#dc3545' }}>Customer will see:</strong><br />
                <span style={{ fontSize: '13px', fontStyle: 'italic' }}>
                  "You have 7 days to cure the default. Failure to pay will result in forfeiture of all payments and loss of property rights."
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Record Notice Sent
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="btn"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {showManualPaymentModal && manualPaymentLoan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>💵 Record Manual Payment</h2>
            
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '5px', 
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              <strong>Customer:</strong> {manualPaymentLoan.first_name} {manualPaymentLoan.last_name}<br/>
              <strong>Property:</strong> {manualPaymentLoan.property_title}<br/>
              <strong>Current Balance:</strong> ${formatCurrency(manualPaymentLoan.balance_remaining)}<br/>
              <strong>Monthly Payment:</strong> ${formatCurrency(manualPaymentLoan.monthly_payment)}
            </div>

            <form onSubmit={handleManualPaymentSubmit}>
              <div className="form-group">
                <label>Payment Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={manualPaymentData.amount}
                  onChange={(e) => setManualPaymentData({...manualPaymentData, amount: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Cannot exceed current balance (${formatCurrency(manualPaymentLoan.balance_remaining)})
                </small>
              </div>

              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  value={manualPaymentData.payment_date}
                  onChange={(e) => setManualPaymentData({...manualPaymentData, payment_date: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={manualPaymentData.payment_method}
                  onChange={(e) => setManualPaymentData({...manualPaymentData, payment_method: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px' }}
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="venmo">Venmo</option>
                  <option value="zelle">Zelle</option>
                  <option value="wire_transfer">Wire Transfer</option>
                  <option value="money_order">Money Order</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transaction ID / Check Number</label>
                <input
                  type="text"
                  placeholder="Check #1234, Venmo ID, etc."
                  value={manualPaymentData.transaction_id}
                  onChange={(e) => setManualPaymentData({...manualPaymentData, transaction_id: e.target.value})}
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="3"
                  placeholder="Additional details about this payment..."
                  value={manualPaymentData.notes}
                  onChange={(e) => setManualPaymentData({...manualPaymentData, notes: e.target.value})}
                  style={{ width: '100%', padding: '10px', resize: 'vertical' }}
                />
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#d1ecf1',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#0c5460'
              }}>
                <strong>ℹ️ Note:</strong> This payment will be recorded immediately and will reduce the loan balance. 
                The next payment due date will be automatically calculated (30 days from payment date).
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, backgroundColor: '#28a745' }}
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualPaymentModal(false);
                    setManualPaymentLoan(null);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
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