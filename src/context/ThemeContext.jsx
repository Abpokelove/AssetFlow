import { createContext, useContext, useState } from 'react';

/**
 * ThemeContext
 * ------------
 * Provides sidebar collapsed state and future theme toggles.
 */

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <ThemeContext.Provider
      value={{
        sidebarCollapsed,
        mobileSidebarOpen,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
