import React, { useState } from 'react';
import { Bell, Search, Menu, LogOut, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
  onLogout?: () => void;
}

export function Navbar({ onMenuClick, onLogout }: NavbarProps) {
  const [isDark, setIsDark] = useState(true);

  const user = React.useMemo(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, []);

  const userName = user ? `${user.nombre || user.nombres || ''} ${user.apellido || user.apellidos || ''}` : 'Admin';
  const userRole = user?.rol || 'Administrador';
  const initials = user ? `${(user.nombre || user.nombres || 'A').charAt(0)}${(user.apellido || user.apellidos || 'D').charAt(0)}`.toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-b border-slate-700/50 backdrop-blur-xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left - Menu & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
            >
              <Menu size={24} />
            </button>

            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar clientes, cuentas..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 relative hover:bg-slate-800 rounded-lg transition-colors text-slate-300">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-3 px-4 py-2 border-l border-slate-700">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-100 capitalize">{userName}</p>
                <p className="text-xs text-slate-400 capitalize">{userRole}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white tracking-wider">
                {initials}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-400 ml-2"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
