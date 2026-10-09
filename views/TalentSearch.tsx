import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/backend';
import { Talent } from '../types';
import { Search, Filter, ChevronDown, Award, ShieldCheck, XCircle, Loader2, MessageSquare } from 'lucide-react';

const TalentSearch: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.getTalents().then(data => { setTalents(data); setLoading(false); });
  }, []);

  const filteredTalents = useMemo(() =>
    talents.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [searchQuery, talents]);

  return (
    <div style={{ padding: '40px clamp(16px,4vw,40px) 120px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 48 }}>
        <div>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-accent)', display: 'block', marginBottom: 8 }}>
            Employer Portal
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: 8 }}>
            Find Your Next{' '}
            <span style={{ background: 'linear-gradient(135deg,#7C3AED,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Hire
            </span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)' }}>Direct access to the top 1% of Web3 professionals.</p>
        </div>
        <button
          style={{ padding: '13px 26px', borderRadius: 14, background: 'var(--color-accent)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(139,92,246,0.25)', transition: 'all 0.2s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-accent-hover)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-accent)')}
        >
          Post a Job
        </button>
      </div>

      {/* Search + filter row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginBottom: 48 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 560 }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search talent, skills, titles…"
            style={{
              width: '100%', padding: '13px 16px 13px 44px', borderRadius: 14,
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Skill', 'Experience'].map(f => (
            <button key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
            >
              <Filter style={{ width: 14, height: 14 }} /> {f} <ChevronDown style={{ width: 14, height: 14 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
          <Loader2 style={{ width: 36, height: 36, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-text-muted)' }}>Searching global talent pool…</p>
        </div>
      ) : filteredTalents.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center', gap: 16 }}>
          <XCircle style={{ width: 48, height: 48, color: 'var(--color-text-muted)' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>No talent matched</h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Try a different name, skill, or title.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
          {filteredTalents.map(talent => (
            <div
              key={talent.id}
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 28, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {/* Glow */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: 150, height: 150, background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', transform: 'translate(30%, -30%)', pointerEvents: 'none' }} />

              {/* Avatar */}
              <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 24, overflow: 'hidden', border: '2px solid var(--color-border)', marginBottom: 20, flexShrink: 0 }}>
                <img src={talent.avatar} alt={talent.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {talent.verified && (
                  <div style={{ position: 'absolute', bottom: 4, right: 4, width: 22, height: 22, borderRadius: 8, background: 'var(--color-accent)', border: '2px solid var(--color-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck style={{ width: 11, height: 11, color: '#fff' }} />
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4, textAlign: 'center' }}>{talent.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16, textAlign: 'center' }}>{talent.title}</p>

              {/* Verified badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
                <Award style={{ width: 13, height: 13 }} /> Verified Talent
              </div>

              {/* Skills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
                {talent.skills.slice(0, 4).map(skill => (
                  <span key={skill} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--color-accent)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {skill}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 'auto' }}>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 12, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
                >
                  <MessageSquare style={{ width: 13, height: 13 }} /> Message
                </button>
                <Link
                  to={`/profile/${talent.id}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: 12, background: 'var(--color-accent)', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-accent-hover)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-accent)')}
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentSearch;
