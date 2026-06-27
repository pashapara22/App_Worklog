import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  Tags,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  BookOpen,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { currentUser, logout, registeredUsers } = useAuth();
  
  // Calculate pending users for the badge
  const pendingCount = registeredUsers.filter(u => u.status === 'pending').length;

  const instructorLinks = [
    { to: '/instructor', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/instructor/log', icon: ClipboardList, label: 'Daily Log' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/requests', icon: ShieldAlert, label: 'Access Requests', badge: pendingCount },
    { to: '/admin/categories', icon: Tags, label: 'Categories' },
    { to: '/admin/settings', icon: Settings, label: 'Time Settings' },
  ];

  const links = currentUser?.role === 'admin' ? adminLinks : instructorLinks;

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-sidebar z-40 flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[68px]' : 'w-[260px]'}
      `}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-white font-bold text-base leading-tight">WorkLog</h1>
            <p className="text-slate-400 text-[10px] font-medium tracking-wider uppercase">
              {currentUser?.role === 'admin' ? 'Admin Portal' : 'Instructor Portal'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`mb-2 ${collapsed ? 'hidden' : ''}`}>
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-3">
            Navigation
          </span>
        </div>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `
              flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${collapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-sidebar-active text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-sidebar-hover'
              }
            `}
            title={link.label}
          >
            <div className="flex items-center gap-3">
              <link.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="animate-fade-in">{link.label}</span>}
            </div>
            
            {/* Optional Badge (e.g. for pending requests) */}
            {!collapsed && link.badge > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-fade-in">
                {link.badge}
              </span>
            )}
            {collapsed && link.badge > 0 && (
              <div className="absolute right-2 top-2 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Actions */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        {currentUser && (
          <div className={`flex items-center gap-3 px-2 py-2 mb-2 ${collapsed ? 'justify-center' : ''}`}>
             <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{currentUser.fullName?.charAt(0)}</span>
             </div>
             {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{currentUser.fullName}</p>
                  <p className="text-slate-400 text-[10px] truncate">{currentUser.employeeId}</p>
                </div>
             )}
          </div>
        )}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-sidebar-hover transition-colors text-xs"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
