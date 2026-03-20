import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  UploadCloud,
  History,
  Shield,
  LogOut,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/app', icon: BarChart3, label: 'Dashboard', end: true },
    { to: '/upload', icon: UploadCloud, label: 'Upload' },
    { to: '/app/history', icon: History, label: 'History' },
    { to: '/app/admin', icon: Shield, label: 'Admin Settings' },
  ];

  const base = 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 group';
  const inactive = 'text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1';
  const active = 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20';

  return (
    <aside className="hidden md:flex w-72 flex-col border-r border-white/5 bg-[#0a0f1d] text-white">
      {/* Logo Section */}
      <div className="px-8 py-10 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-100">
          EchoInsight
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => 
              [base, isActive ? active : inactive].join(' ')
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="font-bold tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="mt-auto mb-6 px-4">
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                Workspace
              </span>
              <span className="text-xs font-bold text-slate-200 truncate pr-2">
                {user?.email}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl hover:bg-rose-500 hover:text-white text-slate-500 transition-all duration-200 active:scale-95 shadow-lg shadow-rose-500/0 hover:shadow-rose-500/20"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;