import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getProperty, createLoan, formatCurrency } from '../api';
import { useAuth } from '../context/AuthContext';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Calculator state
  const [downPaymentOption, setDownPaymentOption] = useState('99');
  const [termMonths, setTermMonths] = useState(36);
  const [calculation, setCalculation] = useState(null);
  const [desiredPayment, setDesiredPayment] = useState('');
  const [billingInfo, setBillingInfo] = useState({
  name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: ''
});
  const [paymentDueDay, setPaymentDueDay] = useState('1');
  // Find closest payment option to desired payment
const findClosestOption = () => {
  if (!desiredPayment || desiredPayment < 50) return null;
  
  const desired = parseFloat(desiredPayment);
  const options = [];
  
  // Calculate $99 down payment
  const principal99 = (property.price - 99) + 99;
  const monthlyRate99 = 0.18 / 12;
  const payment99 = Math.max(
    principal99 * (monthlyRate99 * Math.pow(1 + monthlyRate99, termMonths)) / (Math.pow(1 + monthlyRate99, termMonths) - 1),
    50
  );
  options.push({ option: '99', payment: payment99 });
  
  // Calculate other options
  ['20', '25', '35', '50'].forEach(opt => {
    const dpOption = parseFloat(opt);
    const downPayment = property.price * (dpOption / 100);
    const interestRate = dpOption === 20 ? 12 : 8;
    const principal = (property.price - downPayment) + 99;
    const monthlyRate = interestRate / 100 / 12;
    const payment = Math.max(
      principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1),
      50
    );
    options.push({ option: opt, payment });
  });
  
  // Find closest
  let closest = options[0];
  let minDiff = Math.abs(options[0].payment - desired);
  
  options.forEach(opt => {
    const diff = Math.abs(opt.payment - desired);
    if (diff < minDiff) {
      minDiff = diff;
      closest = opt;
    }
  });
  
  return closest.option;
};

