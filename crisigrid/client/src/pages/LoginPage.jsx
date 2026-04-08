import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, Loader2, Globe, Server, Activity } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* Left Panel: Form Section (approx 40%) */}
      <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col bg-slate-950 border-r border-slate-900 z-10 shrink-0">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-12 xl:px-16">
          
          <div className="mb-10 group">
            <div className="inline-flex bg-blue-600 p-4 rounded-[1.5rem] mb-6 shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition duration-500 transform cursor-pointer">
              <ShieldAlert size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">CrisisGrid</h1>
            <p className="text-slate-500 font-medium tracking-tight">Access the regional resource coordination terminal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-500 p-4 rounded-2xl text-xs font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Operator ID / Email</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={20} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  placeholder="name@organization.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Access Credential</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-2xl transition-all duration-500 shadow-2xl shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Initialize Connection</span>
                  <Activity size={18} className="animate-pulse" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-slate-600 text-xs font-bold tracking-tight text-center">
            New operator?{' '}
            <Link to="/register" className="text-blue-500 hover:text-white transition-colors underline underline-offset-4 decoration-2">
              Request Deployment Access
            </Link>
          </p>
        </div>

        <div className="p-8 border-t border-slate-900 text-center">
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-700 mb-2">Authenticated Infrastructure</p>
            <div className="flex items-center justify-center space-x-4 grayscale opacity-20 group">
                <div className="h-0.5 w-8 bg-slate-700"></div>
                <Globe size={16} className="text-slate-400" />
                <div className="h-0.5 w-8 bg-slate-700"></div>
            </div>
        </div>
      </div>

      {/* Right Panel: Immersive Visual Section */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden">
         {/* Hero Image */}
         <img 
            src="/disaster_coordination_map_hero_1775608445398.png" 
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover scale-105"
         />
         
         {/* Technical Overlay Shadows */}
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/20 to-transparent" />
         <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply" />

         {/* Tech HUD Elements */}
         <div className="absolute bottom-12 left-12 space-y-6 animate-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="flex space-x-8">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/80">Platform Status</p>
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                     <p className="text-xl font-black text-white tracking-widest">ACTIVE_OPERATIONS</p>
                  </div>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nodes Synchronized</p>
                  <p className="text-xl font-black text-white tracking-widest">QUAD-GRID_SYNC</p>
               </div>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-r from-blue-500/50 to-transparent"></div>
            <p className="max-w-md text-slate-400 text-sm font-medium leading-relaxed tracking-tight">
               Regional resource synchronization active. All field coordinates are being processed through the real-time disaster gravity telemetry system.
            </p>
         </div>

         {/* Scanning Line Animation */}
         <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-scan z-20"></div>
      </div>
    </div>
  );
};

export default LoginPage;
