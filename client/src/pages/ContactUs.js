import React, { useState } from 'react';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just show success message
    // In the future, this would send to a backend endpoint
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" style={{ minHeight: '300px' }}>
        <div className="hero-content">
          <h1 className="hero-title">Contact Green Acres Land Investments, LLC</h1>
          <p className="hero-subtitle">
            Have questions? We're here to help. Reach out and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="features">
        <div className="container">
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div className="feature-card">
              <div className="feature-icon">📧</div>
              <h3>Email</h3>
              <p style={{ wordBreak: 'break-word' }}>
                <a href="mailto:GreenAcresLandInvestments@gmail.com" style={{ color: 'var(--forest-green)' }}>
                  GreenAcresLandInvestments@gmail.com
                </a>
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>Phone</h3>
              <p>
                <a href="tel:+19207166107" style={{ color: 'var(--forest-green)' }}>
                  920.716.6107
                </a>
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Mon-Fri 9AM-5PM CST</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Business Hours</h3>
              <p>Monday - Friday<br/>9:00 AM - 5:00 PM CST</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Closed weekends & holidays</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Send Us a Message</h2>
          
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {submitted ? (
              <div style={{
                backgroundColor: '#d4edda',
                border: '2px solid #28a745',
                borderRadius: '10px',
                padding: '2rem',
                textAlign: 'center',
                color: '#155724'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Thank You!</h3>
                <p style={{ marginBottom: 0 }}>
                  Your message has been received. We'll get back to you within 1-2 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '5px', border: '1px solid #ddd' }}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="property">Property Question</option>
                    <option value="financing">Financing Question</option>
                    <option value="payment">Payment Issue</option>
                    <option value="support">Customer Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    rows="6"
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '5px', 
                      border: '1px solid #ddd',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    width: '100%', 
                    padding: '1rem',
                    fontSize: '1.1rem',
                    backgroundColor: 'var(--forest-green)'
                  }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="financing">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--forest-green)', marginBottom: '0.5rem' }}>How quickly will I get a response?</h3>
              <p>We typically respond to all inquiries within 1-2 business days. For urgent matters, please call us during business hours.</p>
            </div>

            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--forest-green)', marginBottom: '0.5rem' }}>Can I schedule a call?</h3>
              <p>Yes! Mention your preferred date and time in your message, and we'll do our best to accommodate your schedule.</p>
            </div>

            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--forest-green)', marginBottom: '0.5rem' }}>What if I have a payment question?</h3>
              <p>For payment-related questions, please log into your dashboard first. If you still need help, select "Payment Issue" as your subject above.</p>
            </div>

            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--forest-green)', marginBottom: '0.5rem' }}>Can I visit a property before purchasing?</h3>
              <p>Absolutely! Contact us about the specific property you're interested in, and we'll provide you with location details and access information.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactUs;
