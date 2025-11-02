const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './greenacres.db';
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
function initializeDatabase() {
  console.log('📊 Initializing database...');

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Properties table
  db.run(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      acres REAL NOT NULL,
      location TEXT NOT NULL,
      county TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      image_url TEXT,
      features TEXT,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Loans table
  db.run(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      property_id INTEGER NOT NULL,
      property_price REAL NOT NULL,
      down_payment REAL NOT NULL,
      down_payment_percentage REAL NOT NULL,
      processing_fee REAL NOT NULL,
      principal REAL NOT NULL,
      interest_rate REAL NOT NULL,
      term_months INTEGER NOT NULL,
      monthly_payment REAL NOT NULL,
      total_amount REAL NOT NULL,
      balance REAL NOT NULL,
      status TEXT DEFAULT 'active',
      square_down_payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    )
  `);

  // Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_type TEXT NOT NULL,
      square_payment_id TEXT,
      status TEXT DEFAULT 'completed',
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loan_id) REFERENCES loans(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Insert sample properties if none exist
  db.get('SELECT COUNT(*) as count FROM properties', (err, row) => {
    if (err) {
      console.error('Error checking properties:', err);
      return;
    }
    
    if (row && row.count === 0) {
      console.log('🏞️  Adding sample properties...');
      
      const sampleProperties = [
        {
          title: "Peaceful 5 Acre Retreat",
          description: "Beautiful 5-acre parcel with mature trees and gentle rolling terrain. Perfect for building your dream home or weekend getaway. Easy access to county roads.",
          price: 4500,
          acres: 5.0,
          location: "Near Lake City",
          county: "Columbia",
          state: "FL",
          zip: "32055",
          image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
          features: JSON.stringify(["Wooded", "Level terrain", "County road access", "Power nearby"]),
          status: "available"
        },
        {
          title: "10 Acre Investment Property",
          description: "Prime 10-acre investment parcel with highway frontage. Great for commercial development or residential subdivision. Survey on file.",
          price: 8900,
          acres: 10.0,
          location: "Near Jacksonville",
          county: "Duval",
          state: "FL",
          zip: "32220",
          image_url: "https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800",
          features: JSON.stringify(["Highway frontage", "Commercial potential", "Cleared", "Surveyed"]),
          status: "available"
        },
        {
          title: "2.5 Acre Homesite",
          description: "Perfect 2.5-acre homesite in quiet rural area. Well-maintained county road access, electricity available at the street. Great views!",
          price: 2200,
          acres: 2.5,
          location: "Near Gainesville",
          county: "Alachua",
          state: "FL",
          zip: "32608",
          image_url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
          features: JSON.stringify(["Cleared", "Power available", "Rural setting", "Near town"]),
          status: "available"
        },
        {
          title: "20 Acre Ranch Land",
          description: "Spacious 20-acre ranch property with mix of open pasture and wooded areas. Excellent for cattle, horses, or agricultural use. Pond on property.",
          price: 15000,
          acres: 20.0,
          location: "Near Ocala",
          county: "Marion",
          state: "FL",
          zip: "34470",
          image_url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
          features: JSON.stringify(["Pasture", "Wooded areas", "Pond", "Agricultural zoning"]),
          status: "available"
        },
        {
          title: "3 Acre Wooded Lot",
          description: "Secluded 3-acre wooded lot offering privacy and natural beauty. Great for nature lovers or those seeking a quiet building site away from city noise.",
          price: 3200,
          acres: 3.0,
          location: "Near Tallahassee",
          county: "Leon",
          state: "FL",
          zip: "32310",
          image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
          features: JSON.stringify(["Heavily wooded", "Private", "Wildlife", "Quiet location"]),
          status: "available"
        },
        {
          title: "7.5 Acre Corner Lot",
          description: "Excellent 7.5-acre corner lot with dual road frontage. High visibility and easy access make this perfect for various uses. Utilities available.",
          price: 6800,
          acres: 7.5,
          location: "Near Panama City",
          county: "Bay",
          state: "FL",
          zip: "32401",
          image_url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800",
          features: JSON.stringify(["Corner lot", "Dual road frontage", "Utilities available", "High visibility"]),
          status: "available"
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO properties (title, description, price, acres, location, county, state, zip, image_url, features, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sampleProperties.forEach(property => {
        stmt.run(
          property.title,
          property.description,
          property.price,
          property.acres,
          property.location,
          property.county,
          property.state,
          property.zip,
          property.image_url,
          property.features,
          property.status
        );
      });

      stmt.finalize();
      console.log(`✅ Added ${sampleProperties.length} sample properties`);
    }

    console.log('✅ Database initialized successfully\n');
  });
}

// Initialize on import
initializeDatabase();

module.exports = db;
