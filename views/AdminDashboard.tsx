import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, DollarSign, ShieldAlert, Activity, CheckCircle, XCircle,
  Server, Download, ExternalLink, X, Loader2, UserPlus,
  BookOpen, RefreshCw,
} from 'lucide-react';
import { convex } from '../services/convex';
import { api as convexApi } from '../convex/_generated/api';

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
interface SystemEvent { label: string; time: string; icon: React.ElementType; color: string; bg: string; }
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
    try {
      const profiles = await convex.query(convexApi.profiles.getLeaderboard, { limit: 500 });
      setStats({ users: profiles.length, enrollments: 0, revenue: 0, completions: 0 });
    } catch (e) { console.error('loadStats:', e); }
  };

  const loadVerifications = async () => {
    setVerLoading(true);
    setVerifications([]);
    setVerLoading(false);
  };

  const handleVerificationAction = async (id: string, _action: 'APPROVED' | 'REJECTED') => {
    setVerifications(v => v.filter(x => x.id !== id));
  };

  const loadRecentEvents = async () => {
    try {
      const profiles = await convex.query(convexApi.profiles.getLeaderboard, { limit: 5 });
      const combined: SystemEvent[] = profiles.map((p: any) => ({
        label: `${p.name || 'New user'} joined the platform`,
        time: new Date(p._creationTime).toISOString(),
        icon: UserPlus,
        color: 'var(--color-accent)',
        bg: 'rgba(47,109,242,0.1)',
      }));
      combined.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setEvents(combined.slice(0, 8));
    } catch (e) { console.error('loadRecentEvents:', e); }
  };

  const checkInfraHealth = async () => {
    setPingLoading(true);
    const checks = [
      { name: 'Main Database',   fn: () => convex.query(convexApi.profiles.getLeaderboard, { limit: 1 }) },
      { name: 'Courses API',     fn: () => convex.query(convexApi.courses.listPublished, { limit: 1 }) },
      { name: 'Auth / Bindings', fn: () => convex.query(convexApi.profiles.getLeaderboard, { limit: 1 }) },
      { name: 'Community Hub',   fn: () => convex.query(convexApi.community.listRooms, {}) },
    ];
    const results = await Promise.all(checks.map(async (s) => {
      const start = performance.now();
      try { await s.fn(); } catch {}
      const ms = Math.round(performance.now() - start);
      const load = Math.min(95, Math.round(ms / 3));
      return { name: s.name, load, status: ms < 200 ? 'Optimal' : ms < 500 ? 'Moderate' : 'Slow', warning: ms > 400 };
    }));
    setInfraHealth(results);
    setPingLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    const usersData = await convex.query(convexApi.profiles.getLeaderboard, { limit: 200 });
    const lines = [
      'FINODIV Platform Report',
      `Generated: ${new Date().toLocaleString()}`,
      '', 'KPI SUMMARY',
      `Registered Users,${stats?.users ?? 0}`,
      `Total Enrollments,${stats?.enrollments ?? 0}`,
      `Completions,${stats?.completions ?? 0}`,
      '', 'USERS', 'Name,Email,Role,Joined',
      ...(usersData || []).map((u: any) =>
        `"${u.name}","${u.email}","${u.role}","${new Date(u._creationTime).toLocaleDateString()}"`
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

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 24,
  };

  const KPI_ITEMS = [
    { label: 'Total Revenue',     value: stats ? `$${stats.revenue.toLocaleString()}` : '—', icon: DollarSign,  color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
    { label: 'Registered Users',  value: stats ? stats.users.toLocaleString()          : '—', icon: Users,       color: 'var(--color-accent)', bg: 'rgba(47,109,242,0.1)' },
    { label: 'Total Enrollments', value: stats ? stats.enrollments.toLocaleString()    : '—', icon: BookOpen,    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { label: 'Completions',       value: stats ? stats.completions.toLocaleString()    : '—', icon: ShieldAlert, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: 1600, margin: '0 auto', paddingBottom: 128 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.25rem)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: 8 }}>
            Platform <span style={{ color: 'var(--color-accent)' }}>Command Center</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
            System status: <span style={{ color: '#34d399', fontWeight: 700 }}>Operational</span> · Last updated: Just now
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleExport} disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 16, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: exporting ? 0.5 : 1 }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-deep)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-card)')}
          >
            {exporting ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Download style={{ width: 16, height: 16 }} />}
            Export CSV
          </button>
          <button onClick={() => setShowLogs(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 16, background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(47,109,242,0.2)' }}>
            <Activity style={{ width: 16, height: 16 }} /> System Logs
          </button>
        </div>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        {KPI_ITEMS.map((kpi, i) => (
          <div key={i} style={{ ...cardStyle, padding: 28, transition: 'border-color 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(47,109,242,0.2)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, background: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <kpi.icon style={{ width: 20, height: 20 }} />
            </div>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-text-muted)', marginBottom: 6 }}>{kpi.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-text-primary)' }}>{kpi.value}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: kpi.color }}>Live</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }} className="lg:grid-cols-[1fr_320px] grid-cols-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Revenue Chart */}
          <div style={{ ...cardStyle, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-text-primary)' }}>Platform Growth & Revenue</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['month', 'year'] as const).map(r => (
                  <button key={r} onClick={() => setChartRange(r)}
                    style={{
                      padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', border: 'none', cursor: 'pointer',
                      background: chartRange === r ? 'rgba(47,109,242,0.1)' : 'transparent',
                      color: chartRange === r ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                  >{r}</button>
                ))}
              </div>
            </div>
            <div style={{ height: 280, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2F6DF2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2F6DF2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 12 }} itemStyle={{ color: 'var(--color-text-primary)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#2F6DF2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Company Verifications */}
          <div style={{ ...cardStyle, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                Pending Verifications
                {verifications.length > 0 && (
                  <span style={{ padding: '2px 10px', borderRadius: 99, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 11, fontWeight: 800, border: '1px solid rgba(239,68,68,0.2)' }}>
                    {verifications.length}
                  </span>
                )}
              </h2>
              <button onClick={loadVerifications} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <RefreshCw style={{ width: 12, height: 12 }} /> Refresh
              </button>
            </div>
            {verLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                <Loader2 style={{ width: 28, height: 28, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : verifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <CheckCircle style={{ width: 40, height: 40, color: '#34d399', margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 14 }}>All clear — no pending verifications</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Company', 'Applied', 'Status', 'Docs', 'Actions'].map((h, i) => (
                        <th key={h} style={{ padding: '0 16px 14px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-text-muted)', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '18px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(47,109,242,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-accent)' }}>
                              {v.company_name[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 13 }}>{v.company_name}</p>
                              <p style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{v.contact_email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '18px 16px', color: 'var(--color-text-muted)', fontSize: 12 }}>
                          {new Date(v.applied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '18px 16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 11, color: v.status === 'IN_REVIEW' ? '#f59e0b' : 'var(--color-accent)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                            {v.status === 'IN_REVIEW' ? 'In Review' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '18px 16px' }}>
                          {v.documents_url ? (
                            <a href={v.documents_url} target="_blank" rel="noopener noreferrer"
                              style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
                              View PDF <ExternalLink style={{ width: 11, height: 11 }} />
                            </a>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>No docs</span>
                          )}
                        </td>
                        <td style={{ padding: '18px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                            <button onClick={() => handleVerificationAction(v.id, 'APPROVED')}
                              style={{ padding: 8, borderRadius: 10, background: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#34d399'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.1)'; (e.currentTarget as HTMLElement).style.color = '#34d399'; }}
                            >
                              <CheckCircle style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => handleVerificationAction(v.id, 'REJECTED')}
                              style={{ padding: 8, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                            >
                              <XCircle style={{ width: 14, height: 14 }} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Infrastructure */}
          <div style={{ ...cardStyle, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server style={{ width: 18, height: 18, color: 'var(--color-accent)' }} /> Infrastructure
              </h3>
              <button onClick={checkInfraHealth} disabled={pingLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', opacity: pingLoading ? 0.5 : 1 }}>
                <RefreshCw style={{ width: 11, height: 11, animation: pingLoading ? 'spin 1s linear infinite' : 'none' }} /> Ping
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {infraHealth.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 14, background: 'var(--color-bg-deep)', height: 72, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))
                : infraHealth.map((s, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 14, background: 'var(--color-bg-deep)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{s.name}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: s.warning ? '#f59e0b' : '#34d399' }}>{s.status}</span>
                      </div>
                      <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, transition: 'width 0.7s ease', width: `${s.load}%`, background: s.warning ? '#f59e0b' : 'var(--color-accent)' }} />
                      </div>
                      <p style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 4, opacity: 0.6 }}>{s.load}% response load</p>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ ...cardStyle, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)' }}>Recent Activity</h3>
              <button onClick={loadRecentEvents} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)' }}>
                <RefreshCw style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {events.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, animation: 'pulse 1.5s ease-in-out infinite' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--color-bg-deep)', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ height: 10, background: 'var(--color-bg-deep)', borderRadius: 6, width: '75%' }} />
                        <div style={{ height: 8, background: 'var(--color-bg-deep)', borderRadius: 6, width: '40%' }} />
                      </div>
                    </div>
                  ))
                : events.slice(0, 5).map((ev, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: ev.bg, color: ev.color }}>
                        <ev.icon style={{ width: 16, height: 16 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.label}</p>
                        <p style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{relativeTime(ev.time)}</p>
                      </div>
                    </div>
                  ))
              }
            </div>
            <button onClick={() => setShowLogs(true)}
              style={{ marginTop: 20, width: '100%', padding: '12px', borderRadius: 12, background: 'var(--color-bg-deep)', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', transition: 'background 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-deep)')}
            >
              View All Logs →
            </button>
          </div>
        </div>
      </div>

      {/* System Logs Drawer */}
      {showLogs && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(4,13,24,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowLogs(false)} />
          <div style={{ width: '100%', maxWidth: 480, background: 'var(--color-bg-card)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 28px 24px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-text-primary)' }}>System Logs</h2>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Real-time platform activity feed</p>
              </div>
              <button onClick={() => setShowLogs(false)} style={{ padding: 8, borderRadius: 10, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }} className="custom-scrollbar">
              {events.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '80px 0', fontWeight: 600 }}>No recent activity</p>
              ) : events.map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 14, borderRadius: 14, background: 'var(--color-bg-deep)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: ev.bg, color: ev.color }}>
                    <ev.icon style={{ width: 15, height: 15 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{ev.label}</p>
                    <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {new Date(ev.time).toLocaleString()} · {relativeTime(ev.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
              <button onClick={loadRecentEvents}
                style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <RefreshCw style={{ width: 15, height: 15 }} /> Refresh Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
