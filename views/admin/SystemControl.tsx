
import React, { useState } from 'react';
import { SystemSettings } from '../../types';
import { 
  ShieldAlert, 
  Construction, 
  UserPlus, 
  LogIn, 
  Settings, 
  Globe, 
  Mail, 
  Bell, 
  Save, 
  RotateCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface Props {
  settings: SystemSettings;
  onUpdate: (s: SystemSettings) => void;
}

const SystemControl: React.FC<Props> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);

  const handleSave = () => {
    onUpdate(localSettings);
    alert("System settings updated successfully.");
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto pb-32">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">System <span className="text-blue-500">Control</span></h1>
          <p className="text-gray-500 font-medium">Configure core platform behavior and security.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setLocalSettings(settings)} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all"><RotateCcw className="w-5 h-5" /></button>
           <button 
             onClick={handleSave}
             className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-black shadow-xl shadow-blue-500/20"
           >
             <Save className="w-5 h-5" /> Save Changes
           </button>
        </div>
      </div>

      <div className="space-y-8">
         {/* Critical Toggles */}
         <div className="grid md:grid-cols-3 gap-6">
            <div className={`p-8 rounded-[40px] border-2 transition-all ${localSettings.maintenanceMode ? 'bg-yellow-500/10 border-yellow-500' : 'bg-white/5 border-white/5'}`}>
               <Construction className={`w-10 h-10 mb-6 ${localSettings.maintenanceMode ? 'text-yellow-400' : 'text-gray-500'}`} />
               <h3 className="font-black mb-2">Maintenance Mode</h3>
               <p className="text-xs text-gray-500 mb-6 leading-relaxed">Blocks all non-admin traffic and shows maintenance screen.</p>
               <button 
                 onClick={() => setLocalSettings({...localSettings, maintenanceMode: !localSettings.maintenanceMode})}
                 className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${localSettings.maintenanceMode ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-500'}`}
               >
                  {localSettings.maintenanceMode ? 'Active' : 'Inactive'}
               </button>
            </div>

            <div className={`p-8 rounded-[40px] border-2 transition-all ${!localSettings.allowSignups ? 'bg-red-500/10 border-red-500' : 'bg-white/5 border-white/5'}`}>
               <UserPlus className={`w-10 h-10 mb-6 ${!localSettings.allowSignups ? 'text-red-400' : 'text-gray-500'}`} />
               <h3 className="font-black mb-2">Signups</h3>
               <p className="text-xs text-gray-500 mb-6 leading-relaxed">Toggle the ability for new users to register on the platform.</p>
               <button 
                 onClick={() => setLocalSettings({...localSettings, allowSignups: !localSettings.allowSignups})}
                 className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${localSettings.allowSignups ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
               >
                  {localSettings.allowSignups ? 'Enabled' : 'Paused'}
               </button>
            </div>

            <div className={`p-8 rounded-[40px] border-2 transition-all ${!localSettings.allowLogins ? 'bg-orange-500/10 border-orange-500' : 'bg-white/5 border-white/5'}`}>
               <LogIn className={`w-10 h-10 mb-6 ${!localSettings.allowLogins ? 'text-orange-400' : 'text-gray-500'}`} />
               <h3 className="font-black mb-2">Logins</h3>
               <p className="text-xs text-gray-500 mb-6 leading-relaxed">Lock the platform access. Active sessions will persist until logout.</p>
               <button 
                 onClick={() => setLocalSettings({...localSettings, allowLogins: !localSettings.allowLogins})}
                 className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${localSettings.allowLogins ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
               >
                  {localSettings.allowLogins ? 'Enabled' : 'Locked'}
               </button>
            </div>
         </div>

         {/* General Config */}
         <div className="p-10 lg:p-16 rounded-[48px] bg-white/5 border border-white/5">
            <h2 className="text-2xl font-black mb-10 flex items-center gap-4"><Settings className="w-6 h-6 text-blue-500" /> Platform Metadata</h2>
            <div className="grid md:grid-cols-2 gap-10">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2"><Globe className="w-3 h-3" /> Ecosystem Name</label>
                  <input 
                    type="text" 
                    value={localSettings.siteName}
                    onChange={(e) => setLocalSettings({...localSettings, siteName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2"><Mail className="w-3 h-3" /> Support Email</label>
                  <input 
                    type="email" 
                    value={localSettings.supportEmail}
                    onChange={(e) => setLocalSettings({...localSettings, supportEmail: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
               </div>
               <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2"><Bell className="w-3 h-3" /> Dashboard Announcement</label>
                  <textarea 
                    rows={2} 
                    value={localSettings.announcement}
                    onChange={(e) => setLocalSettings({...localSettings, announcement: e.target.value})}
                    placeholder="E.g. Schedule maintenance for Oct 30..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" 
                  ></textarea>
               </div>
            </div>
         </div>

         {/* Security Advisory */}
         <div className="p-8 rounded-[40px] bg-blue-600/5 border border-blue-500/20 flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
               <h4 className="font-bold mb-1">Administrative Privileges</h4>
               <p className="text-sm text-gray-400 leading-relaxed">Changing these settings affects the entire FINODIV environment. For security, certain super-admin actions (like database wipes) require multi-factor confirmation from devolufinodiv@gmail.com.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SystemControl;
