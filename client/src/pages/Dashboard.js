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
          <p className="summary-number">{loans.length}</p>
        </div>
        <div className="summary-card">
          <h3>Paid Off</h3>
          <p className="summary-number">{loans.filter(l => l.status === 'paid_off').length}</p>
        </div>
      </div>

      <h2>Your Properties</h2>
      
      {loans.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any properties yet.</p>
          <Link to="/properties" className="btn btn-primary">
            Browse Available Properties
          </Link>
        </div>
      ) : (
        <div className="loans-grid">
          {loans.map(loan => {
            const percentPaid = ((parseFloat(loan.loan_amount) - parseFloat(loan.balance_remaining)) / parseFloat(loan.loan_amount)) * 100;
            const remainingPayments = Math.ceil(parseFloat(loan.balance_remaining) / parseFloat(loan.monthly_payment));
            
            return (
              <div key={loan.id} className="loan-card">
                <h3>{loan.property_title}</h3>
                <p className="loan-location">{loan.location}</p>
                
                <div className="loan-details">
                  <div className="loan-detail-row">
                    <span>Monthly Payment:</span>
                    <span className="loan-amount">
                      ${formatCurrency(loan.monthly_payment)}
                    </span>
                  </div>
                  
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