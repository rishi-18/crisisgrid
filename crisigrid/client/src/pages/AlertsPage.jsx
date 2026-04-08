import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Package, 
  Plus, 
  X, 
  Loader2,
  Filter,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const AlertsPage = () => {
  const { user, hasRole } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active | resolved
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchData = async () => {
    try {
      const [aRes, cRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/camps')
      ]);
      setAlerts(aRes.data);
      setCamps(cRes.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (id) => {
    try {
      // Optimistic transition
      setAlerts(alerts.map(a => a._id === id ? { ...a, resolved: true } : a));
      await api.patch(`/alerts/${id}/resolve`);
      toast.success("Alert marked as resolved");
      fetchData(); // Sync with server for timestamps etc
    } catch (err) {
      fetchData();
    }
  };

  const filteredAlerts = alerts.filter(a => activeTab === 'active' ? !a.resolved : a.resolved);

  const getAlertLabel = (type) => {
    const labels = {
      'low_stock': 'Low Stock Severity',
      'overcapacity': 'Overload Emergency',
      'no_volunteers': 'Personnel Shortage'
    };
    return labels[type] || 'Operational Alert';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
  );

  return (
    <div className="w-full min-h-full p-6 md:p-10 space-y-10 bg-slate-50/50 flex flex-col pb-20 md:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
              <Bell className="mr-3 text-red-500 animate-pulse" />
              Emergency Management
           </h1>
           <p className="text-slate-500 font-medium tracking-tight">Real-time incident tracking and operational warnings</p>
        </div>
        {hasRole('coordinator') && (
          <button 
             onClick={() => setShowAddForm(true)}
             className="bg-red-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition shadow-xl shadow-red-200"
          >
             <Plus size={18} className="inline mr-2" />
             Declare Incident
          </button>
        )}
      </header>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddForm(false)} />
           <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
              <AddAlertForm camps={camps} onCancel={() => setShowAddForm(false)} onSuccess={() => { fetchData(); setShowAddForm(false); }} />
           </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl md:w-fit shrink-0">
         <button 
           onClick={() => setActiveTab('active')}
           className={`flex-1 md:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center transition duration-200 ${
             activeTab === 'active' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'
           }`}
         >
            Active Incidents
            <span className={`ml-2 px-1.5 rounded-lg text-[10px] ${activeTab === 'active' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
               {alerts.filter(a => !a.resolved).length}
            </span>
         </button>
         <button 
           onClick={() => setActiveTab('resolved')}
           className={`flex-1 md:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center transition duration-200 ${
             activeTab === 'resolved' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
           }`}
         >
            Resolved History
            <span className="ml-2 px-1.5 bg-slate-200 text-slate-500 rounded-lg text-[10px]">
               {alerts.filter(a => a.resolved).length}
            </span>
         </button>
      </div>

      {/* Grid Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
         {filteredAlerts.map(alert => (
           <div key={alert._id} className={`bg-white p-6 rounded-[2rem] border transition duration-300 relative group ${
             alert.resolved ? 'border-slate-100 opacity-60' : 'border-slate-200 hover:border-red-200 hover:shadow-xl'
           }`}>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center space-x-6">
                     <div className={`shrink-0 w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${
                       alert.resolved ? 'bg-slate-50 text-slate-300' : 'bg-red-50 text-red-500 shadow-inner'
                     }`}>
                        {alert.type === 'low_stock' ? <Package size={32} /> : 
                         alert.type === 'overcapacity' ? <AlertTriangle size={32} /> : <Bell size={32} />}
                     </div>
                     <div>
                        <div className="flex items-center space-x-3 mb-1">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                             alert.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-400 text-white'
                           }`}>
                             {alert.severity}
                           </span>
                           <h4 className="font-black text-slate-800 text-lg md:text-xl tracking-tight leading-none uppercase">{getAlertLabel(alert.type)}</h4>
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-tight max-w-xl">{alert.message}</p>
                     </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-3 shrink-0">
                     <div className="flex items-center md:flex-col md:items-end gap-2 text-slate-400">
                        <div className="flex items-center text-[10px] font-black uppercase tracking-wider">
                           <MapPin size={12} className="mr-1" />
                           {alert.campId?.name} • {alert.campId?.zone || alert.zone}
                        </div>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-wider">
                           <Clock size={12} className="mr-1" />
                           {formatDistanceToNow(new Date(alert.createdAt))} ago
                        </div>
                     </div>
                     {!alert.resolved && hasRole('coordinator') && (
                        <button 
                           onClick={() => handleResolve(alert._id)}
                           className="flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-sm"
                        >
                           <CheckCircle size={16} />
                           <span>Resolve Impact</span>
                        </button>
                     )}
                  </div>
               </div>
           </div>
         ))}

         {filteredAlerts.length === 0 && (
           <div className="py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <CheckCircle className="mx-auto text-emerald-500 mb-4 opacity-10" size={80} />
              <h5 className="text-2xl font-black text-slate-800 uppercase tracking-widest">No Alerts in Queue</h5>
              <p className="text-slate-400 mt-2 font-medium tracking-tight">System transparency maintained. All zones reporting green status.</p>
           </div>
         )}
      </div>
    </div>
  );
};

const AddAlertForm = ({ camps, onCancel, onSuccess }) => {
  const [form, setForm] = useState({ 
    campId: '', type: 'low_stock', resourceType: '', 
    message: '', severity: 'warning' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.campId || !form.message) return toast.error("Camp and message required");
      await api.post('/alerts', form);
      toast.success("Industrial alert declared");
      onSuccess();
    } catch (err) {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-widest">Declare Operational Alert</h3>
          <X className="text-slate-300 hover:text-red-500 cursor-pointer" onClick={onCancel} />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Target Camp *</label>
             <select 
               value={form.campId} 
               onChange={e => setForm({...form, campId: e.target.value})}
               className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-red-500/10"
             >
                <option value="" disabled>Select Target Location...</option>
                {camps.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Alert Category *</label>
             <select 
               value={form.type} 
               onChange={e => setForm({...form, type: e.target.value})}
               className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none"
             >
                <option value="low_stock">Low Stock Shortage</option>
                <option value="overcapacity">Overcapacity Emergency</option>
                <option value="no_volunteers">Personnel Vacuum</option>
             </select>
          </div>
       </div>

       <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Detailed Situation Message *</label>
          <textarea 
            rows="3"
            placeholder="Describe the immediate operational threat..."
            value={form.message}
            onChange={e => setForm({...form, message: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-medium text-slate-800 outline-none"
          />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Escalation Tier *</label>
             <div className="flex space-x-2">
                {['warning', 'critical'].map(sev => (
                  <button 
                    key={sev} 
                    type="button" 
                    onClick={() => setForm({...form, severity: sev})}
                    className={`flex-1 py-3 rounded-2xl border text-[10px] uppercase font-black tracking-widest transition ${
                      form.severity === sev 
                       ? 'bg-red-600 border-red-600 text-white shadow-lg' 
                       : 'bg-white border-slate-200 text-slate-400 hover:border-red-200'
                    }`}
                  >
                     {sev}
                  </button>
                ))}
             </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition shadow-xl shadow-slate-200">Declare Incident <ArrowRight className="inline ml-2" size={16} /></button>
       </div>
    </form>
  );
};

export default AlertsPage;
