import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function EbaySubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/ebay/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(response.data.submissions || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/admin/ebay/submissions/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchSubmissions();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const updateNotes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/admin/ebay/submissions/${selectedSubmission.id}/notes`,
        { notes },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setShowNotesModal(false);
      fetchSubmissions();
    } catch (err) {
      console.error('Error updating notes:', err);
      alert('Failed to update notes');
    }
  };

  const openDetailsModal = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  const openNotesModal = (submission) => {
    setSelectedSubmission(submission);
    setNotes(submission.notes || '');
    setShowNotesModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', color: '#ffc107' },
      contacted: { text: 'Contacted', color: '#17a2b8' },
      completed: { text: 'Completed', color: '#28a745' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = filter === 'all' || sub.status === filter;
    const matchesSearch = 
      sub.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.property_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.ebay_username && sub.ebay_username.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="admin-dashboard-container"><p>Loading submissions...</p></div>;
  }

  if (error) {
    return <div className="admin-dashboard-container"><p style={{ color: '#dc3545' }}>{error}</p></div>;
  }

  return (
    <div className="admin-dashboard-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-page-title">🏆 eBay Auction Winners</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Manage auction winner submissions and convert to customers
        </p>
        <button 
          onClick={() => navigate('/admin/dashboard')} 
          className="btn btn-secondary" 
          style={{ width: '100%' }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <button 
            className={filter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'} 
            onClick={() => setFilter('all')}
          >
            All ({submissions.length})
          </button>
          <button 
            className={filter === 'pending' ? 'btn btn-primary' : 'btn btn-secondary'} 
            onClick={() => setFilter('pending')}
          >
            Pending ({submissions.filter(s => s.status === 'pending').length})
          </button>
          <button 
            className={filter === 'contacted' ? 'btn btn-primary' : 'btn btn-secondary'} 
            onClick={() => setFilter('contacted')}
          >
            Contacted ({submissions.filter(s => s.status === 'contacted').length})
          </button>
          <button 
            className={filter === 'completed' ? 'btn btn-primary' : 'btn btn-secondary'} 
            onClick={() => setFilter('completed')}
          >
            Completed ({submissions.filter(s => s.status === 'completed').length})
          </button>
        </div>

        <input
          type="text"
          className="form-input"
          placeholder="Search by name, email, property, or eBay username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* Desktop Table */}
      <div className="desktop-only">
        <div className="card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Contact</th>
                <th>eBay Username</th>
                <th>Property</th>
                <th>Winning Bid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map(sub => {
                const badge = getStatusBadge(sub.status);
                return (
                  <tr key={sub.id}>
                    <td>{formatDate(sub.submission_date)}</td>
                    <td>{sub.first_name} {sub.last_name}</td>
                    <td>
                      <div>{sub.email}</div>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>{sub.phone}</div>
                    </td>
                    <td>{sub.ebay_username || '—'}</td>
                    <td>{sub.property_title}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--forest-green)' }}>
                      {formatCurrency(sub.winning_bid)}
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.85em',
                        fontWeight: 'bold',
                        backgroundColor: badge.color + '20',
                        color: badge.color,
                        border: `2px solid ${badge.color}`
                      }}>
                        {badge.text}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => openDetailsModal(sub)}
                          style={{ padding: '5px 10px', fontSize: '0.9em' }}
                        >
                          View
                        </button>
                        {sub.status === 'pending' && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => updateStatus(sub.id, 'contacted')}
                            style={{ padding: '5px 10px', fontSize: '0.9em' }}
                          >
                            Mark Contacted
                          </button>
                        )}
                        {sub.status === 'contacted' && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => updateStatus(sub.id, 'completed')}
                            style={{ padding: '5px 10px', fontSize: '0.9em' }}
                          >
                            Mark Completed
                          </button>
                        )}
                        <button 
                          className="btn btn-secondary"
                          onClick={() => openNotesModal(sub)}
                          style={{ padding: '5px 10px', fontSize: '0.9em' }}
                        >
                          {sub.notes ? '📝' : 'Notes'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSubmissions.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              No submissions found{searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-only">
        {filteredSubmissions.map(sub => {
          const badge = getStatusBadge(sub.status);
          return (
            <div key={sub.id} className="card" style={{ marginBottom: '15px', padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1em' }}>{sub.first_name} {sub.last_name}</h3>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.85em',
                  fontWeight: 'bold',
                  backgroundColor: badge.color + '20',
                  color: badge.color,
                  border: `2px solid ${badge.color}`
                }}>
                  {badge.text}
                </span>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Date:</strong> {formatDate(sub.submission_date)}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Email:</strong> {sub.email}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Phone:</strong> {sub.phone}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>eBay Username:</strong> {sub.ebay_username || '—'}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Property:</strong> {sub.property_title}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Winning Bid:</strong> 
                  <span style={{ fontWeight: 'bold', color: 'var(--forest-green)', marginLeft: '5px' }}>
                    {formatCurrency(sub.winning_bid)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => openDetailsModal(sub)}
                  style={{ flex: '1', minWidth: '120px' }}
                >
                  View Details
                </button>
                {sub.status === 'pending' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => updateStatus(sub.id, 'contacted')}
                    style={{ flex: '1', minWidth: '120px' }}
                  >
                    Mark Contacted
                  </button>
                )}
                {sub.status === 'contacted' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => updateStatus(sub.id, 'completed')}
                    style={{ flex: '1', minWidth: '120px' }}
                  >
                    Mark Completed
                  </button>
                )}
                <button 
                  className="btn btn-secondary"
                  onClick={() => openNotesModal(sub)}
                >
                  {sub.notes ? '📝 Edit Notes' : 'Add Notes'}
                </button>
              </div>
            </div>
          );
        })}

        {filteredSubmissions.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No submissions found{searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submission Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--forest-green)', marginBottom: '10px' }}>Contact Information</h3>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Name:</strong> {selectedSubmission.first_name} {selectedSubmission.last_name}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Email:</strong> {selectedSubmission.email}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Phone:</strong> {selectedSubmission.phone}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--forest-green)', marginBottom: '10px' }}>Auction Details</h3>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Property:</strong> {selectedSubmission.property_title}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>eBay Username:</strong> {selectedSubmission.ebay_username || '—'}
                </div>
                {selectedSubmission.auction_url && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Auction URL:</strong>{' '}
                    <a href={selectedSubmission.auction_url} target="_blank" rel="noopener noreferrer">
                      View on eBay
                    </a>
                  </div>
                )}
                <div style={{ marginBottom: '8px' }}>
                  <strong>Winning Bid:</strong>{' '}
                  <span style={{ fontWeight: 'bold', color: 'var(--forest-green)' }}>
                    {formatCurrency(selectedSubmission.winning_bid)}
                  </span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Preferred Due Day:</strong> {selectedSubmission.preferred_due_day === 1 ? '1st of month' : '15th of month'}
                </div>
              </div>

              {(selectedSubmission.mailing_address || selectedSubmission.mailing_city) && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--forest-green)', marginBottom: '10px' }}>Mailing Address</h3>
                  <div>
                    {selectedSubmission.mailing_address && <div>{selectedSubmission.mailing_address}</div>}
                    {selectedSubmission.mailing_city && (
                      <div>
                        {selectedSubmission.mailing_city}, {selectedSubmission.mailing_state} {selectedSubmission.mailing_zip}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedSubmission.notes && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--forest-green)', marginBottom: '10px' }}>Customer Notes</h3>
                  <p>{selectedSubmission.notes}</p>
                </div>
              )}

              <div>
                <h3 style={{ color: 'var(--forest-green)', marginBottom: '10px' }}>Submission Info</h3>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Status:</strong>{' '}
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.85em',
                    fontWeight: 'bold',
                    backgroundColor: getStatusBadge(selectedSubmission.status).color + '20',
                    color: getStatusBadge(selectedSubmission.status).color,
                    border: `2px solid ${getStatusBadge(selectedSubmission.status).color}`
                  }}>
                    {getStatusBadge(selectedSubmission.status).text}
                  </span>
                </div>
                <div>
                  <strong>Submitted:</strong> {formatDate(selectedSubmission.submission_date)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedSubmission && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Admin Notes</h2>
              <button className="modal-close" onClick={() => setShowNotesModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Notes for {selectedSubmission.first_name} {selectedSubmission.last_name}
              </p>
              <textarea
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this submission..."
                rows="8"
                style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowNotesModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={updateNotes}>
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EbaySubmissions;