import React from 'react';

function TermsOfService() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" style={{ minHeight: '250px' }}>
        <div className="hero-content">
          <h1 className="hero-title">Terms of Service</h1>
          <p className="hero-subtitle">
            Last Updated: November 15, 2025
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="features">
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            {/* Agreement */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Agreement to Terms</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                Welcome to Green Acres Land Investments, LLC ("Company," "we," "our," or "us"). These Terms of Service 
                ("Terms") govern your use of our website and services. By accessing or using our services, you agree to 
                be bound by these Terms.
              </p>
              <p style={{ lineHeight: '1.8', backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '5px' }}>
                <strong>⚠️ Important:</strong> Please read these Terms carefully before using our services. If you do not 
                agree with these Terms, you must not use our website or services.
              </p>
            </div>

            {/* Eligibility */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Eligibility</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                To use our services, you must:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Provide accurate and complete information during registration</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>

            {/* Account Registration */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Account Registration and Security</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                When creating an account, you agree to:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>
              <p style={{ lineHeight: '1.8' }}>
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
              </p>
            </div>

            {/* Land Purchase and Financing */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Land Purchase and Financing Terms</h2>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Contract for Deed</h3>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                All land purchases are made through a Contract for Deed, also known as a Land Contract. This means:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Legal title remains with Green Acres until the contract is paid in full</li>
                <li>You receive equitable title and can use the property according to the contract terms</li>
                <li>Upon full payment, we will transfer legal title via warranty deed or quitclaim deed</li>
                <li>Default on payments may result in forfeiture of all payments made and loss of property rights</li>
              </ul>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Payment Terms</h3>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                By purchasing property through our financing:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>You agree to make timely monthly payments on the 1st or 15th of each month (as selected)</li>
                <li>Late payments (7+ days past due) incur a late fee as specified in your contract</li>
                <li>Payments include principal, interest, and may include property taxes and HOA fees</li>
                <li>You may prepay without penalty at any time</li>
                <li>A processing fee applies to all purchases and is non-refundable</li>
              </ul>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Property Taxes and HOA Fees</h3>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                For properties with tax escrow or HOA fees:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Monthly payments include estimated property taxes and/or HOA fees</li>
                <li>We will pay property taxes and HOA fees on your behalf from escrowed funds</li>
                <li>You remain ultimately responsible for all property taxes and fees</li>
                <li>Escrow amounts may be adjusted annually based on actual tax bills</li>
              </ul>
            </div>

            {/* Default and Forfeiture */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem', backgroundColor: '#fff5f5', border: '2px solid #dc3545' }}>
              <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Default and Forfeiture</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                You will be in default if:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>You fail to make a payment within the grace period</li>
                <li>You fail to maintain required property insurance (if applicable)</li>
                <li>You violate any other material term of your contract</li>
              </ul>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                <strong>Cure Period:</strong> Upon default, you will receive a written notice providing 7 days to cure 
                the default by paying all amounts due plus applicable fees.
              </p>
              <p style={{ lineHeight: '1.8', fontWeight: 'bold' }}>
                If default is not cured within the cure period, we may declare the contract forfeit, resulting in:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '0', lineHeight: '1.8' }}>
                <li>Forfeiture of all payments made (considered rent for use of property)</li>
                <li>Immediate loss of all rights to the property</li>
                <li>Requirement to vacate the property</li>
                <li>No refund of any payments or down payment</li>
              </ul>
            </div>

            {/* Property Representations */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Property Representations and Warranties</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem', fontWeight: 'bold' }}>
                PROPERTIES ARE SOLD "AS IS" WITHOUT WARRANTY OF ANY KIND.
              </p>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                We make no representations or warranties regarding:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Property condition, fitness for a particular purpose, or merchantability</li>
                <li>Access to utilities, roads, or services</li>
                <li>Buildability, soil conditions, or development potential</li>
                <li>Zoning, environmental conditions, or regulatory restrictions</li>
                <li>Boundaries, surveys, or exact acreage (approximations may vary)</li>
              </ul>
              <p style={{ lineHeight: '1.8' }}>
                <strong>Due Diligence:</strong> You are responsible for conducting your own due diligence, including 
                property inspections, title searches, and verification of all property information before purchase.
              </p>
            </div>

            {/* Use of Website */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Acceptable Use of Website</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                You agree NOT to:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Use the website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the website</li>
                <li>Interfere with or disrupt the website or servers</li>
                <li>Transmit viruses, malware, or harmful code</li>
                <li>Scrape, harvest, or collect user information</li>
                <li>Impersonate any person or entity</li>
                <li>Submit false or misleading information</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Intellectual Property</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                All content on this website, including text, graphics, logos, images, and software, is the property of 
                Green Acres Land Investments, LLC and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p style={{ lineHeight: '1.8' }}>
                You may not reproduce, distribute, modify, or create derivative works without our express written permission.
              </p>
            </div>

            {/* Payment Processing */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Payment Processing</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                All payments are processed securely through Square, Inc. By making a payment, you agree to:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Pay a convenience fee for online payments</li>
                <li>Provide accurate payment information</li>
                <li>Authorize us to charge your payment method for scheduled payments</li>
                <li>Square's terms of service and privacy policy</li>
              </ul>
              <p style={{ lineHeight: '1.8' }}>
                We reserve the right to modify payment methods and fees with 30 days' notice.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Limitation of Liability</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, GREEN ACRES LAND INVESTMENTS, LLC SHALL NOT BE LIABLE FOR:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Property damage or personal injury</li>
                <li>Errors or interruptions in service</li>
              </ul>
              <p style={{ lineHeight: '1.8' }}>
                Our total liability shall not exceed the total amount paid by you to us in the 12 months preceding the claim.
              </p>
            </div>

            {/* Dispute Resolution */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Dispute Resolution and Governing Law</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                These Terms shall be governed by and construed in accordance with the laws of the state where the 
                property is located, without regard to conflict of law principles.
              </p>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                Any disputes arising from these Terms or our services shall be resolved through binding arbitration 
                in accordance with the American Arbitration Association rules, except where prohibited by law.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Changes to Terms</h2>
              <p style={{ lineHeight: '1.8' }}>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon 
                posting to this page. Your continued use of our services after changes constitutes acceptance of the 
                modified Terms. We will update the "Last Updated" date to reflect changes.
              </p>
            </div>

            {/* Severability */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Severability</h2>
              <p style={{ lineHeight: '1.8' }}>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
                limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain 
                in full force and effect.
              </p>
            </div>

            {/* Contact */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem', backgroundColor: '#f8f9fa' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Contact Us</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '0.5rem' }}>
                For questions about these Terms of Service, please contact us:
              </p>
              <p style={{ lineHeight: '1.8', marginBottom: '0.5rem' }}>
                <strong>Email:</strong> <a href="mailto:legal@greenacreslandinvestments.com" style={{ color: 'var(--forest-green)' }}>legal@greenacreslandinvestments.com</a>
              </p>
              <p style={{ lineHeight: '1.8', marginBottom: '0.5rem' }}>
                <strong>Phone:</strong> (555) 123-4567
              </p>
              <p style={{ lineHeight: '1.8' }}>
                <strong>Green Acres Land Investments, LLC</strong>
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default TermsOfService;
