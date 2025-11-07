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
        acquisition_cost DECIMAL,
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
        alerts_disabled BOOLEAN DEFAULT FALSE,
        default_date DATE,
        recovery_costs DECIMAL,
        net_recovery DECIMAL,
        default_notes TEXT,
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
        payment_method TEXT DEFAULT 'square',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        loan_payment_amount DECIMAL DEFAULT 0,
        tax_amount DECIMAL DEFAULT 0,
        hoa_amount DECIMAL DEFAULT 0,
        late_fee_amount DECIMAL DEFAULT 0,
        notice_fee_amount DECIMAL DEFAULT 0,
        postal_fee_amount DECIMAL DEFAULT 0,
        square_processing_fee DECIMAL DEFAULT 0,
        convenience_fee DECIMAL DEFAULT 0,
        principal_amount DECIMAL DEFAULT 0,
        interest_amount DECIMAL DEFAULT 0
      )
    `);

 // Add missing columns to payments table if they don't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='payment_method') THEN
          ALTER TABLE payments ADD COLUMN payment_method TEXT DEFAULT 'square';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='loan_payment_amount') THEN
          ALTER TABLE payments ADD COLUMN loan_payment_amount DECIMAL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='tax_amount') THEN
          ALTER TABLE payments ADD COLUMN tax_amount DECIMAL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='hoa_amount') THEN
          ALTER TABLE payments ADD COLUMN hoa_amount DECIMAL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='late_fee_amount') THEN
          ALTER TABLE payments ADD COLUMN late_fee_amount DECIMAL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='notice_fee_amount') THEN
          ALTER TABLE payments ADD COLUMN notice_fee_amount DECIMAL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='postal_fee_amount') THEN
          ALTER TABLE payments ADD COLUMN postal_fee_amount DECIMAL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='square_processing_fee') THEN
          ALTER TABLE payments ADD COLUMN square_processing_fee DECIMAL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='convenience_fee') THEN
          ALTER TABLE payments ADD COLUMN convenience_fee DECIMAL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='principal_amount') THEN
          ALTER TABLE payments ADD COLUMN principal_amount DECIMAL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='interest_amount') THEN
          ALTER TABLE payments ADD COLUMN interest_amount DECIMAL DEFAULT 0;
        END IF;
      END $$;
    `);

// Admin users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add default admin user if none exist
    const adminResult = await client.query('SELECT COUNT(*) FROM admin_users');
    if (parseInt(adminResult.rows[0].count) === 0) {
      await addDefaultAdmin(client);
    }

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

// Add default admin user
const addDefaultAdmin = async (client) => {
  const bcrypt = require('bcryptjs');
  
  // Admin credentials from environment variables
  const defaultAdmin = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_DEFAULT_PASSWORD,
    firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
    lastName: process.env.ADMIN_LAST_NAME || 'User'
  };

  // Validate required environment variables
  if (!defaultAdmin.email || !defaultAdmin.password) {
    console.log('⚠️  Skipping default admin creation - ADMIN_EMAIL and ADMIN_DEFAULT_PASSWORD not set in environment');
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);

  // Insert default admin
  await client.query(
    `INSERT INTO admin_users (email, password, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, 'admin')`,
    [defaultAdmin.email, hashedPassword, defaultAdmin.firstName, defaultAdmin.lastName]
  );

  console.log('✅ Default admin user created');
  console.log('   Email:', defaultAdmin.email);
  console.log('   ⚠️  Password set from environment variable (not displayed for security)');
};

// Export pool for queries
module.exports = {
  pool,
  initDatabase
};