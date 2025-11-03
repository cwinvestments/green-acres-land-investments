import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SoldProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'under_contract', 'sold'

  useEffect(() => {
    fetchSoldProperties();
  }, []);

  const fetchSoldProperties = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/properties/sold`);
      setProperties(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sold properties:', error);
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    if (filter === 'all') return true;
    return property.status === filter;
  });

  if (loading) {
    return <div className="sold-properties-page"><p>Loading...</p></div>;
  }

  return (
    <div className="sold-properties-page">
      <h1>Recent Sales & Active Contracts</h1>
      <p className="subtitle">See what our customers are buying! These properties have been sold or are currently under contract.</p>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({properties.length})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pending ({properties.filter(p => p.status === 'pending').length})
        </button>
        <button 
          className={filter === 'under_contract' ? 'active' : ''}
          onClick={() => setFilter('under_contract')}
        >
          Under Contract ({properties.filter(p => p.status === 'under_contract').length})
        </button>
        <button 
          className={filter === 'sold' ? 'active' : ''}
          onClick={() => setFilter('sold')}
        >
          Sold ({properties.filter(p => p.status === 'sold').length})
        </button>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <p className="no-properties">No properties found in this category.</p>
      ) : (
        <div className="properties-grid">
          {filteredProperties.map(property => (
            <div key={property.id} className="property-card sold-property-card">
              {/* Status Badge */}
              <div className={`status-badge ${property.status === 'sold' ? 'badge-sold' : property.status === 'under_contract' ? 'badge-contract' : 'badge-pending'}`}>
                {property.status === 'sold' ? '✓ SOLD' : property.status === 'under_contract' ? '📝 UNDER CONTRACT' : '⏳ PENDING'}
              </div>

              {/* Property Image */}
              <div className="property-image">
                {property.images ? (
                  <img 
                    src={property.images} 
                    alt={property.title}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '250px',
                    background: 'linear-gradient(135deg, var(--light-green) 0%, var(--forest-green) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem'
                  }}>
                    🏞️
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="property-details">
                <h3>{property.title}</h3>
                <p className="property-location">📍 {property.location}</p>
                <div style={{ margin: '0.75rem 0' }}>
                  <span className="property-acres" style={{ fontSize: '1.1rem', color: 'var(--forest-green)', fontWeight: '600' }}>
                    🌲 {property.acres} Acres
                  </span>
                </div>
                <p className="sale-date">
                  {property.status === 'sold' ? 'Sold' : property.status === 'under_contract' ? 'Under Contract' : 'Pending'}: {new Date(property.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SoldProperties;