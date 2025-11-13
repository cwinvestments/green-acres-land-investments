import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers, getAllProperties, createCustomLoan } from '../api';

function CreateCustomLoan() {
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    userId: '',
    propertyId: '',
    purchasePrice: '',
    downPayment: '0',
    processingFee: '0',
    interestRate: '18',
    termMonths: '60',
    monthlyPayment: '50',
    paymentDueDay: '1',
    notes: ''
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [customersRes, propertiesRes] = await Promise.all([
        getAllCustomers(),
        getAllProperties()
      ]);
      
      setCustomers(customersRes.data);
      setProperties(propertiesRes.data.filter(p => p.status === 'available'));
    } catch (err) {
      console.error('Load data error:', err);
      alert('Failed to load customers and properties');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePropertyChange = (propertyId) => {
    const property = properties.find(p => p.id === parseInt(propertyId));
    if (property) {
      setFormData({
        ...formData,
        propertyId,
        purchasePrice: property.price
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.propertyId) {
      alert('Please select a customer and property');
      return;
    }
    
    if (window.confirm('Create this custom loan? The property will be marked as pending.')) {
      setSubmitting(true);
      try {
        await createCustomLoan({
          ...formData,
          skipPayment: true // Don't require Square payment for custom loans
        });
        
        alert('Custom loan created successfully!');
        navigate('/admin/loans');
      } catch (err) {
        console.error('Create loan error:', err);
        alert(err.response?.data?.error || 'Failed to create loan');
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Create Custom Loan</h1>
        <button onClick={() => navigate('/admin/loans')} className="btn btn-secondary">
          ← Back to Loans
        </button>
      </div>
      
      <div className="info-box" style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <strong>💡 Custom Loans:</strong> Create loans with special terms for loyal customers. 
        Set custom down payments (including $0), interest rates, and monthly payments. 
        No Square payment required.
      </div>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-section">
          <h3>Customer & Property</h3>
          
          <div className="form-group">
            <label>Customer *</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              required
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name} ({customer.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Property *</label>
            <select
              value={formData.propertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
              required
            >
              <option value="">Select Property</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.title} - ${property.price}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Loan Terms</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Purchase Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Down Payment</label>
              <input
                type="number"
                step="0.01"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                placeholder="0.00"
              />
              <small>Set to $0 for no down payment</small>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Processing Fee</label>
              <input
                type="number"
                step="0.01"
                value={formData.processingFee}
                onChange={(e) => setFormData({ ...formData, processingFee: e.target.value })}
                placeholder="0.00"
              />
              <small>Set to $0 to waive fee</small>
            </div>
            
            <div className="form-group">
              <label>Interest Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Term (Months) *</label>
              <input
                type="number"
                value={formData.termMonths}
                onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Monthly Payment *</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthlyPayment}
                onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                required
              />
              <small>Minimum $50</small>
            </div>
          </div>
          
          <div className="form-group">
            <label>Payment Due Day</label>
            <select
              value={formData.paymentDueDay}
              onChange={(e) => setFormData({ ...formData, paymentDueDay: e.target.value })}
            >
              <option value="1">1st of month</option>
              <option value="15">15th of month</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Notes (Internal)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              placeholder="Reason for custom terms, special agreements, etc."
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/loans')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Custom Loan'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCustomLoan;