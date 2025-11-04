import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/login`,
        formData
      );

      // Store admin token and info
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));

      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🔐 Admin Login</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Green Acres Administration Portal
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="username"
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
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full-width"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          <a href="/" style={{ color: 'var(--forest-green)' }}>← Back to Customer Site</a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;