-- ==========================================
-- Digital Village Administration System
-- Database : digital_village
-- ==========================================

CREATE DATABASE IF NOT EXISTS digital_village;
USE digital_village;

-- ==========================================
-- Admin Table
-- ==========================================

DROP TABLE IF EXISTS admin;

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL
);

INSERT INTO admin(username,password)
VALUES
('admin','admin123');

-- ==========================================
-- Citizens Table
-- ==========================================

DROP TABLE IF EXISTS citizens;

CREATE TABLE citizens (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    age INT NOT NULL,

    gender VARCHAR(20),

    mobile VARCHAR(15),

    address TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

INSERT INTO citizens
(name,age,gender,mobile,address)
VALUES
('Ramesh Kumar', 32, 'Male', '9876543210', 'Chennai'),
('Priya Sharma', 28, 'Female', '9876543211', 'Coimbatore'),
('Arun Kumar', 45, 'Male', '9876543212', 'Madurai'),
('Lakshmi Devi', 36, 'Female', '9876543213', 'Salem'),
('Suresh Babu', 41, 'Male', '9876543214', 'Trichy'),
('Meena Rani', 30, 'Female', '9876543215', 'Erode'),
('Karthik Raj', 25, 'Male', '9876543216', 'Vellore'),
('Divya Sri', 27, 'Female', '9876543217', 'Tirunelveli'),
('Manoj Kumar', 39, 'Male', '9876543218', 'Thanjavur'),
('Anitha Devi', 34, 'Female', '9876543219', 'Dindigul');


-- ==========================================
-- Complaints Table
-- ==========================================

DROP TABLE IF EXISTS complaints;

CREATE TABLE complaints(

    id INT AUTO_INCREMENT PRIMARY KEY,

    citizen_name VARCHAR(100),

    complaint TEXT,

    status VARCHAR(30),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

INSERT INTO complaints
(citizen_name,complaint,status)
VALUES
('Ramesh Kumar','Street light not working','Pending'),
('Priya Sharma','Water supply issue','In Progress'),
('Arun Kumar','Road damaged','Resolved');

-- ==========================================
-- Government Schemes
-- ==========================================

DROP TABLE IF EXISTS schemes;

CREATE TABLE schemes(

    id INT AUTO_INCREMENT PRIMARY KEY,

    scheme_name VARCHAR(150),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

INSERT INTO schemes
(scheme_name,description)
VALUES
('PM Awas Yojana','Housing Scheme'),
('MGNREGA','Employment Scheme'),
('Ayushman Bharat','Health Insurance'),
('PM Kisan','Farmer Support');

-- ==========================================
-- Birth Records
-- ==========================================

DROP TABLE IF EXISTS births;

CREATE TABLE births(

    id INT AUTO_INCREMENT PRIMARY KEY,

    child_name VARCHAR(100),

    father_name VARCHAR(100),

    mother_name VARCHAR(100),

    dob DATE,

    village VARCHAR(100)

);

-- ==========================================
-- Death Records
-- ==========================================

DROP TABLE IF EXISTS deaths;

CREATE TABLE deaths(

    id INT AUTO_INCREMENT PRIMARY KEY,

    person_name VARCHAR(100),

    age INT,

    date_of_death DATE,

    cause VARCHAR(255)

);

-- ==========================================
-- Tax Collection
-- ==========================================

DROP TABLE IF EXISTS taxes;

CREATE TABLE taxes(

    id INT AUTO_INCREMENT PRIMARY KEY,

    citizen_name VARCHAR(100),

    tax_type VARCHAR(100),

    amount DECIMAL(10,2),

    payment_date DATE

);

-- ==========================================
-- Certificates
-- ==========================================

DROP TABLE IF EXISTS certificates;

CREATE TABLE certificates(

    id INT AUTO_INCREMENT PRIMARY KEY,

    citizen_name VARCHAR(100),

    certificate_type VARCHAR(100),

    issue_date DATE

);

-- ==========================================
-- Payments (Razorpay Online Transactions)
-- ==========================================

DROP TABLE IF EXISTS payments;

CREATE TABLE payments(

    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100),

    service_name VARCHAR(150),

    amount DECIMAL(10,2),

    razorpay_order_id VARCHAR(100),

    razorpay_payment_id VARCHAR(100),

    payment_status VARCHAR(50),

    payment_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- ==========================================
-- Sample Birth Data
-- ==========================================

INSERT INTO births
(child_name,father_name,mother_name,dob,village)
VALUES
('Rahul','Ramesh Kumar','Anitha','2023-04-10','Chennai');

-- ==========================================
-- Sample Death Data
-- ==========================================

INSERT INTO deaths
(person_name,age,date_of_death,cause)
VALUES
('Mohan',72,'2024-01-15','Natural Causes');

-- ==========================================
-- Sample Tax Data
-- ==========================================

INSERT INTO taxes
(citizen_name,tax_type,amount,payment_date)
VALUES
('Ramesh Kumar','Property Tax',2500,'2025-01-20'),
('Priya Sharma','Water Tax',800,'2025-02-12');

-- ==========================================
-- Sample Certificate Data
-- ==========================================

INSERT INTO certificates
(citizen_name,certificate_type,issue_date)
VALUES
('Arun Kumar','Income Certificate','2025-03-01'),
('Lakshmi Devi','Residence Certificate','2025-04-12');
-- Admin
SELECT * FROM admin
ORDER BY id ASC;

-- Citizens
SELECT * FROM citizens
ORDER BY id ASC;

-- Complaints
SELECT * FROM complaints
ORDER BY id ASC;

-- Schemes
SELECT * FROM schemes
ORDER BY id ASC;

-- Births
SELECT * FROM births
ORDER BY id ASC;

-- Deaths
SELECT * FROM deaths
ORDER BY id ASC;

-- Taxes
SELECT * FROM taxes
ORDER BY id ASC;

-- Certificates
SELECT * FROM certificates
ORDER BY id ASC;

-- ==========================================
-- END OF DATABASE
-- ==========================================