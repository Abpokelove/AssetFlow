import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * ProtectedLayout
 * ---------------
 * Wraps all authenticated pages.
 * Sidebar + Navbar + content area + footer.
 */
export default function ProtectedLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navigation bar */}
        <Navbar />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
