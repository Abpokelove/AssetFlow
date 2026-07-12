// ============================================================
// AssetFlow — Application Constants
// ============================================================

export const APP_NAME = 'AssetFlow';
export const APP_VERSION = '1.0.0';

// ---- Asset Statuses ----
export const ASSET_STATUS = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  RESERVED: 'Reserved',
  UNDER_MAINTENANCE: 'Under Maintenance',
  LOST: 'Lost',
  RETIRED: 'Retired',
  DISPOSED: 'Disposed',
  PENDING_APPROVAL: 'Pending Approval',
};

// ---- Booking Statuses ----
export const BOOKING_STATUS = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// ---- Maintenance Statuses ----
export const MAINTENANCE_STATUS = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

// ---- Audit Statuses ----
export const AUDIT_STATUS = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DISCREPANCY: 'Discrepancy Found',
};

// ---- Asset Categories ----
export const ASSET_CATEGORIES = [
  'IT Equipment',
  'Furniture',
  'Vehicles',
  'Office Equipment',
  'Software License',
  'Lab Equipment',
  'Audio/Visual',
  'Safety Equipment',
];

// ---- Asset Conditions ----
export const ASSET_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

// ---- Departments (seed — real data from /api/departments) ----
export const DEFAULT_DEPARTMENTS = [
  'IT Operations',
  'Human Resources',
  'Finance',
  'Marketing',
  'Engineering',
  'Sales',
  'Legal',
  'Operations',
  'Administration',
];

// ---- Notification Types ----
export const NOTIFICATION_TYPE = {
  MAINTENANCE: 'maintenance',
  ALLOCATION: 'allocation',
  BOOKING: 'booking',
  AUDIT: 'audit',
  RETURN: 'return',
  SYSTEM: 'system',
};

// ---- Priority Levels ----
export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

// ---- Pagination ----
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ---- Date Formats ----
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// ---- Routes ----
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  ORGANIZATION: '/organization',
  ASSETS: '/assets',
  ASSET_DETAIL: '/assets/:id',
  ALLOCATION: '/allocation',
  BOOKINGS: '/bookings',
  MAINTENANCE: '/maintenance',
  AUDIT: '/audit',
  REPORTS: '/reports',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
};

// ---- Status Color Map ----
export const STATUS_COLORS = {
  Available: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  Allocated: { bg: '#EDE7F6', text: '#5E244E', dot: '#5E244E' },
  Reserved: { bg: '#FFF8E1', text: '#8B6914', dot: '#FFB300' },
  'Under Maintenance': { bg: '#FFF3E0', text: '#E65100', dot: '#E68457' },
  Lost: { bg: '#FFEBEE', text: '#C62828', dot: '#C0392B' },
  Retired: { bg: '#EFEBE9', text: '#4E342E', dot: '#8D6E63' },
  Disposed: { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' },
  'Pending Approval': { bg: '#FCE4EC', text: '#880E4F', dot: '#AA1C41' },
  Upcoming: { bg: '#EDE7F6', text: '#5E244E', dot: '#5E244E' },
  Ongoing: { bg: '#FCE4EC', text: '#880E4F', dot: '#AA1C41' },
  Completed: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  Cancelled: { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' },
  Requested: { bg: '#FFF8E1', text: '#8B6914', dot: '#FFB300' },
  Approved: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  Rejected: { bg: '#FFEBEE', text: '#C62828', dot: '#C0392B' },
  'In Progress': { bg: '#E3F2FD', text: '#1565C0', dot: '#1976D2' },
  Scheduled: { bg: '#E8EAF6', text: '#283593', dot: '#3F51B5' },
  'Discrepancy Found': { bg: '#FFEBEE', text: '#C62828', dot: '#C0392B' },
};
