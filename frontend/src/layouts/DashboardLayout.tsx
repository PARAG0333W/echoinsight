import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Topbar from '../components/navigation/Topbar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-8 pt-4 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;