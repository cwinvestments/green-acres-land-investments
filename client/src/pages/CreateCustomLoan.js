import React, { useState, useEffect, useMemo } from 'react';
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
    monthlyPayment: '50',
    paymentDueDay: '1',
    notes: ''
  });
  
  // Real-time loan calculation
  const calculatedLoan = useMemo(() => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;
    const processingFee = parseFloat(formData.processingFee) || 0;
    const interestRate = parseFloat(formData.interestRate) || 0;
    const monthlyPayment = parseFloat(formData.monthlyPayment) || 0;
    
    const loanAmount = purchasePrice - downPayment + processingFee;
    
    if (loanAmount <= 0 || monthlyPayment <= 0) {
      return { loanAmount: 0, calculatedTerm: 0, totalAmount: 0, error: null };
    }
    
    const monthlyRate = interestRate / 100 / 12;
    
    let calculatedTerm;
    let error = null;
    
    if (monthlyRate === 0) {
      // No interest: simple division
      calculatedTerm = Math.ceil(loanAmount / monthlyPayment);
    } else {
      // With interest: amortization formula
      const numerator = 1 - (loanAmount * monthlyRate) / monthlyPayment;
      
      if (numerator <= 0) {
        const minPayment = Math.ceil((loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -360)));
        error = `Monthly payment too low. Minimum: $${minPayment}`;
        calculatedTerm = 0;
      } else {
        calculatedTerm = Math.ceil(-Math.log(numerator) / Math.log(1 + monthlyRate));
      }
    }
    
    const totalAmount = monthlyPayment * calculatedTerm;
    
    return {
      loanAmount: loanAmount.toFixed(2),
      calculatedTerm,
      totalAmount: totalAmount.toFixed(2),
      error
    };
  }, [formData.purchasePrice, formData.downPayment, formData.processingFee, formData.interestRate, formData.monthlyPayment]);
  
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
    
    if (calculatedLoan.error) {
      alert(calculatedLoan.error);
      return;
    }
    
    if (window.confirm(`Create custom loan?\n\nLoan Amount: $${calculatedLoan.loanAmount}\nTerm: ${calculatedLoan.calculatedTerm} months\nTotal: $${calculatedLoan.totalAmount}\n\nThe property will be marked as pending.`)) {
      setSubmitting(true);
      try {
        await createCustomLoan({
          ...formData,
          skipPayment: true
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Create Custom Loan</h1>
        <button onClick={() => navigate('/admin/loans')} className="btn btn-secondary">
          ← Back to Loans
        </button>
      </div>
      
      <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #4caf50' }}>
        <strong>💡 Custom Loans:</strong> Create loans with special terms for loyal customers. 
        Set custom down payments (including $0), interest rates, and monthly payments. 
        No Square payment required.
      </div>
      
      <style>{`
        .loan-creation-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 1024px) {
          .loan-creation-layout {
            grid-template-columns: 1fr 400px;
          }
        }
      `}</style>
      <div className="loan-creation-layout">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#2c5f2d', borderBottom: '2px solid #4caf50', paddingBottom: '10px' }}>Customer & Property</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Customer *</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Property *</label>
              <select
                value={formData.propertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Select Property</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.title} - ${parseFloat(property.price).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#2c5f2d', borderBottom: '2px solid #4caf50', paddingBottom: '10px' }}>Loan Terms</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Purchase Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Down Payment</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Set to $0 for no down payment</small>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Processing Fee</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.processingFee}
                  onChange={(e) => setFormData({ ...formData, processingFee: e.target.value })}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Set to $0 to waive fee</small>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Interest Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Monthly Payment *</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthlyPayment}
                onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Minimum $50</small>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Payment Due Day</label>
              <select
                value={formData.paymentDueDay}
                onChange={(e) => setFormData({ ...formData, paymentDueDay: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="1">1st of month</option>
                <option value="15">15th of month</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Notes (Internal)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                placeholder="Reason for custom terms, special agreements, etc."
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
            <button type="button" onClick={() => navigate('/admin/loans')} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || calculatedLoan.error} style={{ flex: 1 }}>
              {submitting ? 'Creating...' : 'Create Custom Loan'}
            </button>
          </div>
        </form>
        
        {/* Right Column: Live Preview */}
        <div style={{ position: 'sticky', top: '20px', alignSelf: 'start' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #4caf50' }}>
            <h3 style={{ marginBottom: '20px', color: '#2c5f2d', fontSize: '20px', textAlign: 'center' }}>📊 Loan Preview</h3>
            
            {calculatedLoan.error ? (
              <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '15px', marginBottom: '15px', color: '#856404' }}>
                <strong>⚠️ Error:</strong><br/>
                {calculatedLoan.error}
              </div>
            ) : (
              <>
                <div style={{ background: '#f0f8f0', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#666' }}>Loan Amount:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#2c5f2d' }}>
                      ${parseFloat(calculatedLoan.loanAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    (${parseFloat(formData.purchasePrice || 0).toLocaleString()} - ${parseFloat(formData.downPayment || 0).toLocaleString()} + ${parseFloat(formData.processingFee || 0).toLocaleString()})
                  </div>
                </div>
                
                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#666' }}>Calculated Term:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1976d2' }}>
                      {calculatedLoan.calculatedTerm} months
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Auto-calculated based on loan amount, interest, and monthly payment
                  </div>
                </div>
                
                <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#666' }}>Total Amount:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#f57c00' }}>
                      ${parseFloat(calculatedLoan.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    (${parseFloat(formData.monthlyPayment || 0).toFixed(2)} × {calculatedLoan.calculatedTerm} months)
                  </div>
                </div>
                
                <div style={{ background: '#fce4ec', padding: '15px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#666' }}>Total Interest:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#c2185b' }}>
                      ${(parseFloat(calculatedLoan.totalAmount || 0) - parseFloat(calculatedLoan.loanAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Customer will pay this much in interest over {calculatedLoan.calculatedTerm} months
                  </div>
                </div>
              </>
            )}
            
            <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '6px', fontSize: '13px', color: '#666' }}>
              <strong style={{ color: '#333' }}>ℹ️ How it works:</strong><br/>
              The term is automatically calculated using the amortization formula based on your monthly payment amount and interest rate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCustomLoan;