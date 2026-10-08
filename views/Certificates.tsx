
import React, { useState, useEffect } from 'react';
import { api } from '../services/backend';
import { supabase } from '../services/supabase';
import { CertificateNFT } from '../types';
import {
  Award, ExternalLink, ShieldCheck, Zap, Loader2, Link2,
  BookOpen, CheckCircle2, Copy, Download,
} from 'lucide-react';

interface CertificatesProps {
  userId: string;
  walletAddress: string | null;
}

interface CompletedEnrollment {
  courseId: string;
  courseTitle: string;
  completedAt: string;
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
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[40px] overflow-hidden group hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all shadow-sm dark:shadow-none relative">
      {cert.status === 'minting' && (
        <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-8">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-5" />
          <h5 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Minting on BNB Chain…</h5>
          <p className="text-sm text-slate-500 dark:text-gray-400">Usually takes 5–10 seconds.</p>
        </div>
      )}

      {/* Certificate visual */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 flex flex-col items-center text-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 relative z-10">
          <Award className="w-8 h-8 text-white" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-200/70 mb-1 relative z-10">Certificate of Completion</p>
        <h3 className="text-xl font-black text-white leading-tight relative z-10 mb-3">{title}</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 relative z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">
            {cert.status === 'minted' ? 'Verified On-Chain' : 'Soulbound NFT'}
          </span>
        </div>
      </div>

      <div className="p-6">
        {cert.status === 'minted' && cert.tokenId && (
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Token #{cert.tokenId}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Minted
            </span>
          </div>
        )}

        {cert.walletAddress && (
          <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 dark:text-gray-500">
            <Link2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono truncate">
              {cert.walletAddress.slice(0, 10)}…{cert.walletAddress.slice(-6)}
            </span>
            <button onClick={() => copy(cert.walletAddress)} className="shrink-0 hover:text-blue-500 transition-colors">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {cert.issuedAt && (
          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 mb-4">
            Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 rounded-lg bg-yellow-400/10 flex items-center justify-center">
              <Link2 className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">BNB Chain</span>
          </div>
          {cert.txHash && (
            <a href={`${BSC_EXPLORER}${cert.txHash}`} target="_blank" rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 transition-all">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 dark:text-gray-500 transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Certificates: React.FC<CertificatesProps> = ({ userId, walletAddress }) => {
  const [completedEnrollments, setCompletedEnrollments] = useState<CompletedEnrollment[]>([]);
  const [certs, setCerts]   = useState<CertificateNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingId, setMintingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!userId) { setLoading(false); return; }
    const [{ data: enrollData }, certData] = await Promise.all([
      supabase
        .from('enrollments')
        .select('course_id, completed_at, courses(id, title)')
        .eq('user_id', userId)
        .not('completed_at', 'is', null),
      api.getCertificates(userId),
    ]);
    setCompletedEnrollments(
      (enrollData ?? []).map((r: any) => ({
        courseId: r.course_id,
        courseTitle: r.courses?.title ?? `Course ${r.course_id}`,
        completedAt: r.completed_at,
      }))
    );
    setCerts(certData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [userId]);

  const handleMint = async (courseId: string, courseTitle: string) => {
    if (!walletAddress) {
      alert('Please connect and bind your wallet in Settings first to mint on-chain!');
      return;
    }
    setMintingId(courseId);
    await api.requestMint(userId, courseId, walletAddress);
    await loadData();
    setMintingId(null);
  };

  const mintedCourseIds = new Set(certs.map(c => c.courseId));
  const unclaimed = completedEnrollments.filter(e => !mintedCourseIds.has(e.courseId));
  const isEmpty = unclaimed.length === 0 && certs.length === 0;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            On-Chain <span className="text-blue-500">Certificates</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-500 text-sm md:text-lg mt-1 md:mt-2">Soulbound NFT achievements — verifiable proof of your Web3 skills.</p>
        </div>
        <a href="https://bscscan.com" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none whitespace-nowrap">
          Verification Portal <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 md:gap-5 mb-8 md:mb-12">
        {[
          { label: 'Completed',  value: completedEnrollments.length,                    icon: BookOpen, color: 'blue'   },
          { label: 'Minted',     value: certs.filter(c => c.status === 'minted').length, icon: Award,   color: 'purple' },
          { label: 'Unclaimed',  value: unclaimed.length,                                icon: Zap,     color: 'amber'  },
        ].map(t => (
          <div key={t.label} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[24px] p-4 md:p-5 flex flex-col sm:flex-row items-center sm:gap-4 gap-1 shadow-sm dark:shadow-none text-center sm:text-left">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${
              t.color === 'blue'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
              t.color === 'purple' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
              'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}>
              <t.icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white">{loading ? '…' : t.value}</p>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 rounded-[40px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-8">
            <Award className="w-12 h-12 text-slate-300 dark:text-gray-600" />
          </div>
          <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">No certificates yet</h3>
          <p className="text-slate-500 dark:text-gray-500 max-w-sm">Complete a course to earn a soulbound NFT certificate that proves your skills on-chain.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Unclaimed */}
          {unclaimed.length > 0 && (
            <div>
              <h2 className="text-base md:text-lg font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 mb-5 md:mb-6 flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-500" /> Ready to Claim ({unclaimed.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                {unclaimed.map(enrol => (
                  <div key={enrol.courseId}
                    className="bg-white dark:bg-white/5 rounded-[40px] border-2 border-dashed border-blue-500/30 dark:border-blue-500/20 p-8 flex flex-col items-center justify-center text-center group hover:border-blue-500/60 transition-all">
                    <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Award className="w-10 h-10" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4">
                      Course Completed ✓
                    </span>
                    <h4 className="text-lg font-black mb-2 text-slate-900 dark:text-white leading-snug">{enrol.courseTitle}</h4>
                    {enrol.completedAt && (
                      <p className="text-[10px] text-slate-400 dark:text-gray-600 mb-6">
                        Completed {new Date(enrol.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-gray-600 mb-8 leading-relaxed">
                      Mint your Soulbound NFT to claim this certificate on BNB Chain permanently.
                    </p>
                    <button
                      onClick={() => handleMint(enrol.courseId, enrol.courseTitle)}
                      disabled={mintingId === enrol.courseId}
                      className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {mintingId === enrol.courseId
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Minting…</>
                        : <><Zap className="w-5 h-5 fill-current" /> Mint Soulbound NFT</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Minted */}
          {certs.length > 0 && (
            <div>
              <h2 className="text-base md:text-lg font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 mb-5 md:mb-6 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Minted Certificates ({certs.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                {certs.map(cert => {
                  const title = completedEnrollments.find(e => e.courseId === cert.courseId)?.courseTitle ?? `Course Certificate`;
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
