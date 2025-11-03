const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('📊 Initializing database...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Properties table
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        state TEXT NOT NULL,
        county TEXT NOT NULL,
        acres DECIMAL NOT NULL,
        price DECIMAL NOT NULL,
        images TEXT,
        status TEXT DEFAULT 'available',
        apn TEXT,
        coordinates TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Loans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        property_id INTEGER NOT NULL REFERENCES properties(id),
        purchase_price DECIMAL NOT NULL,
        down_payment DECIMAL NOT NULL,
        processing_fee DECIMAL NOT NULL,
        loan_amount DECIMAL NOT NULL,
        interest_rate DECIMAL NOT NULL,
        term_months INTEGER NOT NULL,
        monthly_payment DECIMAL NOT NULL,
        total_amount DECIMAL NOT NULL,
        balance_remaining DECIMAL NOT NULL,
        next_payment_date DATE,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        loan_id INTEGER NOT NULL REFERENCES loans(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount DECIMAL NOT NULL,
        payment_type TEXT NOT NULL,
        square_payment_id TEXT,
        status TEXT DEFAULT 'completed',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add sample properties if none exist
    const { rows } = await client.query('SELECT COUNT(*) FROM properties');
    if (parseInt(rows[0].count) === 0) {
      await addSampleProperties(client);
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Add sample properties
const addSampleProperties = async (client) => {
  const properties = [
    {
      title: 'Peaceful 5 Acre Retreat',
      description: 'Beautiful wooded 5-acre parcel perfect for your dream home or weekend getaway. Gently rolling terrain with mature trees.',
      price: 4500,
      acres: 5.0,
      location: 'Smith County',
      state: 'Texas',
      county: 'Smith'
    },
    {
      title: '10 Acre Investment Property',
      description: 'Prime 10-acre tract with road frontage. Great investment opportunity in growing area.',
      price: 8900,
      acres: 10.0,
      location: 'Henderson County',
      state: 'Texas',
      county: 'Henderson'
    },
    {
      title: '2.5 Acre Homesite',
      description: 'Perfect starter lot for building your first home. Level terrain, utilities nearby.',
      price: 2200,
      acres: 2.5,
      location: 'Van Zandt County',
      state: 'Texas',
      county: 'Van Zandt'
    },
    {
      title: '20 Acre Ranch Land',
      description: 'Spacious 20-acre ranch land with creek running through property. Excellent for livestock or recreation.',
      price: 15000,
      acres: 20.0,
      location: 'Cherokee County',
      state: 'Texas',
      county: 'Cherokee'
    },
    {
      title: '3 Acre Wooded Lot',
      description: 'Secluded 3-acre wooded lot with beautiful hardwood trees. Great for hunting or nature lovers.',
      price: 3200,
      acres: 3.0,
      location: 'Anderson County',
      state: 'Texas',
      county: 'Anderson'
    },
    {
      title: '7.5 Acre Corner Lot',
      description: 'Corner lot with great visibility and access. Perfect for commercial or residential development.',
      price: 6800,
      acres: 7.5,
      location: 'Rusk County',
      state: 'Texas',
      county: 'Rusk'
    }
  ];

  for (const prop of properties) {
    await client.query(
      `INSERT INTO properties (title, description, price, acres, location, state, county, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'available')`,
      [prop.title, prop.description, prop.price, prop.acres, prop.location, prop.state, prop.county]
    );
  }

  console.log('✅ Sample properties added');
};

// Export pool for queries
module.exports = {
  pool,
  initDatabase
};