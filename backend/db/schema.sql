-- Drop tables if they exist
DROP TABLE IF EXISTS employee_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS asset_categories CASCADE;

-- Create Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Departments
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    head_count INT DEFAULT 0,
    asset_count INT DEFAULT 0,
    manager VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Employees
CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    department VARCHAR(100),
    role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    join_date DATE DEFAULT CURRENT_DATE,
    allocated_assets INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Employee Roles Junction
CREATE TABLE employee_roles (
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, role_id)
);

-- Create Asset Categories
CREATE TABLE asset_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    asset_count INT DEFAULT 0,
    icon VARCHAR(50) DEFAULT 'Monitor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Assets
CREATE TABLE assets (
    id VARCHAR(50) PRIMARY KEY,
    tag VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Available',
    condition VARCHAR(50) DEFAULT 'Good',
    department VARCHAR(100),
    assigned_to VARCHAR(100),
    assigned_to_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
    purchase_date DATE NOT NULL,
    purchase_value NUMERIC(15, 2) DEFAULT 0.00 CHECK (purchase_value >= 0),
    current_value NUMERIC(15, 2) DEFAULT 0.00 CHECK (current_value >= 0),
    location VARCHAR(255),
    serial_number VARCHAR(100) UNIQUE,
    description TEXT,
    warranty_expiry DATE,
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_audit_date DATE,
    timeline JSONB DEFAULT '[]'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_assets_tag ON assets(tag);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);

-- Insert Roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'System Administrator with full access'),
('ASSET_MANAGER', 'Manages company assets and inventory'),
('DEPARTMENT_HEAD', 'Manages department allocations and approvals'),
('EMPLOYEE', 'Standard employee with view-only or request permissions');

-- Insert Departments
INSERT INTO departments (id, name, head_count, asset_count, manager) VALUES
('dept-01', 'IT Operations', 24, 87, 'James Torres'),
('dept-02', 'Human Resources', 12, 31, 'Linda Park'),
('dept-03', 'Engineering', 45, 142, 'Raj Sharma'),
('dept-04', 'Finance', 18, 44, 'Carol West'),
('dept-05', 'Marketing', 15, 39, 'Priya Nair'),
('dept-06', 'Sales', 30, 65, 'Mike Johnson'),
('dept-07', 'Operations', 20, 58, 'Anna Rivera');

-- Insert Categories
INSERT INTO asset_categories (id, name, description, asset_count, icon) VALUES
('cat-01', 'IT Equipment', 'Laptops, desktops, peripherals', 185, 'Monitor'),
('cat-02', 'Furniture', 'Desks, chairs, storage units', 94, 'Armchair'),
('cat-03', 'Vehicles', 'Company cars and vans', 12, 'Car'),
('cat-04', 'Office Equipment', 'Printers, scanners, projectors', 47, 'Printer'),
('cat-05', 'Software License', 'Enterprise software licenses', 63, 'FileCode'),
('cat-06', 'Lab Equipment', 'Testing and research tools', 28, 'FlaskConical'),
('cat-07', 'Audio/Visual', 'Cameras, microphones, displays', 31, 'Video');

-- Insert Employees (password is password123)
INSERT INTO employees (id, name, email, password_hash, department, role, status, join_date, allocated_assets) VALUES
('emp-001', 'Sarah Mitchell', 'sarah.m@acme.com', '$2a$10$EtgGDe8crxcEmdbhzXce1Os8MU3dnA141AZ.mkEeg20n1smYgQejG', 'IT Operations', 'Asset Manager', 'Active', '2021-03-15', 3),
('emp-002', 'James Torres', 'james.t@acme.com', '$2a$10$EtgGDe8crxcEmdbhzXce1Os8MU3dnA141AZ.mkEeg20n1smYgQejG', 'IT Operations', 'IT Lead', 'Active', '2019-07-22', 4),
('emp-003', 'Linda Park', 'linda.p@acme.com', '$2a$10$EtgGDe8crxcEmdbhzXce1Os8MU3dnA141AZ.mkEeg20n1smYgQejG', 'Human Resources', 'HR Manager', 'Active', '2020-01-10', 2),
('emp-004', 'Raj Sharma', 'raj.s@acme.com', '$2a$10$EtgGDe8crxcEmdbhzXce1Os8MU3dnA141AZ.mkEeg20n1smYgQejG', 'Engineering', 'Senior Engineer', 'Active', '2018-11-05', 5),
('emp-005', 'Carol West', 'carol.w@acme.com', '$2a$10$EtgGDe8crxcEmdbhzXce1Os8MU3dnA141AZ.mkEeg20n1smYgQejG', 'Finance', 'CFO', 'Active', '2017-04-18', 2),
('emp-006', 'Priya Nair', 'priya.n@acme.com', '$2a$10$EtgGDe8crxcEmdbhzXce1Os8MU3dnA141AZ.mkEeg20n1smYgQejG', 'Marketing', 'Marketing Head', 'Active', '2022-02-28', 3),
('emp-007', 'Mike Johnson', 'mike.j@acme.com', '$2a$10$EtgGDe8crxcEmdbhzXce1Os8MU3dnA141AZ.mkEeg20n1smYgQejG', 'Sales', 'Sales Director', 'Active', '2020-09-14', 2),
('emp-008', 'Anna Rivera', 'anna.r@acme.com', '$2a$10$EtgGDe8crxcEmdbhzXce1Os8MU3dnA141AZ.mkEeg20n1smYgQejG', 'Operations', 'Operations Manager', 'On Leave', '2021-06-01', 1);

