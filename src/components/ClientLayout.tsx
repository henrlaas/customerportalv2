
import React from 'react';
import { Outlet } from 'react-router-dom';

export const ClientLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Client Portal</h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Client Portal
        </div>
      </footer>
    </div>
  );
};
