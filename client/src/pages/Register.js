import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate terms accepted
    if (!termsAccepted) {
      setError('You must read and accept the Terms of Service to register');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Ensure grecaptcha is loaded
      if (!window.grecaptcha) {
        setError('reCAPTCHA not loaded. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      // Get reCAPTCHA token
      const recaptchaToken = await window.grecaptcha.execute(
        process.env.REACT_APP_RECAPTCHA_SITE_KEY,
        { action: 'register' }
      );
      
      console.log('reCAPTCHA token generated:', recaptchaToken);

      // Send registration with reCAPTCHA token
      const response = await apiRegister({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        recaptchaToken: recaptchaToken
      });
      
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Your Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone (optional):</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}
          
          {/* Terms of Service */}
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="btn"
              style={{
                width: '100%',
                backgroundColor: termsAccepted ? '#28a745' : 'var(--forest-green)',
                color: 'white'
              }}
            >
              {termsAccepted ? '✓ Terms of Service Accepted' : 'Read & Accept Terms of Service'}
            </button>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full-width"
            disabled={loading || !termsAccepted}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-links">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
        
        <div style={{ fontSize: '12px', color: '#666', marginTop: '20px', textAlign: 'center' }}>
          This site is protected by reCAPTCHA and the Google{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '2px solid var(--forest-green)'
            }}>
              <h2 style={{ margin: 0, color: 'var(--forest-green)' }}>Terms of Service</h2>
            </div>
            
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              flex: 1
            }}>
              <iframe 
                src="/terms" 
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  minHeight: '400px'
                }}
                title="Terms of Service"
              />
            </div>
            
            <div style={{
              padding: '20px',
              borderTop: '2px solid #e0e0e0',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: 'var(--forest-green)',
                  color: 'white',
                  padding: '12px',
                  fontSize: '16px'
                }}
              >
                ✓ I Accept the Terms of Service
              </button>
              <button
                onClick={() => setShowTermsModal(false)}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '12px',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;