const closestOption = findClosestOption();
  
  // Purchase state
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [cardInstance, setCardInstance] = useState(null);

  const loadProperty = useCallback(async () => {
    try {
      const response = await getProperty(id);
      setProperty(response.data);
    } catch (err) {
      setError('Failed to load property');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadImages = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/properties/${id}/images`);
      setImages(response.data);
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
    loadImages();
  }, [id, loadProperty, loadImages]);

  const calculatePayment = useCallback(() => {
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
  }, [property, downPaymentOption, termMonths]);

  useEffect(() => {
    if (property) {
      calculatePayment();
    }
  }, [property, downPaymentOption, termMonths, calculatePayment]);

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

    // Validate billing info
    if (!billingInfo.name || !billingInfo.phone || !billingInfo.address || !billingInfo.city || !billingInfo.state || !billingInfo.zip) {
      setPurchaseError('Please fill in all billing information fields.');
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
          paymentNonce: result.token,
          phone: billingInfo.phone,
          paymentDueDay: parseInt(paymentDueDay)
        });

        alert('✅ Purchase Successful!\n\nYour property purchase has been completed and your loan has been created.\n\nRedirecting to your dashboard...');
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
          {/* Image Gallery */}
          {images.length > 0 ? (
            <div style={{ marginBottom: '1rem' }}>
              {/* Main Image */}
              <img
                src={images[selectedImageIndex].image_url}
                alt={images[selectedImageIndex].caption || property.title}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  marginBottom: '1rem'
                }}
              />
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                  gap: '10px' 
                }}>
                  {images.map((image, index) => (
                    <img
                      key={image.id}
                      src={image.image_url}
                      alt={image.caption || `View ${index + 1}`}
                      onClick={() => setSelectedImageIndex(index)}
                      style={{
                        width: '100%',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? '3px solid var(--forest-green)' : '2px solid #ddd',
                        opacity: selectedImageIndex === index ? 1 : 0.6,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Caption */}
              {images[selectedImageIndex].caption && (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  fontSize: '0.9rem', 
                  marginTop: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  {images[selectedImageIndex].caption}
                </p>
              )}
            </div>
          ) : (
            <div style={{
              width: '100%',
              height: '400px',
              background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--sandy-gold) 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              marginBottom: '1rem'
            }}>
              🏞️
            </div>
          )}
          
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ color: 'var(--forest-green)', marginTop: 0 }}>Property Details</h2>
            <p style={{ marginTop: '1rem', lineHeight: '1.8', color: '#666' }}>{property.description}</p>
            
            <div style={{ 
              marginTop: '1.5rem', 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              padding: '1rem',
              background: 'var(--light-green)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Location</span>
                <strong style={{ color: 'var(--forest-green)' }}>{property.location}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>County</span>
                <strong style={{ color: 'var(--forest-green)' }}>{property.county}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>State</span>
                <strong style={{ color: 'var(--forest-green)' }}>{property.state}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Acres</span>
                <strong style={{ color: 'var(--forest-green)' }}>{property.acres}</strong>
              </div>
            </div>

{/* GPS Coordinates Section */}
            {property.coordinates && (() => {
              try {
                const coords = JSON.parse(property.coordinates);
                const hasCoords = coords.ne_corner || coords.se_corner || coords.sw_corner || coords.nw_corner || coords.center;
                
                if (!hasCoords) return null;
                
                return (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--light-green)', borderRadius: '8px' }}>
                    <strong style={{ color: 'var(--forest-green)', fontSize: '1.1rem' }}>📍 GPS Coordinates</strong>
                    <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                      {coords.ne_corner && (
                        <div>
                          <strong>NE Corner:</strong> {coords.ne_corner}
                          {' '}
                          <a 
                            href={`https://www.google.com/maps?q=${coords.ne_corner}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--forest-green)', fontSize: '0.85rem' }}
                          >
                            [View on Map]
                          </a>
                        </div>
                      )}
                      {coords.se_corner && (
                        <div>
                          <strong>SE Corner:</strong> {coords.se_corner}
                          {' '}
                          <a 
                            href={`https://www.google.com/maps?q=${coords.se_corner}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--forest-green)', fontSize: '0.85rem' }}
                          >
                            [View on Map]
                          </a>
                        </div>
                      )}
                      {coords.sw_corner && (
                        <div>
                          <strong>SW Corner:</strong> {coords.sw_corner}
                          {' '}
                          <a 
                            href={`https://www.google.com/maps?q=${coords.sw_corner}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--forest-green)', fontSize: '0.85rem' }}
                          >
                            [View on Map]
                          </a>
                        </div>
                      )}
                      {coords.nw_corner && (
                        <div>
                          <strong>NW Corner:</strong> {coords.nw_corner}
                          {' '}
                          <a 
                            href={`https://www.google.com/maps?q=${coords.nw_corner}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--forest-green)', fontSize: '0.85rem' }}
                          >
                            [View on Map]
                          </a>
                        </div>
                      )}
                      {coords.center && (
                        <div>
                          <strong>Center Point:</strong> {coords.center}
                          {' '}
                          <a 
                            href={`https://www.google.com/maps?q=${coords.center}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--forest-green)', fontSize: '0.85rem' }}
                          >
                            [View on Map]
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })()}

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
  ${formatCurrency(property.price)}
</h2>
            <p style={{ color: '#666' }}>{property.acres} acres</p>
          </div>

          {property.status === 'coming_soon' ? (
            <div className="calculator">
              <h3>🎉 Coming Soon!</h3>
              <div style={{ 
                padding: '2rem', 
                background: 'var(--light-green)', 
                borderRadius: '8px',
                textAlign: 'center',
                border: '3px solid var(--sandy-gold)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                <h4 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>
                  This Property is Coming Soon!
                </h4>
                <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  We've recently acquired this property and are currently waiting for the deed transfer to complete. 
                  This property will be available for purchase soon!
                </p>
                <div style={{ 
                  padding: '1rem', 
                  background: 'white', 
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    Estimated Price
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--forest-green)' }}>
                    ${formatCurrency(property.price)}
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  💡 Check back soon or <a href="mailto:greenacreslandinvestments@gmail.com" style={{ color: 'var(--forest-green)' }}>contact us</a> to be notified when this property becomes available!
                </p>
              </div>
            </div>
          ) : (
            <div className="calculator">
  <h3>💰 Find Your Perfect Payment Plan</h3>>
  
  {/* INPUTS AT TOP */}
  <div className="calculator-options">
    <div>
      <label>What monthly payment works for you? (Optional)</label>
      <div className="amount-input-group">
        <span className="currency-symbol">$</span>
        <input
  type="number"
  placeholder="150"
  min="50"
  step="1"
  value={desiredPayment}
  onChange={(e) => setDesiredPayment(e.target.value)}
  style={{ paddingLeft: '2.5rem' }}
/>
      </div>
      <small style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
        Minimum $50/month • Enter your ideal payment to see which option fits best
      </small>
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

  {/* SELECTED PLAN SUMMARY - RIGHT AFTER INPUTS */}
  {calculation && (
    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--light-green)', borderRadius: '8px', borderLeft: '4px solid var(--forest-green)' }}>
      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Your Selected Plan:</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
        <div>Down Payment: ${formatCurrency(calculation.downPayment)}</div>
        <div>Processing Fee: $99</div>
        <div>Monthly Payment: ${formatCurrency(calculation.monthlyPayment)}</div>
        <div>Total Cost: ${formatCurrency(calculation.totalAmount)}</div>
      </div>
    </div>
  )}

  {/* PAYMENT OPTIONS - BELOW SUMMARY */}
  <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
  <h4 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Choose Your Down Payment Option:</h4>
  {desiredPayment && desiredPayment >= 50 && closestOption && (() => {
  // Find the actual payment for closest option
  let closestPayment;
  if (closestOption === '99') {
    const principal99 = (property.price - 99) + 99;
    const monthlyRate99 = 0.18 / 12;
    closestPayment = Math.max(
      principal99 * (monthlyRate99 * Math.pow(1 + monthlyRate99, termMonths)) / (Math.pow(1 + monthlyRate99, termMonths) - 1),
      50
    );
  } else {
    const dpOption = parseFloat(closestOption);
    const downPayment = property.price * (dpOption / 100);
    const interestRate = dpOption === 20 ? 12 : 8;
    const principal = (property.price - downPayment) + 99;
    const monthlyRate = interestRate / 100 / 12;
    closestPayment = Math.max(
      principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1),
      50
    );
  }
  
  const difference = Math.abs(parseFloat(desiredPayment) - closestPayment);
  const isGoodMatch = difference <= 30;
  const isTooLow = parseFloat(desiredPayment) < closestPayment;
  
  if (isGoodMatch) {
    return (
      <div style={{ 
        padding: '0.75rem', 
        background: '#d4edda', 
        border: '1px solid #c3e6cb',
        borderRadius: '5px',
        color: '#155724',
        marginBottom: '1rem'
      }}>
        ✓ The <strong>{closestOption === '99' ? '$99 Down' : `${closestOption}% Down`}</strong> option is closest to your ${formatCurrency(desiredPayment)}/month goal!
      </div>
    );
  } else {
    return (
      <div style={{ 
        padding: '0.75rem', 
        background: '#fff3cd', 
        border: '1px solid #ffc107',
        borderRadius: '5px',
        color: '#856404',
        marginBottom: '1rem'
      }}>
        ⚠️ Your desired payment of ${formatCurrency(desiredPayment)}/month is {isTooLow ? 'lower' : 'higher'} than our available options. 
        The closest we can offer is <strong>${formatCurrency(closestPayment)}/month</strong> with {closestOption === '99' ? '$99 Down' : `${closestOption}% Down`}.
        {isTooLow && termMonths < 60 && <div style={{ marginTop: '0.5rem' }}>💡 Try selecting a longer loan term to lower your monthly payment!</div>}
        {!isTooLow && termMonths > 12 && <div style={{ marginTop: '0.5rem' }}>💡 Try selecting a shorter loan term or you may be able to pay off early with no penalty!</div>}
      </div>
    );
  }
})()}
</div>

  {/* $99 Down Option */}
  <div 
    className={`payment-option ${downPaymentOption === '99' ? 'selected' : ''}`}
    onClick={() => setDownPaymentOption('99')}
    style={{
  padding: '1rem',
  marginBottom: '0.75rem',
  border: '2px solid',
  borderColor: downPaymentOption === '99' ? 'var(--forest-green)' : 'var(--border-color)',
  borderRadius: '8px',
  cursor: 'pointer',
  background: downPaymentOption === '99' ? 'var(--light-green)' : 'white',
  transition: 'all 0.3s ease',
  boxShadow: closestOption === '99' && downPaymentOption !== '99' ? '0 0 20px rgba(44, 95, 45, 0.6), 0 0 40px rgba(44, 95, 45, 0.3)' : 'none'
}}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: '600', color: 'var(--forest-green)', fontSize: '1.1rem' }}>
          $99 Down Payment
          <span style={{ 
            background: 'var(--sandy-gold)', 
            color: 'white', 
            padding: '0.2rem 0.5rem', 
            borderRadius: '12px', 
            fontSize: '0.75rem',
            marginLeft: '0.5rem'
          }}>MOST POPULAR</span>
        </div>
        <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>18% APR</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--forest-green)' }}>
          {calculation && calculation.downPaymentPercentage === 99 
            ? `$${formatCurrency(calculation.monthlyPayment)}`
            : `$${formatCurrency((() => {
                const principal = (property.price - 99) + 99;
                const monthlyRate = 0.18 / 12;
                let payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
                return Math.max(payment, 50);
              })())}`
          }
        </div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>/month</div>
      </div>
    </div>
  </div>

  {/* Other Options */}
  {['20', '25', '35', '50'].map(option => {
    const dpOption = parseFloat(option);
    const downPayment = (property.price * (dpOption / 100));
    const interestRate = dpOption === 20 ? 12 : 8;
    const principal = (property.price - downPayment) + 99;
    const monthlyRate = interestRate / 100 / 12;
    let monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) 
      / (Math.pow(1 + monthlyRate, termMonths) - 1);
    monthlyPayment = Math.max(monthlyPayment, 50);
    
    return (
      <div 
        key={option}
        className={`payment-option ${downPaymentOption === option ? 'selected' : ''}`}
        onClick={() => setDownPaymentOption(option)}
        style={{
  padding: '1rem',
  marginBottom: '0.75rem',
  border: '2px solid',
  borderColor: downPaymentOption === option ? 'var(--forest-green)' : 'var(--border-color)',
  borderRadius: '8px',
  cursor: 'pointer',
  background: downPaymentOption === option ? 'var(--light-green)' : 'white',
  transition: 'all 0.3s ease',
  boxShadow: closestOption === option && downPaymentOption !== option ? '0 0 15px rgba(44, 95, 45, 0.4)' : 'none'
}}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '600', color: 'var(--forest-green)', fontSize: '1.1rem' }}>
              {option}% Down (${formatCurrency(downPayment)})
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>{interestRate}% APR</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--forest-green)' }}>
              ${formatCurrency(monthlyPayment)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>/month</div>
          </div>
        </div>
      </div>
    );
  })}

  {/* READY TO PURCHASE SECTION - AT BOTTOM */}
  {calculation && (
    <>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: 'white',
        border: '3px solid var(--forest-green)',
        borderRadius: '12px'
      }}>
        <h4 style={{ 
          color: 'var(--forest-green)', 
          marginBottom: '1rem',
          fontSize: '1.3rem',
          textAlign: 'center',
          borderBottom: '2px solid var(--sandy-gold)',
          paddingBottom: '0.5rem'
        }}>
          Ready to Purchase?
        </h4>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            padding: '1rem', 
            background: 'var(--sandy-gold)', 
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'white', marginBottom: '0.25rem' }}>Your Cost Today</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
              ${formatCurrency(parseFloat(calculation.downPayment) + 99)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.25rem' }}>
              (${formatCurrency(calculation.downPayment)} down + $99 processing fee)
            </div>
          </div>
          
          <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#333' }}>Your Selected Plan:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Down Payment:</span>
              <strong style={{ color: 'var(--forest-green)' }}>${formatCurrency(calculation.downPayment)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Processing Fee:</span>
              <strong>$99</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Monthly Payment:</span>
              <strong style={{ color: 'var(--forest-green)' }}>${formatCurrency(calculation.monthlyPayment)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Total Cost:</span>
              <strong>${formatCurrency(calculation.totalAmount)}</strong>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: 'var(--light-green)', 
            borderRadius: '5px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            📅 <strong>{calculation.termMonths} monthly payments</strong> of ${formatCurrency(calculation.monthlyPayment)}
          </div>
        </div>

        {cardInstance && (
          <div style={{ marginBottom: '1rem' }}>
            <h5 style={{ marginBottom: '0.5rem', color: 'var(--forest-green)' }}>Billing Information</h5>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
              <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span> Required fields
            </p>
            
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--light-green)', borderRadius: '8px', border: '2px solid var(--forest-green)' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600', color: 'var(--forest-green)' }}>
                📅 Choose Your Monthly Payment Date <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div
                  onClick={() => setPaymentDueDay('1')}
                  style={{
                    padding: '1rem',
                    border: '2px solid',
                    borderColor: paymentDueDay === '1' ? 'var(--forest-green)' : '#ccc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: paymentDueDay === '1' ? 'white' : '#f5f5f5',
                    textAlign: 'center',
                    fontWeight: paymentDueDay === '1' ? '600' : '400',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>1st</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>of Each Month</div>
                </div>
                <div
                  onClick={() => setPaymentDueDay('15')}
                  style={{
                    padding: '1rem',
                    border: '2px solid',
                    borderColor: paymentDueDay === '15' ? 'var(--forest-green)' : '#ccc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: paymentDueDay === '15' ? 'white' : '#f5f5f5',
                    textAlign: 'center',
                    fontWeight: paymentDueDay === '15' ? '600' : '400',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>15th</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>of Each Month</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', textAlign: 'center' }}>
                💡 Choose the date that works best with your budget
              </p>
            </div>
            
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#333' }}>
                Phone Number <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
              </label>
              <input
                type="tel"
                value={billingInfo.phone}
                onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                placeholder="(555) 123-4567"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#333' }}>
                Cardholder Name <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
              </label>
              <input
                type="text"
                value={billingInfo.name}
                onChange={(e) => setBillingInfo({...billingInfo, name: e.target.value})}
                placeholder="John Smith"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#333' }}>
                Billing Address <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
              </label>
              <input
                type="text"
                value={billingInfo.address}
                onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                placeholder="123 Main St"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#333' }}>
                  City <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                </label>
                <input
                  type="text"
                  value={billingInfo.city}
                  onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                  placeholder="Appleton"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--border-color)',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#333' }}>
                  State <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                </label>
                <select
                  value={billingInfo.state}
                  onChange={(e) => setBillingInfo({...billingInfo, state: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--border-color)',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">--</option>
                  <option value="WI">WI</option>
                  <option value="AZ">AZ</option>
                  <option value="AR">AR</option>
                  <option value="CO">CO</option>
                  <option value="AL">AL</option>
                  <option value="AK">AK</option>
                  <option value="CA">CA</option>
                  <option value="FL">FL</option>
                  <option value="GA">GA</option>
                  <option value="IL">IL</option>
                  <option value="IN">IN</option>
                  <option value="IA">IA</option>
                  <option value="KS">KS</option>
                  <option value="KY">KY</option>
                  <option value="LA">LA</option>
                  <option value="MI">MI</option>
                  <option value="MN">MN</option>
                  <option value="MO">MO</option>
                  <option value="NE">NE</option>
                  <option value="NV">NV</option>
                  <option value="NY">NY</option>
                  <option value="NC">NC</option>
                  <option value="OH">OH</option>
                  <option value="OK">OK</option>
                  <option value="OR">OR</option>
                  <option value="PA">PA</option>
                  <option value="TX">TX</option>
                  <option value="UT">UT</option>
                  <option value="WA">WA</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#333' }}>
                  ZIP <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                </label>
                <input
                  type="text"
                  value={billingInfo.zip}
                  onChange={(e) => setBillingInfo({...billingInfo, zip: e.target.value})}
                  placeholder="54911"
                  required
                  maxLength="5"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--border-color)',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h5 style={{ marginBottom: '0.75rem', color: 'var(--forest-green)' }}>Card Information</h5>
            </div>
          </div>
        )}

        <div id="card-container" style={{ display: cardInstance ? 'block' : 'none', marginBottom: '1rem' }}></div>

        {purchaseError && (
          <div className="error-message" style={{ marginTop: '1rem' }}>
            {purchaseError}
          </div>
        )}

        <button 
          className="btn btn-primary btn-full-width"
          onClick={cardInstance ? handlePurchase : initializeSquarePayment}
          disabled={purchasing}
          style={{ marginTop: '1rem' }}
        >
          {purchasing 
  ? 'Processing...' 
  : cardInstance 
    ? `Pay $${formatCurrency(parseFloat(calculation.downPayment) + 99)} Now` 
    : isAuthenticated 
      ? 'Purchase This Property' 
      : 'Login to Purchase'
}
        </button>
      </div>
    </>
  )}
</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;