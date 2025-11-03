import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentHistory, getLoan, formatCurrency } from '../api';

function PaymentHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadData = useCallback(async () => {
  try {
    const [paymentsResponse, loanResponse] = await Promise.all([
      getPaymentHistory(id),
      getLoan(id)
    ]);
    
    setPayments(paymentsResponse.data);
    setLoan(loanResponse.data);
  } catch (err) {
    setError('Failed to load payment history');
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [id]);

useEffect(() => {
  loadData();
}, [loadData]);

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

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  return (
    <div className="payment-history">
      <button onClick={() => navigate(`/loans/${id}`)} className="btn btn-secondary">
        ← Back to Loan Details
      </button>

      <h1>Payment History</h1>
      
      {loan && (
        <div className="payment-summary">
          <h2>{loan.property_title}</h2>
          <div className="summary-stats">
            <div>
              <strong>Total Paid:</strong> ${formatCurrency(totalPaid)}
            </div>
            <div>
              <strong>Remaining Balance:</strong> ${formatCurrency(loan.balance_remaining)}
            </div>
            <div>
              <strong>Monthly Payment:</strong> ${formatCurrency(loan.monthly_payment)}
            </div>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="empty-state">
          <p>No payments recorded yet.</p>
        </div>
      ) : (
        <div className="payments-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </td>
                  <td>
                    {payment.payment_type === 'down_payment' ? 'Down Payment' : 'Monthly Payment'}
                  </td>
                  <td className="amount">
                    ${formatCurrency(payment.amount)}
                  </td>
                  <td>
                    <span className={`status-badge status-${payment.status}`}>
                      {payment.status === 'completed' ? 'Completed' : payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="payments-total">
            <strong>Total Payments:</strong> ${formatCurrency(totalPaid)}
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentHistory;