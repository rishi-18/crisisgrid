import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User, Mail, Lock, Briefcase, Loader2, Globe, Activity } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'field_worker',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await register(formData.name, formData.email, formData.password, formData.role);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* Left Panel: Register Form Section */}
      <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col bg-slate-950 border-r border-slate-900 z-10 shrink-0">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-12 xl:px-16 py-10 overflow-y-auto custom-scrollbar">
          
          <div className="mb-8">
            <div className="inline-flex bg-blue-600 p-3 rounded-2xl mb-4 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition duration-500 transform cursor-pointer">
              <ShieldAlert size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Initialize Deployment</h1>
            <p className="text-slate-500 font-medium tracking-tight">Register your credentials for regional access.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-500 p-4 rounded-xl text-xs font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Full Identity</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-600">
                  <User size={18} />
                </span>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Email Interface</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-600">
                  <Mail size={18} />
                </span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                  placeholder="name@organization.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Security Key</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-600">
                  <Lock size={18} />
                </span>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Designated Role</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <Briefcase size={18} />
                </span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                  required
                >
                  <option value="field_worker">Field Response Worker</option>
                  <option value="operator">Relief Station Operator</option>
                  <option value="coordinator">Regional Zone Coordinator</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-2xl transition-all duration-500 shadow-2xl shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center space-x-3 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>Create Account</span>
                  <Activity size={18} className="animate-pulse" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-slate-600 text-xs font-bold tracking-tight text-center">
            Already have an identity?{' '}
            <Link to="/login" className="text-blue-500 hover:text-white transition-colors underline underline-offset-4 decoration-2">
              Authenticate Terminal
            </Link>
          </p>
        </div>

        <div className="p-8 border-t border-slate-900 text-center">
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-700 mb-2">Operational Integrity</p>
            <Globe size={16} className="mx-auto text-slate-600 opacity-20" />
        </div>
      </div>

      {/* Right Panel: Shared Visual Background */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden">
         <img 
            src="/disaster_coordination_map_hero_1775608445398.png" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 scale-x-[-1]"
         />
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-transparent" />
         <div className="absolute top-0 right-0 p-12 text-right">
            <h2 className="text-4xl font-black text-white/10 uppercase tracking-[0.5em] leading-none mb-4">CRISIS_GRID</h2>
            <div className="flex items-center justify-end space-x-2 text-white/20">
               <div className="h-0.5 w-12 bg-white/10"></div>
               <span className="text-[10px] font-black uppercase tracking-widest leading-none">DEPLOYMENT_MODULE</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RegisterPage;
