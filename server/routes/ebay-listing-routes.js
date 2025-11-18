// eBay Listing Generator Routes
// Add to server.js: const ebayRoutes = require('./routes/ebay-listing-routes');
// Add to server.js: app.use('/api/admin/ebay', authenticateAdmin, ebayRoutes);

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Payment Calculator Function
function calculateMonthlyPayments(price, propertyTax, poaFee) {
  const taxEscrow = propertyTax / 12;
  const poaEscrow = (poaFee || 0) / 12;
  
  const tiers = [
    { name: 'down_99', downPayment: 99, rate: 0.18 },
    { name: 'down_20', downPayment: price * 0.20, rate: 0.12 },
    { name: 'down_25', downPayment: price * 0.25, rate: 0.08 },
    { name: 'down_35', downPayment: price * 0.35, rate: 0.08 },
    { name: 'down_50', downPayment: price * 0.50, rate: 0.08 }
  ];
  
  const payments = {};
  const term = 36; // months
  
  tiers.forEach(tier => {
    const principal = price - tier.downPayment;
    const monthlyRate = tier.rate / 12;
    
    // Calculate principal + interest payment
    const piPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
      (Math.pow(1 + monthlyRate, term) - 1);
    
    // Add escrow
    const totalPayment = piPayment + taxEscrow + poaEscrow;
    
    payments[tier.name] = totalPayment.toFixed(2);
  });
  
  return payments;
}

// Generate eBay Title (max 80 characters)
function generateEbayTitle(property) {
  const acres = property.acres;
  const state = property.state;
  const city = property.location.split(',')[0].trim();
  
  let title = `${acres} Acres ${state} Land Near ${city} - Owner Financing - $99 Down!`;
  
  // Truncate if over 80 chars
  if (title.length > 80) {
    title = `${acres} Acres ${state} - Owner Financed - $99 Down - Near ${city}`;
  }
  
  if (title.length > 80) {
    title = title.substring(0, 77) + '...';
  }
  
  return title;
}

// Generate eBay Subtitle (max 55 characters)
function generateEbaySubtitle() {
  return "Owner Financing - As Low As $99 Down!";
}

