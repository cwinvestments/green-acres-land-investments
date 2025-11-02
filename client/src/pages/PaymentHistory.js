import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentHistory, getLoan } from '../api';

function PaymentHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [loanResponse, paymentsResponse] = await Promise.all([
        getLoan(id),
        getPaymentHistory(id)
      ]);
      
      setLoan(loanResponse.data);
      setPayments(paymentsResponse.data);
    } catch (err) {
      setError('Failed to load payment history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading payment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="payment-history">
      <button onClick={() => navigate(`/loans/${id}`)} className="back-button">
        ← Back to Loan Details
      </button>

      <h1>Payment History</h1>
      
      {loan && (
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '10px', 
          marginBottom: '2rem',
          boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>{loan.property_title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Paid</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2e7d32' }}>
                ${totalPaid.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Remaining Balance</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2e7d32' }}>
                ${loan.balance.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Number of Payments</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2e7d32' }}>
                {payments.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="empty-state">
          <h3>No Payment History</h3>
          <p>Payments will appear here once you make them</p>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map((payment) => (
            <div key={payment.id} className="payment-item">
              <div>
                <span 
                  className={`payment-type ${
                    payment.payment_type === 'down_payment' ? 'down-payment' : 'monthly'
                  }`}
                >
                  {payment.payment_type === 'down_payment' ? 'Down Payment' : 'Monthly Payment'}
                </span>
                <div style={{ marginTop: '0.5rem' }}>
                  {formatDate(payment.payment_date)}
                </div>
                {payment.square_payment_id && (
                  <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                    ID: {payment.square_payment_id.substring(0, 20)}...
                  </div>
                )}
              </div>
              <div>
                <div className="payment-amount">
                  ${payment.amount.toLocaleString()}
                </div>
                <div 
                  style={{ 
                    fontSize: '0.85rem', 
                    color: payment.status === 'completed' ? '#2e7d32' : '#999',
                    textTransform: 'capitalize'
                  }}
                >
                  {payment.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentHistory;
