// Production build - error handling improved
// Force rebuild for production API
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function PropertyManagement() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
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
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imageCaption, setImageCaption] = useState('');
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [showTaxPaymentModal, setShowTaxPaymentModal] = useState(false);
  const [selectedPropertyForTax, setSelectedPropertyForTax] = useState(null);
  const [taxPayments, setTaxPayments] = useState([]);
  const [showAddTaxPaymentForm, setShowAddTaxPaymentForm] = useState(false);
  const [taxPaymentFormData, setTaxPaymentFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    tax_year: new Date().getFullYear(),
    payment_method: 'Check',
    check_number: '',
    notes: ''
  });

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

  const handleImageUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedImageFile) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', selectedImageFile);
      formData.append('caption', imageCaption);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/properties/${selectedPropertyForImages.id}/images/upload`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      alert('Image uploaded successfully!');
      setSelectedImageFile(null);
      setImageCaption('');
      loadImages(selectedPropertyForImages.id);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateImageCaption = async (imageId, caption) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/properties/${selectedPropertyForImages.id}/images/${imageId}`,
        { caption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Caption updated!');
      loadImages(selectedPropertyForImages.id);
    } catch (err) {
      console.error('Failed to update caption:', err);
      alert('Failed to update caption');
    }
  };

  const setFeaturedImage = async (imageId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/properties/${selectedPropertyForImages.id}/images/${imageId}`,
        { is_featured: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Featured image set!');
      loadImages(selectedPropertyForImages.id);
    } catch (err) {
      console.error('Failed to set featured image:', err);
      alert('Failed to set featured image');
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete this image? This will permanently remove it from Cloudinary.')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/properties/${selectedPropertyForImages.id}/images/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Image deleted successfully!');
      loadImages(selectedPropertyForImages.id);
    } catch (err) {
      console.error('Failed to delete image:', err);
      alert('Failed to delete image');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedImageIndex === null || draggedImageIndex === dropIndex) {
      setDraggedImageIndex(null);
      return;
    }

    const reorderedImages = [...images];
    const [draggedImage] = reorderedImages.splice(draggedImageIndex, 1);
    reorderedImages.splice(dropIndex, 0, draggedImage);

    const imageOrders = reorderedImages.map((img, idx) => ({
      id: img.id,
      display_order: idx
    }));

    setImages(reorderedImages);
    setDraggedImageIndex(null);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/properties/${selectedPropertyForImages.id}/images/reorder`,
        { imageOrders },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Image order saved successfully!');
    } catch (err) {
      console.error('Failed to reorder images:', err);
      alert('Failed to save new image order');
      loadImages(selectedPropertyForImages.id);
    }
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
  };

