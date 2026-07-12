# AssetFlow — Database Design and Optimization

## 1. My Design Approach

For AssetFlow, I designed the database by first separating the system into small modules instead of keeping everything in one large table.

The main modules are:

- Organization and users
- Asset master data
- Asset allocation and transfer
- Resource booking
- Maintenance
- Audit management
- Notifications and activity tracking

I used PostgreSQL because this project needs strong relationships, transactions, constraints, indexing, and conflict handling.

The final design contains **12 core tables and 2 supporting tables**. This is enough to cover the important workflows without making the schema too large for an 8-hour hackathon.

---

## 2. Final Tables

### Core Tables

1. `roles`
2. `departments`
3. `employees`
4. `asset_categories`
5. `assets`
6. `asset_allocations`
7. `transfer_requests`
8. `resource_bookings`
9. `maintenance_requests`
10. `audit_cycles`
11. `audit_assignments`
12. `audit_items`

### Supporting Tables

13. `notifications`
14. `activity_logs`

---

## 3. Main Relationships

```text
roles
  └── employees

departments
  ├── employees
  ├── assets
  └── child departments

asset_categories
  └── assets

assets
  ├── asset_allocations
  ├── resource_bookings
  ├── maintenance_requests
  └── audit_items

asset_allocations
  └── transfer_requests

audit_cycles
  ├── audit_assignments
  └── audit_items

employees
  ├── notifications
  └── activity_logs
```

The `assets` table is the centre of the design because allocation, booking, maintenance, and audit operations all depend on an asset.

---

## 4. Normalization Used

I normalized the schema up to **Third Normal Form (3NF)**.

### First Normal Form — 1NF

Each column stores only one value.

For example:

- I did not store multiple employee IDs in one asset row.
- I did not store multiple bookings inside one column.
- Each booking, allocation, and maintenance request has its own row.

### Second Normal Form — 2NF

Every non-key field depends on the complete primary key.

For example:

- `audit_assignments` uses the combined key:
  - `audit_cycle_id`
  - `auditor_id`
- `assigned_at` depends on that full assignment.

### Third Normal Form — 3NF

Repeated information is moved into separate tables.

Examples:

- Role names are stored in `roles`, not repeated as text in every employee.
- Category names are stored in `asset_categories`, not repeated in every asset.
- Department details are stored in `departments`.
- Allocation history is stored in `asset_allocations`.
- Maintenance history is stored in `maintenance_requests`.
- Audit results are stored in `audit_items`.

This reduces duplicated data and prevents update inconsistencies.

---

## 5. Important Database Rules

### One active allocation per asset

An asset can have many old allocation records, but only one active allocation.

```sql
CREATE UNIQUE INDEX uq_active_asset_allocation
ON asset_allocations(asset_id)
WHERE status = 'ACTIVE';
```

### Allocation must have one target

An asset is allocated either to an employee or to a department, but not both.

```sql
CHECK (
    (employee_id IS NOT NULL AND department_id IS NULL)
    OR
    (employee_id IS NULL AND department_id IS NOT NULL)
)
```

### Transfer must also have one target

```sql
CHECK (
    (target_employee_id IS NOT NULL AND target_department_id IS NULL)
    OR
    (target_employee_id IS NULL AND target_department_id IS NOT NULL)
)
```

### Booking time must be valid

```sql
CHECK (start_time < end_time)
```

### Booking overlap prevention

