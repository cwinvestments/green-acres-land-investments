import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function PropertySources() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    password_encrypted: '',
    states: '',
    counties: '',
    notes: '',
    contact_info: '',
    is_active: true
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/property-sources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSources(response.data.sources || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError('Failed to load property sources');
      setLoading(false);
    }
  };

  const openModal = (source = null) => {
    if (source) {
      setEditingSource(source);
      setFormData({
        name: source.name,
        url: source.url,
        username: source.username || '',
        password_encrypted: source.password_encrypted || '',
        states: source.states || '',
        counties: source.counties || '',
        notes: source.notes || '',
        contact_info: source.contact_info || '',
        is_active: source.is_active
      });
    } else {
      setEditingSource(null);
      setFormData({
        name: '',
        url: '',
        username: '',
        password_encrypted: '',
        states: '',
        counties: '',
        notes: '',
        contact_info: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSource(null);
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (editingSource) {
        await axios.patch(
          `${API_URL}/admin/property-sources/${editingSource.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
      } else {
        await axios.post(
          `${API_URL}/admin/property-sources`,
          formData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
      }
      closeModal();
      fetchSources();
    } catch (err) {
      console.error('Error saving source:', err);
      alert('Failed to save property source');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property source?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/admin/property-sources/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSources();
    } catch (err) {
      console.error('Error deleting source:', err);
      alert('Failed to delete property source');
    }
  };

  const handleOpenSite = async (source) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/admin/property-sources/${source.id}/access`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      window.open(source.url, '_blank');
      fetchSources();
    } catch (err) {
      console.error('Error updating access time:', err);
      window.open(source.url, '_blank');
    }
  };

  if (loading) {
    return <div className="admin-dashboard-container"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="admin-dashboard-container"><p style={{ color: '#dc3545' }}>{error}</p></div>;
  }

  return (
    <div className="admin-dashboard-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-page-title">🗂️ Property Sources</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Track auction sites and property acquisition sources
        </p>
        <button onClick={() => openModal()} className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
          ➕ Add New Source
        </button>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary" style={{ width: '100%' }}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Desktop Table */}
      <div className="desktop-only">
        <div className="card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th>States</th>
                <th>Last Accessed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(source => (
                <tr key={source.id}>
                  <td style={{ fontWeight: '600' }}>{source.name}</td>
                  <td>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9em' }}>
                      {source.url.substring(0, 40)}...
                    </a>
                  </td>
                  <td>{source.states || '—'}</td>
                  <td style={{ fontSize: '0.9em' }}>
                    {source.last_accessed ? new Date(source.last_accessed).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85em',
                      fontWeight: 'bold',
                      backgroundColor: source.is_active ? '#28a74520' : '#6c757d20',
                      color: source.is_active ? '#28a745' : '#6c757d',
                      border: `2px solid ${source.is_active ? '#28a745' : '#6c757d'}`
                    }}>
                      {source.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenSite(source)}
                        style={{ padding: '5px 10px', fontSize: '0.9em' }}
                      >
                        🌐 Open
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => openModal(source)}
                        style={{ padding: '5px 10px', fontSize: '0.9em' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleDelete(source.id)}
                        style={{ padding: '5px 10px', fontSize: '0.9em', backgroundColor: '#dc3545', color: 'white' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sources.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              No property sources yet. Click "Add New Source" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-only">
        {sources.map(source => (
          <div key={source.id} className="card" style={{ marginBottom: '15px', padding: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1em' }}>{source.name}</h3>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.85em',
                fontWeight: 'bold',
                backgroundColor: source.is_active ? '#28a74520' : '#6c757d20',
                color: source.is_active ? '#28a745' : '#6c757d',
                border: `2px solid ${source.is_active ? '#28a745' : '#6c757d'}`
              }}>
                {source.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ marginBottom: '10px', fontSize: '0.9em' }}>
              <div><strong>States:</strong> {source.states || '—'}</div>
              <div><strong>Last Accessed:</strong> {source.last_accessed ? new Date(source.last_accessed).toLocaleDateString() : 'Never'}</div>
            </div>

            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleOpenSite(source)}
                style={{ flex: '1', minWidth: '100px' }}
              >
                🌐 Open Site
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => openModal(source)}
                style={{ flex: '1', minWidth: '100px' }}
              >
                Edit
              </button>
              <button
                className="btn"
                onClick={() => handleDelete(source.id)}
                style={{ backgroundColor: '#dc3545', color: 'white' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {sources.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No property sources yet.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSource ? 'Edit Source' : 'Add New Source'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Source Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Website URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={formData.password_encrypted}
                      onChange={(e) => setFormData({...formData, password_encrypted: e.target.value})}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>States</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.states}
                    onChange={(e) => setFormData({...formData, states: e.target.value})}
                    placeholder="AZ, CO, AR"
                  />
                </div>

                <div className="form-group">
                  <label>Counties</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.counties}
                    onChange={(e) => setFormData({...formData, counties: e.target.value})}
                    placeholder="Maricopa, El Paso, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Contact Info</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.contact_info}
                    onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                    placeholder="Rep name, phone, email"
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    className="form-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    placeholder="Best for Colorado mountain land, Auctions every 2nd Tuesday, etc."
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingSource ? 'Update' : 'Add'} Source
                  </button>
                  <button type="button" onClick={closeModal} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertySources;