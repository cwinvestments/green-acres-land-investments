import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCustomer, setResetCustomer] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/customers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCustomers(response.data);
      setFilteredCustomers(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login');
      } else {
        setError('Failed to load customers');
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    // Filter customers based on search term
    if (!searchTerm) {
      setFilteredCustomers(customers);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.first_name.toLowerCase().includes(term) ||
        customer.last_name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        (customer.phone && customer.phone.includes(term))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const loadCustomerDetails = async (customerId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/customers/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedCustomer(response.data);
    } catch (err) {
      alert('Failed to load customer details');
    }
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleResetPassword = (customer) => {
    setResetCustomer(customer);
    setTempPassword(generateTempPassword());
    setShowResetModal(true);
  };

  const confirmResetPassword = async () => {
    if (!window.confirm(`Are you sure you want to reset password for ${resetCustomer.first_name} ${resetCustomer.last_name}?`)) {
      return;
    }

    setResetting(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/customers/${resetCustomer.id}/reset-password`,
        { tempPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Password reset successfully! Make sure to give the customer their temporary password.');
      setShowResetModal(false);
      setResetCustomer(null);
      setTempPassword('');
    } catch (err) {
      alert('Failed to reset password: ' + (err.response?.data?.error || err.message));
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (customer.loan_count > 0) {
      alert(`Cannot delete customer with existing loans. ${customer.first_name} ${customer.last_name} has ${customer.loan_count} loan(s).`);
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${customer.first_name} ${customer.last_name}? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/customers/${customer.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Customer deleted successfully');
      setSelectedCustomer(null);
      loadCustomers();
    } catch (err) {
      alert('Failed to delete customer: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading customers...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>👥 Customer Management</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="btn btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total Customers
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--forest-green)' }}>
              {customers.length}
            </div>
          </div>
          
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total Outstanding
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--forest-green)' }}>
              ${formatCurrency(customers.reduce((sum, c) => sum + c.total_balance, 0))}
            </div>
          </div>
          
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total Monthly Payments
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--forest-green)' }}>
              ${formatCurrency(customers.reduce((sum, c) => sum + c.total_monthly_payment, 0))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid var(--border-color)',
            borderRadius: '8px'
          }}
        />
        {searchTerm && (
          <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        )}
      </div>

      {/* Customer List - Desktop Table */}
      <div className="card desktop-only" style={{ padding: 0, overflow: 'auto', maxWidth: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-green)' }}>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid var(--forest-green)' }}>Customer</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid var(--forest-green)' }}>Contact</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid var(--forest-green)' }}>Loans</th>
              <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid var(--forest-green)' }}>Monthly Payment</th>
              <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid var(--forest-green)' }}>Total Balance</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid var(--forest-green)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>
                  <strong>{customer.first_name} {customer.last_name}</strong>
                  <br />
                  <small style={{ color: '#666' }}>ID: {customer.id}</small>
                </td>
                <td style={{ padding: '15px' }}>
                  {customer.email}
                  <br />
                  {customer.phone && (
                    <small style={{ color: '#666' }}>{customer.phone}</small>
                  )}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', color: 'var(--forest-green)' }}>
                    {customer.active_loans} Active
                  </div>
                  <small style={{ color: '#666' }}>
                    {customer.loan_count} Total
                  </small>
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <strong style={{ color: 'var(--forest-green)', fontSize: '1.1rem' }}>
                    ${formatCurrency(customer.total_monthly_payment || 0)}
                  </strong>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>per month</div>
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <strong style={{ color: 'var(--forest-green)', fontSize: '1.1rem' }}>
                    ${formatCurrency(customer.total_balance)}
                  </strong>
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => loadCustomerDetails(customer.id)}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleResetPassword(customer)}
                      className="btn"
                      style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#f59e0b', color: 'white' }}
                    >
                      🔑 Reset Password
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
          </div>
        )}
      </div>

      {/* Customer List - Mobile Cards */}
      <div className="mobile-only" style={{ gap: '15px' }}>
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="card" style={{ padding: '15px' }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--forest-green)' }}>
                {customer.first_name} {customer.last_name}
              </strong>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>ID: {customer.id}</div>
            </div>

            <div style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
              <div>{customer.email}</div>
              {customer.phone && <div style={{ color: '#666' }}>{customer.phone}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px', fontSize: '0.9rem' }}>
              <div>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>Loans</div>
                <div style={{ fontWeight: '600', color: 'var(--forest-green)' }}>
                  {customer.active_loans} Active / {customer.loan_count} Total
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>Monthly</div>
                <div style={{ fontWeight: '600', color: 'var(--forest-green)' }}>
                  ${formatCurrency(customer.total_monthly_payment || 0)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '15px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
              <div style={{ color: '#666', fontSize: '0.85rem' }}>Total Balance</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--forest-green)' }}>
                ${formatCurrency(customer.total_balance)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => loadCustomerDetails(customer.id)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '14px' }}
              >
                View Details
              </button>
              <button
                onClick={() => handleResetPassword(customer)}
                className="btn"
                style={{ padding: '10px 12px', fontSize: '14px', backgroundColor: '#f59e0b', color: 'white' }}
              >
                🔑
              </button>
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {showResetModal && resetCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div className="card" style={{ maxWidth: '500px', margin: '20px' }}>
            <h2 style={{ marginTop: 0, color: 'var(--forest-green)' }}>Reset Password</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Customer:</strong> {resetCustomer.first_name} {resetCustomer.last_name}</p>
              <p><strong>Email:</strong> {resetCustomer.email}</p>
            </div>

            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107',
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>Temporary Password:</p>
              <div style={{
                padding: '10px',
                backgroundColor: 'white',
                border: '2px solid #ffc107',
                borderRadius: '5px',
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                userSelect: 'all'
              }}>
                {tempPassword}
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
                Copy this password and provide it to the customer. They can change it in Account Settings.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowResetModal(false)}
                className="btn"
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                onClick={confirmResetPassword}
                className="btn btn-primary"
                disabled={resetting}
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            margin: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0, color: 'var(--forest-green)', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer)}
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  disabled={selectedCustomer.loans && selectedCustomer.loans.length > 0}
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  style={{
                    padding: '8px 16px',
                    background: '#ddd',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: 'var(--forest-green)', marginBottom: '15px' }}>Contact Information</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div><strong>Email:</strong> {selectedCustomer.email}</div>
                <div><strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}</div>
                <div><strong>Customer Since:</strong> {formatDate(selectedCustomer.created_at)}</div>
              </div>
            </div>

            {/* Customer's Loans */}
            <div>
              <h3 style={{ color: 'var(--forest-green)', marginBottom: '15px' }}>
                Loans ({selectedCustomer.loans.length})
              </h3>
              
              {selectedCustomer.loans.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No loans yet</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {selectedCustomer.loans.map(loan => (
                    <div key={loan.id} style={{
                      padding: '15px',
                      background: 'var(--light-green)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ color: 'var(--forest-green)' }}>{loan.property_title}</strong>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: loan.status === 'active' ? '#e8f5e9' : '#fff3e0',
                          color: loan.status === 'active' ? '#2e7d32' : '#f57c00'
                        }}>
                          {loan.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#666', display: 'grid', gap: '5px' }}>
                        <div>📍 {loan.property_location}</div>
                        <div>💰 Balance: ${formatCurrency(loan.balance_remaining)}</div>
                        <div>📅 Monthly: ${formatCurrency(loan.monthly_payment)}</div>
                        <div>🏦 Started: {formatDate(loan.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerManagement;