import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLoanManagement() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    notice_date: new Date().toISOString().split('T')[0],
    postal_method: 'Certified Mail with Return Receipt',
    postal_cost: '',
    tracking_number: '',
    notes: ''
  });

  const loadLoans = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/loans`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoans(response.data);
    } catch (err) {
      console.error('Failed to load loans:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const getDaysOverdue = (nextPaymentDate) => {
    if (!nextPaymentDate) return 0;
    const today = new Date();
    const dueDate = new Date(nextPaymentDate);
    const days = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const openNoticeModal = (loan) => {
    setSelectedLoan(loan);
    setShowNoticeModal(true);
    setNoticeForm({
      notice_date: new Date().toISOString().split('T')[0],
      postal_method: 'Certified Mail with Return Receipt',
      postal_cost: '',
      tracking_number: '',
      notes: ''
    });
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    
    if (!noticeForm.postal_cost || !noticeForm.tracking_number) {
      alert('Postal cost and tracking number are required');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/loans/${selectedLoan.id}/send-notice`,
        noticeForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Default/Cure Notice recorded successfully!');
      setShowNoticeModal(false);
      loadLoans();
    } catch (err) {
      console.error('Failed to send notice:', err);
      alert('Failed to record notice: ' + (err.response?.data?.error || err.message));
    }
  };

  const waiveLateFee = async (loanId) => {
    if (!window.confirm('Waive late fee for this loan?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/loans/${loanId}/waive-late-fee`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Late fee waived successfully!');
      loadLoans();
    } catch (err) {
      console.error('Failed to waive late fee:', err);
      alert('Failed to waive late fee');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading loans...</div>;
  }

  const overdueLoans = loans.filter(l => l.status === 'active' && getDaysOverdue(l.next_payment_date) > 0);
  const currentLoans = loans.filter(l => l.status === 'active' && getDaysOverdue(l.next_payment_date) <= 0);
  const completedLoans = loans.filter(l => l.status !== 'active');

  return (
    <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>💼 Loan Management</h1>
          <p style={{ margin: 0, color: '#666' }}>
            {loans.length} total loans ({overdueLoans.length} overdue)
          </p>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="btn">
          ← Back to Dashboard
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ padding: '20px', backgroundColor: '#fee' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#dc3545' }}>⚠️ Overdue</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
            {overdueLoans.length}
          </p>
        </div>
        <div className="card" style={{ padding: '20px', backgroundColor: '#f0f8f0' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--forest-green)' }}>✓ Current</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
            {currentLoans.length}
          </p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>📋 Completed</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#666' }}>
            {completedLoans.length}
          </p>
        </div>
      </div>

      {/* Overdue Loans Section */}
      {overdueLoans.length > 0 && (
        <>
          <h2 style={{ color: '#dc3545', marginTop: '40px' }}>⚠️ Overdue Loans</h2>
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#fee', borderBottom: '2px solid #dc3545' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Property</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Due Date</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Days Overdue</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Balance</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueLoans.map(loan => {
                  const daysOverdue = getDaysOverdue(loan.next_payment_date);
                  return (
                    <tr key={loan.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px' }}>
                        <strong>{loan.first_name} {loan.last_name}</strong>
                        <br />
                        <small style={{ color: '#666' }}>{loan.email}</small>
                        {loan.phone && <><br /><small style={{ color: '#666' }}>{loan.phone}</small></>}
                      </td>
                      <td style={{ padding: '15px' }}>{loan.property_title}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        {new Date(loan.next_payment_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: daysOverdue >= 30 ? '#dc3545' : '#ffc107',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {daysOverdue} days
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                        ${parseFloat(loan.balance_remaining).toFixed(2)}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {daysOverdue >= 30 && !loan.notice_sent_date && (
                            <button
                              onClick={() => openNoticeModal(loan)}
                              className="btn"
                              style={{
                                padding: '8px 15px',
                                fontSize: '14px',
                                backgroundColor: '#dc3545',
                                color: 'white'
                              }}
                            >
                              📨 Send Notice
                            </button>
                          )}
                          {loan.notice_sent_date && (
                            <span style={{
                              padding: '8px 15px',
                              fontSize: '12px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              borderRadius: '4px'
                            }}>
                              Notice Sent {new Date(loan.notice_sent_date).toLocaleDateString()}
                            </span>
                          )}
                          {daysOverdue > 7 && (
                            <button
                              onClick={() => waiveLateFee(loan.id)}
                              className="btn"
                              style={{
                                padding: '8px 15px',
                                fontSize: '14px'
                              }}
                            >
                              Waive Late Fee
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Current Loans Section */}
      <h2 style={{ color: 'var(--forest-green)', marginTop: '40px' }}>✓ Current Loans</h2>
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Property</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Next Due</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Monthly</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {currentLoans.map(loan => (
              <tr key={loan.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>
                  <strong>{loan.first_name} {loan.last_name}</strong>
                  <br />
                  <small style={{ color: '#666' }}>{loan.email}</small>
                </td>
                <td style={{ padding: '15px' }}>{loan.property_title}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {new Date(loan.next_payment_date).toLocaleDateString()}
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  ${parseFloat(loan.monthly_payment).toFixed(2)}
                </td>
                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                  ${parseFloat(loan.balance_remaining).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notice Modal */}
      {showNoticeModal && selectedLoan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0 }}>📨 Send Default/Cure Notice</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              <strong>Customer:</strong> {selectedLoan.first_name} {selectedLoan.last_name}<br />
              <strong>Property:</strong> {selectedLoan.property_title}<br />
              <strong>Days Overdue:</strong> {getDaysOverdue(selectedLoan.next_payment_date)}
            </p>

            <form onSubmit={handleSendNotice}>
              <div className="form-group">
                <label>Notice Date *</label>
                <input
                  type="date"
                  value={noticeForm.notice_date}
                  onChange={(e) => setNoticeForm({...noticeForm, notice_date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Postal Method *</label>
                <select
                  value={noticeForm.postal_method}
                  onChange={(e) => setNoticeForm({...noticeForm, postal_method: e.target.value})}
                  required
                >
                  <option value="Certified Mail">Certified Mail</option>
                  <option value="Certified Mail with Return Receipt">Certified Mail with Return Receipt</option>
                  <option value="Priority Mail">Priority Mail</option>
                  <option value="Overnight">Overnight</option>
                </select>
              </div>

              <div className="form-group">
                <label>Postal Cost * (Actual cost)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10.50"
                  value={noticeForm.postal_cost}
                  onChange={(e) => setNoticeForm({...noticeForm, postal_cost: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tracking Number *</label>
                <input
                  type="text"
                  placeholder="9400 1000 0000 0000 0000 00"
                  value={noticeForm.tracking_number}
                  onChange={(e) => setNoticeForm({...noticeForm, tracking_number: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="3"
                  placeholder="Customer not responding to calls/emails..."
                  value={noticeForm.notes}
                  onChange={(e) => setNoticeForm({...noticeForm, notes: e.target.value})}
                />
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                <strong>⚠️ This will add the following to customer's next payment:</strong><br />
                - Default/Cure Notice Fee: $75.00<br />
                - Postal/Certified Mail: ${noticeForm.postal_cost || '0.00'}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Record Notice Sent
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="btn"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLoanManagement;