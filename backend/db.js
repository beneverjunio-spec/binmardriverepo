const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'binmardrive_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

// In-memory fallback dataset in case MySQL is not running yet
let memoryState = {
  users: [
    { id: 1, user_type: 'admin', name: 'Binmar Admin', email: 'admin@binmardrive.com', phone: '+971500000000', company_name: null, trade_license: null, status: 'approved', country: 'United Arab Emirates', city: 'Abu Dhabi', created_at: new Date() },
    { id: 2, user_type: 'company', name: 'Prestige Auto Gallery', email: 'prestige@dealers.ae', phone: '+971501234567', company_name: 'Prestige Auto Gallery', trade_license: 'CN-9821455', status: 'approved', country: 'United Arab Emirates', city: 'Dubai', created_at: new Date() },
    { id: 3, user_type: 'company', name: 'Al Rasheed Motors', email: 'contact@alrasheed.sa', phone: '+966501234567', company_name: 'Al Rasheed Motors', trade_license: 'CN-2214590', status: 'pending', country: 'Saudi Arabia', city: 'Riyadh', created_at: new Date() },
    { id: 4, user_type: 'company', name: 'Frontier Auto Trading', email: 'info@frontier.ae', phone: '+971507654321', company_name: 'Frontier Auto Trading', trade_license: 'CN-4471902', status: 'pending', country: 'United Arab Emirates', city: 'Ras Al Khaimah', created_at: new Date() }
  ],
  listings: [
    { id: 1, title: '2024 Toyota Land Cruiser', make: 'Toyota', model: 'Land Cruiser', year: 2024, category: 'SUV', fuel: 'Petrol', mileage: '1,200 km', transmission: 'Automatic', condition_type: 'new', listing_type: 'sale', price: 385000, currency: 'AED', price_label: 'AED 385,000', country: 'United Arab Emirates', city: 'Abu Dhabi', seller_name: 'Individual', contact_preference: 'WhatsApp', contact_phone: '+971501234567', description: 'Single owner, GCC specs, full agency service history. Immaculate condition, no accidents.', status: 'approved', created_at: new Date() },
    { id: 2, title: '2019 Nissan Patrol', make: 'Nissan', model: 'Patrol', year: 2019, category: 'SUV', fuel: 'Petrol', mileage: '86,000 km', transmission: 'Automatic', condition_type: 'used', listing_type: 'sale', price: 165000, currency: 'SAR', price_label: 'SAR 165,000', country: 'Saudi Arabia', city: 'Riyadh', seller_name: 'Al Rasheed Motors', contact_preference: 'WhatsApp', contact_phone: '+966501234567', description: 'Dealer-maintained, recent service, new tyres. Ready for immediate viewing.', status: 'approved', created_at: new Date() },
    { id: 3, title: '2021 Mercedes-Benz G63', make: 'Mercedes-Benz', model: 'G63', year: 2021, category: 'Luxury', fuel: 'Petrol', mileage: '24,500 km', transmission: 'Automatic', condition_type: 'used', listing_type: 'sale', price: 890000, currency: 'QAR', price_label: 'QAR 890,000', country: 'Qatar', city: 'Doha', seller_name: 'Prestige Auto Gallery', contact_preference: 'Phone call', contact_phone: '+97455123456', description: 'AMG package, ceramic coating, one of the cleanest examples on the market.', status: 'approved', created_at: new Date() },
    { id: 4, title: '2023 Lexus LX 600', make: 'Lexus', model: 'LX 600', year: 2023, category: 'SUV', fuel: 'Petrol', mileage: '4,800 km', transmission: 'Automatic', condition_type: 'new', listing_type: 'sale', price: 460000, currency: 'AED', price_label: 'AED 460,000', country: 'United Arab Emirates', city: 'Dubai', seller_name: 'Individual', contact_preference: 'WhatsApp', contact_phone: '+971509988776', description: 'Barely used, still under warranty. Selling due to relocation.', status: 'approved', created_at: new Date() },
    { id: 5, title: '2022 Ford F-150 Raptor', make: 'Ford', model: 'F-150 Raptor', year: 2022, category: 'Pickup', fuel: 'Petrol', mileage: '31,000 km', transmission: 'Automatic', condition_type: 'used', listing_type: 'sale', price: 210000, currency: 'AED', price_label: 'AED 210,000', country: 'United Arab Emirates', city: 'Sharjah', seller_name: 'Desert Trucks LLC', contact_preference: 'Phone call', contact_phone: '+971503344556', description: 'Desert-ready, off-road package, recent inspection passed with no faults.', status: 'approved', created_at: new Date() },
    { id: 6, title: '2023 BMW X5', make: 'BMW', model: 'X5', year: 2023, category: 'SUV', fuel: 'Petrol', mileage: '12,000 km', transmission: 'Automatic', condition_type: 'new', listing_type: 'rent', price: 45, currency: 'OMR', price_label: 'OMR 45 / day', country: 'Oman', city: 'Muscat', seller_name: 'Oasis Rent a Car', contact_preference: 'WhatsApp', contact_phone: '+96891234567', description: 'Available for daily or weekly rental. Insurance and delivery included.', status: 'approved', created_at: new Date() },
    { id: 7, title: '2021 Toyota Camry', make: 'Toyota', model: 'Camry', year: 2021, category: 'Sedan', fuel: 'Petrol', mileage: '52,000 km', transmission: 'Automatic', condition_type: 'used', listing_type: 'sale', price: 6200, currency: 'KWD', price_label: 'KWD 6,200', country: 'Kuwait', city: 'Kuwait City', seller_name: 'Individual', contact_preference: 'WhatsApp', contact_phone: '+96590123456', description: 'Well maintained, no mechanical issues, all documents up to date.', status: 'approved', created_at: new Date() },
    { id: 8, title: '2019 Chevrolet Tahoe', make: 'Chevrolet', model: 'Tahoe', year: 2019, category: 'SUV', fuel: 'Petrol', mileage: '71,000 km', transmission: 'Automatic', condition_type: 'used', listing_type: 'sale', price: 98000, currency: 'SAR', price_label: 'SAR 98,000', country: 'Saudi Arabia', city: 'Dammam', seller_name: 'Eastern Auto Trading', contact_preference: 'Phone call', contact_phone: '+966551234567', description: 'Spacious family SUV, third-row seating, recently serviced.', status: 'approved', created_at: new Date() },
    { id: 9, title: '2020 Range Rover Sport', make: 'Land Rover', model: 'Range Rover Sport', year: 2020, category: 'Luxury', fuel: 'Diesel', mileage: '44,000 km', transmission: 'Automatic', condition_type: 'used', listing_type: 'sale', price: 21500, currency: 'BHD', price_label: 'BHD 21,500', country: 'Bahrain', city: 'Manama', seller_name: 'Individual', contact_preference: 'WhatsApp', contact_phone: '+97339123456', description: 'HSE trim, panoramic roof, well cared for, minor curb rash on one wheel.', status: 'approved', created_at: new Date() },
    { id: 10, title: '2024 BMW 3 Series', make: 'BMW', model: '3 Series', year: 2024, category: 'Sedan', fuel: 'Petrol', mileage: '2,100 km', transmission: 'Automatic', condition_type: 'new', listing_type: 'rent', price: 180, currency: 'AED', price_label: 'AED 180 / day', country: 'United Arab Emirates', city: 'Dubai', seller_name: 'Gulf Premium Cars', contact_preference: 'WhatsApp', contact_phone: '+971556677889', description: 'Monthly rates available on request. Comprehensive insurance included.', status: 'approved', created_at: new Date() },
    { id: 11, title: '2018 Toyota Hilux', make: 'Toyota', model: 'Hilux', year: 2018, category: 'Pickup', fuel: 'Diesel', mileage: '98,000 km', transmission: 'Manual', condition_type: 'used', listing_type: 'sale', price: 32000, currency: 'OMR', price_label: 'OMR 32,000', country: 'Oman', city: 'Salalah', seller_name: 'Individual', contact_preference: 'Phone call', contact_phone: '+96898765432', description: 'Reliable workhorse, recently serviced, new clutch fitted.', status: 'approved', created_at: new Date() },
    { id: 12, title: '2022 Porsche 911', make: 'Porsche', model: '911', year: 2022, category: 'Luxury', fuel: 'Petrol', mileage: '9,300 km', transmission: 'Automatic', condition_type: 'used', listing_type: 'sale', price: 610000, currency: 'AED', price_label: 'AED 610,000', country: 'United Arab Emirates', city: 'Dubai', seller_name: 'Prestige Auto Gallery', contact_preference: 'WhatsApp', contact_phone: '+971501234567', description: 'Carrera S, PDK gearbox, sport chrono package, showroom condition.', status: 'approved', created_at: new Date() },
    // Moderation queue items
    { id: 50, title: '2022 Nissan Altima', make: 'Nissan', model: 'Altima', year: 2022, category: 'Sedan', fuel: 'Petrol', mileage: '28,000 km', transmission: 'Automatic', condition_type: 'used', listing_type: 'sale', price: 58000, currency: 'QAR', price_label: 'QAR 58,000', country: 'Qatar', city: 'Doha', seller_name: 'Individual', contact_preference: 'WhatsApp', contact_phone: '+97455998877', description: 'Single owner, low mileage, still under manufacturer warranty.', status: 'pending', created_at: new Date() },
    { id: 51, title: '2020 Jeep Wrangler', make: 'Jeep', model: 'Wrangler', year: 2020, category: 'SUV', fuel: 'Petrol', mileage: '41,000 km', transmission: 'Manual', condition_type: 'used', listing_type: 'sale', price: 96000, currency: 'AED', price_label: 'AED 96,000', country: 'United Arab Emirates', city: 'Ras Al Khaimah', seller_name: 'Frontier Auto Trading', contact_preference: 'Phone call', contact_phone: '+971507654321', description: 'Off-road ready, roll cage, upgraded suspension.', status: 'pending', created_at: new Date() }
  ],
  notifications: [
    { id: 1, user_id: null, type: 'dealer', title: 'New Dealer Registration', message: 'Al Rasheed Motors submitted trade license for verification.', is_read: false, created_at: new Date() },
    { id: 2, user_id: null, type: 'listing', title: 'New Listing Submitted', message: '2022 Nissan Altima submitted by seller for review.', is_read: false, created_at: new Date() },
    { id: 3, user_id: null, type: 'listing', title: 'New Listing Submitted', message: '2020 Jeep Wrangler submitted by Frontier Auto Trading.', is_read: false, created_at: new Date() }
  ],
  nextId: 200
};

