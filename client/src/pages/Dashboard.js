import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLoans, formatCurrency } from '../api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await getLoans();
      setLoans(response.data);
    } catch (err) {
      setError('Failed to load loans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadContract = async (loanId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/loans/${loanId}/contract`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (err) {
      console.error('Load contract error:', err);
      return null;
    }
  };

  const signContract = async (loanId, signature) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/loans/${loanId}/sign-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ signature })
      });

      if (!response.ok) throw new Error('Failed to sign');

      const data = await response.json();
      alert(data.message);
      loadLoans();
    } catch (err) {
      alert('Failed to sign contract');
    }
  };

  const downloadContract = async (loanId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/loans/${loanId}/download-contract`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Contract_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download contract');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Welcome back<br />{user.firstName}!</h1>
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Active Loans</h3>
          <p className="summary-number">{loans.filter(l => l.status === 'active').length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Properties</h3>
          <p className="summary-number">{loans.filter(l => l.status !== 'defaulted').length}</p>
        </div>
        <div className="summary-card">
          <h3>Paid Off</h3>
          <p className="summary-number">{loans.filter(l => l.status === 'paid_off').length}</p>
        </div>
      </div>

      <h2>Your Properties</h2>
      
      {loans.filter(l => l.status !== 'defaulted').length === 0 ? (
        <div className="empty-state">
          <p>You don't have any properties yet.</p>
          <Link to="/properties" className="btn btn-primary">
            Browse Available Properties
          </Link>
        </div>
      ) : (
        <div className="loans-grid">
          {loans.filter(l => l.status !== 'defaulted').map(loan => {
            const percentPaid = ((parseFloat(loan.loan_amount) - parseFloat(loan.balance_remaining)) / parseFloat(loan.loan_amount)) * 100;
            const remainingPayments = Math.ceil(parseFloat(loan.balance_remaining) / parseFloat(loan.monthly_payment));
            
            // Calculate days overdue and cure deadline
            const getDaysOverdue = () => {
              if (!loan.next_payment_date) return 0;
              const today = new Date();
              const dueDate = new Date(loan.next_payment_date);
              const diffTime = today - dueDate;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays > 0 ? diffDays : 0;
            };
            
            const daysOverdue = getDaysOverdue();
            const daysUntilCure = loan.cure_deadline_date 
              ? Math.ceil((new Date(loan.cure_deadline_date) - new Date()) / (1000 * 60 * 60 * 24))
              : null;
            
            // Calculate payment status
            const getPaymentStatus = () => {
              if (loan.status === 'paid_off' || !loan.next_payment_date || loan.alerts_disabled) return null;
              
              const today = new Date();
              const dueDate = new Date(loan.next_payment_date);
              const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
              
              if (daysUntilDue < 0) {
                const daysOverdue = Math.abs(daysUntilDue);
                if (daysOverdue >= 30) {
                  return { text: `${daysOverdue} Days Overdue - Urgent!`, color: '#dc3545', icon: '🚨' };
                } else if (daysOverdue >= 15) {
                  return { text: `${daysOverdue} Days Past Due`, color: '#fd7e14', icon: '⚠️' };
                } else if (daysOverdue >= 5) {
                  return { text: `${daysOverdue} Days Late`, color: '#ffc107', icon: '⏰' };
                } else {
                  return { text: `${daysOverdue} Days Late`, color: '#ffc107', icon: '⏰' };
                }
              } else if (daysUntilDue <= 5) {
                return { text: `Payment Due in ${daysUntilDue} Days`, color: '#17a2b8', icon: '📅' };
              }
              return null;
            };
            
            const paymentStatus = getPaymentStatus();
            
            return (
              <div key={loan.id} className="loan-card">
                {/* Contract Section - Only shows pending_client_signature or fully_signed */}
                {loan.contract_status === 'pending_client_signature' && (
                  <div className="contract-pending-box">
                    <div className="contract-header">
                      <span className="contract-icon">📝</span>
                      <strong className="contract-title">Contract Ready to Sign</strong>
                    </div>
                    <p className="contract-text">
                      Your Contract for Deed is ready for review and signature.
                    </p>
                    <button
                      onClick={async () => {
                        const contract = await loadContract(loan.id);
                        if (contract) {
                          // Show contract modal
                          const modal = document.createElement('div');
                          modal.className = 'contract-modal-overlay';
                          modal.innerHTML = `
                            <div class="contract-modal-container">
                              <div class="contract-modal-header">
                                <h2>Contract for Deed - Review</h2>
                              </div>
                              <div class="contract-modal-body">
${contract.contract_text}
                              </div>
                              <div class="contract-modal-footer">
                                <div class="signature-agreement-notice">
                                  <strong>⚠️ Electronic Signature Agreement</strong><br/>
                                  By typing your name below, you agree to sign this Contract for Deed electronically. This signature will be legally binding.
                                </div>
                                <input type="text" id="signatureInput" class="signature-input" placeholder="Type your full legal name here" />
                                <div class="modal-button-group">
                                  <button id="signBtn" class="btn-sign">
                                    ✍️ Sign Contract
                                  </button>
                                  <button id="cancelBtn" class="btn-cancel-modal">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          `;
                          document.body.appendChild(modal);
                          
                          document.getElementById('cancelBtn').onclick = () => {
                            document.body.removeChild(modal);
                          };
                          
                          document.getElementById('signBtn').onclick = async () => {
                            const signature = document.getElementById('signatureInput').value.trim();
                            if (!signature) {
                              alert('Please enter your full legal name');
                              return;
                            }
                            document.body.removeChild(modal);
                            await signContract(loan.id, signature);
                          };
                        }
                      }}
                      className="btn contract-button"
                      style={{
                        backgroundColor: 'var(--forest-green)',
                        color: 'white'
                      }}
                    >
                      📝 Review & Sign Contract
                    </button>
                  </div>
                )}

                {loan.contract_status === 'fully_signed' && (
                  <div className="contract-complete-box">
                    <div className="contract-header">
                      <span className="contract-icon">✅</span>
                      <strong className="contract-title" style={{ color: '#28a745' }}>Contract Fully Executed</strong>
                    </div>
                    <p className="contract-text">
                      Both parties have signed. Your contract is complete.
                    </p>
                    <button
                      onClick={() => downloadContract(loan.id)}
                      className="btn contract-button"
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white'
                      }}
                    >
                      📄 Download Signed Contract
                    </button>
                  </div>
                )}

                {/* Tier 1: Friendly Reminder (Days 8-14) */}
                {daysOverdue >= 8 && daysOverdue < 15 && (
                  <div className="alert-tier1">
                    <div className="alert-header">
                      <span className="alert-icon-tier1">⚠️</span>
                      <strong className="alert-title-tier1">Payment Overdue</strong>
                    </div>
                    <p className="alert-text-tier1">
                      Your payment was due {daysOverdue} days ago. A $75 late fee has been applied.
                    </p>
                    <p className="alert-text-tier1 alert-text-bold">
                      Please make your payment as soon as possible to avoid further action.
                    </p>
                  </div>
                )}

                {/* Tier 2: Serious Warning (Days 15-29) */}
                {daysOverdue >= 15 && daysOverdue < 30 && (
                  <div className="alert-tier2">
                    <div className="alert-header">
                      <span className="alert-icon-tier2">🚨</span>
                      <strong className="alert-title-tier2">URGENT: Payment Seriously Overdue</strong>
                    </div>
                    <p className="alert-text-tier2">
                      Your account is now <strong>{daysOverdue} days</strong> past due.
                    </p>
                    <p className="alert-text-tier2">
                      If payment is not received soon, we will send an official Default Notice with additional fees ($75 + postal costs).
                    </p>
                    <p className="alert-text-tier2 alert-text-bold">
                      Contact us immediately: (920) 555-0100
                    </p>
                  </div>
                )}

                {/* Tier 3: Critical Default Notice (Day 30+) */}
                {daysOverdue >= 30 && (
                  <div className="alert-tier3">
                    <div className="alert-header">
                      <span className="alert-icon-tier3">⚠️</span>
                      <strong className="alert-title-tier3">DEFAULT NOTICE - IMMEDIATE ACTION REQUIRED</strong>
                    </div>
                    <p className="alert-text-tier3 alert-text-bold">
                      Your loan is officially in DEFAULT.
                    </p>
                    {daysUntilCure !== null && daysUntilCure > 0 && (
                      <>
                        <p className="alert-cure-deadline">
                          YOU HAVE {daysUntilCure} DAYS TO CURE THE DEFAULT
                        </p>
                        <p className="alert-text-tier3">
                          Cure Deadline: {new Date(loan.cure_deadline_date).toLocaleDateString('en-US', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </p>
                      </>
                    )}
                    {daysUntilCure !== null && daysUntilCure <= 0 && (
                      <p className="alert-cure-deadline">
                        CURE DEADLINE HAS PASSED - REPOSSESSION IMMINENT
                      </p>
                    )}
                    <p className="alert-text-tier3 alert-text-bold">
                      FAILURE TO PAY WILL RESULT IN:
                    </p>
                    <ul className="alert-list">
                      <li>Forfeiture of all payments made to date</li>
                      <li>Loss of all rights to the property</li>
                      <li>Immediate repossession proceedings</li>
                      <li>Property will be resold</li>
                    </ul>
                    <p className="alert-text-tier3 alert-text-bold" style={{ wordBreak: 'break-word' }}>
                      Contact us IMMEDIATELY:<br />
                      (920) 716-6107<br />
                      greenacreslandinvestments@gmail.com
                    </p>
                  </div>
                )}

                {paymentStatus && (
                  <div className="payment-status-badge" style={{ backgroundColor: paymentStatus.color }}>
                    {paymentStatus.icon} {paymentStatus.text}
                  </div>
                )}

                <h3>{loan.property_title}</h3>
                <p className="loan-location">{loan.location}</p>
                
                <div className="loan-details">
                  <div className="loan-detail-row">
                    <span>Status:</span>
                    <span className={`status-badge status-${loan.status}`}>
                      {loan.status === 'active' ? 'Active' : 'Paid Off'}
                    </span>
                  </div>
                  
                  {loan.next_payment_date && loan.status === 'active' && (
                    <div className="loan-detail-row">
                      <span>Next Payment Due:</span>
                      <span style={{ fontWeight: '600', color: 'var(--forest-green)' }}>
                        {new Date(loan.next_payment_date.split('T')[0].replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  
                  <div className="loan-detail-row">
                    <span>Remaining Balance:</span>
                    <span className="loan-amount">
                      ${formatCurrency(loan.balance_remaining)}
                    </span>
                  </div>
                  
                  <div className="loan-detail-row">
                    <span>Payments Remaining:</span>
                    <span>{remainingPayments}</span>
                  </div>
                  
                  <div className="loan-detail-row">
                    <span>Status:</span>
                    <span className={`status-badge status-${loan.status}`}>
                      {loan.status === 'active' ? 'Active' : 'Paid Off'}
                    </span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(percentPaid, 100)}%` }}
                  ></div>
                </div>
                <p className="progress-text">{Math.round(percentPaid)}% Paid</p>

                <Link 
                  to={`/loans/${loan.id}`} 
                  className="btn btn-secondary btn-full-width"
                >
                  View Details & Make Payment
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;