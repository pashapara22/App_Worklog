import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ReminderBanner from './ReminderBanner';
import NotificationService from './NotificationService';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`transition-all duration-300 flex flex-col min-h-screen ${collapsed ? 'ml-[68px]' : 'ml-[260px]'}`}
      >
        <ReminderBanner />
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-end sticky top-0 z-30">
           <div className="flex items-center gap-4">
              <NotificationService />
           </div>
        </header>

        <main className="p-6 max-w-[1400px] mx-auto w-full flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