For the same asset, two active bookings must not overlap.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE resource_bookings
ADD CONSTRAINT prevent_booking_overlap
EXCLUDE USING gist (
    asset_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (cancelled_at IS NULL);
```

Using `[)` allows one booking to begin exactly when another booking ends.

### One asset per audit cycle

```sql
UNIQUE (audit_cycle_id, asset_id)
```

This prevents the same asset from appearing twice in the same audit.

---

## 6. Transaction Design

I use transactions when one action updates multiple tables.

### Asset Allocation

```text
BEGIN
Lock the asset
Check that it is AVAILABLE
Create ACTIVE allocation
Change asset status to ALLOCATED
Create notification
Create activity log
COMMIT
```

### Asset Return

```text
BEGIN
Lock active allocation
Mark it as RETURNED
Store return condition
Change asset status to AVAILABLE
Create notification and log
COMMIT
```

### Transfer Approval

```text
BEGIN
Lock current allocation
Mark old allocation as TRANSFERRED
Create new ACTIVE allocation
Keep the asset status as ALLOCATED
Create notifications and log
COMMIT
```

### Maintenance Approval

```text
BEGIN
Approve maintenance request
Change asset status to UNDER_MAINTENANCE
Create notification and log
COMMIT
```

### Maintenance Resolution

```text
BEGIN
Resolve maintenance request
Change asset status to AVAILABLE
Create notification and log
COMMIT
```

Transactions make sure partial updates are not saved when one step fails.

---

## 7. Optimizations Used

### Partial Unique Index

Used to allow only one active allocation while still keeping old allocation history.

### PostgreSQL Exclusion Constraint

Used to prevent overlapping bookings for the same asset.

### Indexes on common filters

I added indexes for columns used often in search, filtering, and joins.

```sql
CREATE INDEX idx_employees_department
ON employees(department_id);

CREATE INDEX idx_employees_role
ON employees(role_id);

CREATE INDEX idx_assets_category
ON assets(category_id);

CREATE INDEX idx_assets_department
ON assets(department_id);

CREATE INDEX idx_assets_status
ON assets(status);

CREATE INDEX idx_assets_location
ON assets(location);

CREATE INDEX idx_allocations_employee
ON asset_allocations(employee_id);

CREATE INDEX idx_active_allocations_due
ON asset_allocations(expected_return_date)
WHERE status = 'ACTIVE';

CREATE INDEX idx_maintenance_asset_status
ON maintenance_requests(asset_id, status);

CREATE INDEX idx_notifications_unread
ON notifications(employee_id, created_at DESC)
WHERE is_read = FALSE;
```

### Dynamic values instead of duplicated values

I calculate these values directly from existing data:

- Overdue returns
- Upcoming bookings
- Ongoing bookings
- Completed bookings
- Dashboard counts
- Audit discrepancy reports

This avoids storing values that may become outdated.

### Foreign Keys

Foreign keys are used to prevent invalid references.

Example:

- An allocation cannot refer to an asset that does not exist.
- A booking cannot refer to an employee that does not exist.
- An audit item cannot refer to an invalid audit cycle.

### Check Constraints

Check constraints are used for:

- Valid statuses
- Positive acquisition cost
- Correct booking time
- Correct allocation target
- Correct audit date range

---

## 8. Deliberate Simplifications

To keep the project achievable, I made a few design decisions.

### No separate `resources` table

Rooms, vehicles, and shared equipment are already assets.

I use:

```text
assets.is_bookable = TRUE
```

So all resources are assets, but not every asset is a resource.

### No `employee_roles` junction table

Each employee has one main role using:

```text
employees.role_id
```

This keeps login, JWT, backend authorization, and frontend navigation simple.

### No report tables

Reports and dashboard values are generated using live SQL queries.

This keeps the data dynamic and avoids duplication.

### No separate document table for the MVP

The `assets` table stores one `photo_url` and one `document_url`.

A separate document table can be added later if multiple documents per asset are required.

### No separate asset-status-history table

Allocation, transfer, maintenance, audit, and activity logs already keep the important history needed for the current implementation.

---

## 9. Why This Design Is Suitable

This design is compact enough to implement during the hackathon, but it still demonstrates:

- Normalization
- Primary and foreign keys
- One-to-many relationships
- Many-to-many relationships
- Self-referencing department hierarchy
- Transactions
- Row locking
- Partial unique indexes
- Booking conflict prevention
- Role-based access
- Audit tracking
- Dynamic reports

The design also matches the main AssetFlow workflow:

```text
Admin sets up organization
        ↓
Asset Manager registers asset
        ↓
Asset is allocated or booked
        ↓
Transfer, return, or maintenance is handled
        ↓
Audit checks the physical asset
        ↓
Dashboard, notifications, and logs are updated
```

---

## 10. Summary

I kept the schema normalized and modular, but avoided adding tables that were not necessary for the hackathon MVP.

The main optimization decisions are:

- One central `assets` table
- One primary role per employee
- Separate transactional tables for history
- Partial unique index for allocation conflict
- Exclusion constraint for booking conflict
- Transactions for multi-table workflows
- Indexes for frequently searched fields
- Live SQL queries for dashboards and reports

This gives a balance between correct database design, performance, and fast implementation.