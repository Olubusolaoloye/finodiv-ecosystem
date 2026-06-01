
import React, { useState } from 'react';
import { UserRole } from '../types';
import { GraduationCap, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';

interface JoinAsProps {
  onSelect: (role: UserRole) => void;
}

const JoinAs: React.FC<JoinAsProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen w-full bg-[#0b0e14] flex flex-col items-center justify-center p-8 relative overflow-y-auto overflow-x-hidden">
      <div className="absolute inset-0 bg-blue-600/5 blur-[150px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        <div className="mb-12 flex flex-col items-center gap-4">
          <Logo className="w-16 h-16 shadow-2xl shadow-blue-500/20" />
          <span className="text-2xl font-black tracking-widest">FINODIV</span>
        </div>

        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Destination</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Select the path that matches your goals. Whether you're here to build or to hire, we have the tools to help you succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mb-16">
          {[
            { 
              role: UserRole.LEARNER, 
              icon: GraduationCap, 
              title: 'Learner', 
              text: 'Master Web3 skills, earn NFT certificates, and build a verifiable proof-of-work portfolio.',
              accent: 'blue'
            },
            { 
              role: UserRole.EMPLOYER, 
              icon: Briefcase, 
              title: 'Employer', 
              text: 'Access a vetted pool of Web3 talent, verify skills on-chain, and hire with total confidence.',
              accent: 'indigo'
            },
          ].map((opt) => (
            <button 
              key={opt.role}
              onClick={() => setSelected(opt.role)}
              className={`
                p-10 rounded-[56px] border-2 transition-all text-left flex flex-col items-start gap-8 relative group overflow-hidden h-full
                ${selected === opt.role 
                  ? 'bg-white/5 border-blue-500 ring-8 ring-blue-500/5' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'}
              `}
            >
              {/* Card Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              
              <div className={`
                w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500
                ${selected === opt.role ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-500 group-hover:text-blue-400'}
              `}>
                <opt.icon className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">{opt.title}</h3>
                <p className="text-gray-500 text-lg leading-relaxed">{opt.text}</p>
              </div>

              <div className={`
                flex items-center gap-3 text-sm font-bold transition-all
                ${selected === opt.role ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}
              `}>
                Select this path <ArrowRight className={`w-4 h-4 transition-transform ${selected === opt.role ? 'translate-x-1' : ''}`} />
              </div>

              {selected === opt.role && (
                 <div className="absolute top-6 right-6">
                    <CheckCircle2 className="w-8 h-8 text-blue-500" />
                 </div>
              )}
            </button>
          ))}
        </div>

        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <button 
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className={`
              w-full py-6 rounded-3xl font-black text-xl transition-all shadow-2xl
              ${selected 
                ? 'bg-blue-600 text-white shadow-blue-500/30 hover:scale-105 active:scale-95' 
                : 'bg-white/5 text-gray-700 cursor-not-allowed'}
            `}
          >
            Create My Account
          </button>

          <p className="text-sm text-gray-500 font-medium">
            Already a member? <span className="text-blue-400 cursor-pointer hover:underline font-black">Sign In instead</span>
          </p>
        </div>
      </div>

      {/* Background Graphic Element */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </div>
  );
};

export default JoinAs;
