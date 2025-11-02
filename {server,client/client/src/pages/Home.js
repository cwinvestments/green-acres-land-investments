import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1>Making Land Ownership Simple</h1>
        <p>Own your piece of paradise with flexible financing options</p>
        <Link to="/properties" className="btn btn-primary">
          Browse Properties
        </Link>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Green Acres?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Flexible Financing</h3>
            <p>Options starting at just $99 down payment. Multiple term lengths to fit your budget.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏞️</div>
            <h3>Quality Land</h3>
            <p>Carefully selected parcels in desirable locations throughout Florida.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Online Management</h3>
            <p>Track your loan, make payments, and manage your investment from anywhere.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payments</h3>
            <p>Industry-leading payment security through Square.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Approval</h3>
            <p>Quick and easy approval process. Own your land today!</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>No Hidden Fees</h3>
            <p>Transparent pricing with no prepayment penalties.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero" style={{ padding: '3rem 2rem' }}>
        <h2>Ready to Own Your Land?</h2>
        <p style={{ fontSize: '1.1rem' }}>Browse our available properties and find your perfect parcel today!</p>
        <Link to="/properties" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          View Available Properties
        </Link>
      </section>
    </div>
  );
}

export default Home;
