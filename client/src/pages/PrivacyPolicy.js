import React from 'react';

function PrivacyPolicy() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" style={{ minHeight: '250px' }}>
        <div className="hero-content">
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-subtitle">
            Last Updated: November 15, 2025
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="features">
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            {/* Introduction */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Introduction</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                Green Acres Land Investments, LLC ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                visit our website or use our services.
              </p>
              <p style={{ lineHeight: '1.8' }}>
                By using our website or services, you agree to the collection and use of information in accordance 
                with this policy. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Information We Collect</h2>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Personal Information</h3>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                We collect information that you provide directly to us, including:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Name, email address, phone number, and mailing address</li>
                <li>Payment information (processed securely through Square)</li>
                <li>Property preferences and purchase history</li>
                <li>Communication preferences</li>
              </ul>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Automatically Collected Information</h3>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                When you access our website, we may automatically collect:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>How We Use Your Information</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                We use the information we collect for the following purposes:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>To process your land purchase transactions and manage your loan</li>
                <li>To communicate with you about your account and provide customer support</li>
                <li>To send you payment reminders and account notifications</li>
                <li>To improve our website and services</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To prevent fraud and enhance security</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Information Sharing and Disclosure</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                We do not sell, trade, or rent your personal information to third parties. We may share your 
                information only in the following circumstances:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website and conducting our business (e.g., Square for payment processing)</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
                <li><strong>Protection of Rights:</strong> We may disclose information to protect our rights, property, or safety, or that of our users or others</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Data Security</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Regular security audits and updates</li>
                <li>Restricted access to personal information</li>
              </ul>
              <p style={{ lineHeight: '1.8', backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '5px' }}>
                <strong>⚠️ Important:</strong> No method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </div>

            {/* Your Rights */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Your Rights and Choices</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                You have the following rights regarding your personal information:
              </p>
              <ul style={{ marginLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li><strong>Access:</strong> You can access and update your account information through your dashboard</li>
                <li><strong>Correction:</strong> You can correct inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> You can request deletion of your account (subject to legal retention requirements)</li>
                <li><strong>Opt-Out:</strong> You can opt out of marketing communications at any time</li>
              </ul>
              <p style={{ lineHeight: '1.8' }}>
                To exercise these rights, please contact us at <a href="mailto:privacy@greenacreslandinvestments.com" style={{ color: 'var(--forest-green)' }}>privacy@greenacreslandinvestments.com</a>
              </p>
            </div>

            {/* Cookies */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Cookies and Tracking Technologies</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
                Cookies are files with small amounts of data that are sent to your browser and stored on your device.
              </p>
              <p style={{ lineHeight: '1.8' }}>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </div>

            {/* Third-Party Links */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Third-Party Websites</h2>
              <p style={{ lineHeight: '1.8' }}>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices 
                or content of these third-party sites. We encourage you to review the privacy policies of any third-party 
                sites you visit.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Children's Privacy</h2>
              <p style={{ lineHeight: '1.8' }}>
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal 
                information from children. If you are a parent or guardian and believe your child has provided us with 
                personal information, please contact us immediately.
              </p>
            </div>

            {/* Changes to Privacy Policy */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Changes to This Privacy Policy</h2>
              <p style={{ lineHeight: '1.8' }}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this 
                Privacy Policy periodically for any changes.
              </p>
            </div>

            {/* Contact Information */}
            <div className="feature-card" style={{ textAlign: 'left', marginBottom: '2rem', backgroundColor: '#f8f9fa' }}>
              <h2 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>Contact Us</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '0.5rem' }}>
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <p style={{ lineHeight: '1.8', marginBottom: '0.5rem' }}>
                <strong>Email:</strong> <a href="mailto:privacy@greenacreslandinvestments.com" style={{ color: 'var(--forest-green)' }}>privacy@greenacreslandinvestments.com</a>
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

export default PrivacyPolicy;
