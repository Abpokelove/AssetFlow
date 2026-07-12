// ============================================================
// AssetFlow — Mock Data
// Used for UI development only. Backend will replace via APIs.
// ============================================================

// ---- Departments ----
export const mockDepartments = [
  { id: 'dept-01', name: 'IT Operations', headCount: 24, assetCount: 87, manager: 'James Torres' },
  { id: 'dept-02', name: 'Human Resources', headCount: 12, assetCount: 31, manager: 'Linda Park' },
  { id: 'dept-03', name: 'Engineering', headCount: 45, assetCount: 142, manager: 'Raj Sharma' },
  { id: 'dept-04', name: 'Finance', headCount: 18, assetCount: 44, manager: 'Carol West' },
  { id: 'dept-05', name: 'Marketing', headCount: 15, assetCount: 39, manager: 'Priya Nair' },
  { id: 'dept-06', name: 'Sales', headCount: 30, assetCount: 65, manager: 'Mike Johnson' },
  { id: 'dept-07', name: 'Operations', headCount: 20, assetCount: 58, manager: 'Anna Rivera' },
];

// ---- Asset Categories ----
export const mockCategories = [
  { id: 'cat-01', name: 'IT Equipment', description: 'Laptops, desktops, peripherals', assetCount: 185, icon: 'Monitor' },
  { id: 'cat-02', name: 'Furniture', description: 'Desks, chairs, storage units', assetCount: 94, icon: 'Armchair' },
  { id: 'cat-03', name: 'Vehicles', description: 'Company cars and vans', assetCount: 12, icon: 'Car' },
  { id: 'cat-04', name: 'Office Equipment', description: 'Printers, scanners, projectors', assetCount: 47, icon: 'Printer' },
  { id: 'cat-05', name: 'Software License', description: 'Enterprise software licenses', assetCount: 63, icon: 'FileCode' },
  { id: 'cat-06', name: 'Lab Equipment', description: 'Testing and research tools', assetCount: 28, icon: 'FlaskConical' },
  { id: 'cat-07', name: 'Audio/Visual', description: 'Cameras, microphones, displays', assetCount: 31, icon: 'Video' },
];

// ---- Employees ----
export const mockEmployees = [
  { id: 'emp-001', name: 'Sarah Mitchell', email: 'sarah.m@acme.com', department: 'IT Operations', role: 'Asset Manager', status: 'Active', joinDate: '2021-03-15', allocatedAssets: 3 },
  { id: 'emp-002', name: 'James Torres', email: 'james.t@acme.com', department: 'IT Operations', role: 'IT Lead', status: 'Active', joinDate: '2019-07-22', allocatedAssets: 4 },
  { id: 'emp-003', name: 'Linda Park', email: 'linda.p@acme.com', department: 'Human Resources', role: 'HR Manager', status: 'Active', joinDate: '2020-01-10', allocatedAssets: 2 },
  { id: 'emp-004', name: 'Raj Sharma', email: 'raj.s@acme.com', department: 'Engineering', role: 'Senior Engineer', status: 'Active', joinDate: '2018-11-05', allocatedAssets: 5 },
  { id: 'emp-005', name: 'Carol West', email: 'carol.w@acme.com', department: 'Finance', role: 'CFO', status: 'Active', joinDate: '2017-04-18', allocatedAssets: 2 },
  { id: 'emp-006', name: 'Priya Nair', email: 'priya.n@acme.com', department: 'Marketing', role: 'Marketing Head', status: 'Active', joinDate: '2022-02-28', allocatedAssets: 3 },
  { id: 'emp-007', name: 'Mike Johnson', email: 'mike.j@acme.com', department: 'Sales', role: 'Sales Director', status: 'Active', joinDate: '2020-09-14', allocatedAssets: 2 },
  { id: 'emp-008', name: 'Anna Rivera', email: 'anna.r@acme.com', department: 'Operations', role: 'Operations Manager', status: 'On Leave', joinDate: '2021-06-01', allocatedAssets: 1 },
];

