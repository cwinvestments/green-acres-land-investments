import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(formData.email, formData.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        {/* Admin Badge */}
        <div className="admin-access-badge">
          🔐 ADMIN ACCESS ONLY
        </div>

        <h2 className="admin-login-title">
          Admin Login
        </h2>
        
        <p className="admin-login-subtitle">
          Authorized personnel only. Unauthorized access is prohibited.
        </p>

        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              Admin Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="admin-form-input"
              disabled={loading}
            />
          </div>

          <div className="admin-form-group-last">
            <label className="admin-form-label">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="admin-form-input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-login-submit"
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#2c5f2d';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#1e4620';
            }}
          >
            {loading ? 'Logging in...' : 'Access Admin Portal'}
          </button>
        </form>

        <div className="admin-login-footer">
          <button
            onClick={() => navigate('/')}
            className="admin-back-button"
          >
            ← Back to Main Site
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;