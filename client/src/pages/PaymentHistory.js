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
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(`/loans/${id}`)} className="btn btn-secondary" style={{ flex: '1 1 auto' }}>
          ← Back to Loan Details
        </button>
        <button 
          onClick={() => {
            const printWindow = window.open('', '_blank', 'width=800,height=900,left=200,top=50');
            printWindow.document.write(`
              <html>
                <head>
                  <title>Payment History - ${loan?.property_title || 'Loan'}</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #2c5f2d; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #f0f8f0; font-weight: bold; }
                    .summary { background: #f0f8f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <h1>Green Acres Land Investments, LLC</h1>
                  <h2>Payment History</h2>
                  <h3>${loan?.property_title || ''}</h3>
                  <div class="summary">
                    <strong>Total Paid:</strong> $${formatCurrency(totalPaid)}<br/>
                    <strong>Remaining Balance:</strong> $${formatCurrency(loan?.balance_remaining || 0)}<br/>
                    <strong>Monthly Payment:</strong> $${formatCurrency(loan?.monthly_payment || 0)}
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${payments.map(payment => `
                        <tr>
                          <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
                          <td>$${formatCurrency(payment.amount)}</td>
                          <td>${payment.payment_type === 'down_payment' ? 'Down Payment' : 'Monthly Payment'}</td>
                          <td>${payment.status}</td>
                        </tr>
                      `).join('')}
                    </tbody>
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
          🖨️ Print Payment History
        </button>
      </div>
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
        <>
        {/* Desktop Table View */}
        <div className="payments-table desktop-only">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Method</th>
                <th>Status</th>
                <th>Receipt</th>
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
                  <td style={{ color: 'var(--forest-green)' }}>
                    {payment.principal_amount ? `$${formatCurrency(payment.principal_amount)}` : '—'}
                  </td>
                  <td style={{ color: '#f59e0b' }}>
                    {payment.interest_amount ? `$${formatCurrency(payment.interest_amount)}` : '—'}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {payment.payment_method || 'Square'}
                  </td>
                  <td>
                    <span className={`status-badge status-${payment.status}`}>
                      {payment.status === 'completed' ? 'Completed' : payment.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        const printWindow = window.open('', '_blank', 'width=600,height=700,left=300,top=100');
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Payment Receipt #${payment.id}</title>
                              <style>
                                body { font-family: Arial, sans-serif; padding: 30px; }
                                h1 { color: #2c5f2d; margin-bottom: 5px; }
                                h2 { color: #666; margin-top: 0; }
                                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                td { padding: 10px; border-bottom: 1px solid #ddd; }
                                .label { font-weight: bold; width: 40%; }
                                .value { text-align: right; }
                                .total { background: #f0f8f0; font-size: 18px; font-weight: bold; }
                              </style>
                            </head>
                            <body>
                              <h1>Green Acres Land Investments, LLC</h1>
                              <h2>Payment Receipt</h2>
                              <p><strong>Receipt #${payment.id}</strong></p>
                              <p><strong>Property:</strong> ${loan?.property_title || ''}</p>
                              <table>
                                <tr><td class="label">Payment Date:</td><td class="value">${new Date(payment.payment_date).toLocaleDateString()}</td></tr>
                                <tr><td class="label">Payment Type:</td><td class="value">${payment.payment_type === 'down_payment' ? 'Down Payment' : 'Monthly Payment'}</td></tr>
                                ${payment.principal_amount ? `<tr><td class="label">Principal:</td><td class="value">$${formatCurrency(payment.principal_amount)}</td></tr>` : ''}
                                ${payment.interest_amount ? `<tr><td class="label">Interest:</td><td class="value">$${formatCurrency(payment.interest_amount)}</td></tr>` : ''}
                                <tr class="total"><td class="label">Total Amount:</td><td class="value">$${formatCurrency(payment.amount)}</td></tr>
                                <tr><td class="label">Payment Method:</td><td class="value">${payment.payment_method || 'Square'}</td></tr>
                                <tr><td class="label">Status:</td><td class="value">${payment.status}</td></tr>
                              </table>
                              <p style="margin-top: 40px; font-size: 12px; color: #666;">
                                Thank you for your payment!<br/>
                                Generated: ${new Date().toLocaleDateString()}
                              </p>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }}
                      className="btn btn-small"
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      🖨️ Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="payments-total">
            <strong>Total Payments:</strong> ${formatCurrency(totalPaid)}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="payments-cards mobile-only">
          {payments.map((payment) => (
            <div key={payment.id} className="payment-card-mobile">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '2px solid var(--forest-green)', paddingBottom: '10px' }}>
                <div>
                  <strong>{new Date(payment.payment_date).toLocaleDateString()}</strong>
                  <br />
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {payment.payment_type === 'down_payment' ? 'Down Payment' : 'Monthly Payment'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                    ${formatCurrency(payment.amount)}
                  </div>
                  <span className={`status-badge status-${payment.status}`}>
                    {payment.status === 'completed' ? 'Completed' : payment.status}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div>
                  <strong>Principal:</strong>
                  <br />
                  <span style={{ color: 'var(--forest-green)' }}>
                    {payment.principal_amount ? `$${formatCurrency(payment.principal_amount)}` : '—'}
                  </span>
                </div>
                <div>
                  <strong>Interest:</strong>
                  <br />
                  <span style={{ color: '#f59e0b' }}>
                    {payment.interest_amount ? `$${formatCurrency(payment.interest_amount)}` : '—'}
                  </span>
                </div>
                <div>
                  <strong>Method:</strong>
                  <br />
                  <span style={{ textTransform: 'capitalize' }}>
                    {payment.payment_method || 'Square'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="payments-total" style={{ marginTop: '20px' }}>
            <strong>Total Payments:</strong> ${formatCurrency(totalPaid)}
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default PaymentHistory;