// Production build - error handling improved
// Force rebuild for production API
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PropertyManagement() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState('');  // Commented: error handling moved to PropertyForm
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const loadProperties = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/properties`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProperties(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login');
      } else {
        // setError('Failed to load properties');  // Commented: error handling moved to PropertyForm
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const updateStatus = async (propertyId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Updating property', propertyId, 'to status', newStatus);
      console.log('API URL:', process.env.REACT_APP_API_URL);
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/properties/${propertyId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Reload properties
      loadProperties();
    } catch (err) {
      console.error('Update status error:', err);
      console.error('Error response:', err.response?.data);
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteProperty = async (propertyId, propertyTitle) => {
    if (!window.confirm(`Are you sure you want to DELETE "${propertyTitle}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/properties/${propertyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Property deleted successfully!');
      loadProperties();
    } catch (err) {
      console.error('Delete property error:', err);
      alert('Failed to delete property: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: { backgroundColor: '#10b981', color: 'white' },
      pending: { backgroundColor: '#f59e0b', color: 'white' },
      under_contract: { backgroundColor: '#3b82f6', color: 'white' },
      sold: { backgroundColor: '#6b7280', color: 'white' },
      coming_soon: { backgroundColor: '#8b5cf6', color: 'white' }
    };

    return (
      <span style={{
        ...styles[status],
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading properties...</div>;
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
          <h1 style={{ margin: '0 0 5px 0' }}>🏘️ Property Management</h1>
          <p style={{ margin: 0, color: '#666' }}>
            {properties.length} total properties
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
            style={{ marginRight: '10px' }}
          >
            {showAddForm ? 'Cancel' : '+ Add Property'}
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="btn"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Profit Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {/* Total Profit Card */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>💰 Total Profit</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
            ${properties
              .filter(p => p.acquisition_cost)
              .reduce((sum, p) => sum + (p.price - p.acquisition_cost), 0)
              .toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
          <small style={{ color: '#999' }}>
            {properties.filter(p => p.acquisition_cost).length} properties with cost data
          </small>
        </div>

        {/* Average ROI Card */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>📈 Average ROI</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--sandy-gold)' }}>
            {properties.filter(p => p.acquisition_cost).length > 0
              ? (properties
                  .filter(p => p.acquisition_cost)
                  .reduce((sum, p) => sum + (((p.price - p.acquisition_cost) / p.acquisition_cost) * 100), 0) / 
                  properties.filter(p => p.acquisition_cost).length
                ).toFixed(1)
              : '0.0'}%
          </p>
          <small style={{ color: '#999' }}>Across all properties</small>
        </div>

        {/* Most Profitable Property Card */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>🏆 Most Profitable</h3>
          {properties.filter(p => p.acquisition_cost).length > 0 ? (
            <>
              <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                ${Math.max(...properties
                  .filter(p => p.acquisition_cost)
                  .map(p => p.price - p.acquisition_cost)
                ).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
              <small style={{ color: '#999' }}>
                {properties
                  .filter(p => p.acquisition_cost)
                  .sort((a, b) => (b.price - b.acquisition_cost) - (a.price - a.acquisition_cost))[0]?.title}
              </small>
            </>
          ) : (
            <p style={{ margin: 0, color: '#999' }}>No data yet</p>
          )}
        </div>
      </div>

      {/* Add/Edit Property Form */}
      {showAddForm && <PropertyForm onSuccess={() => { setShowAddForm(false); loadProperties(); }} />}
      {editingProperty && (
        <PropertyForm 
          property={editingProperty}
          onSuccess={() => { setEditingProperty(null); loadProperties(); }} 
          onCancel={() => setEditingProperty(null)}
        />
      )}

      {/* Properties Table */}
      <div className="card" style={{ padding: 0, overflow: 'auto', maxWidth: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Property</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Location</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Price</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Acres</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Profit</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(property => (
              <tr key={property.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>
                  <strong>{property.title}</strong>
                  <br />
                  <small style={{ color: '#666' }}>ID: {property.id}</small>
                </td>
                <td style={{ padding: '15px' }}>
                  {property.county}, {property.state}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  ${parseFloat(property.price).toLocaleString()}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {parseFloat(property.acres).toFixed(1)}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {getStatusBadge(property.status)}
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  {property.acquisition_cost ? (
                    <div>
                      <span style={{ 
                        color: (property.price - property.acquisition_cost) >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        ${(property.price - property.acquisition_cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                      <br />
                      <small style={{ color: '#666', fontSize: '12px' }}>
                        {(((property.price - property.acquisition_cost) / property.acquisition_cost) * 100).toFixed(1)}% ROI
                      </small>
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <select
                    value={property.status}
                    onChange={(e) => updateStatus(property.id, e.target.value)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      cursor: 'pointer',
                      marginBottom: '5px',
                      display: 'block',
                      width: '100%'
                    }}
                  >
                    <option value="available">Available</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="pending">Pending</option>
                    <option value="under_contract">Under Contract</option>
                    <option value="sold">Sold</option>
                  </select>
                  <button
                    onClick={() => setEditingProperty(property)}
                    className="btn"
                    style={{
                      padding: '5px 15px',
                      fontSize: '14px',
                      width: '100%',
                      marginBottom: '5px'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteProperty(property.id, property.title)}
                    className="btn"
                    style={{
                      padding: '5px 15px',
                      fontSize: '14px',
                      width: '100%',
                      backgroundColor: '#dc3545',
                      color: 'white'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Property Form Component (Add/Edit)
function PropertyForm({ property, onSuccess, onCancel }) {
  const isEditing = !!property;
  
  // Parse coordinates if editing
  const parseCoordinates = (coordString) => {
    if (!coordString) return { ne: '', se: '', sw: '', nw: '', center: '' };
    try {
      const coords = JSON.parse(coordString);
      return {
        ne: coords.ne_corner || '',
        se: coords.se_corner || '',
        sw: coords.sw_corner || '',
        nw: coords.nw_corner || '',
        center: coords.center || ''
      };
    } catch {
      return { ne: '', se: '', sw: '', nw: '', center: '' };
    }
  };

  const existingCoords = isEditing ? parseCoordinates(property.coordinates) : {};

  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    location: property?.location || '',
    state: property?.state || '',
    county: property?.county || '',
    acres: property?.acres || '',
    price: property?.price || '',
    acquisition_cost: property?.acquisition_cost || '',
    apn: property?.apn || '',
    coord_ne: existingCoords.ne || '',
    coord_se: existingCoords.se || '',
    coord_sw: existingCoords.sw || '',
    coord_nw: existingCoords.nw || '',
    coord_center: existingCoords.center || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const token = localStorage.getItem('adminToken');
      
      // Combine coordinates into JSON object
      const coordinates = JSON.stringify({
        ne_corner: formData.coord_ne || null,
        se_corner: formData.coord_se || null,
        sw_corner: formData.coord_sw || null,
        nw_corner: formData.coord_nw || null,
        center: formData.coord_center || null
      });

      // Remove individual coord fields and add combined coordinates
      const { coord_ne, coord_se, coord_sw, coord_nw, coord_center, ...submitData } = formData;
      submitData.coordinates = coordinates;

      if (isEditing) {
        // Update existing property
        submitData.status = property.status; // Keep existing status
        await axios.put(
          `${process.env.REACT_APP_API_URL}/admin/properties/${property.id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Property updated successfully!');
      } else {
        // Create new property
        await axios.post(
          `${process.env.REACT_APP_API_URL}/admin/properties`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Property added successfully!');
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'add'} property`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{isEditing ? 'Edit Property' : 'Add New Property'}</h2>
        {isEditing && (
          <button onClick={onCancel} className="btn" style={{ padding: '8px 20px' }}>
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Property Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Near Appleton"
              required
            />
          </div>

          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g., Wisconsin"
              required
            />
          </div>

          <div className="form-group">
            <label>County *</label>
            <input
              type="text"
              name="county"
              value={formData.county}
              onChange={handleChange}
              placeholder="e.g., Outagamie"
              required
            />
          </div>

          <div className="form-group">
            <label>Acres *</label>
            <input
              type="number"
              step="0.01"
              name="acres"
              value={formData.acres}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Price *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
              <label>Acquisition Cost</label>
              <input
                type="number"
                step="0.01"
                placeholder="What you paid for this property"
                value={formData.acquisition_cost || ''}
                onChange={(e) => setFormData({...formData, acquisition_cost: e.target.value})}
              />
            </div>

            {/* Property Tax Section */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
              <h3 style={{ color: 'var(--forest-green)', marginBottom: '15px' }}>Property Tax Information</h3>
              
              <div className="form-group">
                <label>Annual Tax Amount</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Total annual property tax"
                  value={formData.annual_tax_amount || ''}
                  onChange={(e) => setFormData({...formData, annual_tax_amount: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>1st Payment Due Date</label>
                  <input
                    type="date"
                    value={formData.tax_payment_1_date || ''}
                    onChange={(e) => setFormData({...formData, tax_payment_1_date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>1st Payment Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={formData.tax_payment_1_amount || ''}
                    onChange={(e) => setFormData({...formData, tax_payment_1_amount: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>2nd Payment Due Date</label>
                  <input
                    type="date"
                    value={formData.tax_payment_2_date || ''}
                    onChange={(e) => setFormData({...formData, tax_payment_2_date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>2nd Payment Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={formData.tax_payment_2_amount || ''}
                    onChange={(e) => setFormData({...formData, tax_payment_2_amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tax Notes</label>
                <textarea
                  rows="2"
                  placeholder="Additional tax information, payment instructions, etc."
                  value={formData.tax_notes || ''}
                  onChange={(e) => setFormData({...formData, tax_notes: e.target.value})}
                />
              </div>
            </div>

          <div className="form-group">
            <label>APN (Optional)</label>
            <input
              type="text"
              name="apn"
              value={formData.apn}
              onChange={handleChange}
              placeholder="Assessor's Parcel Number"
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ marginBottom: '10px', display: 'block', fontWeight: 'bold' }}>
              GPS Coordinates (5-Point System - Optional)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '14px', color: '#666' }}>NE Corner (Northeast)</label>
                <input
                  type="text"
                  name="coord_ne"
                  value={formData.coord_ne}
                  onChange={handleChange}
                  placeholder="44.2619, -88.4154"
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', color: '#666' }}>SE Corner (Southeast)</label>
                <input
                  type="text"
                  name="coord_se"
                  value={formData.coord_se}
                  onChange={handleChange}
                  placeholder="44.2600, -88.4154"
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', color: '#666' }}>SW Corner (Southwest)</label>
                <input
                  type="text"
                  name="coord_sw"
                  value={formData.coord_sw}
                  onChange={handleChange}
                  placeholder="44.2600, -88.4170"
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', color: '#666' }}>NW Corner (Northwest)</label>
                <input
                  type="text"
                  name="coord_nw"
                  value={formData.coord_nw}
                  onChange={handleChange}
                  placeholder="44.2619, -88.4170"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '14px', color: '#666' }}>Center Point</label>
                <input
                  type="text"
                  name="coord_center"
                  value={formData.coord_center}
                  onChange={handleChange}
                  placeholder="44.2610, -88.4162"
                />
              </div>
            </div>
            <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              Format: latitude, longitude (e.g., 44.2619, -88.4154)
            </small>
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Property' : 'Add Property')}
        </button>
      </form>
    </div>
  );
}

export default PropertyManagement;
