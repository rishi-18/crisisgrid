import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Trash2, 
  Pencil, 
  Save, 
  X, 
  Loader2, 
  AlertCircle,
  TrendingDown,
  CheckCircle,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

const FormInput = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
    <input 
      {...props} 
      onChange={e => props.onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition placeholder:text-slate-300"
    />
  </div>
);

const MapPicker = ({ location, setLocation }) => {
  // Custom Icon for the "Placement Pin"
  const placementIcon = L.divIcon({
    className: 'custom-pin',
    html: `<div class="relative flex items-center justify-center">
             <div class="absolute w-10 h-10 rounded-full bg-blue-500 opacity-20 animate-pulse"></div>
             <div class="relative w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-2xl"></div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  useMapEvents({
    click(e) {
      setLocation([e.latlng.lng, e.latlng.lat]);
    }
  });

  return location[0] && location[1] ? (
    <Marker position={[location[1], location[0]]} icon={placementIcon}>
      <Popup className="custom-popup">
        <div className="p-2 font-bold text-slate-800 text-center">
           Selected Site Coordinates
        </div>
      </Popup>
    </Marker>
  ) : null;
};

const NeedRegistrationForm = ({ camps, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ campId: user?.assignedCampId || '', resourceType: 'food', quantityNeeded: 0, urgency: 'medium' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.campId) return toast.error("Select a target camp");
      await api.post('/needs', form);
      toast.success("Need registered");
      onSuccess();
    } catch (err) {}
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
       <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Relief Camp *</label>
          <select 
            value={form.campId} 
            onChange={e => setForm({...form, campId: e.target.value})}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white font-bold outline-none ring-blue-500 focus:ring-2 transition"
          >
             <option value="" disabled>Select Camp...</option>
             {camps.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
       </div>
       <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Resource *</label>
          <select 
            value={form.resourceType} 
            onChange={e => setForm({...form, resourceType: e.target.value})}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white font-bold outline-none"
          >
             {['food', 'water', 'medicine', 'shelter'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
       </div>
       <div className="md:col-span-1">
          <FormInput 
             label="Qty Needed *" 
             type="number" 
             value={form.quantityNeeded} 
             onChange={v => setForm({...form, quantityNeeded: v})} 
             style={{ background: 'rgb(51 65 85 / 0.5)', borderColor: 'rgb(71 85 105)', color: 'white' }} 
          />
       </div>
       <div className="flex space-x-2">
          <button type="submit" className="flex-1 bg-emerald-600 py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/40">Register</button>
          <button type="button" onClick={onCancel} className="bg-slate-700 px-4 py-3 rounded-xl font-black text-xs uppercase hover:bg-slate-600 transition">Cancel</button>
       </div>
    </form>
  );
};

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------

const ResourcesPage = () => {
  const { user, hasRole } = useAuth();
  const [camps, setCamps] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCamp, setShowAddCamp] = useState(false);
  const [editingCampId, setEditingCampId] = useState(null);
  const [showAddNeed, setShowAddNeed] = useState(false);

  const [campForm, setCampForm] = useState({
    name: '',
    zone: 'Zone-1',
    location: { type: 'Point', coordinates: [77.1025, 28.7041] }, // [lng, lat]
    capacity: 0,
    inventory: [
      { resourceType: 'food', quantity: 0, unit: 'kgs', threshold: 50 },
      { resourceType: 'water', quantity: 0, unit: 'liters', threshold: 100 },
      { resourceType: 'medicine', quantity: 0, unit: 'kits', threshold: 10 },
      { resourceType: 'shelter', quantity: 0, unit: 'tents', threshold: 5 }
    ]
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campsRes, needsRes] = await Promise.all([
        api.get('/camps'),
        api.get('/needs')
      ]);
      setCamps(campsRes.data);
      setNeeds(needsRes.data);
    } catch (err) {
      toast.error("Network disruption detected.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    try {
      await api.post('/camps', campForm);
      toast.success("Operational hub synchronized!");
      setShowAddCamp(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failure.");
    }
  };

  const handleDeleteCamp = async (id) => {
    if (!window.confirm("CONFIRM DECOMMISSION: Remove this facility and its inventory?")) return;
    try {
      await api.delete(`/camps/${id}`);
      toast.success("Facility decommissioned.");
      fetchData();
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Global Grid...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full p-6 lg:p-10 space-y-10 bg-slate-50/50 pb-20">
      
      {/* Camps Section */}
      <section className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
              <Package className="mr-2 text-blue-600" />
              Relief Facility Matrix
            </h1>
            <p className="text-sm text-slate-500 font-medium tracking-tight">Deployment and supply chain oversight</p>
          </div>
          {hasRole('coordinator') && (
            <button 
              onClick={() => setShowAddCamp(!showAddCamp)}
              className="flex items-center justify-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-3xl font-black hover:bg-blue-700 transition shadow-2xl shadow-blue-900/20 active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              <Plus size={20} />
              <span>Register New Hub</span>
            </button>
          )}
        </div>

        {/* Add Camp Form (with Interactive Map) */}
        {showAddCamp && (
          <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] border-2 border-blue-50 shadow-2xl mb-12 animate-in slide-in-from-top-12 duration-500 relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Strategic Site Selection</h3>
                <p className="text-sm text-slate-500 font-medium">Click on the grid to pin a new relief center coordinate.</p>
              </div>
              <button onClick={() => setShowAddCamp(false)} className="text-slate-400 hover:text-red-500 p-2 bg-slate-100 rounded-2xl transition"><X /></button>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-12">
               {/* Data Terminal */}
               <form onSubmit={handleCreateCamp} className="w-full lg:w-1/2 space-y-8">
                  <div className="space-y-6">
                     <FormInput label="Relief Center Name *" placeholder="Delhi Northern Terminal" value={campForm.name} onChange={v => setCampForm({...campForm, name: v})} required />
                     <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Zone Classification *</label>
                         <select 
                           value={campForm.zone} 
                           onChange={e => setCampForm({...campForm, zone: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none"
                         >
                            {['Zone-1', 'Zone-2', 'Zone-3', 'Zone-4', 'Zone-5'].map(z => <option key={z} value={z}>{z}</option>)}
                         </select>
                       </div>
                       <FormInput label="Max Capacity (Pax) *" type="number" value={campForm.capacity} onChange={v => setCampForm({...campForm, capacity: v})} required />
                     </div>
                     <div className="grid grid-cols-2 gap-6 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                       <FormInput label="Pinned Longitude" type="number" step="0.000001" value={campForm.location.coordinates[0]} onChange={v => setCampForm({...campForm, location: {...campForm.location, coordinates: [parseFloat(v), campForm.location.coordinates[1]]}})} />
                       <FormInput label="Pinned Latitude" type="number" step="0.000001" value={campForm.location.coordinates[1]} onChange={v => setCampForm({...campForm, location: {...campForm.location, coordinates: [campForm.location.coordinates[0], parseFloat(v)]}})} />
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Initial Supply Load</label>
                     <div className="grid grid-cols-2 gap-4">
                        {campForm.inventory.map((item, idx) => (
                          <div key={item.resourceType} className="flex flex-col space-y-1 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{item.resourceType}</span>
                             <div className="flex space-x-2">
                                <input 
                                  type="number" 
                                  placeholder="Qty" 
                                  value={item.quantity} 
                                  onChange={e => {
                                    const newInv = [...campForm.inventory];
                                    newInv[idx].quantity = e.target.value;
                                    setCampForm({...campForm, inventory: newInv});
                                  }} 
                                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold" 
                                />
                                <span className="text-[10px] font-bold text-slate-400 flex items-center">{item.unit}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition duration-500 uppercase tracking-widest text-xs">Deploy Relief Station</button>
               </form>

               {/* Placement Map */}
               <div className="w-full lg:w-1/2 h-[400px] lg:h-auto min-h-[500px] bg-slate-100 rounded-[3rem] border border-slate-200 overflow-hidden relative shadow-inner">
                  <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-xl border border-slate-200">
                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Site Placement Mode</p>
                  </div>
                  <MapContainer 
                    center={[20.5937, 78.9629]} 
                    zoom={5} 
                    className="h-full w-full"
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapPicker 
                      location={campForm.location.coordinates} 
                      setLocation={(coords) => setCampForm({...campForm, location: { ...campForm.location, coordinates: [coords[0], coords[1]] }})} 
                    />
                  </MapContainer>
                  <p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl"> Click map to update coordinates</p>
               </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 uppercase tracking-widest font-black">
                <tr>
                  <th className="px-6 py-5 text-[10px] text-slate-400">Relief Facility</th>
                  <th className="px-6 py-5 text-[10px] text-slate-400">Supply Status</th>
                  <th className="px-6 py-5 text-[10px] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {camps.map(camp => (
                  <tr key={camp._id} className="border-b border-slate-100 hover:bg-slate-50 transition group">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          camp.status === 'stable' ? 'bg-emerald-500' :
                          camp.status === 'strained' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight">{camp.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{camp.zone} • {camp.currentOccupancy}/{camp.capacity} PAX</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex space-x-2">
                        {camp.inventory?.map(item => (
                          <div 
                            key={item.resourceType} 
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition ${
                              item.quantity <= (item.threshold || 0) 
                              ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                              : 'bg-slate-50 border-slate-200 text-slate-400 grayscale hover:grayscale-0'
                            }`}
                          >
                            {item.resourceType}: {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {hasRole('coordinator') && (
                        <button onClick={() => handleDeleteCamp(camp._id)} className="text-slate-300 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-xl">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Resource Gap Analysis (Aggregation Pipeline Exercise) */}
      <section className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white w-full">
          <div className="flex flex-col lg:flex-row justify-between gap-8 mb-12 w-full">
             <div className="w-full">
                <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2 uppercase italic text-blue-500">The Request Queue</h2>
                <p className="text-slate-400 font-medium tracking-tight">Active shortages detected across the operational grid nodes</p>
             </div>
             <button 
               onClick={() => setShowAddNeed(!showAddNeed)}
               className="flex items-center justify-center space-x-3 bg-emerald-600 px-10 py-5 rounded-3xl font-black hover:bg-emerald-700 transition shrink-0 shadow-2xl shadow-emerald-900/40 uppercase tracking-widest text-xs"
             >
                <TrendingDown size={22} className="rotate-180" />
                <span>Raise Relief Request</span>
             </button>
          </div>

          {showAddNeed && (
            <div className="bg-slate-800 p-8 rounded-[2rem] border border-slate-700 mb-12 animate-in slide-in-from-top-8 duration-500 shadow-2xl w-full">
               <NeedRegistrationForm camps={camps} onSuccess={() => { fetchData(); setShowAddNeed(false); }} onCancel={() => setShowAddNeed(false)} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
             {needs.map(need => (
               <div key={need._id} className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] group hover:bg-white/10 transition duration-300 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 px-6 py-2 text-[8px] font-black uppercase tracking-widest rounded-bl-3xl ${
                    need.urgency === 'critical' ? 'bg-red-600 text-white' : 
                    need.urgency === 'medium' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {need.urgency} priority
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
                      <AlertCircle size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{need.resourceType}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Quantity: {need.quantityNeeded}</p>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Cluster</p>
                      <p className="text-sm font-bold text-white tracking-tight">{need.zone}</p>
                    </div>
                  </div>
               </div>
             ))}
             {needs.length === 0 && (
               <div className="col-span-full py-20 text-center opacity-30 select-none">
                  <CheckCircle size={64} className="mx-auto mb-4 text-emerald-500" />
                  <p className="text-lg font-black uppercase tracking-widest">No Active Shortfalls</p>
               </div>
             )}
          </div>
      </section>
    </div>
  );
};

export default ResourcesPage;
