import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      {/* Hero Section with Logo */}
      <section className="hero">
        <div className="hero-content">
          <img 
            src="/images/green-acres-full-logo.svg" 
            alt="Green Acres Land Investments" 
            className="hero-logo"
          />
          <h1 className="hero-title">Make Land Ownership Simple</h1>
          <p className="hero-subtitle">
            Flexible financing options starting at just $99 down. Own your piece of land with terms that work for you.
          </p>
          <div className="hero-buttons">
            <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
            <Link to="/register" className="btn btn-secondary">Get Started</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Green Acres?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>$99 Down Payment</h3>
              <p>Get started with just $99 down on any property. We make land ownership accessible for everyone.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Flexible Terms</h3>
              <p>Choose payment terms from 1-5 years. No credit checks, no bank hassles.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Simple Process</h3>
              <p>Browse properties, choose your terms, and start making payments online. It's that easy.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>No Hidden Fees</h3>
              <p>Transparent pricing with no prepayment penalties. Pay off early and save on interest.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Browse Properties</h3>
              <p>Explore our available land parcels and find the perfect property for your needs.</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Choose Your Terms</h3>
              <p>Use our calculator to select your down payment amount and loan term.</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Complete Purchase</h3>
              <p>Sign up, make your down payment securely online, and receive your loan details.</p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h3>Own Your Land</h3>
              <p>Make monthly payments through your dashboard and watch your equity grow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Financing Options */}
      <section className="financing">
        <div className="container">
          <h2 className="section-title">Financing Options</h2>
          <p className="section-subtitle">Choose the option that works best for you</p>
          
          <div className="financing-grid">
            <div className="financing-card featured">
              <div className="financing-badge">Most Popular</div>
              <h3>$99 Down Special</h3>
              <div className="financing-rate">18% APR</div>
              <ul className="financing-features">
                <li>Available on all properties</li>
                <li>Get started today</li>
                <li>1-5 year terms</li>
                <li>$50 minimum payment</li>
              </ul>
            </div>

            <div className="financing-card">
              <h3>20% Down</h3>
              <div className="financing-rate">12% APR</div>
              <ul className="financing-features">
                <li>Lower interest rate</li>
                <li>Flexible terms</li>
                <li>Build equity faster</li>
                <li>No penalties</li>
              </ul>
            </div>

            <div className="financing-card">
              <h3>25%+ Down</h3>
              <div className="financing-rate">8% APR</div>
              <ul className="financing-features">
                <li>Best rate available</li>
                <li>Save on interest</li>
                <li>Own it faster</li>
                <li>Maximum savings</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Own Your Land?</h2>
          <p>Start browsing properties and find your perfect piece of land today.</p>
          <Link to="/properties" className="btn btn-large">View Available Properties</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
