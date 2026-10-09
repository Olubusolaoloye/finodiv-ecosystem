import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TALENTS } from '../constants';
import { UserRole } from '../types';
import { getSession } from '../services/session';
import { convex } from '../services/convex';
import { api as convexApi } from '../convex/_generated/api';
import {
  Award, Star, Briefcase, Share2, Github, Twitter, Linkedin,
  ShieldCheck, GraduationCap, Zap, Loader2,
} from 'lucide-react';

interface ProfileProps { currentSessionRole?: UserRole; }

interface LiveProfile {
  name: string; title: string; email: string;
  xp: number; level: number; enrollmentCount: number; certCount: number; avatarUrl: string;
}

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string; icon: typeof ShieldCheck }> = {
  [UserRole.ADMIN]:    { label: 'Admin',    color: '#f87171', bg: 'rgba(239,68,68,0.1)',   icon: ShieldCheck },
  [UserRole.EMPLOYER]: { label: 'Employer', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', icon: Briefcase   },
  [UserRole.LEARNER]:  { label: 'Learner',  color: '#34d399', bg: 'rgba(52,211,153,0.1)',  icon: GraduationCap },
};

const Profile: React.FC<ProfileProps> = ({ currentSessionRole }) => {
  const { id } = useParams();
  const [liveProfile, setLiveProfile] = useState<LiveProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(id === 'current');

  const isUUID = (s?: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s ?? '');
  const isRealUser = id !== 'current' && isUUID(id);

  useEffect(() => {
    if (id !== 'current') return;
    const load = async () => {
      const session = getSession();
      if (!session) { setProfileLoading(false); return; }
      const [prof, enrollList, certList] = await Promise.all([
        convex.query(convexApi.profiles.getByUserId, { userId: session.userId }),
        (await import('../services/backend')).api.getEnrollments(session.userId),
        (await import('../services/backend')).api.getCertificates(session.userId),
      ]);
      setLiveProfile({
        name: prof?.name || session.email?.split('@')[0] || 'Learner',
        title: (prof as any)?.title || 'Web3 Builder',
        email: session.email || '',
        xp: prof?.xp ?? 0,
        level: (prof as any)?.level ?? 1,
        enrollmentCount: enrollList.length ?? 0,
        certCount: certList.length ?? 0,
        avatarUrl: `https://i.pravatar.cc/300?u=${session.userId}`,
      });
      setProfileLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!isRealUser) return;
    setProfileLoading(true);
    const load = async () => {
      const [prof, enrollList, certList] = await Promise.all([
        convex.query(convexApi.profiles.getByUserId, { userId: id! }),
        (await import('../services/backend')).api.getEnrollments(id!),
        (await import('../services/backend')).api.getCertificates(id!),
      ]);
      if (prof) {
        setLiveProfile({
          name: prof.name || 'Anonymous',
          title: (prof as any).title || 'Web3 Builder',
          email: '',
          xp: prof.xp ?? 0,
          level: (prof as any).level ?? 1,
          enrollmentCount: enrollList.length ?? 0,
          certCount: certList.length ?? 0,
          avatarUrl: prof.avatarUrl || `https://i.pravatar.cc/300?u=${id}`,
        });
      }
      setProfileLoading(false);
    };
    load();
  }, [id]);

  const talent = TALENTS.find(t => t.id === id) || TALENTS[0];
  const displayRole = id === 'current' ? (currentSessionRole || UserRole.LEARNER) : UserRole.LEARNER;
  const isCurrent = id === 'current' || isRealUser;

  const displayName   = isCurrent ? (liveProfile?.name ?? '…') : talent.name;
  const displayTitle  = isCurrent ? (liveProfile?.title ?? 'Web3 Builder') : talent.title;
  const displayAvatar = isCurrent ? (liveProfile?.avatarUrl ?? `https://i.pravatar.cc/300?u=${id}`) : talent.avatar;
  const displayBio    = isCurrent
    ? (liveProfile?.xp ?? 0) > 0
      ? `Level ${liveProfile?.level ?? 1} learner with ${liveProfile?.xp ?? 0} XP across ${liveProfile?.enrollmentCount ?? 0} course${liveProfile?.enrollmentCount !== 1 ? 's' : ''} and ${liveProfile?.certCount ?? 0} certificate${liveProfile?.certCount !== 1 ? 's' : ''}.`
      : 'A passionate Web3 professional on the FINODIV ecosystem.'
    : talent.bio;

  const roleBadgeInfo = ROLE_BADGE[displayRole] ?? ROLE_BADGE[UserRole.LEARNER];
  const RoleIcon = roleBadgeInfo.icon;

  if (isCurrent && profileLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 80 }}>
        <Loader2 style={{ width: 28, height: 28, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px clamp(16px, 4vw, 32px) 80px' }}>
      {/* Cover + avatar */}
      <div style={{ position: 'relative', marginBottom: 80 }}>
        {/* Cover */}
        <div style={{
          height: 200, borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(124,58,237,0.2) 100%)',
          border: '1px solid var(--color-border)',
          position: 'relative',
        }}>
          {/* Subtle grid overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '32px 32px', opacity: 0.5,
          }} />
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
            <button style={{ padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <Share2 style={{ width: 15, height: 15 }} />
            </button>
            <button style={{ padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <Star style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div style={{
          position: 'absolute', bottom: -48, left: 32,
          width: 96, height: 96, borderRadius: 22,
          border: '3px solid var(--color-bg-primary)',
          overflow: 'hidden', background: 'var(--color-bg-card)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          <img src={displayAvatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Action buttons */}
        <div style={{ position: 'absolute', bottom: -44, right: 0, display: 'flex', gap: 8 }}>
          <button style={{ padding: '9px 18px', borderRadius: 10, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Follow
          </button>
          <button style={{ padding: '9px 18px', borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Contact
          </button>
        </div>
      </div>

      {/* Name + title */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 'clamp(1.4rem,4vw,1.8rem)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            {displayName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, background: roleBadgeInfo.bg, color: roleBadgeInfo.color, border: `1px solid ${roleBadgeInfo.color}30`, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <RoleIcon style={{ width: 11, height: 11 }} /> {roleBadgeInfo.label}
          </div>
          {(isCurrent || talent.verified) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Zap style={{ width: 11, height: 11 }} /> Verified
            </div>
          )}
        </div>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 12 }}>{displayTitle}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          {[Linkedin, Twitter, Github].map((Icon, i) => (
            <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              <Icon style={{ width: 17, height: 17 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="two-col-sidebar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <section style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 14 }}>About</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-muted)' }}>{displayBio}</p>
          </section>

          {!isCurrent && displayRole === UserRole.LEARNER && (
            <section style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Portfolio</h2>
                <button style={{ fontSize: 12, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {talent.portfolio.map(project => (
                  <div key={project.id} style={{ cursor: 'pointer' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).querySelector('h4')!.style.color = 'var(--color-accent)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).querySelector('h4')!.style.color = 'var(--color-text-primary)')}
                  >
                    <div style={{ aspectRatio: '4/3', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: 10 }}>
                      <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', display: 'block' }} />
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, transition: 'color 0.15s' }}>{project.title}</h4>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Stats sidebar */}
        <div>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 20, position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-muted)', marginBottom: 18 }}>Platform Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {isCurrent ? (
                <>
                  {[
                    { label: 'Level', value: liveProfile?.level ?? 1, color: 'var(--color-accent)' },
                    { label: 'XP Earned', value: (liveProfile?.xp ?? 0).toLocaleString(), color: '#a78bfa' },
                    { label: 'Enrolled Courses', value: liveProfile?.enrollmentCount ?? 0, color: 'var(--color-text-primary)' },
                    { label: 'Certificates', value: liveProfile?.certCount ?? 0, color: '#34d399', icon: Award },
                  ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{label}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {Icon && <Icon style={{ width: 14, height: 14 }} />} {value}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label: 'Global Ranking', value: '#452', color: 'var(--color-accent)' },
                    { label: 'Verification', value: 'Trusted', color: '#34d399' },
                    { label: 'Join Date', value: 'Oct 2023', color: 'var(--color-text-primary)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{label}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color }}>{value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
