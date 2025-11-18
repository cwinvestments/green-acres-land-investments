import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function EbayListingGenerator() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState('existing'); // 'existing' or 'manual'
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedListing, setGeneratedListing] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  // Manual entry form data
  const [manualData, setManualData] = useState({
    acres: '',
    location: '',
    city: '',
    state: '',
    county: '',
    price: '',
    apn: '',
    zoning: '',
    annual_tax_amount: '',
    monthly_poa_fee: ''
  });

  // Custom description
  const [customDescription, setCustomDescription] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/ebay/properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handlePropertySelect = (e) => {
    const propertyId = e.target.value;
    setSelectedPropertyId(propertyId);
    
    // Auto-fill description from selected property
    if (propertyId) {
      const property = properties.find(p => p.id === parseInt(propertyId));
      if (property) {
        setCustomDescription(property.description || '');
      }
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateListing = async () => {
    setLoading(true);
    setCopySuccess('');
    
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        customDescription
      };

      if (inputMode === 'existing') {
        if (!selectedPropertyId) {
          alert('Please select a property');
          setLoading(false);
          return;
        }
        payload.propertyId = selectedPropertyId;
      } else {
        // Validate manual data
        if (!manualData.acres || !manualData.location || !manualData.state || 
            !manualData.county || !manualData.price) {
          alert('Please fill in all required fields (Acres, Location, State, County, Price)');
          setLoading(false);
          return;
        }
        payload.manualData = manualData;
      }

      const response = await axios.post(
        `${API_URL}/admin/ebay/generate-listing`,
        payload,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setGeneratedListing(response.data);
    } catch (error) {
      console.error('Error generating listing:', error);
      alert('Failed to generate listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 className="admin-page-title">📦 eBay Listing Generator</h1>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          style={{ 
            width: '100%', 
            marginBottom: '10px',
            padding: '12px',
            backgroundColor: '#2c5f2d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {!generatedListing ? (
        <>
          {/* Input Mode Selection */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>Choose Input Method</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="radio"
                  value="existing"
                  checked={inputMode === 'existing'}
                  onChange={(e) => setInputMode(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Select Existing Property
              </label>
              <label style={{ display: 'block' }}>
                <input
                  type="radio"
                  value="manual"
                  checked={inputMode === 'manual'}
                  onChange={(e) => setInputMode(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Manual Entry
              </label>
            </div>
          </div>

          {/* Property Selection or Manual Entry */}
          {inputMode === 'existing' ? (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>Select Property</h3>
              <select
                value={selectedPropertyId}
                onChange={handlePropertySelect}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="">-- Select a Property --</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.title} - {prop.location} - ${prop.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>Property Information</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Acres *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="acres"
                    value={manualData.acres}
                    onChange={handleManualChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Location (e.g., "Near Denver, Colorado") *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={manualData.location}
                    onChange={handleManualChange}
                    placeholder="Near Denver, Colorado"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    City/Area
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={manualData.city}
                    onChange={handleManualChange}
                    placeholder="Denver"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={manualData.state}
                    onChange={handleManualChange}
                    placeholder="Colorado"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    County *
                  </label>
                  <input
                    type="text"
                    name="county"
                    value={manualData.county}
                    onChange={handleManualChange}
                    placeholder="Jefferson"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={manualData.price}
                    onChange={handleManualChange}
                    placeholder="5000"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    APN
                  </label>
                  <input
                    type="text"
                    name="apn"
                    value={manualData.apn}
                    onChange={handleManualChange}
                    placeholder="123-45-678-90"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Zoning
                  </label>
                  <input
                    type="text"
                    name="zoning"
                    value={manualData.zoning}
                    onChange={handleManualChange}
                    placeholder="Residential/Agricultural"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Annual Tax Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="annual_tax_amount"
                    value={manualData.annual_tax_amount}
                    onChange={handleManualChange}
                    placeholder="120"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Monthly POA Fee
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="monthly_poa_fee"
                    value={manualData.monthly_poa_fee}
                    onChange={handleManualChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Custom Description */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>Custom Description for eBay</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              Describe terrain, access, utilities, views, nearby towns, and permitted uses.
            </p>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="This beautiful property offers..."
              rows="8"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateListing}
            disabled={loading}
            className="btn btn-primary btn-full-width"
            style={{
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: loading ? '#ccc' : '#f4a460',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Generating...' : '🎨 Generate Listing Preview'}
          </button>
        </>
      ) : (
        <>
          {/* Preview Section */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => {
                setGeneratedListing(null);
                setCopySuccess('');
              }}
              className="btn btn-secondary btn-full-width"
              style={{ marginBottom: '10px' }}
            >
              ← Edit Information
            </button>
          </div>

          {/* eBay Title */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>eBay Title (80 characters max)</h3>
            <div style={{
              padding: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              marginBottom: '10px',
              wordBreak: 'break-word'
            }}>
              {generatedListing.title}
            </div>
            <button
              onClick={() => copyToClipboard(generatedListing.title, 'title')}
              className="btn btn-primary btn-full-width"
              style={{
                backgroundColor: copySuccess === 'title' ? '#10b981' : '#2c5f2d'
              }}
            >
              {copySuccess === 'title' ? '✓ Copied!' : '📋 Copy Title'}
            </button>
          </div>

          {/* eBay Subtitle */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>eBay Subtitle (55 characters max)</h3>
            <div style={{
              padding: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              marginBottom: '10px'
            }}>
              {generatedListing.subtitle}
            </div>
            <button
              onClick={() => copyToClipboard(generatedListing.subtitle, 'subtitle')}
              className="btn btn-primary btn-full-width"
              style={{
                backgroundColor: copySuccess === 'subtitle' ? '#10b981' : '#2c5f2d'
              }}
            >
              {copySuccess === 'subtitle' ? '✓ Copied!' : '📋 Copy Subtitle'}
            </button>
          </div>

          {/* Suggested Pricing */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>Suggested eBay Pricing</h3>
            <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
              <div><strong>Starting Bid:</strong> ${generatedListing.suggestedStartingBid.toLocaleString()} (65% of price)</div>
              <div><strong>Buy It Now:</strong> ${generatedListing.suggestedBuyItNow.toLocaleString()} (full price)</div>
            </div>
          </div>

          {/* Payment Calculations */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>Calculated Monthly Payments</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <div>$99 Down (18% APR): ${generatedListing.calculatedPayments.down_99}/month</div>
              <div>20% Down (12% APR): ${generatedListing.calculatedPayments.down_20}/month</div>
              <div>25% Down (8% APR): ${generatedListing.calculatedPayments.down_25}/month</div>
              <div>35% Down (8% APR): ${generatedListing.calculatedPayments.down_35}/month</div>
              <div>50% Down (8% APR): ${generatedListing.calculatedPayments.down_50}/month</div>
            </div>
          </div>

          {/* HTML Preview */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>Listing Preview</h3>
            <div style={{
              border: '2px solid #ddd',
              borderRadius: '4px',
              padding: '20px',
              backgroundColor: 'white',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              <div dangerouslySetInnerHTML={{ __html: generatedListing.html }} />
            </div>
          </div>

          {/* HTML Code */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>HTML Code (Ready for eBay)</h3>
            <textarea
              value={generatedListing.html}
              readOnly
              rows="10"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9'
              }}
            />
            <button
              onClick={() => copyToClipboard(generatedListing.html, 'html')}
              className="btn btn-full-width"
              style={{
                padding: '12px',
                backgroundColor: copySuccess === 'html' ? '#10b981' : '#f4a460',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              {copySuccess === 'html' ? '✓ HTML Copied to Clipboard!' : '📋 Copy HTML to Clipboard'}
            </button>
          </div>

          {/* Instructions */}
          <div className="card" style={{ 
            backgroundColor: '#fff9e6', 
            border: '2px solid #f4a460',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>📝 Next Steps</h3>
            <ol style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Copy the eBay Title and paste into eBay's title field</li>
              <li>Copy the eBay Subtitle and paste into eBay's subtitle field (optional)</li>
              <li>Copy the HTML Code and paste into eBay's description (use HTML mode)</li>
              <li>Add your property photos to the eBay listing</li>
              <li>Set your starting bid and Buy It Now price</li>
              <li>Choose 7-day auction duration</li>
              <li>Publish your listing!</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}

export default EbayListingGenerator;