// Build HTML from template
function buildEbayListing(propertyData, payments, customDescription) {
  // Read the template (in production, you'd have this as a file or string)
  const template = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
  .container { max-width: 900px; margin: 0 auto; padding: 0; }
  .header { background: linear-gradient(135deg, #2c5f2d 0%, #1e4620 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
  .header h1 { margin: 0 0 10px 0; font-size: 32px; font-weight: bold; }
  .header .tagline { font-size: 18px; font-style: italic; margin: 0; color: #f4a460; }
  .highlight-box { background: #f0f8f0; border: 3px solid #2c5f2d; border-radius: 10px; padding: 20px; margin: 20px; text-align: center; }
  .highlight-box h2 { color: #2c5f2d; margin: 0 0 15px 0; font-size: 28px; }
  .price-big { font-size: 48px; font-weight: bold; color: #2c5f2d; margin: 10px 0; }
  .financing-badge { background: #f4a460; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 18px; margin: 10px 0; }
  .content-section { padding: 20px; background: white; }
  .content-section h2 { color: #2c5f2d; font-size: 24px; border-bottom: 3px solid #f4a460; padding-bottom: 10px; margin-top: 30px; }
  .two-column { display: table; width: 100%; margin: 20px 0; }
  .column { display: table-cell; width: 50%; padding: 15px; vertical-align: top; }
  .info-box { background: #f9f9f9; border-left: 4px solid #2c5f2d; padding: 15px; margin: 10px 0; }
  .info-box h3 { color: #2c5f2d; margin: 0 0 10px 0; font-size: 18px; }
  .info-item { margin: 8px 0; font-size: 16px; }
  .info-item strong { color: #2c5f2d; min-width: 120px; display: inline-block; }
  .feature-list { list-style: none; padding: 0; margin: 15px 0; }
  .feature-list li { padding: 10px 10px 10px 35px; margin: 8px 0; background: #f0f8f0; border-radius: 5px; position: relative; }
  .feature-list li:before { content: "✓"; color: #2c5f2d; font-weight: bold; font-size: 20px; position: absolute; left: 10px; }
  .financing-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
  .financing-table th { background: #2c5f2d; color: white; padding: 15px; text-align: left; font-size: 16px; }
  .financing-table td { padding: 12px 15px; border-bottom: 1px solid #ddd; font-size: 16px; }
  .financing-table tr:nth-child(even) { background: #f9f9f9; }
  .financing-table .popular { background: #fff9e6; font-weight: bold; }
  .cta-box { background: linear-gradient(135deg, #2c5f2d 0%, #1e4620 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 20px; }
  .cta-box h2 { color: white; font-size: 28px; margin: 0 0 15px 0; border: none; }
  .cta-box p { font-size: 18px; margin: 10px 0; }
  .warning-box { background: #fff9e6; border: 2px solid #f4a460; border-radius: 10px; padding: 20px; margin: 20px; }
  .warning-box h3 { color: #2c5f2d; margin: 0 0 10px 0; }
  .footer { background: #f0f8f0; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 30px; }
  .footer p { margin: 5px 0; font-size: 14px; }
  .contact-info { background: white; border: 2px solid #2c5f2d; border-radius: 10px; padding: 20px; margin: 20px; text-align: center; }
  .contact-info h3 { color: #2c5f2d; margin: 0 0 15px 0; }
  .contact-info p { margin: 8px 0; font-size: 16px; }
  @media (max-width: 600px) {
    .two-column { display: block; }
    .column { display: block; width: 100%; }
    .header h1 { font-size: 24px; }
    .price-big { font-size: 36px; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🌿 Green Acres Land Investments 🌿</h1>
    <p class="tagline">"Your Land. Your Terms."</p>
  </div>
  <div class="highlight-box">
    <h2>${propertyData.acres} Acres in ${propertyData.location}</h2>
    <div class="price-big">$${propertyData.price.toLocaleString()}</div>
    <div class="financing-badge">💰 Owner Financing Available - As Low As $99 Down!</div>
  </div>
  <div class="content-section">
    <h2>📍 Property Overview</h2>
    <div class="two-column">
      <div class="column">
        <div class="info-box">
          <h3>Property Details</h3>
          <div class="info-item"><strong>Size:</strong> ${propertyData.acres} acres</div>
          <div class="info-item"><strong>Location:</strong> ${propertyData.city}, ${propertyData.state}</div>
          <div class="info-item"><strong>County:</strong> ${propertyData.county} County</div>
          <div class="info-item"><strong>APN:</strong> ${propertyData.apn || 'Available upon request'}</div>
          <div class="info-item"><strong>Zoning:</strong> ${propertyData.zoning || 'Residential/Agricultural'}</div>
        </div>
      </div>
      <div class="column">
        <div class="info-box">
          <h3>Annual Costs</h3>
          <div class="info-item"><strong>Property Tax:</strong> $${propertyData.annual_tax_amount || 0}/year</div>
          <div class="info-item"><strong>POA Fee:</strong> $${(propertyData.monthly_poa_fee || 0) * 12}/year</div>
          <div class="info-item"><strong>Total Annual:</strong> $${((propertyData.annual_tax_amount || 0) + ((propertyData.monthly_poa_fee || 0) * 12)).toFixed(2)}/year</div>
        </div>
      </div>
    </div>
    <h2>✨ Property Features</h2>
    <ul class="feature-list">
      <li><strong>Wide Open Spaces</strong> - Perfect for your dream home, RV, or recreational use</li>
      <li><strong>Peace & Privacy</strong> - Escape the hustle and bustle of city life</li>
      <li><strong>Investment Potential</strong> - Land values continue to appreciate</li>
      <li><strong>No Build Timeline</strong> - Take your time planning your perfect property</li>
      <li><strong>Outdoor Recreation</strong> - Hiking, camping, hunting, or just enjoying nature</li>
      <li><strong>Clear Title</strong> - Clean title, ready to transfer</li>
    </ul>
    <h2>📝 Property Description</h2>
    <p style="font-size: 16px; line-height: 1.8; white-space: pre-line;">${customDescription}</p>
    <h2>💰 Flexible Financing Options</h2>
    <p style="font-size: 16px;">
      <strong>We make land ownership easy!</strong> Choose the payment plan that works for your budget. 
      No bank qualifying, no credit checks, no hassles.
    </p>
    <table class="financing-table">
      <thead>
        <tr>
          <th>Down Payment</th>
          <th>Interest Rate</th>
          <th>Example Monthly Payment*</th>
        </tr>
      </thead>
      <tbody>
        <tr class="popular">
          <td><strong>$99 Down</strong> ⭐ Most Popular!</td>
          <td>18% APR</td>
          <td>$${payments.down_99} (36 months)</td>
        </tr>
        <tr>
          <td>20% Down</td>
          <td>12% APR</td>
          <td>$${payments.down_20} (36 months)</td>
        </tr>
        <tr>
          <td>25% Down</td>
          <td>8% APR</td>
          <td>$${payments.down_25} (36 months)</td>
        </tr>
        <tr>
          <td>35% Down</td>
          <td>8% APR</td>
          <td>$${payments.down_35} (36 months)</td>
        </tr>
        <tr>
          <td>50%+ Down</td>
          <td>8% APR</td>
          <td>$${payments.down_50} (36 months)</td>
        </tr>
      </tbody>
    </table>
    <p style="font-size: 14px; font-style: italic; color: #666;">
      *Example payments shown for 36-month terms. Terms available from 12-60 months. 
      Monthly payment includes principal, interest, and escrow for property taxes and POA fees.
    </p>
    <h2>🎯 Why Choose Owner Financing?</h2>
    <div class="two-column">
      <div class="column">
        <ul class="feature-list">
          <li><strong>No Bank Required</strong> - We finance it directly</li>
          <li><strong>No Credit Check</strong> - Everyone deserves land</li>
          <li><strong>Fast Closing</strong> - Own your land in days, not months</li>
          <li><strong>Flexible Terms</strong> - 1 to 5 year payment plans</li>
        </ul>
      </div>
      <div class="column">
        <ul class="feature-list">
          <li><strong>$50 Minimum Payment</strong> - Affordable for any budget</li>
          <li><strong>No Prepayment Penalty</strong> - Pay off early, save on interest</li>
          <li><strong>Choose Your Due Date</strong> - 1st or 15th of the month</li>
          <li><strong>Taxes Escrowed</strong> - We handle the property taxes</li>
        </ul>
      </div>
    </div>
    <h2>📋 How It Works</h2>
    <div class="info-box" style="font-size: 16px;">
      <strong>Step 1:</strong> Win this auction!<br>
      <strong>Step 2:</strong> Complete your registration on our website<br>
      <strong>Step 3:</strong> Choose your financing terms<br>
      <strong>Step 4:</strong> Review and sign your Contract for Deed<br>
      <strong>Step 5:</strong> Make your down payment<br>
      <strong>Step 6:</strong> Start enjoying your land!<br>
      <strong>Step 7:</strong> Make monthly payments online<br>
      <strong>Step 8:</strong> Receive your deed when paid off!
    </div>
  </div>
  <div class="cta-box">
    <h2>🎉 Ready to Own Your Land?</h2>
    <p>Place your bid now and start your journey to land ownership!</p>
    <p style="font-size: 16px;">After winning, visit our website to complete your registration and choose your payment plan.</p>
    <div style="margin-top: 20px;">
      <strong style="font-size: 20px;">🌐 GreenAcresLandInvestments.com</strong>
    </div>
  </div>
  <div class="warning-box">
    <h3>⚠️ Important Information</h3>
    <p><strong>Buyer Responsibilities:</strong></p>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>This is a Contract for Deed - title transfers after full payment</li>
      <li>Buyer is responsible for property taxes (escrowed in monthly payment)</li>
      <li>Buyer should verify all property details, utilities, and zoning with county</li>
      <li>No refunds after closing - please do your due diligence before bidding</li>
      <li>Property sold "as-is" - buyer encouraged to visit property before bidding</li>
    </ul>
    <p><strong>Due Diligence:</strong> We encourage all buyers to research the property, visit if possible, and verify all information with ${propertyData.county} County before placing a bid.</p>
  </div>
  <div class="contact-info">
    <h3>📞 Questions? We're Here to Help!</h3>
    <p><strong>Phone:</strong> (920) 716-6107</p>
    <p><strong>Email:</strong> GreenAcresLandInvestments@gmail.com</p>
    <p><strong>Website:</strong> www.GreenAcresLandInvestments.com</p>
    <p style="margin-top: 15px; font-size: 14px; color: #666;">
      Business Hours: Monday-Friday 9am-5pm Central Time<br>
      We typically respond within 24 hours
    </p>
  </div>
  <div class="footer">
    <p><strong>Green Acres Land Investments, LLC</strong></p>
    <p>"Your Land. Your Terms."</p>
    <p style="font-size: 12px; color: #666; margin-top: 15px;">
      Making land ownership accessible and affordable since 2024
    </p>
  </div>
</div>
</body>
</html>`;

  return template;
}

// POST /api/admin/ebay/generate-listing
router.post('/generate-listing', async (req, res) => {
  try {
    const { propertyId, manualData, customDescription, startingBid, buyItNowPrice, auctionDuration } = req.body;
    
    let propertyData;
    
    // If propertyId provided, fetch from database
    if (propertyId) {
      const propertyQuery = `
        SELECT 
          id, title, description, location, state, county, 
          price, acres, apn, annual_tax_amount, 
          monthly_poa_fee
        FROM properties 
        WHERE id = $1
      `;
      const propertyResult = await pool.query(propertyQuery, [propertyId]);
      
      if (propertyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      propertyData = propertyResult.rows[0];
      
      // Extract city from location
      propertyData.city = propertyData.location.split(',')[0].trim();
      propertyData.zoning = 'Residential/Agricultural'; // Default if not in DB
      
    } else if (manualData) {
      // Use manual data
      propertyData = {
        acres: manualData.acres,
        location: manualData.location,
        city: manualData.city || manualData.location.split(',')[0].trim(),
        state: manualData.state,
        county: manualData.county,
        price: parseFloat(manualData.price),
        apn: manualData.apn || 'Available upon request',
        zoning: manualData.zoning || 'Residential/Agricultural',
        annual_tax_amount: parseFloat(manualData.annual_tax_amount || 0),
        monthly_poa_fee: parseFloat(manualData.monthly_poa_fee || 0)
      };
    } else {
      return res.status(400).json({ error: 'Either propertyId or manualData is required' });
    }
    
    // Calculate monthly payments for all tiers
    const payments = calculateMonthlyPayments(
      propertyData.price,
      propertyData.annual_tax_amount || 0,
      (propertyData.monthly_poa_fee || 0) * 12
    );
    
    // Generate eBay title and subtitle
    const ebayTitle = generateEbayTitle(propertyData);
    const ebaySubtitle = generateEbaySubtitle();
    
    // Build HTML listing
    const html = buildEbayListing(propertyData, payments, customDescription || propertyData.description || '');
    
    // Calculate suggested starting bid (65% of price)
    const suggestedStartingBid = Math.round(propertyData.price * 0.65);
    
    res.json({
      success: true,
      html: html,
      title: ebayTitle,
      subtitle: ebaySubtitle,
      calculatedPayments: payments,
      suggestedStartingBid: suggestedStartingBid,
      suggestedBuyItNow: propertyData.price,
      propertyData: propertyData
    });
    
  } catch (error) {
    console.error('Error generating eBay listing:', error);
    res.status(500).json({ error: 'Failed to generate eBay listing', details: error.message });
  }
});

// GET /api/admin/ebay/properties
// Get list of available properties for dropdown
router.get('/properties', async (req, res) => {
  try {
    const query = `
      SELECT id, title, location, state, price, acres, status
      FROM properties
      WHERE status IN ('available', 'coming_soon')
      ORDER BY title ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      properties: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties', details: error.message });
  }
});

module.exports = router;