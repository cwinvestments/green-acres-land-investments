import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function EbayWinnerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyTitle: '',
    auctionUrl: '',
    ebayUsername: '',
    winningBid: '',
    preferredDueDay: '1',
    mailingAddress: '',
    mailingCity: '',
    mailingState: '',
    mailingZip: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/ebay/winner-submission`, formData);
      
      if (response.data.success) {
        setSubmitted(true);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e9 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '15px', 
            padding: '50px 30px', 
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
            <h1 style={{ color: '#2c5f2d', fontSize: '32px', marginBottom: '20px' }}>
              Thank You for Your Submission!
            </h1>
            <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#666', marginBottom: '30px' }}>
              We've received your information and will contact you within 24 hours to complete your registration and finalize your financing terms.
            </p>
            <div style={{ 
              background: '#f0f8f0', 
              border: '2px solid #2c5f2d', 
              borderRadius: '10px', 
              padding: '25px', 
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#2c5f2d', marginTop: 0 }}>📋 Next Steps:</h3>
              <ol style={{ fontSize: '16px', lineHeight: '1.8', paddingLeft: '25px' }}>
                <li>Check your email for a confirmation (check spam if needed)</li>
                <li>We'll call you within 24 hours to verify your information</li>
                <li>Complete your account registration on our website</li>
                <li>Choose your final financing terms</li>
                <li>Make your down payment (your winning bid amount)</li>
                <li>Review and sign your Contract for Deed</li>
                <li>Start enjoying your land!</li>
              </ol>
            </div>
            <a 
              href="/" 
              style={{
                display: 'inline-block',
                padding: '15px 40px',
                background: '#2c5f2d',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#1e4620'}
              onMouseOut={(e) => e.target.style.background = '#2c5f2d'}
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e9 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'white', 
          borderRadius: '15px 15px 0 0', 
          padding: '40px 30px', 
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#2c5f2d', fontSize: '36px', marginBottom: '10px' }}>
            🎉 Congratulations on Your Winning Bid!
          </h1>
          <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6', marginBottom: 0 }}>
            Please complete this form so we can finalize your land purchase
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ 
          background: 'white', 
          borderRadius: '0 0 15px 15px', 
          padding: '40px 30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          {error && (
            <div style={{ 
              background: '#ffebee', 
              border: '2px solid #c62828', 
              borderRadius: '8px', 
              padding: '15px', 
              marginBottom: '25px',
              color: '#c62828'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Contact Information Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#2c5f2d', 
              fontSize: '24px', 
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '3px solid #f4a460'
            }}>
              📞 Contact Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="(920) 555-1234"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            </div>
          </div>

          {/* Auction Details Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#2c5f2d', 
              fontSize: '24px', 
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '3px solid #f4a460'
            }}>
              🏆 Auction Details
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Property Title *
              </label>
              <input
                type="text"
                name="propertyTitle"
                value={formData.propertyTitle}
                onChange={handleChange}
                required
                placeholder="e.g., 5 Acres Arizona Land Near Phoenix"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <small style={{ color: '#666', fontSize: '14px' }}>
                Copy the title from your eBay auction
              </small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                eBay Auction URL (optional)
              </label>
              <input
                type="url"
                name="auctionUrl"
                value={formData.auctionUrl}
                onChange={handleChange}
                placeholder="https://www.ebay.com/itm/..."
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <small style={{ color: '#666', fontSize: '14px' }}>
                Must include https:// (example: https://www.ebay.com/itm/...)
              </small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                eBay Username *
              </label>
              <input
                type="text"
                name="ebayUsername"
                value={formData.ebayUsername}
                onChange={handleChange}
                required
                placeholder="your_ebay_username"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <small style={{ color: '#666', fontSize: '14px' }}>
                Your eBay username so we can verify the winning bid
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Your Winning Bid Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="winningBid"
                  value={formData.winningBid}
                  onChange={handleChange}
                  required
                  placeholder="99.00"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
                <small style={{ color: '#666', fontSize: '14px' }}>
                  This becomes your down payment
                </small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Preferred Payment Due Day
                </label>
                <select
                  name="preferredDueDay"
                  value={formData.preferredDueDay}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                >
                  <option value="1">1st of month</option>
                  <option value="15">15th of month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mailing Address Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#2c5f2d', 
              fontSize: '24px', 
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '3px solid #f4a460'
            }}>
              📬 Mailing Address (optional - can be added later)
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Street Address
              </label>
              <input
                type="text"
                name="mailingAddress"
                value={formData.mailingAddress}
                onChange={handleChange}
                placeholder="123 Main Street"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  City
                </label>
                <input
                  type="text"
                  name="mailingCity"
                  value={formData.mailingCity}
                  onChange={handleChange}
                  placeholder="Appleton"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  State
                </label>
                <input
                  type="text"
                  name="mailingState"
                  value={formData.mailingState}
                  onChange={handleChange}
                  placeholder="WI"
                  maxLength="2"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  ZIP
                </label>
                <input
                  type="text"
                  name="mailingZip"
                  value={formData.mailingZip}
                  onChange={handleChange}
                  placeholder="54911"
                  maxLength="10"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Additional Notes or Questions (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Any questions or special requests?"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '20px',
              fontWeight: 'bold',
              background: submitting ? '#ccc' : '#2c5f2d',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(44, 95, 45, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!submitting) e.target.style.background = '#1e4620';
            }}
            onMouseOut={(e) => {
              if (!submitting) e.target.style.background = '#2c5f2d';
            }}
          >
            {submitting ? 'Submitting...' : '✅ Submit Information'}
          </button>

          <p style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            color: '#666', 
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            By submitting this form, you confirm that you are the winning bidder of the eBay auction<br/>
            and agree to complete the purchase per the terms listed in the auction.
          </p>
        </form>
      </div>
    </div>
  );
}

export default EbayWinnerForm;