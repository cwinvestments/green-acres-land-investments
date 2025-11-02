import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLoans } from '../api';
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

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user.firstName}! 🌿</h1>
        <p>Manage your land investments and track your progress</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <h2 style={{ marginBottom: '1.5rem' }}>Your Loans</h2>

      {loans.length === 0 ? (
        <div className="empty-state">
          <h3>No Active Loans</h3>
          <p>Browse our available properties to get started!</p>
          <Link to="/properties" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="loans-grid">
          {loans.map((loan) => {
            const percentPaid = ((loan.principal - loan.balance) / loan.principal) * 100;
            const remainingPayments = Math.ceil(loan.balance / loan.monthly_payment);
            
            return (
              <Link 
                to={`/loans/${loan.id}`} 
                key={loan.id}
                className="loan-card"
              >
                <img
                  src={loan.image_url}
                  alt={loan.property_title}
                  className="loan-image"
                />
                
                <div className="loan-details">
                  <div className={`loan-status ${loan.status}`}>
                    {loan.status === 'active' ? 'Active' : 'Paid Off'}
                  </div>
                  
                  <h3>{loan.property_title}</h3>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>
                    📍 {loan.location}
                  </p>

                  <div className="loan-progress">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        Progress: {Math.round(percentPaid)}%
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        {remainingPayments} payments left
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${percentPaid}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="loan-stats">
                    <div className="stat">
                      <div className="stat-label">Balance</div>
                      <div className="stat-value">
                        ${loan.balance.toLocaleString()}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-label">Monthly Payment</div>
                      <div className="stat-value">
                        ${loan.monthly_payment.toLocaleString()}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-label">Interest Rate</div>
                      <div className="stat-value">
                        {loan.interest_rate}%
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
