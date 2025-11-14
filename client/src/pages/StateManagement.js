import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStates, createState, updateState, deleteState } from '../api';

function StateManagement() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    is_active: false,
    coming_soon: false,
    sort_order: 0
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchStates();
  }, [navigate]);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await getAdminStates();
      setStates(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
      alert('Failed to load states');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (state = null) => {
    if (state) {
      setEditingState(state);
      setFormData({
        name: state.name,
        abbreviation: state.abbreviation,
        is_active: state.is_active,
        coming_soon: state.coming_soon,
        sort_order: state.sort_order
      });
    } else {
      setEditingState(null);
      setFormData({
        name: '',
        abbreviation: '',
        is_active: false,
        coming_soon: false,
        sort_order: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingState(null);
    setFormData({
      name: '',
      abbreviation: '',
      is_active: false,
      coming_soon: false,
      sort_order: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingState) {
        await updateState(editingState.id, formData);
        alert('State updated successfully!');
      } else {
        await createState(formData);
        alert('State created successfully!');
      }
      handleCloseModal();
      fetchStates();
    } catch (error) {
      console.error('Error saving state:', error);
      alert(error.response?.data?.error || 'Failed to save state');
    }
  };

  const handleDelete = async (id, stateName) => {
    if (window.confirm(`Are you sure you want to delete ${stateName}? This cannot be undone.`)) {
      try {
        await deleteState(id);
        alert('State deleted successfully!');
        fetchStates();
      } catch (error) {
        console.error('Error deleting state:', error);
        alert(error.response?.data?.error || 'Failed to delete state');
      }
    }
  };

  const handleToggleActive = async (state) => {
    try {
      await updateState(state.id, {
        ...state,
        is_active: !state.is_active
      });
      fetchStates();
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('Failed to update state status');
    }
  };

  const handleToggleComingSoon = async (state) => {
    try {
      await updateState(state.id, {
        ...state,
        coming_soon: !state.coming_soon
      });
      fetchStates();
    } catch (error) {
      console.error('Error toggling coming soon status:', error);
      alert('Failed to update state status');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading states...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>🗺️ State Management</h1>
          <p style={{ margin: 0, color: '#666' }}>
            Manage which states appear on the public website
          </p>
        </div>
        <div>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary"
            style={{ marginRight: '10px' }}
          >
            + Add New State
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="btn btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Total States</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
            {states.length}
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Active States</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
            {states.filter(s => s.is_active).length}
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Coming Soon</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--sandy-gold)' }}>
            {states.filter(s => s.coming_soon).length}
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Total Properties</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
            {states.reduce((sum, s) => sum + parseInt(s.property_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* States Table */}
      <div className="card" style={{ padding: 0, overflow: 'auto', maxWidth: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>State</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Abbreviation</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Properties</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Sort Order</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {states.map((state) => (
              <tr key={state.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>
                  <strong>{state.name}</strong>
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {state.abbreviation}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {state.property_count}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {state.sort_order}
                </td>
                <td style={{ padding: '15px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    <button
                      onClick={() => handleToggleActive(state)}
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '500',
                        backgroundColor: state.is_active ? '#10b981' : '#f59e0b',
                        color: 'white'
                      }}
                    >
                      {state.is_active ? '✓ Active' : '○ Inactive'}
                    </button>
                    <button
                      onClick={() => handleToggleComingSoon(state)}
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '500',
                        backgroundColor: state.coming_soon ? '#8b5cf6' : '#e5e7eb',
                        color: state.coming_soon ? 'white' : '#666'
                      }}
                    >
                      {state.coming_soon ? '⭐ Coming Soon' : '○ Not Coming'}
                    </button>
                  </div>
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleOpenModal(state)}
                      className="btn"
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(state.id, state.name)}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        backgroundColor: '#dc3545',
                        color: 'white'
                      }}
                      disabled={parseInt(state.property_count) > 0}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
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
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>{editingState ? 'Edit State' : 'Add New State'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>State Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Wisconsin"
                />
              </div>

              <div className="form-group">
                <label>Abbreviation * (2 letters)</label>
                <input
                  type="text"
                  value={formData.abbreviation}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value.toUpperCase() })}
                  required
                  maxLength="2"
                  placeholder="e.g., WI"
                />
              </div>

              <div className="form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  placeholder="0"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Lower numbers appear first in navigation</small>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  {' '}Active (show on public site)
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.coming_soon}
                    onChange={(e) => setFormData({ ...formData, coming_soon: e.target.checked })}
                  />
                  {' '}Coming Soon (show on public site with badge)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseModal} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingState ? 'Update State' : 'Add State'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StateManagement;