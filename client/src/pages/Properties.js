import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getProperties, formatCurrency } from '../api';

// Helper function to transform Cloudinary URLs for thumbnails
const getCloudinaryThumbnail = (url, width = 400, quality = 'auto') => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // Insert transformation parameters into Cloudinary URL
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_${width},c_fill,q_${quality},f_auto/${parts[1]}`;
  }
  return url;
};

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
        <div className="state-filter-container">
          <button
            onClick={() => setSelectedState('all')}
            className={`state-filter-button ${selectedState === 'all' ? 'active' : ''}`}
          >
            All States
          </button>
          {states.map(state => (
            <button
              key={state.id}
              onClick={() => setSelectedState(state.name)}
              className={`state-filter-button ${selectedState === state.name ? 'active' : ''}`}
            >
              {state.name}
              {state.coming_soon && (
                <span className="state-coming-soon-badge">
                  COMING SOON
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      
      <p className="property-count-text">
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
                  src={getCloudinaryThumbnail(propertyImages[property.id][0].url, 400)}
                  alt={property.title}
                  className="property-image"
                  loading="lazy"
                />
              ) : (
                <img
                  src={getCloudinaryThumbnail("https://res.cloudinary.com/dxd4ef2tc/image/upload/IMAGES-COMING-SOON_tbspdc.png", 400)}
                  alt="Property Coming Soon"
                  className="property-image property-placeholder-image"
                  loading="lazy"
                />
              )}
              <div className="property-content">
                <h3>{property.title}</h3>
                <div className="property-info">
                  <span>📍 {property.location}</span>
                  <span>📏 {property.acres} acres</span>
                </div>
                <p className="property-card-description">
                  {property.description.substring(0, 100)}...
                </p>
                <div className="property-price">
                  ${formatCurrency(property.price)}
                  {property.status === 'coming_soon' && (
                    <span className="property-coming-soon-badge">
                      COMING SOON
                    </span>
                  )}
                </div>
                <button className="btn btn-secondary">
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