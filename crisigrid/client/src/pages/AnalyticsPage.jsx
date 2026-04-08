import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, PieChart, Pie
} from 'recharts';
import { 
  Loader2, 
  TrendingDown, 
  Globe, 
  Filter, 
  BarChart3, 
  PieChart as PieIcon,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsPage = () => {
  const [selectedZone, setSelectedZone] = useState('Zone-1');
  const [gapData, setGapData] = useState([]);
  const [overview, setOverview] = useState(null);
  const [zoneStats, setZoneStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [gapRes, overRes, zoneRes] = await Promise.all([
        api.get('/analytics/gap-analysis'),
        api.get('/analytics/overview'),
        api.get(`/analytics/zone/${selectedZone}`)
      ]);
      setGapData(gapRes.data);
      setOverview(overRes.data);
      setZoneStats(zoneRes.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedZone]);

  if (loading) return (
    <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
  );

  const chartData = gapData.map(item => ({
    name: `${item._id.zone} - ${item._id.resourceType}`,
    supply: item.totalSupply,
    need: item.totalNeeded,
    gap: item.gap
  }));

  const campStatusData = overview?.camps?.map(c => ({ name: c._id, count: c.count })) || [];
  const volStatusData = overview?.volunteers?.map(v => ({ name: v._id, count: v.count })) || [];
  const zoneInventoryData = zoneStats?.inventory?.map(i => ({ name: i._id, value: i.total })) || [];

  return (
    <div className="w-full min-h-full p-6 lg:p-10 space-y-12 bg-slate-50/50">
      <header className="px-2 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div>
           <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight uppercase">Operational Intelligence</h1>
           <p className="text-slate-500 font-medium tracking-tight">Supply chain transparency and resource allocation analytics</p>
        </div>
        <div className="bg-white border-2 border-slate-100 p-2 rounded-2xl flex items-center shadow-sm shrink-0">
           <Filter size={18} className="text-slate-400 mx-3" />
           <select 
             value={selectedZone} 
             onChange={e => setSelectedZone(e.target.value)}
             className="bg-transparent text-sm font-black uppercase text-slate-800 outline-none pr-4 cursor-pointer"
           >
              {['Zone-1', 'Zone-2', 'Zone-3', 'Zone-4', 'Zone-5'].map(z => <option key={z} value={z}>{z} Insights</option>)}
           </select>
        </div>
      </header>

      {/* Resource Gap Analysis section */}
      <section className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden w-full">
        <div className="w-full h-2 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 mb-8 shadow-sm"></div>
        <div className="flex items-center space-x-3 mb-10 pl-2">
           <TrendingDown className="text-red-500" size={32} />
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Critical Supply Gap Matrix</h2>
        </div>

        {chartData.length > 0 ? (
          <div className="space-y-12 w-full">
            <div className="h-[300px] md:h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    angle={-35} 
                    textAnchor="end" 
                    height={100}
                    interval={0} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                  <Bar dataKey="supply" name="Net Supply" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="need" name="Total Demand" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={32}>
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.need > entry.supply ? '#ef4444' : '#fca5a5'} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gap Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-100">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Zone & Resource</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Supply</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Need</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Gap</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Operational Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {chartData.map(item => (
                       <tr key={item.name} className="hover:bg-slate-50 transition">
                         <td className="px-6 py-4 font-black text-slate-800 text-sm whitespace-nowrap">{item.name}</td>
                         <td className="px-6 py-4 text-center font-bold text-slate-600">{item.supply}</td>
                         <td className="px-6 py-4 text-center font-bold text-slate-600">{item.need}</td>
                         <td className="px-6 py-4 text-center font-black text-red-600">{item.gap > 0 ? `-${item.gap}` : '0'}</td>
                         <td className="px-6 py-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              item.gap > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                               {item.gap > 0 ? 'Shortfall (Deficit)' : 'Sufficient'}
                            </span>
                         </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
             <CheckCircle className="mx-auto text-emerald-500 mb-4 opacity-20" size={64} />
             <h3 className="text-xl font-black text-slate-800">All zones are sufficiently supplied</h3>
             <p className="text-slate-400 mt-2">Current inventory levels meet or exceed all active unfulfilled needs.</p>
          </div>
        )}
      </section>

      {/* Zone Details section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-xl shadow-slate-200">
            <div className="flex items-center space-x-3 mb-8">
               <Globe className="text-blue-400" size={28} />
               <h3 className="text-xl font-black uppercase tracking-widest">{selectedZone} Tactical Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               <MetricCard title="Camps" value={zoneStats?.totalCamps || 0} />
               <MetricCard title="Personnel" value={zoneStats?.totalVolunteers || 0} />
               <MetricCard title="Emergency Needs" value={zoneStats?.needsCount || 0} />
            </div>
            
            <div className="h-[250px] w-full flex items-center justify-center">
               {zoneInventoryData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie 
                       data={zoneInventoryData} 
                       cx="50%" cy="50%" innerRadius={60} outerRadius={80} 
                       fill="#8884d8" paddingAngle={5} dataKey="value"
                     >
                       {zoneInventoryData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', background: '#1e293b', color: '#fff', fontSize: '10px' }} 
                     />
                     <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }} />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <p className="text-slate-600 font-black uppercase italic text-xs">No active inventory data</p>
               )}
            </div>
         </div>

         {/* Overview Status Charts */}
         <div className="grid grid-cols-1 gap-8">
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h4 className="text-xs font-black uppercase tracking-[.2em] text-slate-400 mb-6 flex items-center">
                  <BarChart3 size={16} className="mr-2" />
                  Camp Health Matrix
               </h4>
               <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campStatusData} layout="vertical" margin={{ left: -30 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                       <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {campStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'critical' ? '#ef4444' : entry.name === 'strained' ? '#f59e0b' : '#10b981'} />
                          ))}
                       </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h4 className="text-xs font-black uppercase tracking-[.2em] text-slate-400 mb-6 flex items-center">
                  <PieIcon size={16} className="mr-2" />
                  Volunteer Force Readiness
               </h4>
               <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volStatusData} margin={{ left: -30 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip cursor={{ fill: '#f8fafc' }} />
                       <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value }) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center">
     <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{title}</p>
     <p className="text-3xl font-black text-white leading-none tracking-tight">{value}</p>
  </div>
);

export default AnalyticsPage;