// ---- Assets ----
export const mockAssets = [
  {
    id: 'ast-001', tag: 'AF-LAPT-0001', name: 'Dell XPS 15 Laptop',
    category: 'IT Equipment', status: 'Allocated', condition: 'Good',
    department: 'IT Operations', assignedTo: 'James Torres', assignedToId: 'emp-002',
    purchaseDate: '2022-03-10', purchaseValue: 1800, currentValue: 1350,
    location: 'Building A, Floor 2', serialNumber: 'DLL-XPS-98231',
    description: '16GB RAM, 512GB SSD, Intel i7', warrantyExpiry: '2025-03-10',
    registeredDate: '2022-03-12', lastAuditDate: '2024-01-15',
    timeline: [
      { status: 'Registered', date: '2022-03-12', note: 'Asset added to inventory', by: 'Sarah Mitchell' },
      { status: 'Available', date: '2022-03-13', note: 'Ready for allocation', by: 'System' },
      { status: 'Allocated', date: '2022-03-15', note: 'Allocated to James Torres', by: 'Sarah Mitchell' },
    ],
  },
  {
    id: 'ast-002', tag: 'AF-DSKP-0002', name: 'HP EliteDesk 800 Desktop',
    category: 'IT Equipment', status: 'Available', condition: 'Excellent',
    department: null, assignedTo: null, assignedToId: null,
    purchaseDate: '2023-01-20', purchaseValue: 950, currentValue: 850,
    location: 'IT Store Room', serialNumber: 'HP-ELD-45721',
    description: '8GB RAM, 256GB SSD, Intel i5', warrantyExpiry: '2026-01-20',
    registeredDate: '2023-01-22', lastAuditDate: '2024-01-15',
    timeline: [
      { status: 'Registered', date: '2023-01-22', note: 'Asset added to inventory', by: 'Sarah Mitchell' },
      { status: 'Available', date: '2023-01-22', note: 'Ready for allocation', by: 'System' },
    ],
  },
  {
    id: 'ast-003', tag: 'AF-PRNT-0003', name: 'Canon imageCLASS Printer',
    category: 'Office Equipment', status: 'Under Maintenance', condition: 'Fair',
    department: 'Finance', assignedTo: 'Finance Dept', assignedToId: null,
    purchaseDate: '2021-08-05', purchaseValue: 450, currentValue: 200,
    location: 'Building B, Floor 1', serialNumber: 'CAN-IMG-12345',
    description: 'Color laser printer, 40ppm', warrantyExpiry: '2024-08-05',
    registeredDate: '2021-08-10', lastAuditDate: '2024-01-15',
    timeline: [
      { status: 'Registered', date: '2021-08-10', note: 'Asset added to inventory', by: 'Linda Park' },
      { status: 'Available', date: '2021-08-10', note: 'Ready for use', by: 'System' },
      { status: 'Allocated', date: '2021-09-01', note: 'Allocated to Finance', by: 'Sarah Mitchell' },
      { status: 'Under Maintenance', date: '2024-02-01', note: 'Paper jam repair', by: 'Carol West' },
    ],
  },
  {
    id: 'ast-004', tag: 'AF-CHIR-0004', name: 'Herman Miller Aeron Chair',
    category: 'Furniture', status: 'Allocated', condition: 'Excellent',
    department: 'Engineering', assignedTo: 'Raj Sharma', assignedToId: 'emp-004',
    purchaseDate: '2022-11-15', purchaseValue: 1400, currentValue: 1200,
    location: 'Building C, Floor 3', serialNumber: 'HM-AERN-77891',
    description: 'Ergonomic office chair, size B', warrantyExpiry: '2027-11-15',
    registeredDate: '2022-11-20', lastAuditDate: '2024-01-15',
    timeline: [
      { status: 'Registered', date: '2022-11-20', note: 'Added to inventory', by: 'Sarah Mitchell' },
      { status: 'Available', date: '2022-11-20', note: 'Ready for allocation', by: 'System' },
      { status: 'Allocated', date: '2022-12-01', note: 'Allocated to Raj Sharma', by: 'Sarah Mitchell' },
    ],
  },
  {
    id: 'ast-005', tag: 'AF-VCLE-0005', name: 'Toyota Corolla - Company Car',
    category: 'Vehicles', status: 'Reserved', condition: 'Good',
    department: 'Sales', assignedTo: null, assignedToId: null,
    purchaseDate: '2021-06-01', purchaseValue: 28000, currentValue: 21000,
    location: 'Parking Lot B', serialNumber: 'TYT-CRL-2021-007',
    description: '2021 model, white, automatic', warrantyExpiry: '2024-06-01',
    registeredDate: '2021-06-05', lastAuditDate: '2024-01-15',
    timeline: [
      { status: 'Registered', date: '2021-06-05', note: 'Fleet vehicle added', by: 'Anna Rivera' },
      { status: 'Available', date: '2021-06-05', note: 'Ready for booking', by: 'System' },
      { status: 'Allocated', date: '2022-01-10', note: 'Allocated to Sales team', by: 'Sarah Mitchell' },
      { status: 'Available', date: '2023-03-01', note: 'Returned from Sales', by: 'Mike Johnson' },
      { status: 'Reserved', date: '2024-02-10', note: 'Reserved for executive visit', by: 'Anna Rivera' },
    ],
  },
  {
    id: 'ast-006', tag: 'AF-MONI-0006', name: 'LG UltraWide 34" Monitor',
    category: 'IT Equipment', status: 'Available', condition: 'Excellent',
    department: null, assignedTo: null, assignedToId: null,
    purchaseDate: '2023-07-14', purchaseValue: 650, currentValue: 600,
    location: 'IT Store Room', serialNumber: 'LG-UW34-55621',
    description: '34" curved, 144Hz, USB-C', warrantyExpiry: '2026-07-14',
    registeredDate: '2023-07-15', lastAuditDate: '2024-01-15',
    timeline: [
      { status: 'Registered', date: '2023-07-15', note: 'New purchase received', by: 'Sarah Mitchell' },
      { status: 'Available', date: '2023-07-15', note: 'Ready for allocation', by: 'System' },
    ],
  },
  {
    id: 'ast-007', tag: 'AF-SOFT-0007', name: 'Adobe Creative Cloud (50 seats)',
    category: 'Software License', status: 'Allocated', condition: 'Excellent',
    department: 'Marketing', assignedTo: 'Marketing Team', assignedToId: null,
    purchaseDate: '2024-01-01', purchaseValue: 12000, currentValue: 12000,
    location: 'Cloud / License Server', serialNumber: 'ADO-CC-2024-ACME',
    description: 'Annual subscription, 50 user seats', warrantyExpiry: '2025-01-01',
    registeredDate: '2024-01-02', lastAuditDate: '2024-02-01',
    timeline: [
      { status: 'Registered', date: '2024-01-02', note: 'License activated', by: 'Priya Nair' },
      { status: 'Allocated', date: '2024-01-02', note: 'Deployed to Marketing team', by: 'Sarah Mitchell' },
    ],
  },
  {
    id: 'ast-008', tag: 'AF-PROJ-0008', name: 'Epson EEB-680 Projector',
    category: 'Audio/Visual', status: 'Retired', condition: 'Poor',
    department: null, assignedTo: null, assignedToId: null,
    purchaseDate: '2018-03-20', purchaseValue: 800, currentValue: 0,
    location: 'Storage - Retired', serialNumber: 'EPS-680-33210',
    description: '3500 lumens, HDMI, VGA', warrantyExpiry: '2021-03-20',
    registeredDate: '2018-03-25', lastAuditDate: '2024-01-15',
    timeline: [
      { status: 'Registered', date: '2018-03-25', note: 'Added to AV inventory', by: 'James Torres' },
      { status: 'Available', date: '2018-03-25', note: 'Ready for use', by: 'System' },
      { status: 'Allocated', date: '2018-04-01', note: 'Used in conference rooms', by: 'James Torres' },
      { status: 'Under Maintenance', date: '2022-06-10', note: 'Lamp replacement', by: 'James Torres' },
      { status: 'Available', date: '2022-07-01', note: 'Maintenance completed', by: 'James Torres' },
      { status: 'Retired', date: '2024-01-10', note: 'End of life, decommissioned', by: 'Sarah Mitchell' },
    ],
  },
];

