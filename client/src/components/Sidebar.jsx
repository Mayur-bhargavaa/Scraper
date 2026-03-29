import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, Briefcase, Users, Folder,
  Calendar, Settings, LogOut, Wifi, WifiOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/search', icon: Search, label: 'New Search' },
  { to: '/dashboard/campaigns', icon: Folder, label: 'Campaigns' },
  { to: '/dashboard/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/dashboard/leads', icon: Users, label: 'Leads' },
  { to: '/dashboard/schedules', icon: Calendar, label: 'Schedules' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-zinc-200 flex flex-col z-50">
      {/* Header / Logo */}
      <div className="px-6 py-5 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <img src="/logo-stitchbyte.png" alt="Stitchbyte Logo" className="h-8 w-auto object-contain" />
          <div>
            {/* <h1 className="text-lg font-bold text-zinc-900 tracking-tight">Stitchbyte</h1>
            <p className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">Lead Generation</p> */}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${isActive
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] transition-transform duration-200" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Actions Footer */}
      <div className="p-4 border-t border-zinc-200 flex flex-col gap-3">

        {/* Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold self-start ${connected
            ? 'bg-zinc-100 text-zinc-900 border border-zinc-300'
            : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {connected ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>System Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-black pulse-dot ml-0.5" />
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Disconnected</span>
            </>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50">
          <div className="w-9 h-9 shrink-0 rounded-full bg-black flex items-center justify-center text-sm font-bold text-white shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0 pr-1 text-left">
            <p className="text-sm font-bold text-zinc-900 leading-tight truncate">{user?.name}</p>
            <p className="text-[11px] text-zinc-500 font-medium truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 shrink-0 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
