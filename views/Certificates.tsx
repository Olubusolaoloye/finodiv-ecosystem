import React, { useState, useEffect } from 'react';
import { api } from '../services/backend';
import { CertificateNFT } from '../types';
import {
  Award, ExternalLink, ShieldCheck, Zap, Loader2, Link2,
  BookOpen, CheckCircle2, Copy, Download,
} from 'lucide-react';

interface CertificatesProps { userId: string; walletAddress: string | null; }

interface CompletedEnrollment {
  courseId: string; courseTitle: string; completedAt: string;
}

const BSC_EXPLORER = 'https://bscscan.com/tx/';

const CertCard: React.FC<{ cert: CertificateNFT; title: string }> = ({ cert, title }) => {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 20, overflow: 'hidden',
      position: 'relative',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    >
      {cert.status === 'minting' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: 'rgba(4,13,24,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
        }}>
          <Loader2 style={{ width: 36, height: 36, color: 'var(--color-accent)', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
          <h5 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>Minting on BNB Chain…</h5>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Usually takes 5–10 seconds.</p>
        </div>
      )}

      {/* Certificate visual */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(124,58,237,0.25) 100%)',
        padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
          <Award style={{ width: 26, height: 26, color: '#fff' }} />
        </div>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.6)', marginBottom: 6, position: 'relative', zIndex: 1 }}>
          Certificate of Completion
        </p>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 12, position: 'relative', zIndex: 1 }}>
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', position: 'relative', zIndex: 1 }}>
          <ShieldCheck style={{ width: 12, height: 12, color: '#86efac' }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {cert.status === 'minted' ? 'Verified On-Chain' : 'Soulbound NFT'}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 18px' }}>
        {cert.status === 'minted' && cert.tokenId && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(139,92,246,0.1)', color: 'var(--color-accent)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Token #{cert.tokenId}
            </span>
            <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Minted
            </span>
          </div>
        )}

        {cert.walletAddress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 11, color: 'var(--color-text-muted)' }}>
            <Link2 style={{ width: 12, height: 12, flexShrink: 0 }} />
            <span style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cert.walletAddress.slice(0, 10)}…{cert.walletAddress.slice(-6)}
            </span>
            <button onClick={() => copy(cert.walletAddress)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', flexShrink: 0 }}>
              {copied ? <CheckCircle2 style={{ width: 12, height: 12, color: '#34d399' }} /> : <Copy style={{ width: 12, height: 12 }} />}
            </button>
          </div>
        )}

        {cert.issuedAt && (
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link2 style={{ width: 11, height: 11, color: '#fbbf24' }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>BNB Chain</span>
          </div>
          {cert.txHash && (
            <a href={`${BSC_EXPLORER}${cert.txHash}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: '7px', borderRadius: 8, background: 'var(--color-bg-deep)', color: 'var(--color-accent)', border: '1px solid var(--color-border)', display: 'flex', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-bg-deep)')}
            >
              <ExternalLink style={{ width: 13, height: 13 }} />
            </a>
          )}
          <button style={{ padding: '7px', borderRadius: 8, background: 'var(--color-bg-deep)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex' }}>
            <Download style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Certificates: React.FC<CertificatesProps> = ({ userId, walletAddress }) => {
  const [completedEnrollments, setCompletedEnrollments] = useState<CompletedEnrollment[]>([]);
  const [certs, setCerts]     = useState<CertificateNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingId, setMintingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!userId) { setLoading(false); return; }
    const [enrollments, certData] = await Promise.all([
      api.getEnrollments(userId),
      api.getCertificates(userId),
    ]);
    setCompletedEnrollments(
      (enrollments ?? [])
        .filter((r: any) => r.completedAt || r.completed_at)
        .map((r: any) => ({
          courseId: r.courseId ?? r.course_id,
          courseTitle: r.courseTitle ?? r.title ?? `Course ${r.courseId ?? r.course_id}`,
          completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : r.completed_at ?? new Date().toISOString(),
        }))
    );
    setCerts(certData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [userId]);

  const handleMint = async (courseId: string) => {
    if (!walletAddress) { alert('Please connect and bind your wallet in Settings first.'); return; }
    setMintingId(courseId);
    await api.requestMint(userId, courseId, walletAddress);
    await loadData();
    setMintingId(null);
  };

  const mintedCourseIds = new Set(certs.map(c => c.courseId));
  const unclaimed = completedEnrollments.filter(e => !mintedCourseIds.has(e.courseId));
  const isEmpty = unclaimed.length === 0 && certs.length === 0;

  const STATS = [
    { label: 'Completed',  value: completedEnrollments.length,                     icon: BookOpen, color: 'var(--color-accent)', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Minted',     value: certs.filter(c => c.status === 'minted').length,  icon: Award,   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { label: 'Unclaimed',  value: unclaimed.length,                                  icon: Zap,     color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Achievements</p>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2rem)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: 6 }}>
            On-Chain{' '}
            <span style={{ background: 'linear-gradient(135deg,#7C3AED,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Certificates
            </span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Soulbound NFT achievements — verifiable proof of your Web3 skills.</p>
        </div>
        <a href="https://bscscan.com" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'border-color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          Verification Portal <ExternalLink style={{ width: 12, height: 12 }} />
        </a>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: 18, height: 18, color }} />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{loading ? '…' : value}</p>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 style={{ width: 32, height: 32, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : isEmpty ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Award style={{ width: 32, height: 32, color: 'var(--color-text-muted)' }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>No certificates yet</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 320, lineHeight: 1.6 }}>
            Complete a course to earn a soulbound NFT certificate that proves your skills on-chain.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Unclaimed */}
          {unclaimed.length > 0 && (
            <div>
              <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap style={{ width: 13, height: 13, color: '#fbbf24' }} /> Ready to Claim ({unclaimed.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
                {unclaimed.map(enrol => (
                  <div key={enrol.courseId} style={{
                    background: 'var(--color-bg-card)',
                    border: '2px dashed rgba(139,92,246,0.25)',
                    borderRadius: 20, padding: '28px 20px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)')}
                  >
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(124,58,237,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--color-accent)' }}>
                      <Award style={{ width: 28, height: 28 }} />
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                      Course Completed ✓
                    </span>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4, marginBottom: 6 }}>{enrol.courseTitle}</h4>
                    {enrol.completedAt && (
                      <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        Completed {new Date(enrol.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                      Mint your Soulbound NFT on BNB Chain permanently.
                    </p>
                    <button
                      onClick={() => handleMint(enrol.courseId)}
                      disabled={mintingId === enrol.courseId}
                      style={{
                        width: '100%', padding: '11px', borderRadius: 10,
                        background: 'var(--color-accent)', color: '#fff',
                        fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        opacity: mintingId === enrol.courseId ? 0.6 : 1,
                      }}
                    >
                      {mintingId === enrol.courseId
                        ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Minting…</>
                        : <><Zap style={{ width: 14, height: 14 }} /> Mint Soulbound NFT</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Minted */}
          {certs.length > 0 && (
            <div>
              <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck style={{ width: 13, height: 13, color: '#34d399' }} /> Minted Certificates ({certs.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                {certs.map(cert => {
                  const title = completedEnrollments.find(e => e.courseId === cert.courseId)?.courseTitle ?? 'Course Certificate';
                  return <CertCard key={cert.id} cert={cert} title={title} />;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Certificates;
