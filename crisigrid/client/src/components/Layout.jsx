import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Package, 
  Users, 
  BarChart3, 
  Bell, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resources', path: '/resources', icon: Package },
    { name: 'Volunteers', path: '/volunteers', icon: Users, roles: ['coordinator'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['coordinator'] },
    { name: 'Alerts', path: '/alerts', icon: Bell, roles: ['coordinator', 'operator'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen w-screen bg-slate-900 overflow-hidden font-sans">
      
      {/* Mobile Top Navbar */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-[60]">
         <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
               <ShieldAlert size={20} className="text-white" />
            </div>
            <span className="text-white font-black text-lg tracking-tight uppercase">CrisisGrid</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2">
            <Menu size={24} />
         </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
           <div 
             className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
             onClick={() => setIsMobileMenuOpen(false)}
           />
           <aside className="relative w-72 bg-slate-900 h-full flex flex-col border-r border-slate-800 animate-in slide-in-from-left duration-300">
              <div className="p-6 flex items-center justify-between border-b border-slate-800">
                 <h2 className="text-white font-black uppercase tracking-widest">CrisisGrid</h2>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-1">
                    <X size={24} />
                 </button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                 {filteredNavItems.map(item => (
                   <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center p-4 rounded-xl font-bold transition ${
                        isActive(item.path) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                   >
                      <item.icon size={22} className="mr-4" />
                      {item.name}
                   </Link>
                 ))}
              </nav>
              <div className="p-4 border-t border-slate-800">
                 <button onClick={handleLogout} className="w-full flex items-center p-4 text-red-400 font-bold">
                    <LogOut size={22} className="mr-4" />
                    Logout
                 </button>
              </div>
           </aside>
        </div>
      )}

      {/* Responsive Sidebar (Tablet & Desktop) */}
      <aside className={`
        hidden md:flex flex-col bg-slate-900 border-r border-slate-800 flex-shrink-0 h-screen transition-all duration-300
        lg:w-64 md:w-16
      `}>
        <div className="p-4 h-20 flex items-center lg:px-6">
           <div className="bg-blue-600 p-2 rounded-xl shrink-0">
              <ShieldAlert size={24} className="text-white" />
           </div>
           <h1 className="ml-4 text-xl font-black text-white uppercase tracking-widest hidden lg:block overflow-hidden whitespace-nowrap">CrisisGrid</h1>
        </div>

        <nav className="flex-1 p-2 space-y-1 lg:p-4 mt-4">
           {filteredNavItems.map((item) => {
             const Icon = item.icon;
             return (
               <Link
                 key={item.name}
                 to={item.path}
                 className={`flex items-center group relative p-3 rounded-xl transition duration-200 ${
                   isActive(item.path) 
                     ? 'bg-blue-600 text-white shadow-lg' 
                     : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                 }`}
               >
                 <Icon size={22} className="shrink-0" />
                 <span className="ml-4 font-bold hidden lg:block overflow-hidden whitespace-nowrap">{item.name}</span>
                 
                 {/* Tablet Tooltip */}
                 <div className="hidden md:group-hover:block lg:hidden absolute left-14 bg-slate-800 text-white text-[10px] font-black uppercase py-1 px-3 rounded shadow-xl z-[100] whitespace-nowrap">
                   {item.name}
                 </div>
               </Link>
             );
           })}
        </nav>

        <div className="p-2 lg:p-4 border-t border-slate-800">
           <div className="flex items-center p-2 mb-4 hidden lg:flex">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-black text-blue-400 border border-slate-600">
                {user?.name?.[0]}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-black text-white truncate">{user?.name}</p>
                <p className="text-[10px] uppercase font-black text-slate-500">{user?.role?.replace('_', ' ')}</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center p-3 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition"
           >
             <LogOut size={22} className="shrink-0" />
             <span className="ml-4 font-black hidden lg:block uppercase text-xs tracking-widest">Logout</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-white pt-16 md:pt-0">
          <div className="w-full h-full min-h-full flex flex-col">
             <Outlet />
          </div>
      </main>
    </div>
  );
};

export default Layout;
