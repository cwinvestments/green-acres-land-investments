import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, createLoan } from '../api';
import { useAuth } from '../context/AuthContext';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Calculator state
  const [downPaymentOption, setDownPaymentOption] = useState('99');
  const [termMonths, setTermMonths] = useState(36);
  const [calculation, setCalculation] = useState(null);
  
  // Purchase state
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [cardInstance, setCardInstance] = useState(null);

  useEffect(() => {
    loadProperty();
  }, [id]);

  useEffect(() => {
    if (property) {
      calculatePayment();
    }
  }, [property, downPaymentOption, termMonths]);

  const loadProperty = async () => {
    try {
      const response = await getProperty(id);
      setProperty(response.data);
    } catch (err) {
      setError('Failed to load property');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayment = () => {
    const processingFee = 99;
    const price = property.price;
    
    // Calculate down payment
    const dpOption = parseFloat(downPaymentOption);
    const downPayment = dpOption === 99 ? 99 : (price * (dpOption / 100));
    
    // Determine interest rate
    let interestRate;
    if (dpOption === 99) {
      interestRate = 18;
    } else if (dpOption === 20) {
      interestRate = 12;
    } else {
      interestRate = 8;
    }
    
    // Calculate principal
    const principal = (price - downPayment) + processingFee;
    
    // Calculate monthly payment
    const monthlyRate = interestRate / 100 / 12;
    let monthlyPayment;
    
    if (monthlyRate === 0) {
      monthlyPayment = principal / termMonths;
    } else {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) 
        / (Math.pow(1 + monthlyRate, termMonths) - 1);
    }
    
    // Enforce minimum payment
    monthlyPayment = Math.max(monthlyPayment, 50);
    
    // Calculate total
    const totalAmount = monthlyPayment * termMonths;
    
    setCalculation({
      downPayment: Math.round(downPayment * 100) / 100,
      downPaymentPercentage: dpOption,
      processingFee,
      principal: Math.round(principal * 100) / 100,
      interestRate,
      termMonths,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    });
  };

  const initializeSquarePayment = async () => {
    if (!window.Square) {
      setPurchaseError('Square payment system not loaded');
      return;
    }

    try {
      const payments = window.Square.payments(
        process.env.REACT_APP_SQUARE_APPLICATION_ID,
        process.env.REACT_APP_SQUARE_LOCATION_ID
      );

      const card = await payments.card();
      await card.attach('#card-container');
      setCardInstance(card);
    } catch (error) {
      console.error('Square initialization error:', error);
      setPurchaseError('Failed to initialize payment form');
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!cardInstance) {
      await initializeSquarePayment();
      return;
    }

    setPurchasing(true);
    setPurchaseError('');

    try {
      // Tokenize card
      const result = await cardInstance.tokenize();
      
      if (result.status === 'OK') {
        // Create loan with payment
        await createLoan({
          propertyId: property.id,
          downPaymentPercentage: parseFloat(downPaymentOption),
          termMonths: termMonths,
          paymentNonce: result.token
        });

        alert('Purchase successful! Redirecting to your dashboard...');
        navigate('/dashboard');
      } else {
        setPurchaseError(result.errors?.[0]?.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-detail">
        <div className="error-message">{error || 'Property not found'}</div>
      </div>
    );
  }

  return (
    <div className="property-detail">
      <h1>{property.title}</h1>
      
      <div className="property-detail-grid">
        <div>
          <img
            src={property.image_url}
            alt={property.title}
            className="property-detail-image"
          />
          
          <div style={{ marginTop: '2rem' }}>
            <h2>Property Details</h2>
            <p style={{ marginTop: '1rem', lineHeight: '1.8' }}>{property.description}</p>
            
            <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.5rem' }}>
              <div><strong>Location:</strong> {property.location}</div>
              <div><strong>County:</strong> {property.county}</div>
              <div><strong>State:</strong> {property.state}</div>
              <div><strong>ZIP:</strong> {property.zip}</div>
              <div><strong>Acres:</strong> {property.acres}</div>
            </div>

            {property.features && property.features.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <strong>Features:</strong>
                <div className="property-features" style={{ marginTop: '0.5rem' }}>
                  {property.features.map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{ background: '#e8f5e9', padding: '2rem', borderRadius: '10px', marginBottom: '2rem' }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>
              ${property.price.toLocaleString()}
            </h2>
            <p style={{ color: '#666' }}>{property.acres} acres</p>
          </div>

          <div className="calculator">
            <h3>📊 Financing Calculator</h3>
            
            <div className="calculator-options">
              <div>
                <label>Down Payment:</label>
                <select 
                  value={downPaymentOption}
                  onChange={(e) => setDownPaymentOption(e.target.value)}
                >
                  <option value="99">$99 Special (18% APR)</option>
                  <option value="20">20% Down (12% APR)</option>
                  <option value="25">25% Down (8% APR)</option>
                  <option value="35">35% Down (8% APR)</option>
                  <option value="50">50% Down (8% APR)</option>
                </select>
              </div>

              <div>
                <label>Loan Term:</label>
                <select 
                  value={termMonths}
                  onChange={(e) => setTermMonths(parseInt(e.target.value))}
                >
                  <option value="12">1 Year</option>
                  <option value="24">2 Years</option>
                  <option value="36">3 Years</option>
                  <option value="48">4 Years</option>
                  <option value="60">5 Years</option>
                </select>
              </div>
            </div>

            {calculation && (
              <>
                <div className="calculator-results">
                  <div className="result-row">
                    <span className="result-label">Down Payment:</span>
                    <span>${calculation.downPayment.toLocaleString()}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">Processing Fee:</span>
                    <span>${calculation.processingFee}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">Amount Financed:</span>
                    <span>${calculation.principal.toLocaleString()}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">Interest Rate:</span>
                    <span>{calculation.interestRate}%</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">Monthly Payment:</span>
                    <span style={{ fontSize: '1.5rem' }}>
                      ${calculation.monthlyPayment.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '5px' }}>
                  <small style={{ color: '#856404' }}>
                    Total to be paid: ${calculation.totalAmount.toLocaleString()} over {calculation.termMonths} months
                  </small>
                </div>

                {!cardInstance ? (
                  <button 
                    className="btn btn-primary btn-full-width"
                    onClick={initializeSquarePayment}
                    disabled={purchasing}
                  >
                    {isAuthenticated ? 'Purchase This Property' : 'Login to Purchase'}
                  </button>
                ) : (
                  <>
                    <div id="card-container" style={{ marginTop: '1rem' }}></div>
                    {purchaseError && (
                      <div className="error-message" style={{ marginTop: '1rem' }}>
                        {purchaseError}
                      </div>
                    )}
                    <button 
                      className="btn btn-primary btn-full-width"
                      onClick={handlePurchase}
                      disabled={purchasing}
                      style={{ marginTop: '1rem' }}
                    >
                      {purchasing ? 'Processing...' : `Pay ${calculation.downPayment.toLocaleString()} Down Payment`}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