// ---- Allocations ----
export const mockAllocations = [
  {
    id: 'alc-001', assetId: 'ast-001', assetName: 'Dell XPS 15 Laptop', assetTag: 'AF-LAPT-0001',
    employeeId: 'emp-002', employeeName: 'James Torres', department: 'IT Operations',
    allocatedDate: '2022-03-15', expectedReturn: '2025-03-15', returnedDate: null,
    allocatedBy: 'Sarah Mitchell', status: 'Active', notes: 'Primary work device',
  },
  {
    id: 'alc-002', assetId: 'ast-004', assetName: 'Herman Miller Aeron Chair', assetTag: 'AF-CHIR-0004',
    employeeId: 'emp-004', employeeName: 'Raj Sharma', department: 'Engineering',
    allocatedDate: '2022-12-01', expectedReturn: null, returnedDate: null,
    allocatedBy: 'Sarah Mitchell', status: 'Active', notes: 'Permanent desk assignment',
  },
  {
    id: 'alc-003', assetId: 'ast-007', assetName: 'Adobe Creative Cloud', assetTag: 'AF-SOFT-0007',
    employeeId: null, employeeName: 'Marketing Team', department: 'Marketing',
    allocatedDate: '2024-01-02', expectedReturn: '2025-01-01', returnedDate: null,
    allocatedBy: 'Sarah Mitchell', status: 'Active', notes: 'Team license',
  },
];

