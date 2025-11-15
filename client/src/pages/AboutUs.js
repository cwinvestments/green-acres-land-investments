import React from 'react';

function AboutUs() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" style={{ minHeight: '300px' }}>
        <div className="hero-content">
          <h1 className="hero-title">About Green Acres Land Investments, LLC</h1>
          <p className="hero-subtitle">
            Making land ownership accessible to everyone through flexible financing and transparent service.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Our Mission</h2>
          <p style={{ 
            textAlign: 'center', 
            maxWidth: '800px', 
            margin: '0 auto 3rem', 
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: '#555'
          }}>
            At Green Acres Land Investments, LLC, we believe land ownership shouldn't be limited to those with perfect credit or large cash reserves. 
            Our mission is to help everyday Americans achieve their dream of owning land through accessible financing options and exceptional customer service.
          </p>

          {/* Values Cards */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Transparency</h3>
              <p>No hidden fees, no surprises. We believe in clear communication and honest business practices.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💪</div>
              <h3>Accessibility</h3>
              <p>We work with customers regardless of credit score. Everyone deserves a chance at land ownership.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Simplicity</h3>
              <p>Our process is straightforward. Browse, choose, and purchase – all online with no complicated paperwork.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Support</h3>
              <p>We're here for you throughout your land ownership journey, from purchase to payoff.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Our Story</h2>
          
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="step">
              <div className="step-number">2020</div>
              <h3>The Beginning</h3>
              <p>
                Green Acres Land Investments, LLC was founded with a simple vision: make land ownership accessible to everyone. 
                We saw too many people being turned away by traditional lenders and knew there had to be a better way.
              </p>
            </div>

            <div className="step">
              <div className="step-number">2021</div>
              <h3>Growing Our Portfolio</h3>
              <p>
                We expanded our inventory across multiple states, carefully selecting properties that offer real value 
                to our customers – from recreational land to future home sites.
              </p>
            </div>

            <div className="step">
              <div className="step-number">2023</div>
              <h3>Digital Innovation</h3>
              <p>
                We launched our online platform, making it easier than ever to browse properties, manage payments, 
                and track your land ownership journey from anywhere.
              </p>
            </div>

            <div className="step">
              <div className="step-number">Today</div>
              <h3>Your Partner in Land Ownership</h3>
              <p>
                We continue to help families achieve their dreams of land ownership with flexible financing, 
                transparent pricing, and dedicated support every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="financing">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏞️</div>
              <h3>Quality Land</h3>
              <p>We hand-select every property in our portfolio, ensuring it offers real value for recreational use, future development, or investment.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Flexible Financing</h3>
              <p>Multiple down payment options and loan terms from 1-5 years. Choose what works best for your budget.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Online Dashboard</h3>
              <p>Manage your loan, make payments, view documents, and track your property ownership progress online 24/7.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>No Credit Checks</h3>
              <p>We don't run credit checks. Your approval is based on your ability to make the down payment and monthly payments.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Clear Contracts</h3>
              <p>Easy-to-understand contracts for deed with no legal jargon. You'll know exactly what you're agreeing to.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Education</h3>
              <p>We help you understand land ownership, from property taxes to development potential.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Start Your Land Ownership Journey?</h2>
          <p>Browse our available properties and take the first step toward owning your piece of land.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/properties" className="btn btn-large">View Properties</a>
            <a href="/contact" className="btn btn-large" style={{ backgroundColor: '#6c757d' }}>Contact Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
