-- ========================================================
-- BinmarDrive Vehicle Marketplace Database Schema (MySQL)
-- ========================================================

CREATE DATABASE IF NOT EXISTS binmardrive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE binmardrive_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('individual', 'company', 'admin') NOT NULL DEFAULT 'individual',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    company_name VARCHAR(255),
    trade_license VARCHAR(255),
    trade_license_doc VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    country VARCHAR(100) DEFAULT 'United Arab Emirates',
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicle Listings Table
CREATE TABLE IF NOT EXISTS listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(255) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    fuel VARCHAR(50) DEFAULT 'Petrol',
    mileage VARCHAR(50) DEFAULT '0 km',
    transmission VARCHAR(50) DEFAULT 'Automatic',
    condition_type ENUM('new', 'used') NOT NULL DEFAULT 'new',
    listing_type ENUM('sale', 'rent') NOT NULL DEFAULT 'sale',
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'AED',
    price_label VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    contact_preference VARCHAR(50) DEFAULT 'WhatsApp',
    contact_phone VARCHAR(50),
    description TEXT,
    images JSON,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_make (make),
    INDEX idx_country (country),
    INDEX idx_type (listing_type),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Notifications Table (Admin & Seller alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    type VARCHAR(50) DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- Seed Initial Data
-- ========================================================

-- Admin user
INSERT INTO users (user_type, name, email, phone, password_hash, status, country)
VALUES ('admin', 'Binmar Admin', 'admin@binmardrive.com', '+971500000000', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1qV8t2bZ6LgGjJdYvP7aK1rC9OqGqy', 'approved', 'United Arab Emirates')
ON DUPLICATE KEY UPDATE name=name;

-- Sample Verified Dealer
INSERT INTO users (user_type, name, email, phone, company_name, trade_license, status, country, city)
VALUES ('company', 'Prestige Auto Gallery', 'prestige@dealers.ae', '+971501234567', 'Prestige Auto Gallery', 'CN-9821455', 'approved', 'United Arab Emirates', 'Dubai')
ON DUPLICATE KEY UPDATE name=name;

-- Sample Pending Dealers (for Dealer Verification queue)
INSERT INTO users (user_type, name, email, phone, company_name, trade_license, status, country)
VALUES 
('company', 'Al Rasheed Motors', 'contact@alrasheed.sa', '+966501234567', 'Al Rasheed Motors', 'CN-2214590', 'pending', 'Saudi Arabia'),
('company', 'Frontier Auto Trading', 'info@frontier.ae', '+971507654321', 'Frontier Auto Trading', 'CN-4471902', 'pending', 'United Arab Emirates')
ON DUPLICATE KEY UPDATE name=name;

-- Sample Live Listings (Approved)
INSERT INTO listings (title, make, model, year, category, fuel, mileage, transmission, condition_type, listing_type, price, currency, price_label, country, city, seller_name, contact_preference, contact_phone, description, status)
VALUES
('2024 Toyota Land Cruiser', 'Toyota', 'Land Cruiser', 2024, 'SUV', 'Petrol', '1,200 km', 'Automatic', 'new', 'sale', 385000, 'AED', 'AED 385,000', 'United Arab Emirates', 'Abu Dhabi', 'Individual', 'WhatsApp', '+971501234567', 'Single owner, GCC specs, full agency service history. Immaculate condition, no accidents.', 'approved'),
('2019 Nissan Patrol', 'Nissan', 'Patrol', 2019, 'SUV', 'Petrol', '86,000 km', 'Automatic', 'used', 'sale', 165000, 'SAR', 'SAR 165,000', 'Saudi Arabia', 'Riyadh', 'Al Rasheed Motors', 'WhatsApp', '+966501234567', 'Dealer-maintained, recent service, new tyres. Ready for immediate viewing.', 'approved'),
('2021 Mercedes-Benz G63', 'Mercedes-Benz', 'G63', 2021, 'Luxury', 'Petrol', '24,500 km', 'Automatic', 'used', 'sale', 890000, 'QAR', 'QAR 890,000', 'Qatar', 'Doha', 'Prestige Auto Gallery', 'Phone call', '+97455123456', 'AMG package, ceramic coating, one of the cleanest examples on the market.', 'approved'),
('2023 Lexus LX 600', 'Lexus', 'LX 600', 2023, 'SUV', 'Petrol', '4,800 km', 'Automatic', 'new', 'sale', 460000, 'AED', 'AED 460,000', 'United Arab Emirates', 'Dubai', 'Individual', 'WhatsApp', '+971509988776', 'Barely used, still under warranty. Selling due to relocation.', 'approved'),
('2022 Ford F-150 Raptor', 'Ford', 'F-150 Raptor', 2022, 'Pickup', 'Petrol', '31,000 km', 'Automatic', 'used', 'sale', 210000, 'AED', 'AED 210,000', 'United Arab Emirates', 'Sharjah', 'Desert Trucks LLC', 'Phone call', '+971503344556', 'Desert-ready, off-road package, recent inspection passed with no faults.', 'approved'),
('2023 BMW X5', 'BMW', 'X5', 2023, 'SUV', 'Petrol', '12,000 km', 'Automatic', 'new', 'rent', 45, 'OMR', 'OMR 45 / day', 'Oman', 'Muscat', 'Oasis Rent a Car', 'WhatsApp', '+96891234567', 'Available for daily or weekly rental. Insurance and delivery included.', 'approved'),
('2021 Toyota Camry', 'Toyota', 'Camry', 2021, 'Sedan', 'Petrol', '52,000 km', 'Automatic', 'used', 'sale', 6200, 'KWD', 'KWD 6,200', 'Kuwait', 'Kuwait City', 'Individual', 'WhatsApp', '+96590123456', 'Well maintained, no mechanical issues, all documents up to date.', 'approved'),
('2019 Chevrolet Tahoe', 'Chevrolet', 'Tahoe', 2019, 'SUV', 'Petrol', '71,000 km', 'Automatic', 'used', 'sale', 98000, 'SAR', 'SAR 98,000', 'Saudi Arabia', 'Dammam', 'Eastern Auto Trading', 'Phone call', '+966551234567', 'Spacious family SUV, third-row seating, recently serviced.', 'approved'),
('2020 Range Rover Sport', 'Land Rover', 'Range Rover Sport', 2020, 'Luxury', 'Diesel', '44,000 km', 'Automatic', 'used', 'sale', 21500, 'BHD', 'BHD 21,500', 'Bahrain', 'Manama', 'Individual', 'WhatsApp', '+97339123456', 'HSE trim, panoramic roof, well cared for, minor curb rash on one wheel.', 'approved'),
('2024 BMW 3 Series', 'BMW', '3 Series', 2024, 'Sedan', 'Petrol', '2,100 km', 'Automatic', 'new', 'rent', 180, 'AED', 'AED 180 / day', 'United Arab Emirates', 'Dubai', 'Gulf Premium Cars', 'WhatsApp', '+971556677889', 'Monthly rates available on request. Comprehensive insurance included.', 'approved'),
('2018 Toyota Hilux', 'Toyota', 'Hilux', 2018, 'Pickup', 'Diesel', '98,000 km', 'Manual', 'used', 'sale', 32000, 'OMR', 'OMR 32,000', 'Oman', 'Salalah', 'Individual', 'Phone call', '+96898765432', 'Reliable workhorse, recently serviced, new clutch fitted.', 'approved'),
('2022 Porsche 911', 'Porsche', '911', 2022, 'Luxury', 'Petrol', '9,300 km', 'Automatic', 'used', 'sale', 610000, 'AED', 'AED 610,000', 'United Arab Emirates', 'Dubai', 'Prestige Auto Gallery', 'WhatsApp', '+971501234567', 'Carrera S, PDK gearbox, sport chrono package, showroom condition.', 'approved')
ON DUPLICATE KEY UPDATE title=title;

-- Sample Pending Listings (in Moderation Queue)
INSERT INTO listings (title, make, model, year, category, fuel, mileage, transmission, condition_type, listing_type, price, currency, price_label, country, city, seller_name, contact_preference, contact_phone, description, status)
VALUES
('2022 Nissan Altima', 'Nissan', 'Altima', 2022, 'Sedan', 'Petrol', '28,000 km', 'Automatic', 'used', 'sale', 58000, 'QAR', 'QAR 58,000', 'Qatar', 'Doha', 'Individual', 'WhatsApp', '+97455998877', 'Single owner, low mileage, still under manufacturer warranty.', 'pending'),
('2020 Jeep Wrangler', 'Jeep', 'Wrangler', 2020, 'SUV', 'Petrol', '41,000 km', 'Manual', 'used', 'sale', 96000, 'AED', 'AED 96,000', 'United Arab Emirates', 'Ras Al Khaimah', 'Frontier Auto Trading', 'Phone call', '+971507654321', 'Off-road ready, roll cage, upgraded suspension.', 'pending')
ON DUPLICATE KEY UPDATE title=title;

-- Sample Notifications
INSERT INTO notifications (title, message, is_read)
VALUES
('New Dealer Registration', 'Al Rasheed Motors submitted trade license for verification.', FALSE),
('New Listing Submitted', '2022 Nissan Altima submitted by seller for review.', FALSE),
('New Listing Submitted', '2020 Jeep Wrangler submitted by Frontier Auto Trading.', FALSE);