// ---- Bookings ----
export const mockBookings = [
  {
    id: 'bkg-001', assetId: 'ast-005', assetName: 'Toyota Corolla', assetTag: 'AF-VCLE-0005',
    bookedBy: 'Anna Rivera', bookedById: 'emp-008', department: 'Operations',
    startDate: '2024-02-10T08:00:00', endDate: '2024-02-10T18:00:00',
    purpose: 'Client site visit', status: 'Completed', approvedBy: 'Sarah Mitchell',
  },
  {
    id: 'bkg-002', assetId: 'ast-005', assetName: 'Toyota Corolla', assetTag: 'AF-VCLE-0005',
    bookedBy: 'Mike Johnson', bookedById: 'emp-007', department: 'Sales',
    startDate: '2024-03-05T09:00:00', endDate: '2024-03-05T17:00:00',
    purpose: 'Sales meeting downtown', status: 'Upcoming', approvedBy: 'Sarah Mitchell',
  },
  {
    id: 'bkg-003', assetId: 'ast-006', assetName: 'LG UltraWide Monitor', assetTag: 'AF-MONI-0006',
    bookedBy: 'Priya Nair', bookedById: 'emp-006', department: 'Marketing',
    startDate: '2024-02-20T10:00:00', endDate: '2024-02-22T18:00:00',
    purpose: 'Design sprint week', status: 'Upcoming', approvedBy: 'Sarah Mitchell',
  },
];

