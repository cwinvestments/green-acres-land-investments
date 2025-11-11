import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getProperties, formatCurrency } from '../api';

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertyImages, setPropertyImages] = useState({});
  const [error, setError] = useState('');
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('all');

  useEffect(() => {
    loadStates();
    loadProperties();
  }, []);

  const loadStates = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/states`);
      setStates(response.data);
    } catch (err) {
      console.error('Failed to load states:', err);
    }
  };
  const loadProperties = async () => {
    try {
      const response = await getProperties();
      setProperties(response.data);
      
      // Load first image for each property
      const imagePromises = response.data.map(async (property) => {
        try {
          const imgResponse = await axios.get(`${process.env.REACT_APP_API_URL}/properties/${property.id}/images`);
          return { propertyId: property.id, images: imgResponse.data };
        } catch (err) {
          return { propertyId: property.id, images: [] };
        }
      });
      
      const imageResults = await Promise.all(imagePromises);
      const imagesMap = {};
      imageResults.forEach(result => {
        imagesMap[result.propertyId] = result.images;
      });
      setPropertyImages(imagesMap);
      
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    if (selectedState === 'all') {
      return properties;
    }
    return properties.filter(p => p.state === selectedState);
  }, [properties, selectedState]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="properties-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="properties-page">
      <h1>Available Properties</h1>
      
      {/* State Filter Tabs */}
      {states.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedState('all')}
            style={{
              padding: '0.75rem 1.5rem',
              border: selectedState === 'all' ? '2px solid var(--forest-green)' : '2px solid var(--border-color)',
              background: selectedState === 'all' ? 'var(--forest-green)' : 'white',
              color: selectedState === 'all' ? 'white' : 'var(--text-dark)',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
          >
            All States
          </button>
          {states.map(state => (
            <button
              key={state.id}
              onClick={() => setSelectedState(state.name)}
              style={{
                padding: '0.75rem 1.5rem',
                border: selectedState === state.name ? '2px solid var(--forest-green)' : '2px solid var(--border-color)',
                background: selectedState === state.name ? 'var(--forest-green)' : 'white',
                color: selectedState === state.name ? 'white' : 'var(--text-dark)',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '500'
              }}
            >
              {state.name}
              {state.coming_soon && (
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  COMING SOON
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      
      <p style={{ color: '#666', marginBottom: '2rem', textAlign: 'center' }}>
        {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} available
      </p>

      {filteredProperties.length === 0 ? (
        <div className="empty-state">
          <h3>No properties available</h3>
          <p>{selectedState === 'all' ? 'Check back soon for new listings!' : `No properties available in ${selectedState}`}</p>
        </div>
      ) : (
        <div className="properties-grid">
          {filteredProperties.map((property) => (
            <Link 
              to={`/properties/${property.id}`} 
              key={property.id}
              className="property-card"
            >
              {propertyImages[property.id]?.length > 0 ? (
                <img
                  src={propertyImages[property.id][0].url}
                  alt={property.title}
                  className="property-image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <img
                  src="https://res.cloudinary.com/dxd4ef2tc/image/upload/IMAGES-COMING-SOON_tbspdc.png"
                  alt="Property Coming Soon"
                  className="property-image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: '0.7'
                  }}
                />
              )}
              <div className="property-content">
                <h3>{property.title}</h3>
                <div className="property-info">
                  <span>📍 {property.location}</span>
                  <span>📏 {property.acres} acres</span>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {property.description.substring(0, 100)}...
                </p>
                <div className="property-price">
                  ${formatCurrency(property.price)}
                  {property.status === 'coming_soon' && (
                    <span style={{
                      marginLeft: '10px',
                      padding: '4px 12px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      COMING SOON
                    </span>
                  )}
                </div>
                <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                  View Details
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Properties;
