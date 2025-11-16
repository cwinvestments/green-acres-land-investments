import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PaymentTracking() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'down_payment', 'monthly_payment'
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const loadPayments = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/payments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(response.data);
    } catch (err) {
      console.error('Failed to load payments:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    // Filter by payment type
    if (filter !== 'all' && payment.payment_type !== filter) return false;

    // Filter by payment method
    if (paymentMethodFilter !== 'all' && payment.payment_method !== paymentMethodFilter) return false;

    // Filter by customer
    if (customerFilter !== 'all' && payment.customer_name !== customerFilter) return false;

    // Filter by search term (customer name, email, or property)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesCustomer = payment.customer_name?.toLowerCase().includes(search);
      const matchesEmail = payment.customer_email?.toLowerCase().includes(search);
      const matchesProperty = payment.property_title?.toLowerCase().includes(search);
      if (!matchesCustomer && !matchesEmail && !matchesProperty) return false;
    }

    // Filter by date range
    if (startDate && new Date(payment.payment_date) < new Date(startDate)) return false;
    if (endDate && new Date(payment.payment_date) > new Date(endDate)) return false;

    return true;
  });

  // Calculate statistics
  const totalCollected = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const thisMonth = new Date();
  const thisMonthPayments = filteredPayments.filter(p => {
    const paymentDate = new Date(p.payment_date);
    return paymentDate.getMonth() === thisMonth.getMonth() && 
           paymentDate.getFullYear() === thisMonth.getFullYear();
  });
  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  const today = new Date();
  const todayPayments = filteredPayments.filter(p => {
    const paymentDate = new Date(p.payment_date);
    return paymentDate.toDateString() === today.toDateString();
  });

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading payments...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 className="admin-page-title" style={{ margin: '0 0 5px 0' }}>💳 Payment Tracking</h1>
        <p style={{ margin: '0 0 20px 0', color: '#666', textAlign: 'center' }}>
          {filteredPayments.length} payments shown
        </p>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', color: 'var(--forest-green)' }}>
            ${totalCollected.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>Total Collected (Filtered)</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', color: 'var(--sandy-gold)' }}>
            ${thisMonthTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>This Month ({thisMonthPayments.length} payments)</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', color: '#6366f1' }}>
            {todayPayments.length}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>Payments Today</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {/* Payment Type Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Payment Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="all">All Payments</option>
              <option value="down_payment">Down Payments</option>
              <option value="monthly_payment">Monthly Payments</option>
              <option value="processing_fee">Processing Fees</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Payment Method
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="all">All Methods</option>
              <option value="square">Square</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="venmo">Venmo</option>
              <option value="zelle">Zelle</option>
              <option value="wire_transfer">Wire Transfer</option>
              <option value="money_order">Money Order</option>
              <option value="custom_loan">Custom Loan</option>
              <option value="imported">Imported</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Customer Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Customer
            </label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="all">All Customers</option>
              {[...new Set(payments.map(p => p.customer_name))].filter(Boolean).sort().map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Customer or property..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          {/* Start Date */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          {/* End Date */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(filter !== 'all' || paymentMethodFilter !== 'all' || customerFilter !== 'all' || searchTerm || startDate || endDate) && (
          <button
            onClick={() => {
              setFilter('all');
              setPaymentMethodFilter('all');
              setCustomerFilter('all');
              setSearchTerm('');
              setStartDate('');
              setEndDate('');
            }}
            className="btn"
            style={{ marginTop: '15px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Payments Table */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Property</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Breakdown</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  No payments found
                </td>
              </tr>
            ) : (
              filteredPayments.map(payment => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>
                    {new Date(payment.payment_date).toLocaleDateString()}
                    <br />
                    <small style={{ color: '#999' }}>
                      {new Date(payment.payment_date).toLocaleTimeString()}
                    </small>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <strong>{payment.customer_name}</strong>
                    <br />
                    <small style={{ color: '#666' }}>{payment.customer_email}</small>
                    {payment.customer_phone && (
                      <>
                        <br />
                        <small style={{ color: '#666' }}>{payment.customer_phone}</small>
                      </>
                    )}
                  </td>
                  <td style={{ padding: '15px' }}>
                    {payment.property_title || '—'}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: payment.payment_type === 'down_payment' ? '#e0f2fe' : payment.payment_type === 'processing_fee' ? '#fef3c7' : '#f0fdf4',
                      color: payment.payment_type === 'down_payment' ? '#0369a1' : payment.payment_type === 'processing_fee' ? '#92400e' : '#15803d'
                    }}>
                      {payment.payment_type === 'down_payment' ? 'DOWN' : payment.payment_type === 'processing_fee' ? 'DOC FEE' : 'MONTHLY'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>
                    ${parseFloat(payment.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td style={{ padding: '15px', fontSize: '13px', lineHeight: '1.5' }}>
                    {payment.loan_payment_amount > 0 && (
                      <>
                        <div>💰 Loan: ${parseFloat(payment.loan_payment_amount).toFixed(2)}</div>
                        {payment.principal_amount > 0 && (
                          <div style={{ paddingLeft: '20px', color: '#059669' }}>
                            ↳ Principal: ${parseFloat(payment.principal_amount).toFixed(2)}
                          </div>
                        )}
                        {payment.interest_amount > 0 && (
                          <div style={{ paddingLeft: '20px', color: '#f59e0b' }}>
                            ↳ Interest: ${parseFloat(payment.interest_amount).toFixed(2)}
                          </div>
                        )}
                      </>
                    )}
                    {payment.tax_amount > 0 && (
                      <div>🏛️ Tax: ${parseFloat(payment.tax_amount).toFixed(2)}</div>
                    )}
                    {payment.hoa_amount > 0 && (
                      <div>🏘️ HOA: ${parseFloat(payment.hoa_amount).toFixed(2)}</div>
                    )}
                    {payment.late_fee_amount > 0 && (
                      <div>⏰ Late Fee: ${parseFloat(payment.late_fee_amount).toFixed(2)}</div>
                    )}
                    {payment.notice_fee_amount > 0 && (
                      <div>📄 Notice Fee: ${parseFloat(payment.notice_fee_amount).toFixed(2)}</div>
                    )}
                    {payment.postal_fee_amount > 0 && (
                      <div>📮 Postal: ${parseFloat(payment.postal_fee_amount).toFixed(2)}</div>
                    )}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: '#10b981',
                      color: 'white'
                    }}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentTracking;