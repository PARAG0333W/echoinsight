import React from 'react';
import { Shield, Users, Database, Globe, Key } from 'lucide-react';
import { Card } from '../components/ui/Card';

const AdminPage: React.FC = () => {
  const sections = [
    { title: 'User Management', desc: 'Manage agent access and permissions', icon: Users, color: 'text-indigo-600' },
    { title: 'System Logs', desc: 'View server performance and analysis logs', icon: Database, color: 'text-emerald-600' },
    { title: 'API Integration', desc: 'Manage keys and third-party webhooks', icon: Key, color: 'text-amber-600' },
    { title: 'Global Config', desc: 'Update regional and system-wide settings', icon: Globe, color: 'text-blue-600' },
  ];

  return (
    <div className="max-w-[1000px] mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Settings</h1>
        <p className="text-slate-500 font-medium">Configure and manage your EchoInsight workspace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="p-8 border-slate-200/60 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <section.icon className="h-24 w-24" />
             </div>
             
             <div className="flex items-start gap-5">
               <div className={`p-3 rounded-2xl bg-slate-50 ${section.color}`}>
                 <section.icon className="h-6 w-6" />
               </div>
               <div className="space-y-1.5 min-w-0">
                 <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">{section.desc}</p>
               </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end">
               <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline px-2 py-1">
                 Manage settings
               </button>
             </div>
          </Card>
        ))}
      </div>

      {/* Status Card */}
      <Card className="p-8 border-slate-200/60 shadow-sm bg-[#0a0f1d] text-white">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <Shield className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100">System Security</h4>
              <p className="text-sm text-slate-400 font-medium">All services operational and secure</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            Up to date
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminPage;
