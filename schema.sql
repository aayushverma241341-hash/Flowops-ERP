-- SQL Scripts for Database Creation

-- Create Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'HR Manager', 'Site Manager', 'Accountant'))
);

-- Insert a default admin user (password is 'admin123')
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2a$10$xyz...', 'Admin') -- Will hash properly in backend script, or just add a seed script later
ON CONFLICT (username) DO NOTHING;

-- Core Entities

CREATE TABLE IF NOT EXISTS employees (
    employee_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    date_of_birth DATE,
    uan_no VARCHAR(50),
    esic_no VARCHAR(50),
    bank_account_no VARCHAR(100),
    ifsc_no VARCHAR(20),
    mobile_no VARCHAR(20),
    aadhar_no VARCHAR(20) UNIQUE,
    post VARCHAR(100),
    category VARCHAR(50) CHECK (category IN ('Skilled', 'Unskilled', 'Semi-Skilled', 'Highly-Skilled', 'Other'))
);

CREATE TABLE IF NOT EXISTS work_orders (
    wo_no VARCHAR(100) PRIMARY KEY,
    issue_date DATE NOT NULL,
    end_date DATE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS sites (
    site_id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    wo_no VARCHAR(100) REFERENCES work_orders(wo_no) ON DELETE SET NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    max_employees INTEGER,
    location TEXT
);

-- Relationships

CREATE TABLE IF NOT EXISTS site_employees (
    site_id INTEGER REFERENCES sites(site_id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    date_assigned DATE DEFAULT CURRENT_DATE,
    date_removed DATE,
    PRIMARY KEY (site_id, employee_id)
);

-- Attendance Module

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Leave', 'Half-Day')),
    site_id INTEGER REFERENCES sites(site_id) ON DELETE SET NULL,
    UNIQUE(employee_id, date) -- An employee has one attendance record per day
);

-- Billing Module

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id SERIAL PRIMARY KEY,
    wo_no VARCHAR(100) REFERENCES work_orders(wo_no) ON DELETE SET NULL,
    site_id INTEGER REFERENCES sites(site_id) ON DELETE SET NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Paid', 'Unpaid', 'Partially Paid')) DEFAULT 'Unpaid'
);

CREATE TABLE IF NOT EXISTS invoice_details (
    invoice_detail_id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    rate DECIMAL(15, 2) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL
);

-- Salary Module

CREATE TABLE IF NOT EXISTS salaries (
    salary_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL, -- e.g., 'January 2024'
    basic_salary DECIMAL(15, 2) NOT NULL,
    allowances DECIMAL(15, 2) DEFAULT 0.00,
    deductions DECIMAL(15, 2) DEFAULT 0.00,
    net_salary DECIMAL(15, 2) NOT NULL,
    payment_status VARCHAR(50) CHECK (payment_status IN ('Paid', 'Pending')) DEFAULT 'Pending',
    payment_date DATE
);
