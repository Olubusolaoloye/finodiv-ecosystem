
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/backend';
import { supabase } from '../services/supabase';
import {
  Search, MapPin, DollarSign, Briefcase, Tag, Loader2,
  CheckCircle, Send, X, ChevronDown,
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
}

const TAG_COLORS: Record<string, string> = {
  Solidity:    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  React:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DeFi:        'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Security:    'bg-red-500/10 text-red-400 border-red-500/20',
  Data:        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Python:      'bg-green-500/10 text-green-400 border-green-500/20',
  Rust:        'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Community:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
  default:     'bg-white/5 text-gray-400 border-white/10',
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? TAG_COLORS.default;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Apply modal state
  const [modalJob, setModalJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const applied = await api.getUserApplications(user.id);
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

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) || j.tags.some(t => t.toLowerCase().includes(q));
      const matchesTag = !activeTag || j.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [jobs, searchQuery, activeTag]);

  const openModal = (job: Job) => {
    setModalJob(job);
    setCoverLetter('');
    setSubmitted(false);
  };

  const closeModal = () => { setModalJob(null); setSubmitted(false); };

  const handleApply = async () => {
    if (!userId || !modalJob) return;
    setSubmitting(true);
    await api.applyToJob(userId, modalJob.id, coverLetter);
    setAppliedIds(prev => new Set([...prev, modalJob.id]));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Web3 <span className="text-blue-600 dark:text-blue-400">Job Board</span>
        </h1>
        <p className="text-slate-500 dark:text-gray-500 text-lg">
          Curated opportunities at the frontier of decentralized technology.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search roles, companies, or skills..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-gray-500"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                !activeTag ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  activeTag === tag ? 'bg-blue-600 text-white border-blue-600' : `${tagColor(tag)} hover:opacity-80`
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Jobs list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Loading opportunities...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Briefcase className="w-16 h-16 text-gray-700 mb-6" />
          <h3 className="text-2xl font-bold mb-2 text-white">No jobs found</h3>
          <p className="text-gray-500">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => {
            const applied = appliedIds.has(job.id);
            return (
              <div
                key={job.id}
                className="bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-[32px] p-8 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    {/* Company logo placeholder */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center shrink-0 text-xl font-black text-blue-400">
                      {job.company[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="font-semibold text-gray-300">{job.company}</span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                        </span>
                        {job.salaryRange && (
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5" /> {job.salaryRange}
                          </span>
                        )}
                        <span className="text-gray-600">{timeAgo(job.createdAt)}</span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map(tag => (
                          <span
                            key={tag}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${tagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {applied ? (
                      <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold">
                        <CheckCircle className="w-4 h-4" /> Applied
                      </div>
                    ) : userId ? (
                      <button
                        onClick={() => openModal(job)}
                        className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Apply Now
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600 font-bold">Sign in to apply</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {modalJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-[#0f1218] border border-white/10 rounded-[40px] p-10 shadow-2xl">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">{modalJob.title}</h2>
                <p className="text-gray-500 font-semibold">{modalJob.company} · {modalJob.location}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">Application Submitted!</h3>
                <p className="text-gray-500 mb-8">Your application to {modalJob.company} has been recorded. Good luck!</p>
                <button
                  onClick={closeModal}
                  className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Cover Letter <span className="text-gray-600">(optional)</span>
                  </label>
                  <textarea
                    rows={5}
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder="Tell them why you're the right fit for this role..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                  />
                </div>
                <button
                  onClick={handleApply}
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
