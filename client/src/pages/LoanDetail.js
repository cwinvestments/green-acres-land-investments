import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLoan, createPayment, formatCurrency } from '../api';

function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [cardInstance, setCardInstance] = useState(null);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);
  const loadLoan = useCallback(async () => {
  try {
    const response = await getLoan(id);
    setLoan(response.data);
    setPaymentAmount(parseFloat(response.data.monthly_payment).toFixed(2));
  } catch (err) {
    setError('Failed to load loan details');
    console.error(err);
  } finally {
    setLoading(false);
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
          paymentNonce: result.token
        });

        alert('✅ Payment Successful!\n\nYour payment has been processed and your loan balance has been updated.\n\nThank you!');
loadLoan();
        setCardInstance(null);
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

  return (
    <div className="loan-detail">
      <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
        ← Back to Dashboard
      </button>
      <button onClick={() => navigate(`/loans/${id}/payments`)} className="btn btn-secondary" style={{marginLeft: '1rem'}}>
        View Payment History
      </button>

      <h1>{loan.property_title}</h1>
      <p className="loan-location">{loan.location}</p>
      
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

          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(percentPaid, 100)}%` }}
              ></div>
            </div>
            <p className="progress-text">{Math.round(percentPaid)}% Paid Off</p>
          </div>
        </div>

        {loan.status === 'active' && parseFloat(loan.balance_remaining) > 0 && (
          <div className="payment-card">
            <h2>Make a Payment</h2>
            
            <form onSubmit={handlePayment}>
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
    setPaymentAmount(loan.monthly_payment);
    setSelectedQuickAmount('monthly');
  }}
>
  Monthly Payment
</button>
                  <button
  type="button"
  className={`btn btn-small ${selectedQuickAmount === 'payoff' ? 'btn-primary' : 'btn-secondary'}`}
  onClick={() => {
    setPaymentAmount(loan.balance_remaining.toString());
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

              {!cardInstance ? (
                <>
                  <div id="payment-card-container" style={{ display: 'none' }}></div>
                  <button 
                    type="button"
                    className="btn btn-primary btn-full-width"
                    onClick={initializeSquarePayment}
                    disabled={processing}
                  >
                    Continue to Payment
                  </button>
                </>
              ) : (
                <>
                  <div id="payment-card-container" style={{ marginTop: '1rem' }}></div>
                  {paymentError && (
                    <div className="error-message" style={{ marginTop: '1rem' }}>
                      {paymentError}
                    </div>
                  )}
                  <button 
                    type="submit"
                    className="btn btn-primary btn-full-width"
                    disabled={processing}
                    style={{ marginTop: '1rem' }}
                  >
                    {processing ? 'Processing...' : `Pay $${formatCurrency(paymentAmount)}`}
                  </button>
                </>
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

export default LoanDetail;