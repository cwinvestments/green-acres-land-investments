import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLoan, createPayment, formatCurrency } from '../api';

function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [cardInstance, setCardInstance] = useState(null);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);
  const [billingName, setBillingName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const loadLoan = useCallback(async () => {
    try {
      const response = await getLoan(id);
      setLoan(response.data);
      setPaymentAmount(parseFloat(response.data.monthly_payment).toFixed(2));
      
      // Load payment history for stats
      const paymentsResponse = await fetch(`${process.env.REACT_APP_API_URL}/loans/${id}/payments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }
      
      // Load payment breakdown
      const breakdownResponse = await fetch(`${process.env.REACT_APP_API_URL}/loans/${id}/payment-breakdown`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (breakdownResponse.ok) {
        const breakdownData = await breakdownResponse.json();
        setPaymentBreakdown(breakdownData);
        setPaymentAmount(breakdownData.total.toFixed(2));
      }
    } catch (err) {
      setError('Failed to load loan details');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingBreakdown(false);
    }
  }, [id]);

  useEffect(() => {
    loadLoan();
  }, [loadLoan]);

  const initializeSquarePayment = async () => {
    if (!window.Square) {
      setPaymentError('Square payment system not loaded');
      return;
    }

    try {
      const payments = window.Square.payments(
        process.env.REACT_APP_SQUARE_APPLICATION_ID,
        process.env.REACT_APP_SQUARE_LOCATION_ID
      );

      const card = await payments.card();
      await card.attach('#payment-card-container');
      setCardInstance(card);
    } catch (error) {
      console.error('Square initialization error:', error);
      setPaymentError('Failed to initialize payment form');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(paymentAmount);
    
    const minPayment = parseFloat(loan.monthly_payment);
    if (!amount || amount < minPayment) {
      setPaymentError(`Minimum payment is $${formatCurrency(loan.monthly_payment)}`);
      return;
    }

    if (amount > parseFloat(loan.balance_remaining)) {
      setPaymentError('Payment amount cannot exceed remaining balance');
      return;
    }

    if (!cardInstance) {
      await initializeSquarePayment();
      return;
    }

    setProcessing(true);
    setPaymentError('');

    try {
      const result = await cardInstance.tokenize();
      
      if (result.status === 'OK') {
        await createPayment({
          loanId: loan.id,
          amount: amount,
          paymentNonce: result.token,
          paymentMethod: 'square'
        });

        // Redirect to dashboard with success message
        navigate('/dashboard', { 
          state: { 
            message: 'Payment Successful! Your payment has been processed and your loan balance has been updated.' 
          } 
        });
      } else {
        setPaymentError(result.errors?.[0]?.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading loan details...</p>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="loan-detail">
        <div className="error-message">{error || 'Loan not found'}</div>
      </div>
    );
  }

  const percentPaid = ((parseFloat(loan.loan_amount) - parseFloat(loan.balance_remaining)) / parseFloat(loan.loan_amount)) * 100;
  const remainingPayments = Math.ceil(parseFloat(loan.balance_remaining) / parseFloat(loan.monthly_payment));
  
  // Calculate payment stats
  const totalPrincipalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.principal_amount) || 0), 0);
  const totalInterestPaid = payments.reduce((sum, p) => sum + (parseFloat(p.interest_amount) || 0), 0);
  
  // Calculate next payment breakdown
  const monthlyInterestRate = (parseFloat(loan.interest_rate) / 100) / 12;
  const nextInterest = parseFloat(loan.balance_remaining) * monthlyInterestRate;
  const nextPrincipal = parseFloat(loan.monthly_payment) - nextInterest;
  
  // Calculate payment status alert
  const getPaymentStatus = () => {
    if (loan.status === 'paid_off' || !loan.next_payment_date || loan.alerts_disabled) return null;
    
    const today = new Date();
    const dueDate = new Date(loan.next_payment_date);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) {
      const daysOverdue = Math.abs(daysUntilDue);
      if (daysOverdue >= 30) {
        return { text: `${daysOverdue} Days Overdue - Urgent! Please contact us immediately.`, color: '#dc3545', icon: '🚨' };
      } else if (daysOverdue >= 15) {
        return { text: `${daysOverdue} Days Past Due - Please make your payment as soon as possible.`, color: '#fd7e14', icon: '⚠️' };
      } else if (daysOverdue >= 5) {
        return { text: `${daysOverdue} Days Late - Your payment is overdue.`, color: '#ffc107', icon: '⏰' };
      } else {
        return { text: `Payment is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} late.`, color: '#ffc107', icon: '⏰' };
      }
    } else if (daysUntilDue <= 5) {
      return { text: `Payment Due in ${daysUntilDue} Day${daysUntilDue !== 1 ? 's' : ''}`, color: '#17a2b8', icon: '📅' };
    }
    return null;
  };
  
  const paymentStatus = getPaymentStatus();

 return (
    <div className="loan-detail">
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ flex: '1 1 auto' }}>
          ← Back to Dashboard
        </button>
        <button onClick={() => navigate(`/loans/${id}/payments`)} className="btn btn-secondary" style={{ flex: '1 1 auto' }}>
          View Payment History
        </button>
        <button 
          onClick={() => {
            const printWindow = window.open('', '_blank', 'width=800,height=900,left=200,top=50');
            printWindow.document.write(`
              <html>
                <head>
                  <title>Loan Statement - ${loan.property_title}</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #2c5f2d; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    td { padding: 8px; border-bottom: 1px solid #ddd; }
                    .label { font-weight: bold; width: 40%; }
                    .value { text-align: right; }
                  </style>
                </head>
                <body>
                  <h1>Green Acres Land Investments, LLC</h1>
                  <h2>Loan Statement</h2>
                  <h3>${loan.property_title}</h3>
                  <p>${loan.location}</p>
                  <table>
                    <tr><td class="label">Purchase Price:</td><td class="value">$${formatCurrency(loan.purchase_price)}</td></tr>
                    <tr><td class="label">Down Payment:</td><td class="value">$${formatCurrency(loan.down_payment)}</td></tr>
                    <tr><td class="label">Loan Amount:</td><td class="value">$${formatCurrency(loan.loan_amount)}</td></tr>
                    <tr><td class="label">Interest Rate:</td><td class="value">${loan.interest_rate}% APR</td></tr>
                    <tr><td class="label">Term:</td><td class="value">${loan.term_months} months</td></tr>
                    <tr><td class="label">Monthly Payment:</td><td class="value">$${formatCurrency(loan.monthly_payment)}</td></tr>
                    <tr><td class="label">Balance Remaining:</td><td class="value">$${formatCurrency(loan.balance_remaining)}</td></tr>
                    <tr><td class="label">Status:</td><td class="value">${loan.status === 'active' ? 'Active' : 'Paid Off'}</td></tr>
                    ${loan.next_payment_date ? `<tr><td class="label">Next Payment Due:</td><td class="value">${new Date(loan.next_payment_date.split('T')[0].replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>` : ''}
                  </table>
                  <p style="margin-top: 40px; font-size: 12px; color: #666;">Generated: ${new Date().toLocaleDateString()}</p>
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.print();
          }} 
          className="btn btn-primary" 
          style={{ flex: '1 1 auto' }}
        >
          🖨️ Print Loan Statement
        </button>
      </div>

      <h1>{loan.property_title}</h1>
      <p className="loan-location">{loan.location}</p>
      
      {paymentStatus && (
        <div style={{
          backgroundColor: paymentStatus.color,
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          marginTop: '20px',
          marginBottom: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {paymentStatus.icon} {paymentStatus.text}
          {paymentStatus.color === '#dc3545' && (
            <div style={{ marginTop: '8px', fontSize: '15px' }}>
              Contact us: (920) 716-6107
            </div>
          )}
        </div>
      )}
      
      {loan.description && (
        <p style={{ marginTop: '1rem', color: '#666' }}>{loan.description}</p>
      )}

      <div className="loan-detail-grid">
        <div className="loan-info-card">
          <h2>Loan Information</h2>
          
          <div className="info-row">
            <span>Purchase Price:</span>
            <span>${formatCurrency(loan.purchase_price)}</span>
          </div>
          
          <div className="info-row">
            <span>Down Payment:</span>
            <span>${formatCurrency(loan.down_payment)}</span>
          </div>
          
          <div className="info-row">
            <span>Processing Fee:</span>
            <span>${formatCurrency(loan.processing_fee)}</span>
          </div>
          
          <div className="info-row">
            <span>Loan Amount:</span>
            <span>${formatCurrency(loan.loan_amount)}</span>
          </div>
          
          <div className="info-row">
            <span>Interest Rate:</span>
            <span>{loan.interest_rate}% APR</span>
          </div>
          
          <div className="info-row">
            <span>Term:</span>
            <span>{loan.term_months} months</span>
          </div>
          
          <div className="info-row">
            <span>Monthly Payment:</span>
            <span className="highlight">${formatCurrency(loan.monthly_payment)}</span>
          </div>
          
          <div className="info-row">
            <span>Total Amount:</span>
            <span>${formatCurrency(loan.total_amount)}</span>
          </div>
          
          <div className="info-row">
            <span>Remaining Balance:</span>
            <span className="highlight">
              ${formatCurrency(loan.balance_remaining)}
            </span>
          </div>
          
          <div className="info-row">
            <span>Payments Remaining:</span>
            <span>{remainingPayments}</span>
          </div>
          
          <div className="info-row">
            <span>Status:</span>
            <span className={`status-badge status-${loan.status}`}>
              {loan.status === 'active' ? 'Active' : 'Paid Off'}
            </span>
          </div>
          
          {loan.next_payment_date && loan.status === 'active' && (
            <div className="info-row">
              <span>Next Payment Due:</span>
              <span style={{ fontWeight: '600', color: 'var(--forest-green)', fontSize: '1.1rem' }}>
                {new Date(loan.next_payment_date.split('T')[0].replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}

          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(percentPaid, 100)}%` }}
              ></div>
            </div>
            <p className="progress-text">{Math.round(percentPaid)}% Paid Off</p>
          </div>

          {payments.length > 0 && (
            <>
              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
              
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--forest-green)' }}>💰 Payment Breakdown</h3>
              
              <div className="info-row">
                <span>Total Principal Paid:</span>
                <span style={{ color: 'var(--forest-green)', fontWeight: 'bold' }}>
                  ${formatCurrency(totalPrincipalPaid)}
                </span>
              </div>
              
              <div className="info-row">
                <span>Total Interest Paid:</span>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  ${formatCurrency(totalInterestPaid)}
                </span>
              </div>
              
              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
              
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--forest-green)' }}>📊 Next Payment Breakdown</h3>
              
              <div className="info-row">
                <span>Principal:</span>
                <span style={{ color: 'var(--forest-green)' }}>
                  ${formatCurrency(nextPrincipal)}
                </span>
              </div>
              
              <div className="info-row">
                <span>Interest:</span>
                <span style={{ color: '#f59e0b' }}>
                  ${formatCurrency(nextInterest)}
                </span>
              </div>
              
              {paymentBreakdown && paymentBreakdown.monthlyTax > 0 && (
                <div className="info-row">
                  <span>Property Tax:</span>
                  <span style={{ color: '#3b82f6' }}>
                    ${formatCurrency(paymentBreakdown.monthlyTax)}
                  </span>
                </div>
              )}
              
              {paymentBreakdown && paymentBreakdown.monthlyHoa > 0 && (
                <div className="info-row">
                  <span>HOA Fee:</span>
                  <span style={{ color: '#8b5cf6' }}>
                    ${formatCurrency(paymentBreakdown.monthlyHoa)}
                  </span>
                </div>
              )}
              
              <p style={{ marginTop: '15px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                💡 Tip: Pay extra to reduce interest and own your land faster!
              </p>
            </>
          )}
        </div>

        {loan.status === 'active' && parseFloat(loan.balance_remaining) > 0 && (
          <div className="payment-card">
            <h2>Make a Payment</h2>
            
            {/* Pay Extra Calculator */}
            <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#f0f8f0', borderRadius: '8px', border: '2px solid var(--forest-green)' }}>
              <h3 style={{ color: 'var(--forest-green)', marginBottom: '10px', fontSize: '18px' }}>💡 Pay Extra & Save!</h3>
              <PayExtraCalculator loan={loan} />
            </div>
            
            <form onSubmit={handlePayment}>
              {/* Payment Breakdown */}
              {paymentBreakdown && !loadingBreakdown && (
                <div style={{
                  padding: '20px',
                  marginBottom: '25px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  border: '2px solid var(--forest-green)'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: 'var(--forest-green)' }}>💳 Payment Breakdown</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span>Monthly Loan Payment:</span>
                      <span style={{ fontWeight: '600' }}>${paymentBreakdown.loanPayment.toFixed(2)}</span>
                    </div>
                    
                    {paymentBreakdown.monthlyTax > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>Estimated Monthly Property Tax:</span>
                        <span style={{ fontWeight: '600' }}>${paymentBreakdown.monthlyTax.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {paymentBreakdown.monthlyHoa > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>HOA Fee:</span>
                        <span style={{ fontWeight: '600' }}>${paymentBreakdown.monthlyHoa.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {paymentBreakdown.lateFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#dc3545' }}>
                        <span>Late Fee ({paymentBreakdown.daysOverdue} days overdue):</span>
                        <span style={{ fontWeight: '600' }}>${paymentBreakdown.lateFee.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {paymentBreakdown.noticeFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#dc3545' }}>
                        <span>Default/Cure Notice Fee:</span>
                        <span style={{ fontWeight: '600' }}>${paymentBreakdown.noticeFee.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {paymentBreakdown.postalFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#dc3545' }}>
                        <span>Postal/Certified Mail Fee:</span>
                        <span style={{ fontWeight: '600' }}>${paymentBreakdown.postalFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ borderTop: '2px solid #ddd', paddingTop: '15px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ fontWeight: '600' }}>Subtotal:</span>
                      <span style={{ fontWeight: '600' }}>${paymentBreakdown.subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#666' }}>
                      <span>Square Processing Fee:</span>
                      <span>${paymentBreakdown.squareFee.toFixed(2)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#666' }}>
                      <span>Credit Card Processing Fee:</span>
                      <span>${paymentBreakdown.convenienceFee.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    borderTop: '3px solid var(--forest-green)', 
                    paddingTop: '15px', 
                    marginTop: '15px',
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>TOTAL DUE TODAY:</span>
                      <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                        ${paymentBreakdown.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="payment-amount-section">
                <label>Payment Amount:</label>
                <div className="amount-input-group">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => {
                      setPaymentAmount(e.target.value);
                      setSelectedQuickAmount(null);
                    }}
                    min={loan.monthly_payment}
                    max={parseFloat(loan.balance_remaining)}
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="quick-amount-buttons">
                  <button
                    type="button"
                    className={`btn btn-small ${selectedQuickAmount === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      setPaymentAmount(parseFloat(loan.monthly_payment).toFixed(2));
                      setSelectedQuickAmount('monthly');
                    }}
                  >
                    Monthly Payment
                  </button>
                  <button
                    type="button"
                    className={`btn btn-small ${selectedQuickAmount === 'payoff' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      setPaymentAmount(parseFloat(loan.balance_remaining).toFixed(2));
                      setSelectedQuickAmount('payoff');
                    }}
                  >
                    Pay Off Balance
                  </button>
                </div>
                
                <p className="payment-note">
                  Minimum payment: ${formatCurrency(loan.monthly_payment)} | Remaining balance: ${formatCurrency(loan.balance_remaining)}
                </p>
              </div>

              <div className="billing-info-section" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--forest-green)' }}>Billing Information</h3>
                
                <div className="form-group">
                  <label>Cardholder Name *</label>
                  <input
                    type="text"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Billing Address *</label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="123 Main St"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      placeholder="Appleton"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <select
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      <option value="WI">WI</option>
                      <option value="IL">IL</option>
                      <option value="MI">MI</option>
                      <option value="MN">MN</option>
                      <option value="IA">IA</option>
                      <option value="AZ">AZ</option>
                      <option value="AR">AR</option>
                      <option value="CO">CO</option>
                      <option value="AL">AL</option>
                      <option value="AK">AK</option>
                      <option value="CA">CA</option>
                      <option value="CT">CT</option>
                      <option value="DE">DE</option>
                      <option value="FL">FL</option>
                      <option value="GA">GA</option>
                      <option value="HI">HI</option>
                      <option value="ID">ID</option>
                      <option value="IN">IN</option>
                      <option value="KS">KS</option>
                      <option value="KY">KY</option>
                      <option value="LA">LA</option>
                      <option value="ME">ME</option>
                      <option value="MD">MD</option>
                      <option value="MA">MA</option>
                      <option value="MS">MS</option>
                      <option value="MO">MO</option>
                      <option value="MT">MT</option>
                      <option value="NE">NE</option>
                      <option value="NV">NV</option>
                      <option value="NH">NH</option>
                      <option value="NJ">NJ</option>
                      <option value="NM">NM</option>
                      <option value="NY">NY</option>
                      <option value="NC">NC</option>
                      <option value="ND">ND</option>
                      <option value="OH">OH</option>
                      <option value="OK">OK</option>
                      <option value="OR">OR</option>
                      <option value="PA">PA</option>
                      <option value="RI">RI</option>
                      <option value="SC">SC</option>
                      <option value="SD">SD</option>
                      <option value="TN">TN</option>
                      <option value="TX">TX</option>
                      <option value="UT">UT</option>
                      <option value="VT">VT</option>
                      <option value="VA">VA</option>
                      <option value="WA">WA</option>
                      <option value="WV">WV</option>
                      <option value="WY">WY</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>ZIP *</label>
                    <input
                      type="text"
                      value={billingZip}
                      onChange={(e) => setBillingZip(e.target.value)}
                      placeholder="54911"
                      maxLength="5"
                      pattern="[0-9]{5}"
                      required
                    />
                  </div>
                </div>
              </div>

              <div id="payment-card-container" style={{ marginTop: '1rem' }}></div>

              {paymentError && (
                <div className="error-message" style={{ marginTop: '1rem' }}>
                  {paymentError}
                </div>
              )}

              {!cardInstance ? (
                <button 
                  type="button"
                  className="btn btn-primary btn-full-width"
                  onClick={initializeSquarePayment}
                  disabled={processing}
                  style={{ marginTop: '1rem' }}
                >
                  Continue to Payment
                </button>
              ) : (
                <button 
                  type="submit"
                  className="btn btn-primary btn-full-width"
                  disabled={processing}
                  style={{ marginTop: '1rem' }}
                >
                  {processing ? 'Processing...' : `Pay $${formatCurrency(paymentAmount)}`}
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {loan.status === 'paid_off' && (
        <div className="success-message" style={{ marginTop: '2rem' }}>
          🎉 Congratulations! This loan has been paid off!
        </div>
      )}
    </div>
  );
}

// Pay Extra Calculator Component
function PayExtraCalculator({ loan }) {
  const [extraPayment, setExtraPayment] = useState('');
  
  const currentMonthly = parseFloat(loan.monthly_payment);
  const balance = parseFloat(loan.balance_remaining);
  
  // Calculate current loan payoff
  const currentMonths = Math.ceil(balance / currentMonthly);
  const currentTotalPaid = currentMonthly * currentMonths;
  const currentTotalInterest = currentTotalPaid - balance;
  
  // Calculate with extra payment
  let newMonthly = currentMonthly;
  let monthsSaved = 0;
  let interestSaved = 0;
  
  if (extraPayment && parseFloat(extraPayment) > 0) {
    newMonthly = currentMonthly + parseFloat(extraPayment);
    const newMonths = Math.ceil(balance / newMonthly);
    const newTotalPaid = newMonthly * newMonths;
    const newTotalInterest = newTotalPaid - balance;
    
    monthsSaved = currentMonths - newMonths;
    interestSaved = currentTotalInterest - newTotalInterest;
  }
  
  return (
    <div>
      <div className="form-group">
        <label>Extra Payment Amount (per month):</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>$</span>
          <input
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(e.target.value)}
            placeholder="50"
            min="0"
            step="10"
            style={{ flex: 1 }}
          />
        </div>
      </div>
      
      {extraPayment && parseFloat(extraPayment) > 0 && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--forest-green)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--forest-green)' }}>💰 Your Savings:</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>New Monthly Payment:</strong> ${formatCurrency(newMonthly)}
          </div>
          
          <div style={{ marginBottom: '10px', color: 'var(--forest-green)', fontWeight: 'bold', fontSize: '18px' }}>
            ⏱️ Pay off {monthsSaved} months earlier!
          </div>
          
          <div style={{ marginBottom: '10px', color: 'var(--forest-green)', fontWeight: 'bold', fontSize: '18px' }}>
            💵 Save ${formatCurrency(interestSaved)} in interest!
          </div>
          
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f8f0', borderRadius: '4px', fontSize: '14px' }}>
            <strong>Own your land by:</strong> {new Date(Date.now() + (currentMonths - monthsSaved) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanDetail;