import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ImportLoan() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [properties, setProperties] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Step 1: Loan Details
  const [loanData, setLoanData] = useState({
    propertyId: '',
    userId: '',
    purchaseDate: '',
    purchasePrice: '',
    downPayment: '',
    processingFee: 99,
    loanAmount: '',
    interestRate: '',
    termMonths: 36,
    monthlyPayment: '',
    paymentDueDay: 1,
    currentBalance: '',
    nextPaymentDate: ''
  });

  // Step 2: Payment History
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({
    paymentDate: '',
    amount: '',
    principalAmount: '',
    interestAmount: '',
    taxAmount: '',
    hoaAmount: '',
    lateFeeAmount: ''
  });

  // Step 3: Tax History
  const [taxPayments, setTaxPayments] = useState([]);
  const [newTaxPayment, setNewTaxPayment] = useState({
    paymentDate: '',
    amount: '',
    taxYear: new Date().getFullYear(),
    paymentMethod: 'Check',
    notes: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkData, setBulkData] = useState({
    startDate: '',
    numberOfPayments: 12,
    paymentAmount: '',
    principalAmount: '',
    interestAmount: '',
    taxAmount: '',
    hoaAmount: ''
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fill bulk payment amount when moving to Step 2
  useEffect(() => {
    if (step === 2 && loanData.monthlyPayment && !bulkData.paymentAmount) {
      setBulkData({...bulkData, paymentAmount: loanData.monthlyPayment});
    }
  }, [step, loanData.monthlyPayment]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const [propsRes, custsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/admin/properties`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/customers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProperties(propsRes.data);
      setCustomers(custsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load properties and customers');
      setLoading(false);
    }
  };

  const calculateLoanAmount = () => {
    if (loanData.purchasePrice && loanData.downPayment) {
      const principal = parseFloat(loanData.purchasePrice) - parseFloat(loanData.downPayment) + parseFloat(loanData.processingFee);
      setLoanData({...loanData, loanAmount: principal.toFixed(2)});
    }
  };

  const addPayment = () => {
    if (!newPayment.paymentDate || !newPayment.amount) {
      alert('Please enter payment date and amount');
      return;
    }

    setPayments([...payments, {...newPayment}]);
    setNewPayment({
      paymentDate: '',
      amount: '',
      principalAmount: '',
      interestAmount: '',
      taxAmount: '',
      hoaAmount: '',
      lateFeeAmount: ''
    });
  };

  const generateBulkPayments = () => {
    if (!bulkData.startDate || !bulkData.numberOfPayments || !bulkData.paymentAmount) {
      alert('Please enter start date, number of payments, and payment amount');
      return;
    }

    // Check if we have loan amount and interest rate from Step 1
    if (!loanData.loanAmount || !loanData.interestRate) {
      alert('Please complete Step 1 first (Loan Amount and Interest Rate are required for automatic calculations)');
      return;
    }

    const newPayments = [];
    let currentDate = new Date(bulkData.startDate + 'T12:00:00');
    let remainingBalance = parseFloat(String(loanData.loanAmount).replace(/\s/g, ''));
    const paymentAmount = parseFloat(bulkData.paymentAmount);
    const monthlyInterestRate = parseFloat(String(loanData.interestRate).replace(/\s/g, '')) / 100 / 12;
    
    // Subtract any existing payments from the starting balance
    payments.forEach(payment => {
      const principal = parseFloat(payment.principalAmount) || 0;
      remainingBalance -= principal;
    });
    
    for (let i = 0; i < parseInt(bulkData.numberOfPayments); i++) {
      // Calculate interest on remaining balance
      const interestAmount = remainingBalance * monthlyInterestRate;
      
      // Calculate principal (payment minus interest)
      const principalAmount = Math.min(paymentAmount - interestAmount, remainingBalance);
      
      newPayments.push({
        paymentDate: currentDate.toISOString().split('T')[0],
        amount: bulkData.paymentAmount,
        principalAmount: principalAmount.toFixed(2),
        interestAmount: interestAmount.toFixed(2),
        taxAmount: bulkData.taxAmount || '',
        hoaAmount: bulkData.hoaAmount || '',
        lateFeeAmount: ''
      });
      
      // Update remaining balance
      remainingBalance -= principalAmount;
      
      // Add one month to the date
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    setPayments([...payments, ...newPayments]);
    alert(`✅ Generated ${bulkData.numberOfPayments} payments with automatic principal/interest calculation!`);
    
    // Reset bulk form
    setBulkData({
      startDate: '',
      numberOfPayments: 12,
      paymentAmount: '',
      principalAmount: '',
      interestAmount: '',
      taxAmount: '',
      hoaAmount: ''
    });
  };

  const removePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const startEditPayment = (index) => {
    setEditingIndex(index);
    setEditingPayment({...payments[index]});
  };

  const cancelEditPayment = () => {
    setEditingIndex(null);
    setEditingPayment(null);
  };

  const saveEditPayment = () => {
    const updatedPayments = [...payments];
    updatedPayments[editingIndex] = editingPayment;
    setPayments(updatedPayments);
    setEditingIndex(null);
    setEditingPayment(null);
  };

  const recalculatePayment = () => {
    if (!loanData.loanAmount || !loanData.interestRate) {
      alert('Loan amount and interest rate are required for calculation');
      return;
    }

    // Calculate remaining balance up to this payment
    let remainingBalance = parseFloat(String(loanData.loanAmount).replace(/\s/g, ''));
    
    // Subtract all payments before this one
    for (let i = 0; i < editingIndex; i++) {
      const principal = parseFloat(payments[i].principalAmount) || 0;
      remainingBalance -= principal;
    }

    const paymentAmount = parseFloat(editingPayment.amount);
    const monthlyInterestRate = parseFloat(String(loanData.interestRate).replace(/\s/g, '')) / 100 / 12;
    
    // Calculate interest on remaining balance
    const interestAmount = remainingBalance * monthlyInterestRate;
    
    // Calculate principal (payment minus interest)
    const principalAmount = Math.min(paymentAmount - interestAmount, remainingBalance);
    
    // Update the editing payment
    setEditingPayment({
      ...editingPayment,
      principalAmount: principalAmount.toFixed(2),
      interestAmount: interestAmount.toFixed(2)
    });
  };

  const addTaxPayment = () => {
    if (!newTaxPayment.paymentDate || !newTaxPayment.amount) {
      alert('Please enter payment date and amount');
      return;
    }

    setTaxPayments([...taxPayments, {...newTaxPayment}]);
    setNewTaxPayment({
      paymentDate: '',
      amount: '',
      taxYear: new Date().getFullYear(),
      paymentMethod: 'Check',
      notes: ''
    });
  };

  const removeTaxPayment = (index) => {
    setTaxPayments(taxPayments.filter((_, i) => i !== index));
  };

  const calculateCurrentBalance = () => {
    let balance = parseFloat(loanData.loanAmount) || 0;
    payments.forEach(payment => {
      const principal = parseFloat(payment.principalAmount) || 0;
      balance -= principal;
    });
    return balance.toFixed(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      
      const importData = {
        loanData: {
          ...loanData,
          currentBalance: calculateCurrentBalance()
        },
        payments,
        taxPayments
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/loans/import`,
        importData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Loan imported successfully!');
      navigate('/admin/loans');
    } catch (err) {
      console.error('Import failed:', err);
      setError(err.response?.data?.error || 'Failed to import loan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>📥 Import Existing Loan</h1>
        <button onClick={() => navigate('/admin/loans')} className="btn btn-secondary">
          ← Cancel
        </button>
      </div>

      {/* Progress Steps */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '30px',
        padding: '20px',
        background: 'var(--light-green)',
        borderRadius: '10px'
      }}>
        {[1, 2, 3, 4].map(num => (
          <div key={num} style={{ 
            flex: 1, 
            textAlign: 'center',
            opacity: step >= num ? 1 : 0.4
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: step >= num ? 'var(--forest-green)' : '#ccc',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {num}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {num === 1 && 'Loan Details'}
              {num === 2 && 'Payment History'}
              {num === 3 && 'Tax History'}
              {num === 4 && 'Review'}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Loan Details */}
      {step === 1 && (
        <div className="card" style={{ padding: '30px' }}>
          <h2 style={{ color: 'var(--forest-green)', marginTop: 0 }}>Step 1: Loan Details</h2>
          
          <div className="form-group">
            <label>Property *</label>
            <select
              value={loanData.propertyId}
              onChange={(e) => setLoanData({...loanData, propertyId: e.target.value})}
              required
            >
              <option value="">-- Select Property --</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Customer *</label>
            <select
              value={loanData.userId}
              onChange={(e) => setLoanData({...loanData, userId: e.target.value})}
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Original Purchase Date *</label>
              <input
                type="date"
                value={loanData.purchaseDate}
                onChange={(e) => setLoanData({...loanData, purchaseDate: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Purchase Price *</label>
              <input
                type="number"
                step="0.01"
                value={loanData.purchasePrice}
                onChange={(e) => {
                  setLoanData({...loanData, purchasePrice: e.target.value});
                }}
                onBlur={calculateLoanAmount}
                required
              />
            </div>

            <div className="form-group">
              <label>Down Payment *</label>
              <input
                type="number"
                step="0.01"
                value={loanData.downPayment}
                onChange={(e) => setLoanData({...loanData, downPayment: e.target.value})}
                onBlur={calculateLoanAmount}
                required
              />
            </div>

            <div className="form-group">
              <label>Processing Fee</label>
              <input
                type="number"
                step="0.01"
                value={loanData.processingFee}
                onChange={(e) => setLoanData({...loanData, processingFee: e.target.value})}
                onBlur={calculateLoanAmount}
              />
            </div>

            <div className="form-group">
              <label>Loan Amount (Calculated)</label>
              <input
                type="number"
                step="0.01"
                value={loanData.loanAmount}
                onChange={(e) => setLoanData({...loanData, loanAmount: e.target.value})}
                required
              />
              <small style={{ color: '#666' }}>Auto-calculated or enter manually</small>
            </div>

            <div className="form-group">
              <label>Interest Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                value={loanData.interestRate}
                onChange={(e) => setLoanData({...loanData, interestRate: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Term (Months) *</label>
              <input
                type="number"
                value={loanData.termMonths}
                onChange={(e) => setLoanData({...loanData, termMonths: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Monthly Payment *</label>
              <input
                type="number"
                step="0.01"
                value={loanData.monthlyPayment}
                onChange={(e) => setLoanData({...loanData, monthlyPayment: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Due Day *</label>
              <select
                value={loanData.paymentDueDay}
                onChange={(e) => setLoanData({...loanData, paymentDueDay: e.target.value})}
              >
                <option value="1">1st of Month</option>
                <option value="15">15th of Month</option>
              </select>
            </div>

            <div className="form-group">
              <label>Next Payment Date *</label>
              <input
                type="date"
                value={loanData.nextPaymentDate}
                onChange={(e) => setLoanData({...loanData, nextPaymentDate: e.target.value})}
                required
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
            disabled={!loanData.propertyId || !loanData.userId || !loanData.purchaseDate || !loanData.loanAmount}
          >
            Next: Payment History →
          </button>
        </div>
      )}

      {/* Step 2: Payment History */}
      {step === 2 && (
        <div className="card" style={{ padding: '30px' }}>
          <h2 style={{ color: 'var(--forest-green)', marginTop: 0 }}>Step 2: Payment History</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Add all previous payments made on this loan. If you don't have payment history, you can skip this step.
          </p>

          {/* Mode Toggle */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setBulkMode(false)} 
              className={`btn ${!bulkMode ? 'btn-primary' : 'btn-secondary'}`}
            >
              ➕ Add One Payment
            </button>
            <button 
              onClick={() => setBulkMode(true)} 
              className={`btn ${bulkMode ? 'btn-primary' : 'btn-secondary'}`}
            >
              ⚡ Bulk Generate Payments
            </button>
          </div>

          {/* Bulk Payment Generator */}
          {bulkMode ? (
            <div style={{ 
              padding: '20px', 
              background: '#e3f2fd', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '2px solid #2196f3'
            }}>
              <h4 style={{ marginTop: 0, color: '#1976d2' }}>⚡ Bulk Payment Generator</h4>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                Quickly generate multiple monthly payments. Perfect for importing a year+ of payment history!
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={bulkData.startDate}
                    onChange={(e) => setBulkData({...bulkData, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Number of Payments *</label>
                  <input
                    type="number"
                    value={bulkData.numberOfPayments}
                    onChange={(e) => setBulkData({...bulkData, numberOfPayments: e.target.value})}
                    min="1"
                    max="120"
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>Monthly payments</small>
                </div>
                <div className="form-group">
                  <label>Payment Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkData.paymentAmount}
                    onChange={(e) => setBulkData({...bulkData, paymentAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div className="form-group">
                  <label>Principal (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkData.principalAmount}
                    onChange={(e) => setBulkData({...bulkData, principalAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Interest (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkData.interestAmount}
                    onChange={(e) => setBulkData({...bulkData, interestAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Tax Escrow (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkData.taxAmount}
                    onChange={(e) => setBulkData({...bulkData, taxAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>HOA Fee (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkData.hoaAmount}
                    onChange={(e) => setBulkData({...bulkData, hoaAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <button onClick={generateBulkPayments} className="btn btn-primary" style={{ marginTop: '10px' }}>
                ⚡ Generate {bulkData.numberOfPayments} Payments
              </button>
            </div>
          ) : (
            // Single Payment Form
            <div style={{ 
              padding: '20px', 
              background: 'var(--light-green)', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <h4 style={{ marginTop: 0 }}>Add Payment</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div className="form-group">
                  <label>Payment Date *</label>
                  <input
                    type="date"
                    value={newPayment.paymentDate}
                    onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Total Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Principal Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPayment.principalAmount}
                    onChange={(e) => setNewPayment({...newPayment, principalAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Interest Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPayment.interestAmount}
                    onChange={(e) => setNewPayment({...newPayment, interestAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Tax Escrow</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPayment.taxAmount}
                    onChange={(e) => setNewPayment({...newPayment, taxAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>HOA Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPayment.hoaAmount}
                    onChange={(e) => setNewPayment({...newPayment, hoaAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button onClick={addPayment} className="btn btn-primary" style={{ marginTop: '10px' }}>
                + Add Payment
              </button>
            </div>
          )}

          {/* Payment List */}
          {payments.length > 0 && (
            <div>
              <h4>Added Payments ({payments.length})</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Principal</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Interest</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    editingIndex === index ? (
                      // Editing row
                      <tr key={index} style={{ borderBottom: '1px solid #eee', backgroundColor: '#fff3cd' }}>
                        <td style={{ padding: '10px' }}>
                          <input
                            type="date"
                            value={editingPayment.paymentDate}
                            onChange={(e) => setEditingPayment({...editingPayment, paymentDate: e.target.value})}
                            style={{ width: '100%', padding: '5px' }}
                          />
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={editingPayment.amount}
                            onChange={(e) => setEditingPayment({...editingPayment, amount: e.target.value})}
                            style={{ width: '100%', padding: '5px', textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={editingPayment.principalAmount}
                            onChange={(e) => setEditingPayment({...editingPayment, principalAmount: e.target.value})}
                            style={{ width: '100%', padding: '5px', textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={editingPayment.interestAmount}
                            onChange={(e) => setEditingPayment({...editingPayment, interestAmount: e.target.value})}
                            style={{ width: '100%', padding: '5px', textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            onClick={recalculatePayment}
                            className="btn"
                            style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#17a2b8', color: 'white', marginRight: '5px' }}
                            title="Recalculate principal and interest based on current amount"
                          >
                            🔄
                          </button>
                          <button
                            onClick={saveEditPayment}
                            className="btn"
                            style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#28a745', color: 'white', marginRight: '5px' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditPayment}
                            className="btn"
                            style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#6c757d', color: 'white' }}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      // Display row
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{new Date(payment.paymentDate + 'T12:00:00').toLocaleDateString()}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>${parseFloat(payment.amount).toFixed(2)}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          ${payment.principalAmount ? parseFloat(payment.principalAmount).toFixed(2) : '0.00'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          ${payment.interestAmount ? parseFloat(payment.interestAmount).toFixed(2) : '0.00'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            onClick={() => startEditPayment(index)}
                            className="btn"
                            style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#007bff', color: 'white', marginRight: '5px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removePayment(index)}
                            className="btn"
                            style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#dc3545', color: 'white' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              ← Back
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary">
              Next: Tax History →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Tax History */}
      {step === 3 && (
        <div className="card" style={{ padding: '30px' }}>
          <h2 style={{ color: 'var(--forest-green)', marginTop: 0 }}>Step 3: Tax Payment History (Optional)</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Add any property tax payments you've already made to the county. This is optional.
          </p>

          {/* Add Tax Payment Form */}
          <div style={{ 
            padding: '20px', 
            background: 'var(--light-green)', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h4 style={{ marginTop: 0 }}>Add Tax Payment</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  value={newTaxPayment.paymentDate}
                  onChange={(e) => setNewTaxPayment({...newTaxPayment, paymentDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTaxPayment.amount}
                  onChange={(e) => setNewTaxPayment({...newTaxPayment, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Tax Year</label>
                <input
                  type="number"
                  value={newTaxPayment.taxYear}
                  onChange={(e) => setNewTaxPayment({...newTaxPayment, taxYear: e.target.value})}
                />
              </div>
            </div>
            <button onClick={addTaxPayment} className="btn btn-primary" style={{ marginTop: '10px' }}>
              + Add Tax Payment
            </button>
          </div>

          {/* Tax Payment List */}
          {taxPayments.length > 0 && (
            <div>
              <h4>Added Tax Payments ({taxPayments.length})</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Tax Year</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {taxPayments.map((payment, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{new Date(payment.paymentDate + 'T12:00:00').toLocaleDateString()}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{payment.taxYear}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>${parseFloat(payment.amount).toFixed(2)}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => removeTaxPayment(index)}
                          className="btn"
                          style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#dc3545', color: 'white' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              ← Back
            </button>
            <button onClick={() => setStep(4)} className="btn btn-primary">
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="card" style={{ padding: '30px' }}>
          <h2 style={{ color: 'var(--forest-green)', marginTop: 0 }}>Step 4: Review & Submit</h2>
          
          {/* Summary */}
          <div style={{ padding: '20px', background: 'var(--light-green)', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Loan Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <strong>Property:</strong> {properties.find(p => p.id === parseInt(loanData.propertyId))?.title}
              </div>
              <div>
                <strong>Customer:</strong> {customers.find(c => c.id === parseInt(loanData.userId))?.email}
              </div>
              <div>
                <strong>Original Loan Amount:</strong> ${parseFloat(loanData.loanAmount).toFixed(2)}
              </div>
              <div>
                <strong>Interest Rate:</strong> {loanData.interestRate}%
              </div>
              <div>
                <strong>Monthly Payment:</strong> ${parseFloat(loanData.monthlyPayment).toFixed(2)}
              </div>
              <div>
                <strong>Term:</strong> {loanData.termMonths} months
              </div>
              <div>
                <strong>Payments Made:</strong> {payments.length}
              </div>
              <div>
                <strong>Calculated Balance:</strong> ${calculateCurrentBalance()}
              </div>
              <div>
                <strong>Tax Payments:</strong> {taxPayments.length}
              </div>
              <div>
                <strong>Next Payment:</strong> {new Date(loanData.nextPaymentDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(3)} className="btn btn-secondary" disabled={submitting}>
              ← Back
            </button>
            <button 
              onClick={handleSubmit} 
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {submitting ? 'Importing...' : '✅ Import Loan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportLoan;