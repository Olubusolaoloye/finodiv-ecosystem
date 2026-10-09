import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/backend';
import { getSession } from '../services/session';
import { UserRole } from '../types';
import EmployerJobs from './EmployerJobs';
import {
  Search, MapPin, DollarSign, Briefcase, Loader2,
  CheckCircle, Send, X, Clock, MessageSquare,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salaryRange: string;
  tags: string[];
  createdAt: string;
  postedBy?: string;
}

const TAG_ACCENT: Record<string, string> = {
  Solidity:       '#818cf8',
  React:          '#60a5fa',
  DeFi:           '#a78bfa',
  Security:       '#f87171',
  Data:           '#fbbf24',
  Python:         '#34d399',
  Rust:           '#fb923c',
  Community:      '#f472b6',
};

function tagStyle(tag: string): React.CSSProperties {
  const c = TAG_ACCENT[tag] ?? '#94a3b8';
  return {
    padding: '3px 10px', borderRadius: 6,
    background: `${c}18`, color: c,
    border: `1px solid ${c}30`,
    fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
  };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const COMPANY_COLORS = ['var(--color-accent)', '#7C3AED', '#059669', '#d97706', '#dc2626', '#0ea5e9'];

const Jobs: React.FC<{ role: UserRole }> = ({ role }) => {
  const navigate = useNavigate();
  const isEmployer = role === UserRole.EMPLOYER || role === UserRole.ADMIN;
  const [tab, setTab] = useState<'browse' | 'mine'>(isEmployer ? 'mine' : 'browse');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [modalJob, setModalJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const session = getSession();
      if (session) {
        setUserId(session.userId);
        const applied = await api.getUserApplications(session.userId);
        setAppliedIds(new Set(applied));
      }
      const data = await api.getJobs();
      setJobs(data);
      setLoading(false);
    };
    init();
  }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    jobs.forEach(j => j.tags.forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [jobs]);

  const filtered = useMemo(() => jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) || j.tags.some(t => t.toLowerCase().includes(q));
    const matchesTag = !activeTag || j.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  }), [jobs, searchQuery, activeTag]);

  const openModal = (job: Job) => { setModalJob(job); setCoverLetter(''); setSubmitted(false); };
  const closeModal = () => { setModalJob(null); setSubmitted(false); };

  const messageEmployer = (job: Job) => {
    if (!job.postedBy) return;
    navigate(`/community?with=${encodeURIComponent(job.postedBy)}&job=${job.id}`);
  };

  const handleApply = async () => {
    if (!userId || !modalJob) return;
    setSubmitting(true);
    await api.applyToJob(userId, modalJob.id, coverLetter);
    setAppliedIds(prev => new Set([...prev, modalJob.id]));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px 80px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p className="eyebrow" style={{ marginBottom: 10 }}>Opportunities</p>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 600,
          letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: 8,
        }}>
          Web3{' '}
          <span style={{
            background: 'linear-gradient(135deg,#7C3AED,#3B82F6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Job Board
          </span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-muted)' }}>
          Curated opportunities at the frontier of decentralized technology.
        </p>
      </div>

      {isEmployer && (
        <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 12, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', marginBottom: 28 }}>
          {([['mine', 'My Job Posts'], ['browse', 'Browse All']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === key ? 'var(--color-accent)' : 'transparent',
              color: tab === key ? '#fff' : 'var(--color-text-muted)',
            }}>{label}</button>
          ))}
        </div>
      )}

      {isEmployer && tab === 'mine' && userId ? <EmployerJobs employerId={userId} /> : (<>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 560 }}>
        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search roles, companies, or skills…"
          style={{
            width: '100%', padding: '12px 16px 12px 40px',
            borderRadius: 10,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontSize: 14, outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{
              padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: !activeTag ? 'var(--color-accent)' : 'var(--color-bg-card)',
              color: !activeTag ? '#fff' : 'var(--color-text-muted)',
              border: `1px solid ${!activeTag ? 'var(--color-accent)' : 'var(--color-border)'}`,
              transition: 'all 0.15s',
            }}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: activeTag === tag ? 'var(--color-accent)' : 'var(--color-bg-card)',
                color: activeTag === tag ? '#fff' : 'var(--color-text-muted)',
                border: `1px solid ${activeTag === tag ? 'var(--color-accent)' : 'var(--color-border)'}`,
                transition: 'all 0.15s',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Jobs */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 style={{ width: 28, height: 28, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Briefcase style={{ width: 40, height: 40, color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>No jobs found</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Try a different search or filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((job, idx) => {
            const applied = appliedIds.has(job.id);
            const companyColor = COMPANY_COLORS[job.company.charCodeAt(0) % COMPANY_COLORS.length];
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                whileHover={{ y: -2 }}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16, padding: '24px',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.35)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(139,92,246,0.08)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Company avatar */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${companyColor}20`,
                    border: `1px solid ${companyColor}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, color: companyColor, flexShrink: 0,
                  }}>
                    {job.company[0]}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                      {job.title}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{job.company}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>
                        <MapPin style={{ width: 11, height: 11 }} />{job.location}
                      </span>
                      {job.salaryRange && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>
                          <DollarSign style={{ width: 11, height: 11 }} />{job.salaryRange}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>
                        <Clock style={{ width: 11, height: 11 }} />{timeAgo(job.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {job.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {job.tags.map(tag => (
                          <span key={tag} style={tagStyle(tag)}>{tag}</span>
                        ))}
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {job.postedBy && userId && job.postedBy !== userId && (
                          <button
                            onClick={() => messageEmployer(job)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '7px 14px', borderRadius: 8,
                              background: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
                              border: '1px solid var(--color-border)',
                              fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            <MessageSquare style={{ width: 12, height: 12 }} /> Message
                          </button>
                        )}
                        {job.postedBy === userId ? (
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center' }}>Your posting</span>
                        ) : isEmployer ? null : applied ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.25)', color: '#34d399', fontSize: 12, fontWeight: 600 }}>
                            <CheckCircle style={{ width: 13, height: 13 }} /> Applied
                          </div>
                        ) : userId ? (
                          <button
                            onClick={() => openModal(job)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '7px 16px', borderRadius: 8,
                              background: 'var(--color-accent)', color: '#fff',
                              fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
                          >
                            <Send style={{ width: 12, height: 12 }} /> Apply Now
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Sign in to apply</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      </>)}

      {/* Apply Modal */}
      <AnimatePresence>
        {modalJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'var(--color-overlay)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '100%', maxWidth: 520,
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 20, padding: 32,
                boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{modalJob.title}</h2>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{modalJob.company} · {modalJob.location}</p>
                </div>
                <button
                  onClick={closeModal}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle style={{ width: 28, height: 28, color: '#34d399' }} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>Application Submitted!</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24 }}>
                    Your application to {modalJob.company} has been recorded.
                    {modalJob.postedBy ? ' We started a chat with the employer so you can follow up.' : ' Good luck!'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {modalJob.postedBy && (
                      <button onClick={() => messageEmployer(modalJob)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                        <MessageSquare style={{ width: 15, height: 15 }} /> Open Chat
                      </button>
                    )}
                    <button onClick={closeModal} style={{ padding: '10px 24px', borderRadius: 10, background: modalJob.postedBy ? 'var(--color-bg-deep)' : 'var(--color-accent)', color: modalJob.postedBy ? 'var(--color-text-primary)' : '#fff', fontWeight: 600, fontSize: 14, border: modalJob.postedBy ? '1px solid var(--color-border)' : 'none', cursor: 'pointer' }}>
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
                      Cover Letter <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <textarea
                      rows={5}
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                      placeholder="Tell them why you're the right fit for this role…"
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 10,
                        background: 'var(--color-bg-deep)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontSize: 13, outline: 'none', resize: 'none',
                        fontFamily: 'inherit', lineHeight: 1.6,
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    />
                  </div>
                  <button
                    onClick={handleApply}
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '13px', borderRadius: 10,
                      background: 'var(--color-accent)', color: '#fff',
                      fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      opacity: submitting ? 0.6 : 1,
                    }}
                  >
                    {submitting ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: 16, height: 16 }} />}
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;
