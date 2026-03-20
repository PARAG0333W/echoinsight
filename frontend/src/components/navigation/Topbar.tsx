import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, Bell, Search } from 'lucide-react';

const Topbar: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/app') return 'Overview';
    if (path === '/upload') return 'Upload Conversation';
    if (path.includes('/conversations/')) return 'Conversation Analysis';
    return '';
  };

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-foreground">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-slate-50 transition-colors">
          <Search className="h-4 w-4" />
        </button>
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-slate-50 transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-8 w-px bg-border mx-1" />
        <div className="flex items-center gap-2 pl-2">
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-medium leading-none">Admin User</span>
            <span className="text-[10px] text-muted-foreground">Admin Role</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;