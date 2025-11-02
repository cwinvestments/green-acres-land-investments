import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLoan, createPayment } from '../api';

function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [cardInstance, setCardInstance] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    try {
      const response = await getLoan(id);
      setLoan(response.data);
      setPaymentAmount(response.data.monthly_payment.toString());
    } catch (err) {
      setError('Failed to load loan details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      await card.attach('#card-container');
      setCardInstance(card);
      setShowPaymentForm(true);
    } catch (error) {
      console.error('Square initialization error:', error);
      setPaymentError('Failed to initialize payment form');
    }
  };

  const handlePayment = async () => {
    if (!cardInstance) {
      await initializeSquarePayment();
      return;
    }

    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Please enter a valid payment amount');
      return;
    }

    if (amount > loan.balance) {
      setPaymentError('Payment amount cannot exceed remaining balance');
      return;
    }

    setProcessing(true);
    setPaymentError('');

    try {
      // Tokenize card
      const result = await cardInstance.tokenize();
      
      if (result.status === 'OK') {
        // Process payment
        await createPayment({
          loanId: loan.id,
          amount: amount,
          paymentNonce: result.token
        });

        alert('Payment successful!');
        // Reload loan details
        await loadLoan();
        setShowPaymentForm(false);
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

  const percentPaid = ((loan.principal - loan.balance) / loan.principal) * 100;
  const remainingPayments = Math.ceil(loan.balance / loan.monthly_payment);

  return (
    <div className="loan-detail">
      <button onClick={() => navigate('/dashboard')} className="back-button">
        ← Back to Dashboard
      </button>

      <div className="loan-header">
        <div className={`loan-status ${loan.status}`}>
          {loan.status === 'active' ? 'Active Loan' : 'Paid Off'}
        </div>
        
        <h1>{loan.property_title}</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          📍 {loan.location}
        </p>

        <div className="loan-progress" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: '500' }}>
              Progress: {Math.round(percentPaid)}%
            </span>
            <span style={{ fontSize: '1rem', color: '#666' }}>
              {remainingPayments} payments remaining
            </span>
          </div>
          <div className="progress-bar-container" style={{ height: '30px' }}>
            <div 
              className="progress-bar" 
              style={{ width: `${percentPaid}%` }}
            ></div>
          </div>
        </div>

        <div className="loan-stats" style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat">
            <div className="stat-label">Original Amount</div>
            <div className="stat-value">${loan.property_price.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Amount Financed</div>
            <div className="stat-value">${loan.principal.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Balance Remaining</div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>
              ${loan.balance.toLocaleString()}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Monthly Payment</div>
            <div className="stat-value">${loan.monthly_payment.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', fontSize: '0.95rem' }}>
          <div>
            <strong>Interest Rate:</strong> {loan.interest_rate}%
          </div>
          <div>
            <strong>Down Payment:</strong> ${loan.down_payment.toLocaleString()}
          </div>
          <div>
            <strong>Term:</strong> {loan.term_months} months
          </div>
        </div>
      </div>

      {loan.status === 'active' && loan.balance > 0 && (
        <div className="payment-section">
          <h2>Make a Payment</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Make your monthly payment or pay extra to reduce your balance faster
          </p>

          {!showPaymentForm ? (
            <div className="payment-form">
              <div className="payment-amount-input">
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0.01"
                  max={loan.balance}
                  step="0.01"
                  placeholder="Enter amount"
                />
                <button 
                  className="btn btn-secondary"
                  onClick={() => setPaymentAmount(loan.monthly_payment.toString())}
                >
                  Monthly Payment
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setPaymentAmount(loan.balance.toString())}
                >
                  Pay Off Balance
                </button>
              </div>

              <button 
                className="btn btn-primary btn-full-width"
                onClick={initializeSquarePayment}
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '5px' }}>
                <strong>Payment Amount: ${parseFloat(paymentAmount).toLocaleString()}</strong>
              </div>

              <div id="card-container"></div>

              {paymentError && (
                <div className="error-message" style={{ marginTop: '1rem' }}>
                  {paymentError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setCardInstance(null);
                  }}
                  disabled={processing}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handlePayment}
                  disabled={processing}
                  style={{ flex: 2 }}
                >
                  {processing ? 'Processing...' : `Pay $${parseFloat(paymentAmount).toLocaleString()}`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to={`/loans/${loan.id}/payments`} className="btn btn-secondary">
          View Payment History
        </Link>
      </div>
    </div>
  );
}

export default LoanDetail;
