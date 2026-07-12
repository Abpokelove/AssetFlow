import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#2B2B2B',
                borderRadius: '10px',
                border: '1px solid #F1E5DD',
                boxShadow: '0 4px 16px rgba(94, 36, 78, 0.12)',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                maxWidth: '380px',
              },
              success: {
                iconTheme: { primary: '#4CAF50', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#C0392B', secondary: '#fff' },
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