// ---- Maintenance ----
export const mockMaintenance = [
  {
    id: 'mnt-001', assetId: 'ast-003', assetName: 'Canon imageCLASS Printer', assetTag: 'AF-PRNT-0003',
    type: 'Corrective', priority: 'High', status: 'In Progress',
    requestedBy: 'Carol West', requestedDate: '2024-02-01',
    approvedBy: 'Sarah Mitchell', approvedDate: '2024-02-02',
    vendor: 'TechFix Solutions', scheduledDate: '2024-02-15',
    completedDate: null, estimatedCost: 120,
    description: 'Paper jam and roller wear issue — needs part replacement',
    notes: 'Vendor confirmed visit on Feb 15',
    steps: [
      { label: 'Requested', completed: true, date: '2024-02-01' },
      { label: 'Approved', completed: true, date: '2024-02-02' },
      { label: 'Scheduled', completed: true, date: '2024-02-05' },
      { label: 'In Progress', completed: true, date: '2024-02-15' },
      { label: 'Completed', completed: false, date: null },
    ],
  },
  {
    id: 'mnt-002', assetId: 'ast-001', assetName: 'Dell XPS 15 Laptop', assetTag: 'AF-LAPT-0001',
    type: 'Preventive', priority: 'Medium', status: 'Requested',
    requestedBy: 'James Torres', requestedDate: '2024-02-10',
    approvedBy: null, approvedDate: null,
    vendor: null, scheduledDate: null,
    completedDate: null, estimatedCost: 0,
    description: 'Annual cleaning and thermal paste replacement',
    notes: '',
    steps: [
      { label: 'Requested', completed: true, date: '2024-02-10' },
      { label: 'Approved', completed: false, date: null },
      { label: 'Scheduled', completed: false, date: null },
      { label: 'In Progress', completed: false, date: null },
      { label: 'Completed', completed: false, date: null },
    ],
  },
];

// ---- Audits ----
export const mockAudits = [
  {
    id: 'aud-001', name: 'Q1 2024 IT Equipment Audit', category: 'IT Equipment',
    status: 'In Progress', auditor: 'Sarah Mitchell', auditorId: 'emp-001',
    department: 'IT Operations', startDate: '2024-01-15', endDate: '2024-01-31',
    totalAssets: 87, verified: 72, discrepancies: 3,
    description: 'Full inventory check of all IT equipment in IT Operations dept.',
  },
  {
    id: 'aud-002', name: 'Annual Furniture Audit 2024', category: 'Furniture',
    status: 'Scheduled', auditor: 'Linda Park', auditorId: 'emp-003',
    department: 'All Departments', startDate: '2024-03-01', endDate: '2024-03-15',
    totalAssets: 94, verified: 0, discrepancies: 0,
    description: 'Yearly furniture inventory verification across all floors.',
  },
  {
    id: 'aud-003', name: 'Vehicle Fleet Audit - Feb 2024', category: 'Vehicles',
    status: 'Completed', auditor: 'Anna Rivera', auditorId: 'emp-008',
    department: 'Operations', startDate: '2024-02-01', endDate: '2024-02-05',
    totalAssets: 12, verified: 12, discrepancies: 0,
    description: 'Monthly vehicle condition and mileage audit.',
  },
];

// ---- Notifications ----
export const mockNotifications = [
  {
    id: 'ntf-001', type: 'maintenance', title: 'Maintenance Approved',
    message: 'Canon Printer repair has been approved and scheduled for Feb 15.',
    timestamp: '2024-02-02T10:30:00', read: false, priority: 'High',
    link: '/maintenance',
  },
  {
    id: 'ntf-002', type: 'return', title: 'Asset Return Reminder',
    message: 'Dell XPS Laptop (AF-LAPT-0001) allocated to James Torres is due for return in 30 days.',
    timestamp: '2024-02-08T09:00:00', read: false, priority: 'Medium',
    link: '/allocation',
  },
  {
    id: 'ntf-003', type: 'booking', title: 'Booking Confirmed',
    message: 'Your booking for Toyota Corolla on March 5 has been approved.',
    timestamp: '2024-02-09T14:15:00', read: true, priority: 'Low',
    link: '/bookings',
  },
  {
    id: 'ntf-004', type: 'audit', title: 'Audit Due Soon',
    message: 'Q1 2024 IT Equipment Audit deadline is January 31. 15 assets still unverified.',
    timestamp: '2024-01-28T08:00:00', read: true, priority: 'High',
    link: '/audit',
  },
  {
    id: 'ntf-005', type: 'allocation', title: 'New Asset Allocated',
    message: 'LG UltraWide Monitor (AF-MONI-0006) has been reserved by Priya Nair.',
    timestamp: '2024-02-07T16:45:00', read: true, priority: 'Low',
    link: '/allocation',
  },
  {
    id: 'ntf-006', type: 'system', title: 'System Update',
    message: 'AssetFlow has been updated to version 1.2.0. See changelog for details.',
    timestamp: '2024-02-01T00:00:00', read: true, priority: 'Low',
    link: null,
  },
];

