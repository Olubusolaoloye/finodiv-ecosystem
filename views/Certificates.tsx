
import React, { useState, useEffect } from 'react';
import { api } from '../services/backend';
import { supabase } from '../services/supabase';
import { CertificateNFT } from '../types';
import { Award, ExternalLink, ShieldCheck, Zap, Loader2, Link2, BookOpen } from 'lucide-react';

interface CertificatesProps {
  userId: string;
  walletAddress: string | null;
}

interface CompletedEnrollment {
  courseId: string;
  courseTitle: string;
}

const Certificates: React.FC<CertificatesProps> = ({ userId, walletAddress }) => {
  const [completedEnrollments, setCompletedEnrollments] = useState<CompletedEnrollment[]>([]);
  const [certs, setCerts] = useState<CertificateNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingId, setMintingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!userId) { setLoading(false); return; }
    const [{ data: enrollData }, certData] = await Promise.all([
      supabase
        .from('enrollments')
        .select('course_id, courses(id, title)')
        .eq('user_id', userId)
        .not('completed_at', 'is', null),
      api.getCertificates(userId),
    ]);
    setCompletedEnrollments(
      (enrollData ?? []).map((r: any) => ({
        courseId: r.course_id,
        courseTitle: r.courses?.title ?? `Course ${r.course_id}`,
      }))
    );
    setCerts(certData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [userId]);

  const handleMint = async (courseId: string) => {
    if (!walletAddress) {
      alert('Please connect and bind your wallet in Settings first!');
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
    <div className="p-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            On-Chain <span className="text-blue-600 dark:text-blue-400">Certificates</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-500 text-lg">Verifiable soulbound achievements and proof-of-skills.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold shadow-sm dark:shadow-none">
          Verification Portal <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 rounded-[40px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-8">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">No certificates yet</h3>
          <p className="text-slate-500 dark:text-gray-500 max-w-sm">
            Complete a course to earn a soulbound NFT certificate. Your achievements will appear here.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Unclaimed — completed courses without a minted cert */}
          {unclaimed.map(enrol => (
            <div
              key={enrol.courseId}
              className="bg-white dark:bg-white/5 rounded-[40px] border-2 border-dashed border-blue-600/20 dark:border-blue-500/20 p-8 flex flex-col items-center justify-center text-center group"
            >
              <div className="w-20 h-20 rounded-[32px] bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Zap className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Unclaimed</h4>
              <p className="text-sm text-slate-500 dark:text-gray-500 mb-2 font-medium">{enrol.courseTitle}</p>
              <p className="text-xs text-slate-400 dark:text-gray-600 mb-8 leading-relaxed">
                You've completed this course. Mint your Soulbound NFT to claim it on-chain.
              </p>
              <button
                onClick={() => handleMint(enrol.courseId)}
                disabled={mintingId === enrol.courseId}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {mintingId === enrol.courseId
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : 'Mint Soulbound NFT'}
              </button>
            </div>
          ))}

          {/* Minted / pending certificates */}
          {certs.map(cert => (
            <div
              key={cert.id}
              className="bg-white dark:bg-white/5 rounded-[40px] border border-slate-200 dark:border-white/5 overflow-hidden group hover:border-blue-600/30 dark:hover:border-blue-500/30 transition-all shadow-sm dark:shadow-none relative"
            >
              {cert.status === 'minting' && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-8">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                  <h5 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Minting on BNB Chain...</h5>
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    Verifying and binding identity. Usually takes 5–10 seconds.
                  </p>
                </div>
              )}

              <div className="aspect-square p-8 bg-slate-50 dark:bg-white/[0.02] relative overflow-hidden flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-600/5 dark:bg-blue-500/5 blur-[50px] rounded-full" />
                <img
                  src={`https://picsum.photos/seed/${cert.id}/400/400`}
                  alt="Certificate"
                  className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700 relative z-10"
                />
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Verifiable On-Chain
                  </span>
                  {cert.status === 'minted' && cert.tokenId && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Token #{cert.tokenId}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-2 text-slate-900 dark:text-white">
                  Course #{cert.courseId} Certificate
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-500 mb-8">
                  Issued to: {cert.walletAddress.slice(0, 8)}...{cert.walletAddress.slice(-4)}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-600">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">BSC Mainnet</span>
                  </div>
                  {cert.txHash && (
                    <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-blue-600 dark:text-blue-400 transition-all">
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
