
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TALENTS } from '../constants';
import { UserRole } from '../types';
import { supabase } from '../services/supabase';
import { Award, Star, Briefcase, Share2, Github, Twitter, Linkedin, ShieldCheck, GraduationCap, Zap, Loader2 } from 'lucide-react';

interface ProfileProps {
  currentSessionRole?: UserRole;
}

interface LiveProfile {
  name: string;
  title: string;
  email: string;
  xp: number;
  level: number;
  enrollmentCount: number;
  certCount: number;
  avatarUrl: string;
}

const Profile: React.FC<ProfileProps> = ({ currentSessionRole }) => {
  const { id } = useParams();
  const [liveProfile, setLiveProfile] = useState<LiveProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(id === 'current');

  useEffect(() => {
    if (id !== 'current') return;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setProfileLoading(false); return; }

      const [{ data: prof }, { count: enrollCount }, { count: certCount }] = await Promise.all([
        supabase.from('profiles').select('name, title, xp, level').eq('id', user.id).maybeSingle(),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setLiveProfile({
        name: prof?.name || user.email?.split('@')[0] || 'Learner',
        title: prof?.title || 'Web3 Builder',
        email: user.email || '',
        xp: prof?.xp ?? 0,
        level: prof?.level ?? 1,
        enrollmentCount: enrollCount ?? 0,
        certCount: certCount ?? 0,
        avatarUrl: `https://i.pravatar.cc/300?u=${user.id}`,
      });
      setProfileLoading(false);
    };
    load();
  }, [id]);

  // Detect UUID IDs — load from Supabase instead of TALENTS mock
  const isUUID = (s?: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s ?? '');
  const isRealUser = id !== 'current' && isUUID(id);

  useEffect(() => {
    if (!isRealUser) return;
    setProfileLoading(true);
    const load = async () => {
      const [{ data: prof }, { count: enrollCount }, { count: certCount }] = await Promise.all([
        supabase.from('profiles').select('name, title, bio, skills, avatar_url, xp, level, verified').eq('id', id!).maybeSingle(),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('user_id', id!),
        supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('user_id', id!),
      ]);
      if (prof) {
        setLiveProfile({
          name: prof.name || 'Anonymous',
          title: prof.title || 'Web3 Builder',
          email: '',
          xp: prof.xp ?? 0,
          level: prof.level ?? 1,
          enrollmentCount: enrollCount ?? 0,
          certCount: certCount ?? 0,
          avatarUrl: prof.avatar_url || `https://i.pravatar.cc/300?u=${id}`,
        });
      }
      setProfileLoading(false);
    };
    load();
  }, [id]);

  const talent = TALENTS.find(t => t.id === id) || TALENTS[0];
  const displayRole = id === 'current' ? (currentSessionRole || UserRole.LEARNER) : UserRole.LEARNER;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-400 uppercase tracking-widest shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </div>
        );
      case UserRole.EMPLOYER:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest shadow-sm">
            <Briefcase className="w-3.5 h-3.5" /> Employer
          </div>
        );
      case UserRole.LEARNER:
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest shadow-sm">
            <GraduationCap className="w-3.5 h-3.5" /> Learner
          </div>
        );
    }
  };

  const isCurrent = id === 'current' || isRealUser;
  const displayName = isCurrent ? (liveProfile?.name ?? '…') : talent.name;
  const displayTitle = isCurrent
    ? (liveProfile?.title ?? (displayRole === UserRole.ADMIN ? 'System Administrator' : 'Web3 Builder'))
    : talent.title;
  const displayAvatar = isCurrent ? (liveProfile?.avatarUrl ?? `https://i.pravatar.cc/300?u=${id}`) : talent.avatar;
  const displayBio = isCurrent
    ? (liveProfile?.xp ?? 0) > 0
      ? `Level ${liveProfile?.level ?? 1} Web3 learner with ${liveProfile?.xp ?? 0} XP earned across ${liveProfile?.enrollmentCount ?? 0} enrolled course${liveProfile?.enrollmentCount !== 1 ? 's' : ''} and ${liveProfile?.certCount ?? 0} on-chain certificate${liveProfile?.certCount !== 1 ? 's' : ''}.`
      : 'A passionate Web3 professional on the FINODIV ecosystem.'
    : talent.bio;

  if (isCurrent && profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 lg:p-12 pb-32">
       <div className="relative mb-20">
          <div className="h-64 w-full bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded-[48px] overflow-hidden relative">
             <div className="absolute inset-0 bg-black/20"></div>
             <div className="absolute top-8 right-8 flex gap-4">
                <button className="p-3 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white"><Share2 className="w-5 h-5" /></button>
                <button className="p-3 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white"><Star className="w-5 h-5" /></button>
             </div>
          </div>

          <div className="absolute -bottom-16 left-12 flex flex-col items-center md:flex-row md:items-end gap-8">
             <div className="w-48 h-48 rounded-[48px] border-8 border-[#0b0e14] overflow-hidden shadow-2xl bg-[#0b0e14]">
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
             </div>
             <div className="pb-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                  <h1 className="text-4xl font-black tracking-tight">{displayName}</h1>
                  {getRoleBadge(displayRole)}
                  {(isCurrent || talent.verified) && (
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-[10px] font-black text-emerald-400 uppercase tracking-widest shadow-lg">
                       <Zap className="w-3.5 h-3.5 fill-current" /> Verified Talent
                    </div>
                  )}
                </div>
                <p className="text-xl text-gray-400 font-medium mb-4">{displayTitle}</p>
                <div className="flex gap-4">
                  <Linkedin className="w-5 h-5 text-gray-500 hover:text-blue-400 cursor-pointer transition-colors" />
                  <Twitter className="w-5 h-5 text-gray-500 hover:text-blue-400 cursor-pointer transition-colors" />
                  <Github className="w-5 h-5 text-gray-500 hover:text-blue-400 cursor-pointer transition-colors" />
                </div>
             </div>
          </div>

          <div className="absolute -bottom-12 right-12 hidden lg:flex gap-4">
             <button className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold">Follow</button>
             <button className="px-10 py-4 rounded-2xl bg-[#2F6DF2] hover:bg-blue-600 transition-all font-bold shadow-xl shadow-blue-500/20">Contact</button>
          </div>
       </div>

       <div className="mt-28 grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-20">
             <section>
                <h2 className="text-2xl font-black mb-6">About</h2>
                <p className="text-gray-400 text-lg leading-relaxed">{displayBio}</p>
             </section>

             {!isCurrent && displayRole === UserRole.LEARNER && (
               <section>
                  <div className="flex items-center justify-between mb-10">
                     <h2 className="text-2xl font-black">Portfolio</h2>
                     <button className="text-sm font-bold text-blue-400 hover:text-blue-300">View all</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-8">
                    {talent.portfolio.map(project => (
                      <div key={project.id} className="group cursor-pointer">
                         <div className="aspect-[4/3] rounded-[40px] overflow-hidden border border-white/5 mb-6 shadow-xl">
                            <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         </div>
                         <h4 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{project.title}</h4>
                         <p className="text-sm text-gray-500">{project.description}</p>
                      </div>
                    ))}
                  </div>
               </section>
             )}
          </div>

          <div className="space-y-12">
             <section className="bg-white/5 rounded-[48px] p-10 border border-white/5">
                <h3 className="text-lg font-black mb-8 tracking-widest uppercase text-gray-500">Platform Activity</h3>
                <div className="space-y-6">
                   {isCurrent ? (
                     <>
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-400 font-medium">Level</span>
                         <span className="text-lg font-black text-blue-400">{liveProfile?.level ?? 1}</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-400 font-medium">XP Earned</span>
                         <span className="text-lg font-black text-purple-400">{(liveProfile?.xp ?? 0).toLocaleString()}</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-400 font-medium">Enrolled Courses</span>
                         <span className="text-lg font-black text-gray-200">{liveProfile?.enrollmentCount ?? 0}</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-400 font-medium">Certificates</span>
                         <span className="text-lg font-black text-emerald-400 flex items-center gap-2">
                           <Award className="w-5 h-5" /> {liveProfile?.certCount ?? 0}
                         </span>
                       </div>
                     </>
                   ) : (
                     <>
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-400 font-medium">Global Ranking</span>
                         <span className="text-lg font-black text-blue-400">#452</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-400 font-medium">Verification Status</span>
                         <span className="text-lg font-black text-emerald-400 flex items-center gap-2">
                           <Award className="w-5 h-5" /> Trusted
                         </span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-400 font-medium">Join Date</span>
                         <span className="text-lg font-black text-gray-200">Oct 2023</span>
                       </div>
                     </>
                   )}
                </div>
             </section>
          </div>
       </div>
    </div>
  );
};

export default Profile;
