// Production build - error handling improved
// Force rebuild for production API
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PropertyManagement() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Postal/Mailing',
    description: '',
    amount: ''
  });
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedPropertyForImages, setSelectedPropertyForImages] = useState(null);
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [loadingImages, setLoadingImages] = useState(false);

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
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const loadExpenses = async (propertyId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/properties/${propertyId}/expenses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses(response.data);
    } catch (err) {
      console.error('Failed to load expenses:', err);
      alert('Failed to load expenses');
    }
  };

  const openExpensesModal = (property) => {
    setSelectedProperty(property);
    setShowExpensesModal(true);
    loadExpenses(property.id);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/properties/${selectedProperty.id}/expenses`,
        expenseFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Expense added successfully!');
      setShowAddExpenseForm(false);
      setExpenseFormData({
        expense_date: new Date().toISOString().split('T')[0],
        category: 'Postal/Mailing',
        description: '',
        amount: ''
      });
      loadExpenses(selectedProperty.id);
      loadProperties();
    } catch (err) {
      console.error('Failed to add expense:', err);
      alert('Failed to add expense');
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/expenses/${expenseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Expense deleted successfully!');
      loadExpenses(selectedProperty.id);
      loadProperties();
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert('Failed to delete expense');
    }
  };

  const loadImages = async (propertyId) => {
    setLoadingImages(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/properties/${propertyId}/images`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setImages(response.data);
    } catch (err) {
      console.error('Failed to load images:', err);
      alert('Failed to load images');
    } finally {
      setLoadingImages(false);
    }
  };

  const openImagesModal = (property) => {
    setSelectedPropertyForImages(property);
    setShowImagesModal(true);
    loadImages(property.id);
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    
    if (!imageUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/properties/${selectedPropertyForImages.id}/images`,
        { 
          image_url: imageUrl,
          caption: imageCaption 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Image added successfully!');
      setImageUrl('');
      setImageCaption('');
      loadImages(selectedPropertyForImages.id);
    } catch (err) {
      console.error('Failed to add image:', err);
      alert(err.response?.data?.error || 'Failed to add image');
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/images/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Image deleted successfully!');
      loadImages(selectedPropertyForImages.id);
    } catch (err) {
      console.error('Failed to delete image:', err);
      alert('Failed to delete image');
    }
  };

  const updateStatus = async (propertyId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/properties/${propertyId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadProperties();
    } catch (err) {
      console.error('Update status error:', err);
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
            className="btn btn-secondary"
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
                    onClick={() => openExpensesModal(property)}
                    className="btn"
                    style={{
                      padding: '5px 15px',
                      fontSize: '14px',
                      width: '100%',
                      marginBottom: '5px',
                      backgroundColor: '#f59e0b',
                      color: 'white'
                    }}
                  >
                    💰 Expenses
                  </button>
                  <button
                    onClick={() => openImagesModal(property)}
                    className="btn"
                    style={{
                      padding: '5px 15px',
                      fontSize: '14px',
                      width: '100%',
                      marginBottom: '5px',
                      backgroundColor: '#6366f1',
                      color: 'white'
                    }}
                  >
                    📷 Images
                  </button>
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

      {/* Expenses Modal */}
      {showExpensesModal && selectedProperty && (
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
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>💰 Selling Expenses - {selectedProperty.title}</h2>
              <button 
                onClick={() => {
                  setShowExpensesModal(false);
                  setShowAddExpenseForm(false);
                }}
                className="btn"
                style={{ padding: '8px 20px' }}
              >
                Close
              </button>
            </div>

            {/* Summary */}
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f0f8f0', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '15px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Sale Price</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                  ${selectedProperty.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Expenses</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
                  ${expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Net After Expenses</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--sandy-gold)' }}>
                  ${(selectedProperty.price - (selectedProperty.acquisition_cost || 0) - expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
              </div>
            </div>

            {/* Add Expense Button/Form */}
            {!showAddExpenseForm ? (
              <button
                onClick={() => setShowAddExpenseForm(true)}
                className="btn btn-primary"
                style={{ marginBottom: '20px', width: '100%' }}
              >
                + Add Expense
              </button>
            ) : (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '2px solid var(--forest-green)'
              }}>
                <h3 style={{ marginTop: 0 }}>Add New Expense</h3>
                <form onSubmit={handleAddExpense}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        value={expenseFormData.expense_date}
                        onChange={(e) => setExpenseFormData({...expenseFormData, expense_date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={expenseFormData.category}
                        onChange={(e) => setExpenseFormData({...expenseFormData, category: e.target.value})}
                        required
                      >
                        <option value="Postal/Mailing">Postal/Mailing</option>
                        <option value="Deed Transfer">Deed Transfer</option>
                        <option value="Legal Fees">Legal Fees</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Property Cleanup">Property Cleanup</option>
                        <option value="Travel">Travel</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={expenseFormData.description}
                      onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                      placeholder="Brief description of expense"
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseFormData.amount}
                      onChange={(e) => setExpenseFormData({...expenseFormData, amount: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      Save Expense
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowAddExpenseForm(false)}
                      className="btn"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Expenses List */}
            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No expenses recorded yet
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px' }}>{expense.category}</td>
                      <td style={{ padding: '10px' }}>{expense.description || '—'}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                        ${parseFloat(expense.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="btn"
                          style={{
                            padding: '5px 10px',
                            fontSize: '12px',
                            backgroundColor: '#dc3545',
                            color: 'white'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Images Modal */}
      {showImagesModal && selectedPropertyForImages && (
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
            maxWidth: '900px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>📷 Property Images - {selectedPropertyForImages.title}</h2>
              <button 
                onClick={() => setShowImagesModal(false)}
                className="btn"
                style={{ padding: '8px 20px' }}
              >
                Close
              </button>
            </div>

            {/* Image Count */}
            <div style={{ 
              padding: '10px 15px', 
              backgroundColor: '#f0f8f0', 
              borderRadius: '8px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <strong>{images.length} / 10</strong> images uploaded
            </div>

            {/* Add Image Form */}
            {images.length < 10 && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '2px solid var(--forest-green)'
              }}>
                <h3 style={{ marginTop: 0 }}>Add New Image</h3>
                <form onSubmit={handleAddImage}>
                  <div className="form-group">
                    <label>Image URL *</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      Upload your image to a hosting service (Imgur, Cloudinary, etc.) and paste the URL here
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Caption (Optional)</label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Description of this image"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Add Image
                  </button>
                </form>
              </div>
            )}

            {/* Images Grid */}
            {loadingImages ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Loading images...
              </div>
            ) : images.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No images uploaded yet
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '15px' 
              }}>
                {images.map(image => (
                  <div key={image.id} style={{ 
                    border: '2px solid #ddd', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    backgroundColor: 'white'
                  }}>
                    <img 
                      src={image.image_url} 
                      alt={image.caption || 'Property'} 
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover' 
                      }}
                    />
                    <div style={{ padding: '10px' }}>
                      {image.caption && (
                        <p style={{ 
                          margin: '0 0 10px 0', 
                          fontSize: '13px', 
                          color: '#666' 
                        }}>
                          {image.caption}
                        </p>
                      )}
                      <button
                        onClick={() => deleteImage(image.id)}
                        className="btn"
                        style={{
                          padding: '5px 10px',
                          fontSize: '12px',
                          width: '100%',
                          backgroundColor: '#dc3545',
                          color: 'white'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Property Form Component (Add/Edit)
function PropertyForm({ property, onSuccess, onCancel }) {
  const isEditing = !!property;
  
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
    coord_center: existingCoords.center || '',
    annual_tax_amount: property?.annual_tax_amount || '',
    tax_payment_1_date: property?.tax_payment_1_date ? property.tax_payment_1_date.split('T')[0] : '',
    tax_payment_1_amount: property?.tax_payment_1_amount || '',
    tax_payment_2_date: property?.tax_payment_2_date ? property.tax_payment_2_date.split('T')[0] : '',
    tax_payment_2_amount: property?.tax_payment_2_amount || '',
    tax_notes: property?.tax_notes || '',
    monthly_hoa_fee: property?.monthly_hoa_fee || '',
    hoa_name: property?.hoa_name || '',
    hoa_contact: property?.hoa_contact || '',
    hoa_notes: property?.hoa_notes || ''
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
      
      const coordinates = JSON.stringify({
        ne_corner: formData.coord_ne || null,
        se_corner: formData.coord_se || null,
        sw_corner: formData.coord_sw || null,
        nw_corner: formData.coord_nw || null,
        center: formData.coord_center || null
      });

      const { coord_ne, coord_se, coord_sw, coord_nw, coord_center, ...submitData } = formData;
      submitData.coordinates = coordinates;

      if (isEditing) {
        submitData.status = property.status;
        await axios.put(
          `${process.env.REACT_APP_API_URL}/admin/properties/${property.id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Property updated successfully!');
      } else {
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
        </div>

        {/* GPS Coordinates */}
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
          <label style={{ marginBottom: '10px', display: 'block', fontWeight: 'bold', fontSize: '16px' }}>
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

        <div className="form-group" style={{ marginTop: '30px' }}>
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        {/* Property Tax Section */}
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
          <h3 style={{ color: 'var(--forest-green)', marginBottom: '15px' }}>Property Tax Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
            <div></div>

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

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Tax Notes</label>
            <textarea
              rows="2"
              placeholder="Additional tax information, payment instructions, etc."
              value={formData.tax_notes || ''}
              onChange={(e) => setFormData({...formData, tax_notes: e.target.value})}
            />
          </div>
        </div>

        {/* HOA Section */}
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
          <h3 style={{ color: 'var(--forest-green)', marginBottom: '15px' }}>HOA Information (If Applicable)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Monthly HOA Fee</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.monthly_hoa_fee || ''}
                onChange={(e) => setFormData({...formData, monthly_hoa_fee: e.target.value})}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Leave blank if no HOA</small>
            </div>
            <div className="form-group">
              <label>HOA Name</label>
              <input
                type="text"
                placeholder="Name of HOA"
                value={formData.hoa_name || ''}
                onChange={(e) => setFormData({...formData, hoa_name: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>HOA Contact</label>
            <input
              type="text"
              placeholder="Contact email or phone"
              value={formData.hoa_contact || ''}
              onChange={(e) => setFormData({...formData, hoa_contact: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>HOA Notes</label>
            <textarea
              rows="2"
              placeholder="Payment schedule, included services, etc."
              value={formData.hoa_notes || ''}
              onChange={(e) => setFormData({...formData, hoa_notes: e.target.value})}
            />
          </div>
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