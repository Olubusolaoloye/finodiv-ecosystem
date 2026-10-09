import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { convex } from '../services/convex';
import { errorMessage } from '../services/errors';
import {
  Plus, X, Loader2, Users, MessageSquare, ChevronDown, ChevronUp,
  MapPin, Briefcase, XCircle, AlertCircle,
} from 'lucide-react';

type JobType = 'remote' | 'hybrid' | 'onsite';
type AppStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

const STATUS_COLOR: Record<AppStatus, string> = {
  pending: '#f59e0b', reviewed: '#60a5fa', accepted: '#34d399', rejected: '#f87171',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)', fontSize: 14, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
  color: 'var(--color-text-muted)', display: 'block', marginBottom: 7,
};

const Applicants: React.FC<{ jobId: Id<'jobs'>; employerId: string }> = ({ jobId, employerId }) => {
  const navigate = useNavigate();
  const applicants = useQuery(api.jobs.listApplicants, { jobId, employerId });
  const [error, setError] = useState('');

  const setStatus = async (applicationId: Id<'jobApplications'>, status: AppStatus) => {
    setError('');
    try {
      await convex.mutation(api.jobs.updateApplicationStatus, { applicationId, employerId, status });
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  if (applicants === undefined) {
    return <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}><Loader2 style={{ width: 18, height: 18, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} /></div>;
  }
  if (applicants.length === 0) {
    return <p style={{ padding: '16px 4px 4px', fontSize: 13, color: 'var(--color-text-muted)' }}>No applicants yet.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14 }}>
      {error && <p style={{ fontSize: 12, color: '#f87171' }}>{error}</p>}
      {applicants.map(a => (
        <div key={a._id} style={{ padding: 14, borderRadius: 12, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <img src={a.avatarUrl || `https://i.pravatar.cc/100?u=${a.userId}`} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
            <div style={{ flex: 1, minWidth: 120 }}>
              <button onClick={() => navigate(`/profile/${a.userId}`)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {a.name}
              </button>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Applied {new Date(a._creationTime).toLocaleDateString()}</p>
            </div>
            <select
              value={a.status}
              onChange={e => setStatus(a._id, e.target.value as AppStatus)}
              style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: 12, fontWeight: 700, color: STATUS_COLOR[a.status] }}
            >
              {(['pending', 'reviewed', 'accepted', 'rejected'] as AppStatus[]).map(s => (
                <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => navigate(`/community?with=${encodeURIComponent(a.userId)}&job=${jobId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--color-accent)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              <MessageSquare style={{ width: 13, height: 13 }} /> Message
            </button>
          </div>
          {a.coverLetter && (
            <p style={{ marginTop: 10, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{a.coverLetter}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const PostJobModal: React.FC<{ employerId: string; onClose: () => void }> = ({ employerId, onClose }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<JobType>('remote');
  const [salaryRange, setSalaryRange] = useState('');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!title.trim() || !company.trim() || !description.trim()) {
      setError('Title, company and description are required.');
      return;
    }
    setSaving(true);
    try {
      await convex.mutation(api.jobs.createJob, {
        title, company, description, type,
        location: location.trim() || 'Remote',
        salaryRange: salaryRange.trim() || undefined,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        postedBy: employerId,
      });
      onClose();
    } catch (e) {
      setError(errorMessage(e, 'Could not post job.'));
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--color-overlay)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>Post a Job</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div><label style={labelStyle}>Job Title *</label><input style={inputStyle} value={title} maxLength={120} onChange={e => setTitle(e.target.value)} placeholder="Solidity Engineer" /></div>
          <div><label style={labelStyle}>Company *</label><input style={inputStyle} value={company} maxLength={120} onChange={e => setCompany(e.target.value)} placeholder="Acme Labs" /></div>
          <div><label style={labelStyle}>Location</label><input style={inputStyle} value={location} maxLength={120} onChange={e => setLocation(e.target.value)} placeholder="Lagos / Remote" /></div>
          <div>
            <label style={labelStyle}>Work Type</label>
            <select style={inputStyle} value={type} onChange={e => setType(e.target.value as JobType)}>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
          <div><label style={labelStyle}>Salary Range</label><input style={inputStyle} value={salaryRange} maxLength={60} onChange={e => setSalaryRange(e.target.value)} placeholder="$3k – $5k / month" /></div>
          <div><label style={labelStyle}>Skills (comma separated)</label><input style={inputStyle} value={skills} onChange={e => setSkills(e.target.value)} placeholder="Solidity, DeFi, React" /></div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Description *</label>
          <textarea rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} value={description} maxLength={5000} onChange={e => setDescription(e.target.value)} placeholder="What will this person do? What are you looking for?" />
        </div>
        {error && <p style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13, color: '#f87171' }}><AlertCircle style={{ width: 14, height: 14 }} /> {error}</p>}
        <button onClick={submit} disabled={saving} style={{ width: '100%', marginTop: 18, padding: 13, borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Plus style={{ width: 16, height: 16 }} />}
          Publish Job
        </button>
      </div>
    </div>
  );
};

const EmployerJobs: React.FC<{ employerId: string }> = ({ employerId }) => {
  const postings = useQuery(api.jobs.listMyPostings, { employerId });
  const [showPost, setShowPost] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const closeJob = async (id: Id<'jobs'>) => {
    if (!window.confirm('Close this job? It will no longer accept applications.')) return;
    await convex.mutation(api.jobs.closeJob, { id, postedBy: employerId });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Manage your postings, review applicants and message candidates.</p>
        <button onClick={() => setShowPost(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          <Plus style={{ width: 15, height: 15 }} /> Post a Job
        </button>
      </div>

      {postings === undefined ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Loader2 style={{ width: 26, height: 26, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} /></div>
      ) : postings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Briefcase style={{ width: 40, height: 40, color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>No job posts yet</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Post your first role to start receiving applications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {postings.map(job => {
            const open = expanded === job._id;
            return (
              <div key={job._id} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 20, opacity: job.isActive ? 1 : 0.65 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {job.title} {!job.isActive && <span style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>· Closed</span>}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      {job.company} · <MapPin style={{ width: 11, height: 11 }} /> {job.location} · {job.type}
                    </p>
                  </div>
                  <button onClick={() => setExpanded(open ? null : job._id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Users style={{ width: 13, height: 13 }} /> {job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'}
                    {open ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
                  </button>
                  {job.isActive && (
                    <button onClick={() => closeJob(job._id)} title="Close job" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--color-border)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <XCircle style={{ width: 13, height: 13 }} /> Close
                    </button>
                  )}
                </div>
                {open && <Applicants jobId={job._id} employerId={employerId} />}
              </div>
            );
          })}
        </div>
      )}

      {showPost && <PostJobModal employerId={employerId} onClose={() => setShowPost(false)} />}
    </div>
  );
};

export default EmployerJobs;