// ---- Dashboard KPIs ----
export const mockDashboardKPIs = {
  totalAssets: 460,
  availableAssets: 127,
  allocatedAssets: 218,
  underMaintenance: 23,
  pendingApprovals: 7,
  overdueReturns: 4,
  activebookings: 12,
  upcomingAudits: 2,
};

// ---- Reports Chart Data ----
export const mockAssetsByCategory = [
  { name: 'IT Equipment', value: 185 },
  { name: 'Furniture', value: 94 },
  { name: 'Vehicles', value: 12 },
  { name: 'Office Equipment', value: 47 },
  { name: 'Software License', value: 63 },
  { name: 'Lab Equipment', value: 28 },
  { name: 'Audio/Visual', value: 31 },
];

export const mockAssetsByStatus = [
  { name: 'Available', value: 127, color: '#4CAF50' },
  { name: 'Allocated', value: 218, color: '#5E244E' },
  { name: 'Reserved', value: 42, color: '#FFB300' },
  { name: 'Maintenance', value: 23, color: '#E68457' },
  { name: 'Retired', value: 38, color: '#8D6E63' },
  { name: 'Disposed', value: 12, color: '#9E9E9E' },
];

export const mockMonthlyActivity = [
  { month: 'Aug', allocations: 32, returns: 18, maintenance: 8 },
  { month: 'Sep', allocations: 28, returns: 22, maintenance: 12 },
  { month: 'Oct', allocations: 41, returns: 27, maintenance: 10 },
  { month: 'Nov', allocations: 35, returns: 30, maintenance: 15 },
  { month: 'Dec', allocations: 22, returns: 19, maintenance: 7 },
  { month: 'Jan', allocations: 38, returns: 25, maintenance: 14 },
  { month: 'Feb', allocations: 44, returns: 31, maintenance: 9 },
];

export const mockDepartmentUtilization = [
  { dept: 'IT Ops', utilization: 78 },
  { dept: 'Engineering', utilization: 91 },
  { dept: 'Finance', utilization: 62 },
  { dept: 'Marketing', utilization: 84 },
  { dept: 'Sales', utilization: 73 },
  { dept: 'HR', utilization: 55 },
  { dept: 'Operations', utilization: 69 },
];

export const mockRecentActivity = [
  { id: 1, action: 'Asset Allocated', asset: 'Dell XPS 15 Laptop', user: 'Sarah Mitchell', time: '2 hours ago', type: 'allocation' },
  { id: 2, action: 'Maintenance Requested', asset: 'Canon Printer', user: 'Carol West', time: '4 hours ago', type: 'maintenance' },
  { id: 3, action: 'Booking Created', asset: 'Toyota Corolla', user: 'Mike Johnson', time: '5 hours ago', type: 'booking' },
  { id: 4, action: 'Asset Returned', asset: 'LG Monitor', user: 'Priya Nair', time: '1 day ago', type: 'return' },
  { id: 5, action: 'Audit Started', asset: 'Q1 IT Audit', user: 'Sarah Mitchell', time: '2 days ago', type: 'audit' },
  { id: 6, action: 'Asset Registered', asset: 'Adobe CC License', user: 'Sarah Mitchell', time: '3 days ago', type: 'registration' },
];
