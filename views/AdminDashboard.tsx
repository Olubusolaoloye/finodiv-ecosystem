
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, DollarSign, ShieldAlert, Activity, CheckCircle, XCircle,
  Server, Download, ExternalLink, X, Loader2, UserPlus, Award,
  BookOpen, RefreshCw,
} from 'lucide-react';
import { supabase } from '../services/supabase';

const monthlyData = [
  { label: 'Jan', revenue: 45000, users: 1200 },
  { label: 'Feb', revenue: 52000, users: 1500 },
  { label: 'Mar', revenue: 48000, users: 1800 },
  { label: 'Apr', revenue: 61000, users: 2200 },
  { label: 'May', revenue: 55000, users: 2600 },
  { label: 'Jun', revenue: 72000, users: 3100 },
];

const yearlyData = [
  { label: 'Q1 2025', revenue: 145000, users: 4500 },
  { label: 'Q2 2025', revenue: 188000, users: 7900 },
  { label: 'Q3 2025', revenue: 225000, users: 12000 },
  { label: 'Q4 2025', revenue: 310000, users: 18500 },
  { label: 'Q1 2026', revenue: 289000, users: 24000 },
  { label: 'Q2 2026', revenue: 385000, users: 31000 },
];

interface Stats { users: number; enrollments: number; revenue: number; completions: number; }
interface Verification { id: string; company_name: string; contact_email: string; applied_at: string; status: string; documents_url: string | null; }
interface SystemEvent { label: string; time: string; icon: React.ElementType; color: string; }
interface InfraHealth { name: string; load: number; status: string; warning: boolean; }

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartRange, setChartRange] = useState<'month' | 'year'>('month');
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [verLoading, setVerLoading] = useState(true);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [infraHealth, setInfraHealth] = useState<InfraHealth[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadVerifications();
    loadRecentEvents();
    checkInfraHealth();
  }, []);

  const loadStats = async () => {
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

  const loadVerifications = async () => {
    setVerLoading(true);
    const { data } = await supabase
      .from('company_verifications')
      .select('id, company_name, contact_email, applied_at, status, documents_url')
      .in('status', ['PENDING', 'IN_REVIEW'])
      .order('applied_at', { ascending: false });
    setVerifications(data || []);
    setVerLoading(false);
  };

  const handleVerificationAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    await supabase
      .from('company_verifications')
      .update({ status: action, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    setVerifications(v => v.filter(x => x.id !== id));
  };

  const loadRecentEvents = async () => {
    const [newUsers, newEnrollments, newPayments, newCerts] = await Promise.all([
      supabase.from('profiles').select('name, created_at').order('created_at', { ascending: false }).limit(3),
      supabase.from('enrollments').select('enrolled_at, courses(title)').order('enrolled_at', { ascending: false }).limit(3),
      supabase.from('payments').select('amount_usd, created_at').eq('status', 'COMPLETED').order('created_at', { ascending: false }).limit(3),
      supabase.from('certificates').select('issued_at').order('issued_at', { ascending: false }).limit(2),
    ]);
    const combined: SystemEvent[] = [];
    (newUsers.data || []).forEach((u: any) => combined.push({
      label: `${u.name || 'New user'} joined the platform`,
      time: u.created_at,
      icon: UserPlus,
      color: 'text-blue-500 bg-blue-500/10',
    }));
    (newEnrollments.data || []).forEach((e: any) => combined.push({
      label: `New enrollment: ${(e.courses as any)?.title || 'a course'}`,
      time: e.enrolled_at,
      icon: BookOpen,
      color: 'text-purple-500 bg-purple-500/10',
    }));
    (newPayments.data || []).forEach((p: any) => combined.push({
      label: `Payment received: $${Number(p.amount_usd).toFixed(2)}`,
      time: p.created_at,
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10',
    }));
    (newCerts.data || []).forEach((c: any) => combined.push({
      label: 'Certificate minted on BNB Chain',
      time: c.issued_at || new Date().toISOString(),
      icon: Award,
      color: 'text-amber-500 bg-amber-500/10',
    }));
    combined.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setEvents(combined.slice(0, 8));
  };

  const checkInfraHealth = async () => {
    setPingLoading(true);
    const services = [
      { name: 'Main Database',   table: 'profiles' },
      { name: 'Courses API',     table: 'courses' },
      { name: 'Auth / Bindings', table: 'wallet_bindings' },
      { name: 'Community Hub',   table: 'community_messages' },
    ];
    const results = await Promise.all(services.map(async (s) => {
      const start = performance.now();
      await supabase.from(s.table as any).select('id', { count: 'exact', head: true });
      const ms = Math.round(performance.now() - start);
      const load = Math.min(95, Math.round(ms / 3));
      return {
        name: s.name,
        load,
        status: ms < 200 ? 'Optimal' : ms < 500 ? 'Moderate' : 'Slow',
        warning: ms > 400,
      };
    }));
    setInfraHealth(results);
    setPingLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    const [usersData, paymentsData] = await Promise.all([
      supabase.from('profiles').select('name, email, role, created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('payments').select('amount_usd, status, created_at, method').order('created_at', { ascending: false }).limit(200),
    ]);
    const lines = [
      'FINODIV Platform Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'KPI SUMMARY',
      `Total Revenue,$${stats?.revenue.toLocaleString() ?? 0}`,
      `Registered Users,${stats?.users ?? 0}`,
      `Total Enrollments,${stats?.enrollments ?? 0}`,
      `Completions,${stats?.completions ?? 0}`,
      '',
      'USERS',
      'Name,Email,Role,Joined',
      ...(usersData.data || []).map((u: any) =>
        `"${u.name}","${u.email}","${u.role}","${new Date(u.created_at).toLocaleDateString()}"`
      ),
      '',
      'PAYMENTS',
      'Amount,Status,Method,Date',
      ...(paymentsData.data || []).map((p: any) =>
        `"$${Number(p.amount_usd).toFixed(2)}","${p.status}","${p.method}","${new Date(p.created_at).toLocaleDateString()}"`
      ),
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finodiv-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const chartData = chartRange === 'month' ? monthlyData : yearlyData;
  const card = 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none';

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">
            Platform <span className="text-blue-500">Command Center</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-500 font-medium">
            System status: <span className="text-emerald-500 font-bold">Operational</span> · Last updated: Just now
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all font-bold text-sm text-slate-700 dark:text-white shadow-sm dark:shadow-none disabled:opacity-50">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </button>
          <button onClick={() => setShowLogs(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold text-sm text-white shadow-lg shadow-blue-500/20">
            <Activity className="w-4 h-4" /> System Logs
          </button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue',     value: stats ? `$${stats.revenue.toLocaleString()}` : '—', icon: DollarSign,  color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Registered Users',  value: stats ? stats.users.toLocaleString()          : '—', icon: Users,       color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
          { label: 'Total Enrollments', value: stats ? stats.enrollments.toLocaleString()    : '—', icon: CheckCircle, color: 'text-purple-500',  bg: 'bg-purple-500/10'  },
          { label: 'Completions',       value: stats ? stats.completions.toLocaleString()    : '—', icon: ShieldAlert,  color: 'text-amber-500',  bg: 'bg-amber-500/10'   },
        ].map((kpi, i) => (
          <div key={i} className={`p-8 rounded-[32px] ${card} hover:border-blue-500/20 transition-all`}>
            <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-6`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">{kpi.label}</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{kpi.value}</span>
              <span className={`text-xs font-bold ${kpi.color}`}>Live</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Revenue Chart */}
          <div className={`${card} rounded-[40px] p-8`}>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Platform Growth & Revenue</h2>
              <div className="flex gap-2">
                {(['month', 'year'] as const).map(r => (
                  <button key={r} onClick={() => setChartRange(r)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      chartRange === r
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >{r}</button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} itemStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Company Verifications */}
          <div className={`${card} rounded-[40px] p-8 overflow-hidden`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Pending Verifications
                {verifications.length > 0 && (
                  <span className="ml-3 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-black border border-red-500/20">
                    {verifications.length}
                  </span>
                )}
              </h2>
              <button onClick={loadVerifications} className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            {verLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : verifications.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-slate-500 dark:text-gray-500">All clear — no pending verifications</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 border-b border-slate-100 dark:border-white/5">
                      <th className="pb-4 px-4">Company</th>
                      <th className="pb-4 px-4">Applied</th>
                      <th className="pb-4 px-4">Status</th>
                      <th className="pb-4 px-4">Docs</th>
                      <th className="pb-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {verifications.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 last:border-none transition-colors">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                              {v.company_name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{v.company_name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-gray-500">{v.contact_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-slate-500 dark:text-gray-500 text-xs">
                          {new Date(v.applied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-5 px-4">
                          <span className={`flex items-center gap-2 font-bold text-xs ${v.status === 'IN_REVIEW' ? 'text-amber-500' : 'text-blue-500'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {v.status === 'IN_REVIEW' ? 'In Review' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          {v.documents_url ? (
                            <a href={v.documents_url} target="_blank" rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs font-medium">
                              View PDF <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400 dark:text-gray-500 text-xs">No docs</span>
                          )}
                        </td>
                        <td className="py-5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleVerificationAction(v.id, 'APPROVED')} title="Approve"
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleVerificationAction(v.id, 'REJECTED')} title="Reject"
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-8">
          {/* Infrastructure */}
          <div className={`${card} rounded-[40px] p-8`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black flex items-center gap-3 text-slate-900 dark:text-white">
                <Server className="w-5 h-5 text-blue-500" /> Infrastructure
              </h3>
              <button onClick={checkInfraHealth} disabled={pingLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50">
                <RefreshCw className={`w-3 h-3 ${pingLoading ? 'animate-spin' : ''}`} /> Ping
              </button>
            </div>
            <div className="space-y-5">
              {infraHealth.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 h-[72px] animate-pulse" />
                  ))
                : infraHealth.map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-white">{s.name}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${s.warning ? 'text-amber-500' : 'text-emerald-500'}`}>{s.status}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${s.warning ? 'bg-amber-500' : 'bg-blue-500'}`}
                          style={{ width: `${s.load}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 dark:text-gray-600 mt-1">{s.load}% response load</p>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${card} rounded-[40px] p-8`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Recent Activity</h3>
              <button onClick={loadRecentEvents} className="text-blue-500 hover:text-blue-400 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-4">
              {events.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-3/4" />
                        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                : events.slice(0, 5).map((ev, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ev.color} group-hover:scale-110 transition-transform`}>
                        <ev.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{ev.label}</p>
                        <p className="text-xs text-slate-400 dark:text-gray-500">{relativeTime(ev.time)}</p>
                      </div>
                    </div>
                  ))
              }
            </div>
            <button onClick={() => setShowLogs(true)}
              className="mt-6 w-full py-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-slate-500 dark:text-gray-400 transition-all">
              View All Logs →
            </button>
          </div>
        </div>
      </div>

      {/* System Logs Drawer */}
      {showLogs && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogs(false)} />
          <div className="w-full max-w-lg bg-white dark:bg-[#0b0e14] border-l border-slate-200 dark:border-white/10 flex flex-col h-full">
            <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5 shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">System Logs</h2>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Real-time platform activity feed</p>
              </div>
              <button onClick={() => setShowLogs(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {events.length === 0 ? (
                <p className="text-center text-slate-400 dark:text-gray-500 py-20 font-medium">No recent activity</p>
              ) : events.map((ev, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ev.color}`}>
                    <ev.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{ev.label}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                      {new Date(ev.time).toLocaleString()} · {relativeTime(ev.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-white/5 shrink-0">
              <button onClick={loadRecentEvents}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
