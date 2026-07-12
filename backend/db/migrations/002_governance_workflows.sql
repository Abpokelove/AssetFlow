BEGIN;

-- 1. Create maintenance_requests table
CREATE TABLE maintenance_requests (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    reporter_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
    approver_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
    technician_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED')),
    estimated_cost NUMERIC(15, 2) DEFAULT 0.00 CHECK (estimated_cost >= 0),
    actual_cost NUMERIC(15, 2) DEFAULT 0.00 CHECK (actual_cost >= 0),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create audit_cycles table
CREATE TABLE audit_cycles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED')),
    created_by VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_audit_cycle_dates CHECK (start_date <= end_date)
);

-- 3. Create audit_assignments table
CREATE TABLE audit_assignments (
    audit_cycle_id BIGINT NOT NULL REFERENCES audit_cycles(id) ON DELETE CASCADE,
    auditor_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (audit_cycle_id, auditor_id)
);

-- 4. Create audit_items table
CREATE TABLE audit_items (
    id BIGSERIAL PRIMARY KEY,
    audit_cycle_id BIGINT NOT NULL REFERENCES audit_cycles(id) ON DELETE CASCADE,
    asset_id VARCHAR(50) NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'MISSING', 'DAMAGED')),
    expected_location VARCHAR(255),
    observed_location VARCHAR(255),
    observed_condition VARCHAR(50) CHECK (observed_condition IN ('Excellent', 'Good', 'Fair', 'Poor')),
    verifier_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    CONSTRAINT uq_audit_cycle_asset UNIQUE (audit_cycle_id, asset_id)
);

-- 5. Create notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ
);

-- 6. Create activity_logs table
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add useful indexes for common filters
CREATE INDEX idx_maintenance_requests_asset_id ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_audit_cycles_status ON audit_cycles(status);
CREATE INDEX idx_audit_items_audit_cycle_id ON audit_items(audit_cycle_id);
CREATE INDEX idx_notifications_employee_id_is_read ON notifications(employee_id, is_read);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

COMMIT;
