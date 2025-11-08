import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStates, createState, updateState, deleteState } from '../../api';

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
    fetchStates();
  }, []);

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
    return <div className="admin-container"><p>Loading...</p></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <button onClick={() => navigate('/admin')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>State Management</h1>
          <p>Manage which states appear on the public website</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          Add New State
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total States</h3>
          <p className="summary-number">{states.length}</p>
        </div>
        <div className="summary-card">
          <h3>Active States</h3>
          <p className="summary-number">{states.filter(s => s.is_active).length}</p>
        </div>
        <div className="summary-card">
          <h3>Coming Soon</h3>
          <p className="summary-number">{states.filter(s => s.coming_soon).length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Properties</h3>
          <p className="summary-number">{states.reduce((sum, s) => sum + parseInt(s.property_count), 0)}</p>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>State</th>
              <th>Abbreviation</th>
              <th>Properties</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {states.map((state) => (
              <tr key={state.id}>
                <td><strong>{state.name}</strong></td>
                <td>{state.abbreviation}</td>
                <td>{state.property_count}</td>
                <td>{state.sort_order}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleToggleActive(state)}
                      className={state.is_active ? 'status-badge-success' : 'status-badge-warning'}
                      style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
                    >
                      {state.is_active ? '✓ Active' : '○ Inactive'}
                    </button>
                    <button
                      onClick={() => handleToggleComingSoon(state)}
                      className={state.coming_soon ? 'status-badge-info' : 'status-badge'}
                      style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
                    >
                      {state.coming_soon ? '⭐ Coming Soon' : '○ Not Coming Soon'}
                    </button>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenModal(state)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(state.id, state.name)}
                      className="btn-danger"
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                      disabled={parseInt(state.property_count) > 0}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingState ? 'Edit State' : 'Add New State'}</h2>
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
                <small>Lower numbers appear first in navigation</small>
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

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
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