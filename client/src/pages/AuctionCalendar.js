import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AuctionCalendar() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [formData, setFormData] = useState({
    auction_date: '',
    auction_name: '',
    url: '',
    property_address: '',
    description: '',
    notes: ''
  });
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/auction-calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuctions(response.data.auctions || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError('Failed to load auction calendar');
      setLoading(false);
    }
  };

  const openModal = (auction = null) => {
    if (auction) {
      setEditingAuction(auction);
      setFormData({
        auction_date: auction.auction_date ? auction.auction_date.split('T')[0] : '',
        auction_name: auction.auction_name,
        url: auction.url || '',
        property_address: auction.property_address || '',
        description: auction.description || '',
        notes: auction.notes || ''
      });
    } else {
      setEditingAuction(null);
      setFormData({
        auction_date: '',
        auction_name: '',
        url: '',
        property_address: '',
        description: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAuction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (editingAuction) {
        await axios.patch(
          `${API_URL}/admin/auction-calendar/${editingAuction.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
      } else {
        await axios.post(
          `${API_URL}/admin/auction-calendar`,
          formData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
      }
      closeModal();
      fetchAuctions();
    } catch (err) {
      console.error('Error saving auction:', err);
      alert('Failed to save auction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this auction entry?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/admin/auction-calendar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAuctions();
    } catch (err) {
      console.error('Error deleting auction:', err);
      alert('Failed to delete auction');
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/admin/auction-calendar/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchAuctions();
    } catch (err) {
      console.error('Error marking as completed:', err);
      alert('Failed to mark auction as completed');
    }
  };

  const getDaysUntil = (dateString) => {
    const auctionDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    auctionDate.setHours(0, 0, 0, 0);
    const diffTime = auctionDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntil) => {
    if (daysUntil < 0) return '#6c757d';
    if (daysUntil === 0) return '#dc3545';
    if (daysUntil <= 2) return '#ff6b00';
    if (daysUntil <= 7) return '#ffc107';
    return '#28a745';
  };

  const filteredAuctions = auctions.filter(auction => {
    const daysUntil = getDaysUntil(auction.auction_date);
    if (filter === 'upcoming') return !auction.is_completed && daysUntil >= 0;
    if (filter === 'past') return daysUntil < 0 && !auction.is_completed;
    if (filter === 'completed') return auction.is_completed;
    return true;
  });

  if (loading) {
    return <div className="admin-dashboard-container"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="admin-dashboard-container"><p style={{ color: '#dc3545' }}>{error}</p></div>;
  }

  return (
    <div className="admin-dashboard-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-page-title">📅 Auction Calendar</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Track upcoming auction dates and property opportunities
        </p>
        <button onClick={() => openModal()} className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
          ➕ Add Auction
        </button>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary" style={{ width: '100%' }}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('upcoming')}
          className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Upcoming ({auctions.filter(a => !a.is_completed && getDaysUntil(a.auction_date) >= 0).length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`btn ${filter === 'past' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Past ({auctions.filter(a => getDaysUntil(a.auction_date) < 0 && !a.is_completed).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Completed ({auctions.filter(a => a.is_completed).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All ({auctions.length})
        </button>
      </div>

      {/* Desktop Table */}
      <div className="desktop-only">
        <div className="card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Auction Name</th>
                <th>Property/Location</th>
                <th>Days Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuctions.map(auction => {
                const daysUntil = getDaysUntil(auction.auction_date);
                const urgencyColor = getUrgencyColor(daysUntil);
                return (
                  <tr key={auction.id} style={{ backgroundColor: daysUntil === 0 ? '#fff5f5' : 'white' }}>
                    <td style={{ fontWeight: '600' }}>
                      {new Date(auction.auction_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{auction.auction_name}</div>
                      {auction.url && (
                        <a href={auction.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85em' }}>
                          View Listing
                        </a>
                      )}
                    </td>
                    <td>
                      {auction.property_address && <div>{auction.property_address}</div>}
                      {auction.description && <div style={{ fontSize: '0.85em', color: '#666' }}>{auction.description}</div>}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 'bold',
                        color: urgencyColor,
                        fontSize: '1.1em'
                      }}>
                        {daysUntil === 0 ? 'TODAY' : 
                         daysUntil === 1 ? 'Tomorrow' :
                         daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` :
                         `${daysUntil} days`}
                      </span>
                    </td>
                    <td>
                      {auction.is_completed ? (
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85em',
                          fontWeight: 'bold',
                          backgroundColor: '#28a74520',
                          color: '#28a745',
                          border: '2px solid #28a745'
                        }}>
                          ✓ Completed
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {!auction.is_completed && (
                          <button
                            className="btn"
                            onClick={() => handleMarkCompleted(auction.id)}
                            style={{ padding: '5px 10px', fontSize: '0.9em', backgroundColor: '#28a745', color: 'white' }}
                          >
                            ✓ Complete
                          </button>
                        )}
                        <button
                          className="btn btn-secondary"
                          onClick={() => openModal(auction)}
                          style={{ padding: '5px 10px', fontSize: '0.9em' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn"
                          onClick={() => handleDelete(auction.id)}
                          style={{ padding: '5px 10px', fontSize: '0.9em', backgroundColor: '#dc3545', color: 'white' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAuctions.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              No auctions found.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-only">
        {filteredAuctions.map(auction => {
          const daysUntil = getDaysUntil(auction.auction_date);
          const urgencyColor = getUrgencyColor(daysUntil);
          return (
            <div key={auction.id} className="card" style={{ 
              marginBottom: '15px', 
              padding: '15px',
              border: daysUntil === 0 ? '3px solid #dc3545' : '1px solid #e0e0e0'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: urgencyColor, fontSize: '1.2em' }}>
                    {daysUntil === 0 ? 'TODAY' : 
                     daysUntil === 1 ? 'Tomorrow' :
                     daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` :
                     `${daysUntil} days`}
                  </span>
                  {auction.is_completed && (
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85em',
                      fontWeight: 'bold',
                      backgroundColor: '#28a74520',
                      color: '#28a745',
                      border: '2px solid #28a745'
                    }}>
                      ✓ Completed
                    </span>
                  )}
                </div>
                <h3 style={{ margin: '5px 0', fontSize: '1.1em' }}>{auction.auction_name}</h3>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  {new Date(auction.auction_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {(auction.property_address || auction.description) && (
                <div style={{ marginBottom: '10px', fontSize: '0.9em' }}>
                  {auction.property_address && <div><strong>Location:</strong> {auction.property_address}</div>}
                  {auction.description && <div><strong>Description:</strong> {auction.description}</div>}
                </div>
              )}

              {auction.url && (
                <div style={{ marginBottom: '10px' }}>
                  <a href={auction.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                    🌐 View Listing
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {!auction.is_completed && (
                  <button
                    className="btn"
                    onClick={() => handleMarkCompleted(auction.id)}
                    style={{ flex: '1', minWidth: '100px', backgroundColor: '#28a745', color: 'white' }}
                  >
                    ✓ Complete
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => openModal(auction)}
                  style={{ flex: '1', minWidth: '100px' }}
                >
                  Edit
                </button>
                <button
                  className="btn"
                  onClick={() => handleDelete(auction.id)}
                  style={{ backgroundColor: '#dc3545', color: 'white' }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {filteredAuctions.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No auctions found.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAuction ? 'Edit Auction' : 'Add New Auction'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Auction Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.auction_date}
                    onChange={(e) => setFormData({...formData, auction_date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Auction Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.auction_name}
                    onChange={(e) => setFormData({...formData, auction_name: e.target.value})}
                    placeholder="e.g., Hudson & Marshall December Auction"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Auction URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>Property Address/Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.property_address}
                    onChange={(e) => setFormData({...formData, property_address: e.target.value})}
                    placeholder="Maricopa County, AZ"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="2"
                    placeholder="Brief description of properties available"
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    className="form-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    placeholder="Internal notes, reminders, etc."
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingAuction ? 'Update' : 'Add'} Auction
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

export default AuctionCalendar;