
import React, { useState, useEffect } from 'react';
import { UserRole, WalletBinding } from '../types';
import { api } from '../services/backend';
import { supabase } from '../services/supabase';
import {
  User,
  Lock,
  CreditCard,
  Wallet,
  ShieldCheck,
  Globe,
  Camera,
  Check,
  Mail,
  Link2,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface SettingsProps {
  userId: string;
  role: UserRole;
  authEmail: string | null;
  walletAddress: string | null;
  onBindWallet: () => void;
}

const Settings: React.FC<SettingsProps> = ({ userId, role, authEmail, walletAddress, onBindWallet }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [binding, setBinding] = useState<WalletBinding | null>(null);
  const [isBinding, setIsBinding] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    api.getBinding(userId).then(b => { if (b) setBinding(b); });
    // Load real profile data
    supabase.from('profiles').select('name, title').eq('id', userId).maybeSingle().then(({ data }) => {
      if (data) {
        setDisplayName(data.name || '');
        setProfessionalTitle(data.title || '');
      }
    });
  }, [userId]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await supabase.from('profiles').update({ name: displayName, title: professionalTitle }).eq('id', userId);
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleBindClick = async () => {
    setIsBinding(true);
    try {
      const nonce = await api.generateBindingNonce(userId);
      setTimeout(async () => {
        const newBinding = await api.bindWallet(userId, walletAddress || '0xDemoAddress', 'sig_verify');
        setBinding(newBinding);
        setIsBinding(false);
        onBindWallet();
      }, 1500);
    } catch (e) {
      setIsBinding(false);
    }
  };

  const tabs = [
    { id: 'Profile', icon: User },
    { id: 'Security', icon: Lock },
    { id: 'Identity', icon: ShieldCheck },
    ...(role === UserRole.LEARNER ? [{ id: 'Payments', icon: CreditCard }] : []),
    { id: 'Integrations', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 pb-32">
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-gray-500">Manage your profile, security, and linked identities.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm
                ${activeTab === tab.id ? 'bg-[#2F6DF2] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              <tab.icon className="w-5 h-5" />
              {tab.id}
            </button>
          ))}
        </aside>

        <main className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 lg:p-12 backdrop-blur-xl shadow-sm dark:shadow-none">
          {activeTab === 'Identity' && (
            <div className="space-y-12">
               <div>
                  <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Connected Identities</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-500 mb-8">Binding your wallet to your Gmail account allows for multi-factor authentication and verified proof-of-work.</p>
                  
                  <div className="space-y-4">
                     {/* Google Identity */}
                     <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Mail className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">Google Account</p>
                              <p className="text-[10px] text-slate-500 dark:text-gray-500">{authEmail || 'Not Connected'}</p>
                           </div>
                        </div>
                        {authEmail ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Primary</span>
                        ) : (
                          <button className="text-xs font-bold text-blue-500">Connect</button>
                        )}
                     </div>

                     {/* Web3 Identity */}
                     <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-500">
                              <Wallet className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">Web3 Identity (BSC)</p>
                              <p className="text-[10px] text-slate-500 dark:text-gray-500">
                                {binding ? `${binding.address.slice(0,6)}...${binding.address.slice(-4)}` : (walletAddress ? 'Pending Binding' : 'Not Connected')}
                              </p>
                           </div>
                        </div>
                        
                        {binding ? (
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                <Check className="w-3 h-3" /> Bound
                              </div>
                              <button className="text-[10px] text-red-500 font-bold hover:underline">Unbind</button>
                           </div>
                        ) : walletAddress ? (
                          <button 
                            onClick={handleBindClick}
                            disabled={isBinding}
                            className="px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center gap-2"
                          >
                             {isBinding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign to Bind"}
                          </button>
                        ) : (
                          <button 
                            onClick={onBindWallet}
                            className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white text-xs font-bold transition-all"
                          >
                             Connect Wallet
                          </button>
                        )}
                     </div>
                  </div>
               </div>

               <div className="p-8 rounded-[40px] bg-blue-500/5 border border-blue-500/10 dark:border-blue-500/20">
                  <div className="flex items-center gap-4 mb-4">
                     <Link2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                     <h4 className="text-lg font-bold text-slate-900 dark:text-white">Identity Sync</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">By syncing your identities, your earned NFT certificates will be automatically associated with your professional profile regardless of how you sign in.</p>
               </div>
            </div>
          )}

          {activeTab === 'Payments' && (
            <div className="space-y-12">
               <div>
                  <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Payment Channels</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-500 mb-8">Choose between traditional Fiat via Paystack or USDT on the Binance Smart Chain.</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="p-8 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between h-56 transition-colors">
                        <div className="flex justify-between items-start">
                           <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <CreditCard className="w-6 h-6" />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">Paystack Ready</span>
                        </div>
                        <div>
                           <h4 className="font-bold text-lg text-slate-900 dark:text-white">Fiat Payments</h4>
                           <p className="text-xs text-slate-500 dark:text-gray-500">Fast card and bank transfers</p>
                        </div>
                     </div>

                     <div className="p-8 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between h-56 transition-colors">
                        <div className="flex justify-between items-start">
                           <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-500">
                              <Wallet className="w-6 h-6" />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">USDT / BSC</span>
                        </div>
                        <div>
                           <h4 className="font-bold text-lg text-slate-900 dark:text-white">Blockchain Channel</h4>
                           <p className="text-xs text-slate-500 dark:text-gray-500">Direct on-chain settlements</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
          
          {activeTab === 'Profile' && (
             <div className="space-y-8">
                <div className="flex flex-col items-center">
                   <div className="relative group mb-6">
                      <img src={`https://i.pravatar.cc/150?u=${userId}`} className="w-32 h-32 rounded-[40px] object-cover border-4 border-slate-100 dark:border-white/10 shadow-xl" />
                      <button className="absolute inset-0 bg-black/40 rounded-[40px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="w-8 h-8 text-white" />
                      </button>
                   </div>
                   <h4 className="text-xl font-black text-slate-900 dark:text-white">{displayName || authEmail?.split('@')[0] || 'My Profile'}</h4>
                   <p className="text-sm text-slate-500 dark:text-gray-500">{authEmail || 'Web3 Builder'}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Professional Title</label>
                      <input
                        type="text"
                        value={professionalTitle}
                        onChange={e => setProfessionalTitle(e.target.value)}
                        placeholder="e.g. Smart Contract Developer"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white"
                      />
                   </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-10 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 disabled:opacity-70"
                >
                  {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : profileSaved ? <CheckCircle className="w-5 h-5 text-emerald-300" /> : null}
                  {profileSaved ? 'Saved!' : 'Update Profile'}
                </button>
             </div>
          )}
          {activeTab === 'Security' && <p className="text-slate-500 italic">Security controls content goes here...</p>}
          {activeTab === 'Integrations' && <p className="text-slate-500 italic">External API integrations go here...</p>}
        </main>
      </div>
    </div>
  );
};

export default Settings;
