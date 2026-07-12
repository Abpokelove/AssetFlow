import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import ProtectedLayout from './components/layout/ProtectedLayout';

// Pages — lazy loaded for performance
import { Suspense, lazy } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OrganizationSetup = lazy(() => import('./pages/OrganizationSetup'));
const AssetDirectory = lazy(() => import('./pages/AssetDirectory'));
const AssetDetail = lazy(() => import('./pages/AssetDetail'));
const AssetAllocation = lazy(() => import('./pages/AssetAllocation'));
const ResourceBooking = lazy(() => import('./pages/ResourceBooking'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Audit = lazy(() => import('./pages/Audit'));
const Reports = lazy(() => import('./pages/Reports'));
const Notifications = lazy(() => import('./pages/Notifications'));
const EmployeeProfile = lazy(() => import('./pages/EmployeeProfile'));

// ---- Route Guard ----
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RedirectIfAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          }
        />

        {/* Protected — all under shared layout */}
        <Route
          element={
            <RequireAuth>
              <ProtectedLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/organization" element={<OrganizationSetup />} />
          <Route path="/assets" element={<AssetDirectory />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/allocation" element={<AssetAllocation />} />
          <Route path="/bookings" element={<ResourceBooking />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<EmployeeProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