-- Map Employee Roles
INSERT INTO employee_roles (employee_id, role_id) VALUES
('emp-001', 2), ('emp-001', 4),
('emp-002', 3), ('emp-002', 4),
('emp-003', 3), ('emp-003', 4),
('emp-004', 4),
('emp-005', 3), ('emp-005', 4),
('emp-006', 3), ('emp-006', 4),
('emp-007', 3), ('emp-007', 4),
('emp-008', 4);

-- Insert Assets
INSERT INTO assets (id, tag, name, category, status, condition, department, assigned_to, assigned_to_id, purchase_date, purchase_value, current_value, location, serial_number, description, warranty_expiry, registered_date, last_audit_date, timeline) VALUES
('ast-001', 'AF-LAPT-0001', 'Dell XPS 15 Laptop', 'IT Equipment', 'Allocated', 'Good', 'IT Operations', 'James Torres', 'emp-002', '2022-03-10', 1800.00, 1350.00, 'Building A, Floor 2', 'DLL-XPS-98231', '16GB RAM, 512GB SSD, Intel i7', '2025-03-10', '2022-03-12 10:00:00', '2024-01-15', '[{"status": "Registered", "date": "2022-03-12T10:00:00Z", "note": "Asset added to inventory", "by": "Sarah Mitchell"}, {"status": "Available", "date": "2022-03-13T09:00:00Z", "note": "Ready for allocation", "by": "System"}, {"status": "Allocated", "date": "2022-03-15T14:00:00Z", "note": "Allocated to James Torres", "by": "Sarah Mitchell"}]'::jsonb),
('ast-002', 'AF-DSKP-0002', 'HP EliteDesk 800 Desktop', 'IT Equipment', 'Available', 'Excellent', NULL, NULL, NULL, '2023-01-20', 950.00, 850.00, 'IT Store Room', 'HP-ELD-45721', '8GB RAM, 256GB SSD, Intel i5', '2026-01-20', '2023-01-22 09:00:00', '2024-01-15', '[{"status": "Registered", "date": "2023-01-22T09:00:00Z", "note": "Asset added to inventory", "by": "Sarah Mitchell"}, {"status": "Available", "date": "2023-01-22T09:00:00Z", "note": "Ready for allocation", "by": "System"}]'::jsonb),
('ast-003', 'AF-PRNT-0003', 'Canon imageCLASS Printer', 'Office Equipment', 'Under Maintenance', 'Fair', 'Finance', 'Finance Dept', NULL, '2021-08-05', 450.00, 200.00, 'Building B, Floor 1', 'CAN-IMG-12345', 'Color laser printer, 40ppm', '2024-08-05', '2021-08-10 11:00:00', '2024-01-15', '[{"status": "Registered", "date": "2021-08-10T11:00:00Z", "note": "Asset added to inventory", "by": "Linda Park"}, {"status": "Available", "date": "2021-08-10T11:00:00Z", "note": "Ready for use", "by": "System"}, {"status": "Allocated", "date": "2021-09-01T09:30:00Z", "note": "Allocated to Finance", "by": "Sarah Mitchell"}, {"status": "Under Maintenance", "date": "2024-02-01T15:00:00Z", "note": "Paper jam repair", "by": "Carol West"}]'::jsonb),
('ast-004', 'AF-CHIR-0004', 'Herman Miller Aeron Chair', 'Furniture', 'Allocated', 'Excellent', 'Engineering', 'Raj Sharma', 'emp-004', '2022-11-15', 1400.00, 1200.00, 'Building C, Floor 3', 'HM-AERN-77891', 'Ergonomic office chair, size B', '2027-11-15', '2022-11-20 14:00:00', '2024-01-15', '[{"status": "Registered", "date": "2022-11-20T14:00:00Z", "note": "Added to inventory", "by": "Sarah Mitchell"}, {"status": "Available", "date": "2022-11-20T14:00:00Z", "note": "Ready for allocation", "by": "System"}, {"status": "Allocated", "date": "2022-12-01T10:00:00Z", "note": "Allocated to Raj Sharma", "by": "Sarah Mitchell"}]'::jsonb),
('ast-005', 'AF-VCLE-0005', 'Toyota Corolla - Company Car', 'Vehicles', 'Reserved', 'Good', 'Sales', NULL, NULL, '2021-06-01', 28000.00, 21000.00, 'Parking Lot B', 'TYT-CRL-2021-007', '2021 model, white, automatic', '2024-06-01', '2021-06-05 08:30:00', '2024-01-15', '[{"status": "Registered", "date": "2021-06-05T08:30:00Z", "note": "Fleet vehicle added", "by": "Anna Rivera"}, {"status": "Available", "date": "2021-06-05T08:30:00Z", "note": "Ready for booking", "by": "System"}, {"status": "Allocated", "date": "2022-01-10T09:00:00Z", "note": "Allocated to Sales team", "by": "Sarah Mitchell"}, {"status": "Available", "date": "2023-03-01T17:00:00Z", "note": "Returned from Sales", "by": "Mike Johnson"}, {"status": "Reserved", "date": "2024-02-10T08:00:00Z", "note": "Reserved for executive visit", "by": "Anna Rivera"}]'::jsonb),
('ast-006', 'AF-MONI-0006', 'LG UltraWide 34" Monitor', 'IT Equipment', 'Available', 'Excellent', NULL, NULL, NULL, '2023-07-14', 650.00, 600.00, 'IT Store Room', 'LG-UW34-55621', '34" curved, 144Hz, USB-C', '2026-07-14', '2023-07-15 13:00:00', '2024-01-15', '[{"status": "Registered", "date": "2023-07-15T13:00:00Z", "note": "New purchase received", "by": "Sarah Mitchell"}, {"status": "Available", "date": "2023-07-15T13:00:00Z", "note": "Ready for allocation", "by": "System"}]'::jsonb),
('ast-007', 'AF-SOFT-0007', 'Adobe Creative Cloud (50 seats)', 'Software License', 'Allocated', 'Excellent', 'Marketing', 'Marketing Team', NULL, '2024-01-01', 12000.00, 12000.00, 'Cloud / License Server', 'ADO-CC-2024-ACME', 'Annual subscription, 50 user seats', '2025-01-01', '2024-01-02 09:00:00', '2024-02-01', '[{"status": "Registered", "date": "2024-01-02T09:00:00Z", "note": "License activated", "by": "Priya Nair"}, {"status": "Allocated", "date": "2024-01-02T09:00:00Z", "note": "Deployed to Marketing team", "by": "Sarah Mitchell"}]'::jsonb),
('ast-008', 'AF-PROJ-0008', 'Epson EEB-680 Projector', 'Audio/Visual', 'Retired', 'Poor', NULL, NULL, NULL, '2018-03-20', 800.00, 0.00, 'Storage - Retired', 'EPS-680-33210', '3500 lumens, HDMI, VGA', '2021-03-20', '2018-03-25 15:00:00', '2024-01-15', '[{"status": "Registered", "date": "2018-03-25T15:00:00Z", "note": "Added to AV inventory", "by": "James Torres"}, {"status": "Available", "date": "2018-03-25T15:00:00Z", "note": "Ready for use", "by": "System"}, {"status": "Allocated", "date": "2018-04-01T10:00:00Z", "note": "Used in conference rooms", "by": "James Torres"}, {"status": "Under Maintenance", "date": "2022-06-10T09:00:00Z", "note": "Lamp replacement", "by": "James Torres"}, {"status": "Available", "date": "2022-07-01T17:00:00Z", "note": "Maintenance completed", "by": "James Torres"}, {"status": "Retired", "date": "2024-01-10T16:00:00Z", "note": "End of life, decommissioned", "by": "Sarah Mitchell"}]'::jsonb);
