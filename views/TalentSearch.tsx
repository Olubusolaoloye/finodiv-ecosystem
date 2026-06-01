
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/backend';
import { Talent } from '../types';
import { Search, Filter, ChevronDown, Award, Star, MessageSquare, XCircle, ShieldCheck, Loader2 } from 'lucide-react';

const TalentSearch: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTalents();
  }, []);

  const loadTalents = async () => {
    setLoading(true);
    const data = await api.getTalents();
    setTalents(data);
    setLoading(false);
  };

  const filteredTalents = useMemo(() => {
    return talents.filter(talent => {
      return talent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             talent.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [searchQuery, talents]);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">Find Your Next <span className="text-blue-500">Hire</span></h1>
          <p className="text-gray-500 text-lg">Direct access to the top 1% of Web3 professionals.</p>
        </div>
        <button className="px-8 py-3 rounded-2xl bg-[#2F6DF2] hover:bg-blue-600 transition-all font-bold shadow-xl shadow-blue-500/20">
          Post a Job
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search talent, skills, jobs..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           {['Skill', 'Experience'].map(f => (
             <button key={f} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all">
               <Filter className="w-4 h-4 opacity-50" /> {f} <ChevronDown className="w-4 h-4 opacity-50" />
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Searching global talent pool...</p>
        </div>
      ) : filteredTalents.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTalents.map(talent => (
            <div key={talent.id} className="bg-white/5 rounded-[40px] p-8 border border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
               
               <div className="w-32 h-32 rounded-[40px] border-4 border-white/5 overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-500 shadow-2xl relative">
                 <img src={talent.avatar} alt={talent.name} className="w-full h-full object-cover" />
                 {talent.verified && (
                    <div className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-blue-600 border-2 border-[#0b0e14] shadow-lg">
                       <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                 )}
               </div>
               
               <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  {talent.name}
               </h3>
               <p className="text-sm text-gray-500 mb-6">{talent.title}</p>
               
               {/* Verified Talent Badge */}
               <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-8 shadow-sm">
                  <Award className="w-4 h-4" /> Verified Talent
               </div>

               <div className="flex gap-3 w-full mt-auto">
                 <button className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">
                    Message
                 </button>
                 <Link to={`/profile/${talent.id}`} className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-center hover:bg-white/10 transition-all">
                    View Profile
                 </Link>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <XCircle className="w-16 h-16 text-gray-700 mb-6" />
          <h3 className="text-2xl font-bold mb-2">No talent matched</h3>
          <p className="text-gray-500">Try a different name, skill, or title.</p>
        </div>
      )}
    </div>
  );
};

export default TalentSearch;
