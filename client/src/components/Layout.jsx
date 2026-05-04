import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0 flex-1">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
