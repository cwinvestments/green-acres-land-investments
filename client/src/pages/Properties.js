import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProperties } from '../api';

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await getProperties();
      setProperties(response.data);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        {properties.length} {properties.length === 1 ? 'property' : 'properties'} available
      </p>

      {properties.length === 0 ? (
        <div className="empty-state">
          <h3>No properties available</h3>
          <p>Check back soon for new listings!</p>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <Link 
              to={`/properties/${property.id}`} 
              key={property.id}
              className="property-card"
            >
              <img
                src={property.image_url}
                alt={property.title}
                className="property-image"
              />
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
                  ${property.price.toLocaleString()}
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
