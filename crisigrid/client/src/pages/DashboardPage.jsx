import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  Loader2, 
  Map as MapIcon, 
  Users, 
  Package, 
  Bell, 
  CheckCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const createDivIcon = (status) => {
  const colors = {
    stable: 'bg-emerald-500',
    strained: 'bg-amber-500',
    critical: 'bg-red-500'
  };
  const colorClass = colors[status] || 'bg-slate-500';

  return L.divIcon({
    className: 'custom-pin',
    html: `<div class="relative flex items-center justify-center">
             <div class="absolute w-6 h-6 rounded-full ${colorClass} opacity-20 animate-ping"></div>
             <div class="relative w-4 h-4 rounded-full ${colorClass} border-2 border-white shadow-lg"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [campsRes, statsRes, alertsRes] = await Promise.all([
        api.get('/camps'),
        api.get('/analytics/overview'),
        api.get('/alerts?resolved=false')
      ]);
      setCamps(campsRes.data);
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      // Axios interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (id) => {
    try {
      // Optimistic update
      const originalAlerts = [...alerts];
      setAlerts(alerts.filter(a => a._id !== id));
      
      await api.patch(`/alerts/${id}/resolve`);
      toast.success("Alert resolved");
    } catch (err) {
      fetchData(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-medium animate-pulse">Initializing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full p-6 space-y-6 bg-slate-50/50">
      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        <StatCard 
          icon={<MapIcon size={24} />} 
          title="Total Camps" 
          value={camps.length} 
          subtitle={`${stats?.camps?.find(c => c._id === 'stable')?.count || 0} stable · ${stats?.camps?.find(c => c._id === 'strained')?.count || 0} strained`}
          color="blue"
          onClick={() => navigate('/resources')}
        />
        <StatCard 
          icon={<Package size={24} />} 
          title="Open Needs" 
          value={stats?.needs?.reduce((acc, curr) => acc + curr.count, 0) || 0}
          subtitle="Awaiting fulfillment"
          color="amber"
          onClick={() => navigate('/resources')}
        />
        <StatCard 
          icon={<Users size={24} />} 
          title="Total Volunteers" 
          value={stats?.volunteers?.reduce((acc, curr) => acc + curr.count, 0) || 0}
          subtitle="Ready for deployment"
          color="indigo"
          onClick={() => navigate('/volunteers')}
        />
        <StatCard 
          icon={<Bell size={24} />} 
          title="Active Alerts" 
          value={alerts.length}
          subtitle="Requires attention"
          color="red"
          onClick={() => navigate('/alerts')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[500px] md:h-[600px] relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur border border-slate-200 rounded-full px-4 py-2 flex items-center space-x-4 shadow-xl shadow-slate-200/50">
             <LegendItem color="bg-emerald-500" label="Stable" />
             <LegendItem color="bg-amber-500" label="Strained" />
             <LegendItem color="bg-red-500" label="Critical" />
          </div>
          
          <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {camps.map(camp => (
              <Marker 
                key={camp._id} 
                position={[camp.location.coordinates[1], camp.location.coordinates[0]]}
                icon={createDivIcon(camp.status)}
              >
                <Popup className="custom-popup">
                   <div className="p-1 min-w-[200px]">
                      <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                         <div>
                            <h3 className="font-bold text-slate-800 leading-tight">{camp.name}</h3>
                            <p className="text-[10px] text-slate-500 uppercase font-black">{camp.zone}</p>
                         </div>
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                           camp.status === 'stable' ? 'bg-emerald-100 text-emerald-700' :
                           camp.status === 'strained' ? 'bg-amber-100 text-amber-700' :
                           'bg-red-100 text-red-700'
                         }`}>
                           {camp.status}
                         </span>
                      </div>
                      
                      <div className="space-y-3">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Capacity</p>
                            <div className="flex items-center space-x-2">
                               <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      (camp.currentOccupancy / camp.capacity) > 0.9 ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${(camp.currentOccupancy / camp.capacity) * 100}%` }}
                                  ></div>
                               </div>
                               <span className="text-xs font-bold text-slate-700">{camp.currentOccupancy}/{camp.capacity}</span>
                            </div>
                         </div>
                         
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase font-black">Quick Inventory</p>
                            <div className="grid grid-cols-2 gap-2">
                               {camp.inventory.map(item => (
                                 <div key={item.resourceType} className="flex flex-col">
                                    <span className="text-[9px] text-slate-400 capitalize">{item.resourceType}</span>
                                    <span className="text-xs font-bold text-slate-700">{item.quantity} {item.unit}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      <button 
                        onClick={() => navigate(`/resources?camp=${camp._id}`)}
                        className="w-full mt-4 flex items-center justify-center space-x-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition duration-200"
                      >
                        <span>View Details</span>
                        <ChevronRight size={14} />
                      </button>
                   </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {camps.length === 0 && (
            <div className="absolute inset-0 z-[500] bg-slate-50/50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 text-center">
                <AlertTriangle className="mx-auto text-amber-500 mb-2" size={32} />
                <p className="font-bold text-slate-800">No camps registered yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Alerts Feed Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-800">Active Emergency Alerts</h3>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">{alerts.length}</span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={32} />
                   </div>
                   <p className="font-bold text-slate-800">No active alerts</p>
                   <p className="text-xs text-slate-400 mt-1">All mission-critical systems are stable across zones.</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-start mb-2">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                         alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {alert.severity}
                       </span>
                       <span className="text-[10px] font-semibold text-slate-400">
                         {formatDistanceToNow(new Date(alert.createdAt))} ago
                       </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-2 leading-snug">{alert.message}</p>
                    <div className="flex items-center text-[10px] text-slate-500 space-x-2 mb-3">
                       <span className="font-bold uppercase tracking-wider">{alert.campId?.name || 'Central'}</span>
                       <span>•</span>
                       <span>{alert.campId?.zone}</span>
                    </div>
                    
                    {user?.role === 'coordinator' && (
                      <button 
                         onClick={() => handleResolve(alert._id)}
                         className="w-full bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 py-1.5 rounded-xl text-xs font-black uppercase transition duration-200"
                      >
                        Resolve Alert
                      </button>
                    )}
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color, onClick }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer group"
    >
       <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
             {icon}
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition" />
       </div>
       <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
       <div className="flex items-baseline space-x-2">
          <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h4>
          <p className="text-[10px] font-bold text-slate-400 truncate uppercase">{subtitle}</p>
       </div>
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center space-x-2">
     <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
     <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider whitespace-nowrap">{label}</span>
  </div>
);

export default DashboardPage;
