
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Users,
  DollarSign,
  ShieldAlert,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Server,
  Download,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../services/supabase';

const revenueData = [
  { month: 'Jan', revenue: 45000, users: 1200 },
  { month: 'Feb', revenue: 52000, users: 1500 },
  { month: 'Mar', revenue: 48000, users: 1800 },
  { month: 'Apr', revenue: 61000, users: 2200 },
  { month: 'May', revenue: 55000, users: 2600 },
  { month: 'Jun', revenue: 72000, users: 3100 },
];

interface Stats {
  users: number;
  enrollments: number;
  revenue: number;
  completions: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const [usersRes, enrollRes, paymentsRes, completionsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount_usd').eq('status', 'COMPLETED'),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).not('completed_at', 'is', null),
      ]);
      const revenue = (paymentsRes.data ?? []).reduce((acc: number, p: any) => acc + Number(p.amount_usd), 0);
      setStats({
        users: usersRes.count ?? 0,
        enrollments: enrollRes.count ?? 0,
        revenue,
        completions: completionsRes.count ?? 0,
      });
    };
    load();
  }, []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Platform <span className="text-blue-500">Command Center</span></h1>
          <p className="text-gray-500 font-medium">System status: <span className="text-green-400 font-bold">Operational</span> • Last updated: Just now</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold text-sm shadow-lg shadow-blue-500/20">
            <Activity className="w-4 h-4" /> System Logs
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: stats ? `$${stats.revenue.toLocaleString()}` : '—', change: 'Live', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Registered Users', value: stats ? stats.users.toLocaleString() : '—', change: 'Live', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Total Enrollments', value: stats ? stats.enrollments.toLocaleString() : '—', change: 'Live', icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Course Completions', value: stats ? stats.completions.toLocaleString() : '—', change: 'Live', icon: ShieldAlert, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        ].map((kpi, i) => (
          <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-6`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{kpi.label}</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black">{kpi.value}</span>
              <span className={`text-xs font-bold ${kpi.color}`}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 rounded-[40px] p-8 border border-white/5">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black">Platform Growth & Revenue</h2>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-xl bg-white/10 text-xs font-bold">Month</button>
                <button className="px-4 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-white">Year</button>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1d23', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Verifications Table */}
          <div className="bg-white/5 rounded-[40px] p-8 border border-white/5 overflow-hidden">
            <h2 className="text-xl font-black mb-8">Pending Company Verifications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                    <th className="pb-4 px-4">Company</th>
                    <th className="pb-4 px-4">Applied Date</th>
                    <th className="pb-4 px-4">Status</th>
                    <th className="pb-4 px-4">Documentation</th>
                    <th className="pb-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {[
                    { name: 'Nexus Blockchain', date: 'Oct 24, 2023', status: 'In Review', color: 'text-yellow-400' },
                    { name: 'Solana Ventures', date: 'Oct 25, 2023', status: 'Pending', color: 'text-blue-400' },
                    { name: 'MetaLabs DAO', date: 'Oct 26, 2023', status: 'In Review', color: 'text-yellow-400' },
                  ].map((company, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-none">
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-blue-500">{company.name[0]}</div>
                          {company.name}
                        </div>
                      </td>
                      <td className="py-6 px-4 text-gray-500">{company.date}</td>
                      <td className="py-6 px-4">
                        <span className={`flex items-center gap-2 ${company.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full bg-current`}></div>
                          {company.status}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <button className="text-blue-500 hover:underline flex items-center gap-1">
                          View PDF <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-6 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-8">
          <div className="bg-white/5 rounded-[40px] p-8 border border-white/5">
            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
              <Server className="w-5 h-5 text-blue-500" /> Infrastructure
            </h3>
            <div className="space-y-6">
              {[
                { name: 'Main Database', status: 'Optimal', load: '12%' },
                { name: 'IPFS Gateway', status: 'Operational', load: '45%' },
                { name: 'Authentication API', status: 'Optimal', load: '8%' },
                { name: 'Blockchain RPC', status: 'Slight Delay', load: '88%', warning: true },
              ].map((service, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold">{service.name}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${service.warning ? 'text-yellow-400' : 'text-green-400'}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${service.warning ? 'bg-yellow-400' : 'bg-blue-500'}`} style={{ width: service.load }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-[40px] p-8 border border-white/5">
            <h3 className="text-lg font-black mb-8">Recent System Events</h3>
            <div className="space-y-6">
              {[
                { event: 'New Employer Registered', time: '2m ago', icon: Users, color: 'text-blue-400' },
                { event: 'Bulk Certificate Minting', time: '15m ago', icon: CheckCircle, color: 'text-green-400' },
                { event: 'Security Patch Applied', time: '1h ago', icon: ShieldAlert, color: 'text-purple-400' },
                { event: 'Wallet Connection Error', time: '3h ago', icon: XCircle, color: 'text-red-400' },
              ].map((ev, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 ${ev.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <ev.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{ev.event}</p>
                    <p className="text-xs text-gray-500">{ev.time}</p>
                  </div>
                  <MoreVertical className="w-4 h-4 text-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
