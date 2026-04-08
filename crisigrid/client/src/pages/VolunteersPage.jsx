import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Truck, 
  CheckCircle, 
  Trash2, 
  Plus, 
  X, 
  MapPin, 
  Search,
  Loader2,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const VolunteersPage = () => {
  const { user, hasRole } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('unassigned'); // for mobile tabs
  
  // Assignment state
  const [assigningId, setAssigningId] = useState(null);
  const [targetCamp, setTargetCamp] = useState('');

  const fetchData = async () => {
    try {
      const [vRes, cRes] = await Promise.all([
        api.get('/volunteers'),
        api.get('/camps')
      ]);
      setVolunteers(vRes.data);
      setCamps(cRes.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (vId) => {
    if (!targetCamp) return toast.error("Select a target camp");
    try {
      // Optimistic transition
      const vol = volunteers.find(v => v._id === vId);
      setVolunteers(volunteers.map(v => v._id === vId ? { ...v, status: 'in_transit' } : v));
      
      await api.patch(`/volunteers/${vId}/assign`, { campId: targetCamp });
      toast.success("Volunteer dispatched");
      setAssigningId(null);
      setTargetCamp('');
      fetchData();
    } catch (err) {
      fetchData();
    }
  };

  const handleStatusUpdate = async (vId, newStatus) => {
     try {
        if (newStatus === 'deployed') {
           await api.patch(`/assignments/active/${vId}`, { status: 'deployed' });
        } else if (newStatus === 'unassigned') {
           await api.patch(`/volunteers/${vId}/assign`, { campId: null });
        }
        toast.success("Status updated");
        fetchData();
     } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this volunteer from the task force?")) return;
    try {
       setVolunteers(volunteers.filter(v => v._id !== id));
       await api.delete(`/volunteers/${id}`);
       toast.success("Volunteer removed");
    } catch (err) {
       fetchData();
    }
  };

  const columns = [
    { id: 'unassigned', label: 'Unassigned Force', icon: UserPlus, color: 'slate' },
    { id: 'in_transit', label: 'In Transit', icon: Truck, color: 'blue' },
    { id: 'deployed', label: 'Active Deployment', icon: CheckCircle, color: 'emerald' }
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
  );

  return (
    <div className="w-full min-h-full p-6 space-y-8 bg-slate-50/50 flex flex-col pb-20 md:pb-8">
      {/* Header Section */}
      <section className="shrink-0 w-full px-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div>
             <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                <Users className="mr-3 text-blue-600" />
                Task Force Management
             </h1>
             <p className="text-slate-500 font-medium">Personnel tracking and strategic asset deployment</p>
          </div>
          {hasRole('coordinator') && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center space-x-2 bg-slate-900 text-white px-8 py-4 rounded-3xl font-black hover:bg-slate-800 transition shadow-xl shadow-slate-200"
            >
               <Plus size={20} />
               <span>Register Volunteer</span>
            </button>
          )}
        </div>
      </section>

      {/* Add Form Modal-ish */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
           <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 border border-slate-200">
              <AddVolunteerForm onCancel={() => setShowAddForm(false)} onSuccess={() => { fetchData(); setShowAddForm(false); }} />
           </div>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-slate-200/50 p-1 rounded-2xl shrink-0">
         {columns.map(col => (
           <button 
             key={col.id} 
             onClick={() => setActiveTab(col.id)}
             className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition duration-200 ${
               activeTab === col.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
             }`}
           >
              {col.label.split(' ')[0]}
           </button>
         ))}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
         {columns.map(col => (
            <div 
              key={col.id} 
              className={`flex flex-col bg-slate-100/50 rounded-[2.5rem] p-4 border border-slate-200 w-full min-h-[400px] ${
                activeTab !== col.id ? 'hidden md:flex' : 'flex'
              }`}
            >
               <div className="flex items-center justify-between mb-6 px-4 py-2">
                  <div className="flex items-center space-x-3">
                     <div className={`p-2 bg-${col.color}-100 text-${col.color}-600 rounded-xl`}>
                        <col.icon size={20} />
                     </div>
                     <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{col.label}</h3>
                  </div>
                  <span className="text-xs font-black bg-white px-2 py-1 rounded-lg shadow-sm text-slate-400">
                    {volunteers.filter(v => v.status === col.id).length}
                  </span>
               </div>

               <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                  {volunteers.filter(v => v.status === col.id).map(vol => (
                    <div key={vol._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 transition group">
                       <div className="flex justify-between items-start mb-4">
                          <h4 className="font-black text-slate-800 text-lg tracking-tight">{vol.name}</h4>
                          {hasRole('coordinator') && (
                            <button onClick={() => handleDelete(vol._id)} className="text-slate-300 hover:text-red-500 transition">
                               <Trash2 size={16} />
                            </button>
                          )}
                       </div>
                       
                       <div className="flex flex-wrap gap-1.5 mb-6">
                          {vol.skills.map(skill => (
                            <span key={skill} className="bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                               {skill}
                            </span>
                          ))}
                       </div>

                       {(vol.status === 'in_transit' || vol.status === 'deployed') && (
                         <div className="mb-6 p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center space-x-3">
                            <MapPin size={16} className="text-blue-500" />
                            <div className="min-w-0">
                               <p className="text-[9px] text-blue-400 uppercase font-black font-black">Designated Camp</p>
                               <p className="text-xs font-bold text-blue-800 truncate">{vol.assignedCampId?.name || 'In Logistics'}</p>
                            </div>
                         </div>
                       )}

                       {hasRole('coordinator') && (
                         <div className="pt-4 border-t border-slate-50">
                            {vol.status === 'unassigned' && (
                               assigningId === vol._id ? (
                                 <div className="space-y-3 animate-in fade-in zoom-in duration-200">
                                    <select 
                                      value={targetCamp} 
                                      onChange={e => setTargetCamp(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none ring-blue-500 focus:ring-1"
                                    >
                                       <option value="">Target Mission Camp...</option>
                                       {camps.map(c => <option key={c._id} value={c._id}>{c.name} ({c.zone})</option>)}
                                    </select>
                                    <div className="flex space-x-2">
                                       <button onClick={() => handleAssign(vol._id)} className="flex-1 bg-blue-600 text-white text-xs font-black py-3 rounded-xl uppercase">Confirm</button>
                                       <button onClick={() => setAssigningId(null)} className="px-4 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl"><X size={16} /></button>
                                    </div>
                                 </div>
                               ) : (
                                 <button 
                                   onClick={() => setAssigningId(vol._id)}
                                   className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-600 hover:text-white transition group"
                                 >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Dispatch to Camp</span>
                                    <ChevronRight size={18} className="translate-x-1" />
                                 </button>
                               )
                            )}

                            {vol.status === 'in_transit' && (
                              <button 
                                 onClick={() => handleStatusUpdate(vol._id, 'deployed')}
                                 className="w-full py-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition"
                              >
                                Mark Deployed
                              </button>
                            )}

                            {vol.status === 'deployed' && (
                              <button 
                                 onClick={() => handleStatusUpdate(vol._id, 'unassigned')}
                                 className="w-full py-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition"
                              >
                                Recall to Unassigned
                              </button>
                            )}
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

const AddVolunteerForm = ({ onCancel, onSuccess }) => {
  const [form, setForm] = useState({ name: '', skills: [], location: { coordinates: [77.5946, 12.9716] } });
  const allSkills = ['medical', 'logistics', 'rescue', 'communications', 'engineering'];

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.name || form.skills.length === 0) return toast.error("Name and at least one skill required");
      await api.post('/volunteers', form);
      toast.success("Volunteer registered");
      onSuccess();
    } catch (err) {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Personnel Registration</h3>
          <ShieldCheck className="text-blue-600" size={24} />
       </div>
       
       <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[.2em]">Full Legal Name *</label>
          <input 
            type="text" 
            placeholder="Dr. Aryan Sharma" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
          />
       </div>

       <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[.2em]">Qualified Skillset *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
             {allSkills.map(skill => (
               <button 
                 key={skill} 
                 type="button" 
                 onClick={() => toggleSkill(skill)}
                 className={`px-3 py-2.5 rounded-xl border text-[10px] uppercase font-black tracking-wider transition ${
                   form.skills.includes(skill) 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-blue-200'
                 }`}
               >
                  {skill}
               </button>
             ))}
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Current Longitude</label>
             <input value={form.location.coordinates[0]} onChange={e => setForm({...form, location: {...form.location, coordinates: [e.target.value, form.location.coordinates[1]]}})} type="number" step="0.000001" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Current Latitude</label>
             <input value={form.location.coordinates[1]} onChange={e => setForm({...form, location: {...form.location, coordinates: [form.location.coordinates[0], e.target.value]}})} type="number" step="0.000001" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
          </div>
       </div>

       <div className="flex space-x-3 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition">Discard</button>
          <button type="submit" className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-200">Register Task Force</button>
       </div>
    </form>
  );
};

export default VolunteersPage;
