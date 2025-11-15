import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getProperty, createLoan, formatCurrency } from '../api';
import { useAuth } from '../context/AuthContext';

// Helper function to transform Cloudinary URLs
const getCloudinaryTransform = (url, width, height = null, quality = 'auto') => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    const transforms = [`w_${width}`, 'c_fill', `q_${quality}`, 'f_auto'];
    if (height) transforms.splice(1, 0, `h_${height}`);
    return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
  }
  return url;
};

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
  const [deedInfo, setDeedInfo] = useState({
    deedName: '',
    deedMailingAddress: ''
  });
  const [paymentDueDay, setPaymentDueDay] = useState('1');
  const [dueDiligenceAgreed, setDueDiligenceAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
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

    // Validate terms accepted
    if (!termsAccepted) {
      setPurchaseError('You must read and accept the Terms of Service to complete this purchase');
      return;
    }

    // Validate billing info
    if (!billingInfo.name || !billingInfo.phone || !billingInfo.address || !billingInfo.city || !billingInfo.state || !billingInfo.zip) {
      setPurchaseError('Please fill in all billing information fields.');
      return;
    }

    // Validate deed info
    if (!deedInfo.deedName || !deedInfo.deedMailingAddress) {
      setPurchaseError('Please fill in deed name and mailing address.');
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
          paymentDueDay: parseInt(paymentDueDay),
          deedName: deedInfo.deedName,
          deedMailingAddress: deedInfo.deedMailingAddress
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
                src={getCloudinaryTransform(images[selectedImageIndex].url, 800, 400)}
                alt={images[selectedImageIndex].caption || property.title}
                loading="eager"
                className="property-main-image"
              />
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="property-thumbnail-grid">
                  {images.map((image, index) => (
                    <img
                      key={image.id}
                      src={getCloudinaryTransform(image.url, 100, 100)}
                      alt={image.caption || `View ${index + 1}`}
                      onClick={() => setSelectedImageIndex(index)}
                      loading="lazy"
                      className={`property-thumbnail ${selectedImageIndex === index ? 'selected' : ''}`}
                    />
                  ))}
                </div>
              )}
              
              {/* Caption */}
              {images[selectedImageIndex].caption && (
                <p className="image-caption">
                  {images[selectedImageIndex].caption}
                </p>
              )}
            </div>
          ) : (
            <img
              src={getCloudinaryTransform("https://res.cloudinary.com/dxd4ef2tc/image/upload/IMAGES-COMING-SOON_tbspdc.png", 800, 400)}
              alt="Images Coming Soon"
              loading="lazy"
              className="property-main-image"
              style={{ objectFit: 'contain', background: '#f5f5f5' }}
            />
          )}
          
          {/* Photo Disclaimer */}
          <div className="photo-disclaimer">
            📷 Note: Photos shown are representative of the surrounding area and may not depict the exact parcel for sale.
          </div>
          
          <div className="card">
            <h2>Property Details</h2>
            <p>{property.description}</p>
            
            <div className="property-info-grid">
              <div className="property-info-item">
                <span className="property-info-label">Location</span>
                <strong className="property-info-value">{property.location}</strong>
              </div>
              <div className="property-info-item">
                <span className="property-info-label">County</span>
                <strong className="property-info-value">{property.county}</strong>
              </div>
              <div className="property-info-item">
                <span className="property-info-label">State</span>
                <strong className="property-info-value">{property.state}</strong>
              </div>
              <div className="property-info-item">
                <span className="property-info-label">Acres</span>
                <strong className="property-info-value">{property.acres}</strong>
              </div>
              {property.annual_tax_amount && (
                <div className="property-info-item">
                  <span className="property-info-label">Annual Property Tax</span>
                  <strong className="property-info-value">${formatCurrency(property.annual_tax_amount)}</strong>
                </div>
              )}
              {property.monthly_hoa_fee && (
                <div className="property-info-item">
                  <span className="property-info-label">Monthly HOA Fee</span>
                  <strong className="property-info-value">${formatCurrency(property.monthly_hoa_fee)}</strong>
                </div>
              )}
              {property.apn && (
                <div className="property-info-item">
                  <span className="property-info-label">APN</span>
                  <strong className="property-info-value">{property.apn}</strong>
                </div>
              )}
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
                <div className="property-features">
                  {property.features.map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="price-box">
            <h2>${formatCurrency(property.price)}</h2>
            <p>{property.acres} acres</p>
          </div>

          {property.status === 'coming_soon' ? (
            <div className="calculator">
              <h3>🎉 Coming Soon!</h3>
              <div className="coming-soon-container">
                <div className="coming-soon-icon">📍</div>
                <h4 className="coming-soon-title">This Property is Coming Soon!</h4>
                <p className="coming-soon-text">
                  We've recently acquired this property and are currently waiting for the deed transfer to complete. 
                  This property will be available for purchase soon!
                </p>
                <div className="coming-soon-price-box">
                  <div className="coming-soon-price-label">Estimated Price</div>
                  <div className="coming-soon-price">${formatCurrency(property.price)}</div>
                </div>
                <p className="coming-soon-footer">
                  💡 Check back soon or <a href="mailto:greenacreslandinvestments@gmail.com">contact us</a> to be notified when this property becomes available!
                </p>
              </div>
            </div>
          ) : (
            <div className="calculator">
              <h3>💰 Find Your Perfect Payment Plan</h3>
              
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

              {/* SELECTED PLAN SUMMARY */}
              {calculation && (
                <div className="plan-summary-box">
                  <div className="plan-summary-title">Your Selected Plan:</div>
                  <div className="plan-summary-grid">
                    <div>Down Payment: ${formatCurrency(calculation.downPayment)}</div>
                    <div>Processing Fee: $99</div>
                    <div>Monthly Payment: ${formatCurrency(calculation.monthlyPayment)}</div>
                    <div>Total Cost (Includes Loan Interest): ${formatCurrency(calculation.totalAmount)}</div>
                  </div>
                </div>
              )}

              {/* PAYMENT OPTIONS */}
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
                      <div className="closest-match-success">
                        ✓ The <strong>{closestOption === '99' ? '$99 Down' : `${closestOption}% Down`}</strong> option is closest to your ${formatCurrency(desiredPayment)}/month goal!
                      </div>
                    );
                  } else {
                    return (
                      <div className="closest-match-warning">
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
                className={`payment-option-card ${downPaymentOption === '99' ? 'selected' : ''} ${closestOption === '99' && downPaymentOption !== '99' ? 'highlighted' : ''}`}
                onClick={() => setDownPaymentOption('99')}
              >
                <div className="payment-option-header">
                  <div>
                    <div className="payment-option-title">
                      $99 Down Payment
                      <span className="payment-option-badge">MOST POPULAR</span>
                    </div>
                    <div className="payment-option-rate">18% APR</div>
                  </div>
                  <div className="payment-option-amount">
                    <div className="payment-option-price">
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
                    <div className="payment-option-frequency">/month</div>
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
                    className={`payment-option-card ${downPaymentOption === option ? 'selected' : ''} ${closestOption === option && downPaymentOption !== option ? 'highlighted' : ''}`}
                    onClick={() => setDownPaymentOption(option)}
                  >
                    <div className="payment-option-header">
                      <div>
                        <div className="payment-option-title">
                          {option}% Down (${formatCurrency(downPayment)})
                        </div>
                        <div className="payment-option-rate">{interestRate}% APR</div>
                      </div>
                      <div className="payment-option-amount">
                        <div className="payment-option-price">
                          ${formatCurrency(monthlyPayment)}
                        </div>
                        <div className="payment-option-frequency">/month</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* READY TO PURCHASE SECTION */}
              {calculation && (
                <>
                  <div className="purchase-summary-container">
                    <h4 className="purchase-summary-title">Ready to Purchase?</h4>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="cost-today-box">
                        <div className="cost-today-label">Your Cost Today</div>
                        <div className="cost-today-amount">
                          ${formatCurrency(parseFloat(calculation.downPayment) + 99)}
                        </div>
                        <div className="cost-today-breakdown">
                          (${formatCurrency(calculation.downPayment)} down + $99 processing fee)
                        </div>
                      </div>
                      
                      <div className="purchase-plan-details">Your Selected Plan:</div>
                      <div className="purchase-plan-grid">
                        <div className="purchase-plan-item">
                          <span className="purchase-plan-label">Down Payment:</span>
                          <strong className="purchase-plan-value">${formatCurrency(calculation.downPayment)}</strong>
                        </div>
                        <div className="purchase-plan-item">
                          <span className="purchase-plan-label">Processing Fee:</span>
                          <strong>$99</strong>
                        </div>
                        <div className="purchase-plan-item">
                          <span className="purchase-plan-label">Monthly Payment:</span>
                          <strong className="purchase-plan-value">${formatCurrency(calculation.monthlyPayment)}</strong>
                        </div>
                        <div className="purchase-plan-item">
                          <span className="purchase-plan-label">Total Cost<br />(Includes Loan Interest):</span>
                          <strong>${formatCurrency(calculation.totalAmount)}</strong>
                        </div>
                      </div>
                      
                      <div className="payment-schedule-note">
                        📅 <strong>{calculation.termMonths} monthly payments</strong> of ${formatCurrency(calculation.monthlyPayment)}
                      </div>
                    </div>

                    {cardInstance && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h5 style={{ marginBottom: '0.5rem', color: 'var(--forest-green)' }}>Billing Information</h5>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                          <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span> Required fields
                        </p>
                        
                        <div className="payment-date-selector">
                          <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600', color: 'var(--forest-green)' }}>
                            📅 Choose Your Monthly Payment Date <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                          </label>
                          <div className="payment-date-options">
                            <div
                              onClick={() => setPaymentDueDay('1')}
                              className={`payment-date-option ${paymentDueDay === '1' ? 'selected' : ''}`}
                            >
                              <div className="payment-date-number">1st</div>
                              <div className="payment-date-label">of Each Month</div>
                            </div>
                            <div
                              onClick={() => setPaymentDueDay('15')}
                              className={`payment-date-option ${paymentDueDay === '15' ? 'selected' : ''}`}
                            >
                              <div className="payment-date-number">15th</div>
                              <div className="payment-date-label">of Each Month</div>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', textAlign: 'center' }}>
                            💡 Choose the date that works best with your budget
                          </p>
                        </div>
                        
                        <div className="form-group">
                          <label>
                            Phone Number <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                          </label>
                          <input
                            type="tel"
                            value={billingInfo.phone}
                            onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                            placeholder="(555) 123-4567"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Cardholder Name <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={billingInfo.name}
                            onChange={(e) => setBillingInfo({...billingInfo, name: e.target.value})}
                            placeholder="John Smith"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Billing Address <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={billingInfo.address}
                            onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                            placeholder="123 Main St"
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div className="form-group">
                            <label>
                              City <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                            </label>
                            <input
                              type="text"
                              value={billingInfo.city}
                              onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                              placeholder="Appleton"
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>
                              State <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                            </label>
                            <select
                              value={billingInfo.state}
                              onChange={(e) => setBillingInfo({...billingInfo, state: e.target.value})}
                              required
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
                          
                          <div className="form-group">
                            <label>
                              ZIP <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                            </label>
                            <input
                              type="text"
                              value={billingInfo.zip}
                              onChange={(e) => setBillingInfo({...billingInfo, zip: e.target.value})}
                              placeholder="54911"
                              required
                              maxLength="5"
                            />
                          </div>
                        </div>

                        <div className="deed-info-box">
                          <h5>📜 Deed Information</h5>
                          <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                            This information will appear on the property deed when your loan is paid off.
                          </p>
                          
                          <div className="form-group">
                            <label>
                              Name(s) for Deed <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                            </label>
                            <input
                              type="text"
                              value={deedInfo.deedName}
                              onChange={(e) => setDeedInfo({...deedInfo, deedName: e.target.value})}
                              placeholder="John and Jane Smith"
                              required
                            />
                            <small style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                              Enter name(s) exactly as you want them to appear on the deed
                            </small>
                          </div>

                          <div className="form-group">
                            <label>
                              Mailing Address for Deed <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
                            </label>
                            <textarea
                              rows="3"
                              value={deedInfo.deedMailingAddress}
                              onChange={(e) => setDeedInfo({...deedInfo, deedMailingAddress: e.target.value})}
                              placeholder="123 Main St&#10;Appleton, WI 54911"
                              required
                            />
                            <small style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                              Full address where the deed should be mailed upon loan payoff
                            </small>
                          </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                          <h5 style={{ marginBottom: '0.75rem', color: 'var(--forest-green)' }}>Card Information</h5>
                        </div>
                      </div>
                    )}

                    {/* Terms of Service */}
                    {cardInstance && (
                      <div className={`terms-accepted-box ${termsAccepted ? 'accepted' : 'not-accepted'}`}>
                        <div style={{ marginBottom: '10px', fontWeight: '600' }}>
                          {termsAccepted ? '✓ Terms Accepted' : '⚠️ Required: Terms of Service'}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="btn"
                          style={{
                            width: '100%',
                            backgroundColor: termsAccepted ? '#28a745' : '#ffc107',
                            color: termsAccepted ? 'white' : '#000',
                            padding: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          {termsAccepted ? '✓ Terms of Service Accepted' : 'Click to Read & Accept Terms'}
                        </button>
                      </div>
                    )}

                    {/* Due Diligence Agreement */}
                    {cardInstance && (
                      <div className="due-diligence-box">
                        <h5>⚠️ Due Diligence Statement</h5>
                        <p style={{ fontSize: '0.85rem', color: '#856404', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                          All prospective buyers are urged to conduct their own due diligence to their satisfaction prior to purchasing this property. 
                          Prospective purchasers are strongly encouraged to examine, visit, and thoroughly research the property before buying. 
                          This includes verifying boundaries, utilities, zoning, road access, and suitability for your intended use.
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#856404', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                          All information contained in this listing has come from reliable sources and is believed to be accurate to the best of our knowledge. 
                          However, <strong>Green Acres Land Investments, LLC</strong> makes no guarantee, expressed or implied, as to the location, condition, 
                          accessibility, terrain, buildability, utility availability, or any other information contained in this listing.
                        </p>
                        <div className="due-diligence-checkbox-wrapper">
                          <input
                            type="checkbox"
                            id="dueDiligenceCheckbox"
                            checked={dueDiligenceAgreed}
                            onChange={(e) => setDueDiligenceAgreed(e.target.checked)}
                          />
                          <label htmlFor="dueDiligenceCheckbox">
                            <strong>I acknowledge that I have read and understand the Due Diligence Statement above. 
                            I have conducted adequate due diligence and accept the property in its current condition.</strong>
                          </label>
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
                      disabled={purchasing || (cardInstance && (!dueDiligenceAgreed || !termsAccepted))}
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

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="terms-modal-overlay">
          <div className="terms-modal-content">
            <h2>Terms of Service</h2>
            
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
              <h3>Agreement to Terms</h3>
              <p>By purchasing property, you agree to be bound by these Terms of Service.</p>
              
              <h3>Contract for Deed</h3>
              <p>All land purchases are made through a Contract for Deed. Legal title remains with Green Acres Land Investments, LLC until the contract is paid in full. You receive equitable title and can use the property according to contract terms.</p>
              
              <h3>Payment Terms</h3>
              <ul>
                <li>Monthly payments must be made on your selected due date (1st or 15th)</li>
                <li>Late payments (7+ days past due) incur a late fee</li>
                <li>Payments include principal, interest, and may include property taxes and HOA fees</li>
                <li>You may prepay without penalty at any time</li>
              </ul>
              
              <h3>Default and Forfeiture</h3>
              <p><strong style={{ color: '#dc3545' }}>⚠️ CRITICAL:</strong> If you default on payments:</p>
              <ul>
                <li>You will receive written notice providing 7 days to cure the default</li>
                <li>If not cured, <strong>all payments made will be forfeited</strong> (considered rent for use of property)</li>
                <li>You will immediately lose all rights to the property</li>
                <li>No refund of any payments or down payment</li>
              </ul>
              
              <h3>Property "As-Is"</h3>
              <p><strong>Properties are sold "AS IS" without warranty of any kind.</strong> You are responsible for conducting your own due diligence including property inspections, title searches, and verification of utilities, access, zoning, and buildability.</p>
              
              <h3>Governing Law</h3>
              <p>These Terms shall be governed by the laws of the State of Wisconsin. Any disputes shall be resolved exclusively in the courts of Outagamie County, Appleton, Wisconsin.</p>
              
              <p style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                <strong>Contact:</strong> GreenAcresLandInvestments@gmail.com | 920.716.6107
              </p>
              
              <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '12px', color: '#666' }}>
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest-green)' }}>View Full Terms of Service (Opens in New Window)</a>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: 'var(--forest-green)',
                  color: 'white',
                  padding: '12px',
                  fontSize: '16px'
                }}
              >
                ✓ I Accept the Terms of Service
              </button>
              <button
                onClick={() => setShowTermsModal(false)}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '12px',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetail;