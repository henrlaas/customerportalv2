
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { AppearanceProvider } from './components/AppearanceProvider';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppearanceProvider>
        <App />
      </AppearanceProvider>
    </AuthProvider>
  </React.StrictMode>
);