// Initialize connection
async function initDB() {
  try {
    // Attempt connecting to MySQL server directly
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    // Create database if it does not exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();

    // Now establish connection pool with the database
    pool = mysql.createPool(dbConfig);
    const [test] = await pool.query('SELECT 1 + 1 AS result');
    if (test) {
      isConnected = true;
      console.log(`[BinmarDrive DB] Successfully connected to MySQL database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
      
      // Auto-run schema to ensure tables are created
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        // Split and execute statements
        const statements = schemaSQL.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
        for (const statement of statements) {
          try {
            await pool.query(statement);
          } catch (e) {
            // Ignore duplicate or existing table notices
          }
        }
        console.log('[BinmarDrive DB] MySQL tables verified & initialized.');
      }
    }
  } catch (err) {
    isConnected = false;
    console.warn(`[BinmarDrive DB] MySQL not currently available (${err.message}). Using built-in local store with full seed data.`);
    console.warn(`[BinmarDrive DB] As soon as your MySQL server is running, update backend/.env and restart to store directly into MySQL.`);
  }
}

// Universal Query function
async function query(sql, params = []) {
  if (isConnected && pool) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (err) {
      console.error('[BinmarDrive DB] MySQL Query Error:', err.message);
      throw err;
    }
  }

  // Memory fallback query handling
  return handleMemoryQuery(sql, params);
}

function handleMemoryQuery(sql, params) {
  const normalized = sql.trim().toLowerCase();

  // SELECT listings
  if (normalized.startsWith('select') && normalized.includes('from listings')) {
    let rows = [...memoryState.listings];
    if (normalized.includes("status = 'approved'") || normalized.includes('status = ?') && params.includes('approved')) {
      rows = rows.filter(r => r.status === 'approved');
    } else if (normalized.includes("status = 'pending'") || normalized.includes('status = ?') && params.includes('pending')) {
      rows = rows.filter(r => r.status === 'pending');
    }
    return rows;
  }

  // SELECT users
  if (normalized.startsWith('select') && normalized.includes('from users')) {
    let rows = [...memoryState.users];
    if (params[0]) {
      const p = String(params[0]).toLowerCase();
      rows = rows.filter(u => (u.email && u.email.toLowerCase() === p) || (u.name && u.name.toLowerCase() === p));
    }
    return rows;
  }

  // SELECT notifications
  if (normalized.startsWith('select') && normalized.includes('from notifications')) {
    return [...memoryState.notifications].sort((a,b) => b.id - a.id);
  }

  // INSERT INTO listings
  if (normalized.startsWith('insert into listings')) {
    const newId = memoryState.nextId++;
    const newListing = {
      id: newId,
      title: params[0] || 'Vehicle Listing',
      make: params[1],
      model: params[2],
      year: params[3],
      category: params[4],
      fuel: params[5],
      mileage: params[6],
      transmission: params[7],
      condition_type: params[8],
      listing_type: params[9],
      price: params[10],
      currency: params[11],
      price_label: params[12] || `${params[11]} ${Number(params[10]).toLocaleString()}${params[9] === 'rent' ? ' / day' : ''}`,
      country: params[13] || 'United Arab Emirates',
      city: params[14] || 'Abu Dhabi',
      seller_name: params[15] || 'Individual',
      contact_preference: params[16] || 'WhatsApp',
      contact_phone: params[17] || '+971501234567',
      description: params[18] || 'Clean vehicle, well maintained.',
      images: params[19] ? (typeof params[19] === 'string' ? JSON.parse(params[19]) : params[19]) : [],
      status: 'pending',
      created_at: new Date()
    };
    memoryState.listings.unshift(newListing);
    memoryState.notifications.unshift({
      id: memoryState.nextId++,
      user_id: null,
      type: 'listing',
      title: 'New Listing Submitted',
      message: `${newListing.title} was submitted for review.`,
      is_read: false,
      created_at: new Date()
    });
    return { insertId: newId };
  }

  // UPDATE listings status (approve / reject)
  if (normalized.startsWith('update listings set status')) {
    const status = params[0];
    const id = parseInt(params[1], 10);
    const item = memoryState.listings.find(l => l.id === id);
    if (item) item.status = status;
    return { affectedRows: 1 };
  }

  // DELETE FROM listings
  if (normalized.startsWith('delete from listings')) {
    const id = parseInt(params[0], 10);
    memoryState.listings = memoryState.listings.filter(l => l.id !== id);
    return { affectedRows: 1 };
  }

  // INSERT INTO users
  if (normalized.startsWith('insert into users')) {
    const newId = memoryState.nextId++;
    const newUser = {
      id: newId,
      user_type: params[0],
      name: params[1],
      email: params[2],
      phone: params[3],
      password_hash: params[4],
      company_name: params[5],
      trade_license: params[6],
      trade_license_doc: params[7] || null,
      status: params[8] || 'approved',
      country: params[9],
      city: params[10] || '',
      created_at: new Date()
    };
    memoryState.users.push(newUser);
    if (newUser.user_type === 'company') {
      memoryState.notifications.unshift({
        id: memoryState.nextId++,
        user_id: null,
        type: 'dealer',
        title: 'New Dealer Registration',
        message: `${newUser.company_name} submitted trade license for verification.`,
        is_read: false,
        created_at: new Date()
      });
    }
    return { insertId: newId };
  }

  // UPDATE users status (dealer verify / reject)
  if (normalized.startsWith('update users set status')) {
    const status = params[0];
    const id = parseInt(params[1], 10);
    const user = memoryState.users.find(u => u.id === id);
    if (user) user.status = status;
    return { affectedRows: 1 };
  }

  return [];
}

module.exports = {
  initDB,
  query,
  getIsConnected: () => isConnected,
  getMemoryState: () => memoryState
};