const loadTaxPayments = async (propertyId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/properties/${propertyId}/tax-payments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTaxPayments(response.data);
    } catch (err) {
      console.error('Failed to load tax payments:', err);
      alert('Failed to load tax payments');
    }
  };

  const openTaxPaymentModal = useCallback((property) => {
    setSelectedPropertyForTax(property);
    setShowTaxPaymentModal(true);
    loadTaxPayments(property.id);
  }, []);

  // Auto-open tax payment modal if propertyId in URL
  useEffect(() => {
    if (propertyId && properties.length > 0 && !loading) {
      const property = properties.find(p => p.id === parseInt(propertyId));
      if (property) {
        openTaxPaymentModal(property);
        // Clear the URL to avoid re-opening on refresh
        navigate('/admin/properties', { replace: true });
      }
    }
  }, [propertyId, properties, loading, navigate, openTaxPaymentModal]);

  const handleAddTaxPayment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/properties/${selectedPropertyForTax.id}/pay-taxes`,
        taxPaymentFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Tax payment recorded successfully!');
      setShowAddTaxPaymentForm(false);
      setTaxPaymentFormData({
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        tax_year: new Date().getFullYear(),
        payment_method: 'Check',
        check_number: '',
        notes: ''
      });
      loadTaxPayments(selectedPropertyForTax.id);
      loadProperties();
    } catch (err) {
      console.error('Failed to record tax payment:', err);
      alert('Failed to record tax payment');
    }
  };

  const deleteTaxPayment = async (paymentId) => {
    if (!window.confirm('Delete this tax payment?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/tax-payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Tax payment deleted successfully!');
      loadTaxPayments(selectedPropertyForTax.id);
      loadProperties();
    } catch (err) {
      console.error('Failed to delete tax payment:', err);
      alert('Failed to delete tax payment');
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
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>🏘️ Property Management</h1>
          <p style={{ margin: 0, color: '#666' }}>
            {properties.length} total properties
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
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

      {/* Desktop Properties Table */}
      <div className="desktop-only">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
                    onClick={() => openTaxPaymentModal(property)}
                    className="btn"
                    style={{
                      padding: '5px 15px',
                      fontSize: '14px',
                      width: '100%',
                      marginBottom: '5px',
                      backgroundColor: '#28a745',
                      color: 'white'
                    }}
                  >
                    💵 Pay Taxes
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
        </div>
      </div>

      {/* Mobile Properties Cards */}
      <div className="mobile-only">
        {properties.map(property => (
          <div key={property.id} style={{
            background: 'white',
            border: '2px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '10px', borderBottom: '2px solid var(--forest-green)', paddingBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--forest-green)' }}>
                {property.title}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>ID: {property.id}</div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Location</div>
              <div style={{ fontWeight: '600' }}>{property.county}, {property.state}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Price</div>
                <div style={{ fontWeight: '600', color: 'var(--forest-green)' }}>
                  ${parseFloat(property.price).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Acres</div>
                <div style={{ fontWeight: '600' }}>
                  {parseFloat(property.acres).toFixed(1)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Status</div>
              {getStatusBadge(property.status)}
            </div>

            {property.acquisition_cost && (
              <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'var(--light-green)', borderRadius: '5px' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Profit</div>
                <div style={{ 
                  color: (property.price - property.acquisition_cost) >= 0 ? '#10b981' : '#ef4444',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  ${(property.price - property.acquisition_cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {(((property.price - property.acquisition_cost) / property.acquisition_cost) * 100).toFixed(1)}% ROI
                </div>
              </div>
            )}

            <div style={{ marginTop: '15px' }}>
              <select
                value={property.status}
                onChange={(e) => updateStatus(property.id, e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  width: '100%',
                  marginBottom: '8px'
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
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%',
                  marginBottom: '8px',
                  backgroundColor: '#f59e0b',
                  color: 'white'
                }}
              >
                💰 Expenses
              </button>

              <button
                onClick={() => openTaxPaymentModal(property)}
                className="btn"
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%',
                  marginBottom: '8px',
                  backgroundColor: '#28a745',
                  color: 'white'
                }}
              >
                💵 Pay Taxes
              </button>

              <button
                onClick={() => openImagesModal(property)}
                className="btn"
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%',
                  marginBottom: '8px',
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
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%',
                  marginBottom: '8px'
                }}
              >
                ✏️ Edit
              </button>

              <button
                onClick={() => deleteProperty(property.id, property.title)}
                className="btn"
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%',
                  backgroundColor: '#dc3545',
                  color: 'white'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
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

      {/* Images Modal - CLOUDINARY VERSION */}
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

            {/* Add Image Form - FILE UPLOAD */}
            {images.length < 10 && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '2px solid var(--forest-green)'
              }}>
                <h3 style={{ marginTop: 0 }}>📤 Upload New Image</h3>
                <form onSubmit={handleImageUpload}>
                  <div className="form-group">
                    <label>Select Image File *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImageFile(e.target.files[0])}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    />
                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                      Supported: JPG, PNG, GIF, WebP (max 10MB per image)
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Caption (Optional)</label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Front view, Aerial shot, etc."
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? '⏳ Uploading...' : '📤 Upload Image'}
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
                No images uploaded yet. Upload your first image above!
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '15px' 
              }}>
                {images.map((image, index) => (
                  <div 
                    key={image.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    style={{ 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      position: 'relative',
                      cursor: draggedImageIndex === index ? 'grabbing' : 'grab',
                      opacity: draggedImageIndex === index ? 0.5 : 1,
                      transition: 'opacity 0.2s'
                    }}>
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      zIndex: 1
                    }}>
                      ☰ {index + 1}
                    </div>
                    {image.is_featured && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 1
                      }}>
                        ⭐ Featured
                      </div>
                    )}
                    <img 
                      src={image.url} 
                      alt={image.caption || 'Property'} 
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover',
                        pointerEvents: 'none'
                      }}
                    />
                    <div style={{ padding: '10px' }}>
                      {image.caption ? (
                        <p style={{ 
                          margin: '0 0 10px 0', 
                          fontSize: '13px', 
                          color: '#666' 
                        }}>
                          {image.caption}
                        </p>
                      ) : (
                        <button
                          onClick={() => {
                            const caption = prompt('Enter caption for this image:');
                            if (caption !== null) updateImageCaption(image.id, caption);
                          }}
                          className="btn"
                          style={{
                            padding: '5px 10px',
                            fontSize: '12px',
                            width: '100%',
                            marginBottom: '5px',
                            backgroundColor: '#6366f1',
                            color: 'white'
                          }}
                        >
                          ✏️ Add Caption
                        </button>
                      )}
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {!image.is_featured && (
                          <button
                            onClick={() => setFeaturedImage(image.id)}
                            className="btn"
                            style={{
                              padding: '5px 10px',
                              fontSize: '12px',
                              flex: 1,
                              backgroundColor: '#f59e0b',
                              color: 'white'
                            }}
                          >
                            ⭐ Feature
                          </button>
                        )}
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="btn"
                          style={{
                            padding: '5px 10px',
                            fontSize: '12px',
                            flex: 1,
                            backgroundColor: '#dc3545',
                            color: 'white'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tax Payment Modal */}
      {showTaxPaymentModal && selectedPropertyForTax && (
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
              <h2 style={{ margin: 0 }}>💵 Tax Payments - {selectedPropertyForTax.title}</h2>
              <button 
                onClick={() => {
                  setShowTaxPaymentModal(false);
                  setShowAddTaxPaymentForm(false);
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
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Annual Tax Amount</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                ${selectedPropertyForTax.annual_tax_amount ? selectedPropertyForTax.annual_tax_amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
              </div>
            </div>

            {/* Add Payment Button/Form */}
            {!showAddTaxPaymentForm ? (
              <button
                onClick={() => setShowAddTaxPaymentForm(true)}
                className="btn btn-primary"
                style={{ marginBottom: '20px', width: '100%' }}
              >
                + Record Tax Payment
              </button>
            ) : (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '2px solid var(--forest-green)'
              }}>
                <h3 style={{ marginTop: 0 }}>Record Tax Payment to County</h3>
                <form onSubmit={handleAddTaxPayment}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Payment Date *</label>
                      <input
                        type="date"
                        value={taxPaymentFormData.payment_date}
                        onChange={(e) => setTaxPaymentFormData({...taxPaymentFormData, payment_date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Amount Paid *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={taxPaymentFormData.amount}
                        onChange={(e) => setTaxPaymentFormData({...taxPaymentFormData, amount: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Tax Year *</label>
                      <input
                        type="number"
                        value={taxPaymentFormData.tax_year}
                        onChange={(e) => setTaxPaymentFormData({...taxPaymentFormData, tax_year: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <select
                        value={taxPaymentFormData.payment_method}
                        onChange={(e) => setTaxPaymentFormData({...taxPaymentFormData, payment_method: e.target.value})}
                      >
                        <option value="Check">Check</option>
                        <option value="Wire Transfer">Wire Transfer</option>
                        <option value="ACH">ACH</option>
                        <option value="Cash">Cash</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Check Number</label>
                      <input
                        type="text"
                        value={taxPaymentFormData.check_number}
                        onChange={(e) => setTaxPaymentFormData({...taxPaymentFormData, check_number: e.target.value})}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      rows="2"
                      value={taxPaymentFormData.notes}
                      onChange={(e) => setTaxPaymentFormData({...taxPaymentFormData, notes: e.target.value})}
                      placeholder="Additional notes about this payment"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      Save Payment
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowAddTaxPaymentForm(false)}
                      className="btn"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Payment History */}
            {taxPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No tax payments recorded yet
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Tax Year</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Method</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Check #</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {taxPayments.map(payment => (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px' }}>{payment.tax_year}</td>
                      <td style={{ padding: '10px' }}>{payment.payment_method || '—'}</td>
                      <td style={{ padding: '10px' }}>{payment.check_number || '—'}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                        ${parseFloat(payment.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => deleteTaxPayment(payment.id)}
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
    </div>
  );
}
// Property Form Component (Add/Edit)
function PropertyForm({ property, onSuccess, onCancel }) {
  const isEditing = !!property;
  const [availableStates, setAvailableStates] = useState([]);
  
  useEffect(() => {
    const loadStates = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/states`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailableStates(response.data);
      } catch (err) {
        console.error('Failed to load states:', err);
      }
    };
    loadStates();
  }, []);
  
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
    legal_description: property?.legal_description || '',
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
    hoa_notes: property?.hoa_notes || '',
    property_covenants: property?.property_covenants || ''
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
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
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="">-- Select State --</option>
              {availableStates.map(state => (
                <option key={state.id} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
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

        <div className="form-group">
          <label>Legal Description</label>
          <textarea
            name="legal_description"
            value={formData.legal_description}
            onChange={handleChange}
            rows="3"
            placeholder="Legal property description (e.g., Lot 5, Block 3, County Subdivision)"
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            This will appear on the contract instead of the title
          </small>
        </div>

        {/* GPS Coordinates */}
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
          <label style={{ marginBottom: '10px', display: 'block', fontWeight: 'bold', fontSize: '16px' }}>
            GPS Coordinates (5-Point System - Optional)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
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

        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Property Covenants/Restrictions</label>
          <textarea
            name="property_covenants"
            value={formData.property_covenants}
            onChange={handleChange}
            rows="4"
            placeholder="Enter any covenants, restrictions, or HOA rules (optional). If none, leave blank and contract will show 'None'."
          />
          <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
            This will be inserted into Section 27 of the Contract for Deed
          </small>
        </div>

        {/* Property Tax Section */}
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
          <h3 style={{ color: 'var(--forest-green)', marginBottom: '15px' }}>Property Tax Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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