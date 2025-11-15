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
                {/* Contract Section */}
                {loan.contract_status === 'pending_client_signature' && (
                  <div style={{
                    backgroundColor: '#fff3cd',
                    border: '2px solid #ffc107',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📝</span>
                      <strong style={{ fontSize: '16px' }}>Contract Ready to Sign</strong>
                    </div>
                    <p style={{ margin: '0 0 10px 34px', fontSize: '14px' }}>
                      Your Contract for Deed is ready for review and signature.
                    </p>
                    <button
                      onClick={async () => {
                        const contract = await loadContract(loan.id);
                        if (contract) {
                          // Show contract modal
                          const modal = document.createElement('div');
                          modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
                          modal.innerHTML = `
                            <div style="background:white;border-radius:10px;max-width:800px;width:100%;max-height:90vh;display:flex;flex-direction:column;">
                              <div style="padding:20px;border-bottom:2px solid var(--forest-green);">
                                <h2 style="margin:0;color:var(--forest-green);">Contract for Deed - Review</h2>
                              </div>
                              <div style="padding:20px;overflow-y:auto;flex:1;white-space:pre-wrap;font-family:monospace;font-size:12px;line-height:1.6;">
${contract.contract_text}
                              </div>
                              <div style="padding:20px;border-top:2px solid #e0e0e0;display:flex;flex-direction:column;gap:15px;">
                                <div style="background:#fff3cd;padding:15px;border-radius:5px;border:2px solid #ffc107;">
                                  <strong>⚠️ Electronic Signature Agreement</strong><br/>
                                  By typing your name below, you agree to sign this Contract for Deed electronically. This signature will be legally binding.
                                </div>
                                <input type="text" id="signatureInput" placeholder="Type your full legal name here" style="padding:12px;border:2px solid var(--forest-green);border-radius:5px;font-size:16px;width:100%;box-sizing:border-box;" />
                                <div style="display:flex;gap:10px;">
                                  <button id="signBtn" style="flex:1;padding:12px;background:var(--forest-green);color:white;border:none;border-radius:5px;font-size:16px;cursor:pointer;font-weight:600;">
                                    ✍️ Sign Contract
                                  </button>
                                  <button id="cancelBtn" style="flex:1;padding:12px;background:#6c757d;color:white;border:none;border-radius:5px;font-size:16px;cursor:pointer;font-weight:600;">
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
                      className="btn"
                      style={{
                        marginLeft: '34px',
                        backgroundColor: 'var(--forest-green)',
                        color: 'white',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    >
                      📝 Review & Sign Contract
                    </button>
                  </div>
                )}

                {loan.contract_status === 'customer_signed' && (
                    <div className="status-box" style={{ border: '2px solid #0dcaf0', backgroundColor: '#e7f6fd' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '32px', marginRight: '15px' }}>✅</span>
                        <h3 style={{ margin: 0, color: '#0a6375' }}>You've Signed!</h3>
                      </div>
                      <p style={{ margin: '0 0 15px 0' }}>
                        Your signature has been recorded. Awaiting seller's signature.
                      </p>
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#fff3cd',
                        border: '2px solid #ffc107',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#856404'
                      }}>
                        ⏳ Awaiting Admin Signature
                      </div>
                    </div>
                  )}

                {loan.contract_status === 'fully_signed' && (
                  <div style={{
                    backgroundColor: '#d4edda',
                    border: '2px solid #28a745',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>✅</span>
                      <strong style={{ fontSize: '16px', color: '#28a745' }}>Contract Fully Executed</strong>
                    </div>
                    <p style={{ margin: '0 0 10px 34px', fontSize: '14px' }}>
                      Both parties have signed. Your contract is complete.
                    </p>
                    <button
                      onClick={() => downloadContract(loan.id)}
                      className="btn"
                      style={{
                        display: 'block',
                        margin: '0 auto',
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
                  <div style={{
                    backgroundColor: '#fff3cd',
                    border: '2px solid #ffc107',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>⚠️</span>
                      <strong style={{ fontSize: '16px', color: '#856404' }}>Payment Overdue</strong>
                    </div>
                    <p style={{ margin: '0 0 8px 34px', color: '#856404', fontSize: '14px' }}>
                      Your payment was due {daysOverdue} days ago. A $75 late fee has been applied.
                    </p>
                    <p style={{ margin: '0 0 0 34px', color: '#856404', fontSize: '14px', fontWeight: 'bold' }}>
                      Please make your payment as soon as possible to avoid further action.
                    </p>
                  </div>
                )}

                {/* Tier 2: Serious Warning (Days 15-29) */}
                {daysOverdue >= 15 && daysOverdue < 30 && (
                  <div style={{
                    backgroundColor: '#fff3e0',
                    border: '2px solid #ff9800',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>🚨</span>
                      <strong style={{ fontSize: '16px', color: '#e65100' }}>URGENT: Payment Seriously Overdue</strong>
                    </div>
                    <p style={{ margin: '0 0 8px 34px', color: '#e65100', fontSize: '14px' }}>
                      Your account is now <strong>{daysOverdue} days</strong> past due.
                    </p>
                    <p style={{ margin: '0 0 8px 34px', color: '#e65100', fontSize: '14px' }}>
                      If payment is not received soon, we will send an official Default Notice with additional fees ($75 + postal costs).
                    </p>
                    <p style={{ margin: '0 0 0 34px', color: '#e65100', fontSize: '14px', fontWeight: 'bold' }}>
                      Contact us immediately: (920) 555-0100
                    </p>
                  </div>
                )}

                {/* Tier 3: Critical Default Notice (Day 30+) */}
                {daysOverdue >= 30 && (
                  <div style={{
                    backgroundColor: '#ffebee',
                    border: '3px solid #dc3545',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '28px' }}>⚠️</span>
                      <strong style={{ fontSize: '18px', color: '#dc3545' }}>DEFAULT NOTICE - IMMEDIATE ACTION REQUIRED</strong>
                    </div>
                    <p style={{ margin: '0 0 12px 38px', color: '#dc3545', fontSize: '14px', fontWeight: 'bold' }}>
                      Your loan is officially in DEFAULT.
                    </p>
                    {daysUntilCure !== null && daysUntilCure > 0 && (
                      <>
                        <p style={{ margin: '0 0 8px 38px', color: '#dc3545', fontSize: '16px', fontWeight: 'bold' }}>
                          YOU HAVE {daysUntilCure} DAYS TO CURE THE DEFAULT
                        </p>
                        <p style={{ margin: '0 0 12px 38px', color: '#dc3545', fontSize: '14px' }}>
                          Cure Deadline: {new Date(loan.cure_deadline_date).toLocaleDateString('en-US', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </p>
                      </>
                    )}
                    {daysUntilCure !== null && daysUntilCure <= 0 && (
                      <p style={{ margin: '0 0 12px 38px', color: '#dc3545', fontSize: '16px', fontWeight: 'bold' }}>
                        CURE DEADLINE HAS PASSED - REPOSSESSION IMMINENT
                      </p>
                    )}
                    <p style={{ margin: '0 0 8px 38px', color: '#dc3545', fontSize: '14px', fontWeight: 'bold' }}>
                      FAILURE TO PAY WILL RESULT IN:
                    </p>
                    <ul style={{ margin: '0 0 12px 58px', color: '#dc3545', fontSize: '13px', lineHeight: '1.6' }}>
                      <li>Forfeiture of all payments made to date</li>
                      <li>Loss of all rights to the property</li>
                      <li>Immediate repossession proceedings</li>
                      <li>Property will be resold</li>
                    </ul>
                    <p style={{ margin: '0 0 8px 38px', color: '#dc3545', fontSize: '14px', fontWeight: 'bold', wordBreak: 'break-word' }}>
                      Contact us IMMEDIATELY:<br />
                      (920) 716-6107<br />
                      greenacreslandinvestments@gmail.com
                    </p>
                  </div>
                )}

                {paymentStatus && (
                  <div style={{
                    backgroundColor: paymentStatus.color,
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: '14px'
                  }}>
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