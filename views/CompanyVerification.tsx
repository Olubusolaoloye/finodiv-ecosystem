
import React, { useState } from 'react';
// Add Lock to the lucide-react imports
import { Upload, CheckCircle2, File, Info, Building2, Globe, MapPin, X, Lock } from 'lucide-react';

const CompanyVerification: React.FC = () => {
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'certificate_of_incorporation.pdf', status: 'uploaded' },
    { name: 'director_id.jpg', status: 'uploading', progress: 65 }
  ]);

  return (
    <div className="max-w-7xl mx-auto p-8 lg:p-12 pb-32">
       <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">Company Verification</h1>
            <p className="text-gray-500 text-lg">Securely verify your company to access the full platform and hire top Web3 talent.</p>
          </div>
          <button className="text-sm font-bold text-gray-500 hover:text-white transition-colors">Support</button>
       </div>

       {/* Stepper */}
       <div className="mb-12">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4">
             <span>Step {step} of 3: Company Details & Documents</span>
             <span>33% Complete</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 w-1/3 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          </div>
       </div>

       <div className="bg-white/5 border border-white/5 rounded-[48px] p-10 lg:p-16">
          <section className="mb-16">
             <h3 className="text-2xl font-black mb-10 flex items-center gap-4">
                <Building2 className="w-7 h-7 text-blue-400" /> Company Information
             </h3>
             <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Legal Company Name</label>
                   <input type="text" placeholder="Enter your company's legal name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Registration Number</label>
                   <input type="text" placeholder="e.g., 12345678" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2">Company Website <Globe className="w-3 h-3" /></label>
                   <input type="text" placeholder="https://example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Company Type</label>
                   <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none">
                      <option>Select company type</option>
                      <option>Corporation</option>
                      <option>LLC</option>
                      <option>DAO</option>
                   </select>
                </div>
             </div>
          </section>

          <section className="mb-16">
             <h3 className="text-2xl font-black mb-10 flex items-center gap-4">
                <MapPin className="w-7 h-7 text-blue-400" /> Business Address
             </h3>
             <div className="grid md:grid-cols-3 gap-10">
                <div className="md:col-span-3 space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Address Line</label>
                   <input type="text" placeholder="123 Main Street" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">City</label>
                   <input type="text" placeholder="Metropolis" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Postal Code</label>
                   <input type="text" placeholder="10001" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Country</label>
                   <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none">
                      <option>Select country</option>
                      <option>United States</option>
                      <option>Singapore</option>
                      <option>United Kingdom</option>
                   </select>
                </div>
             </div>
          </section>

          <section className="mb-16">
             <h3 className="text-2xl font-black mb-10">Document Upload</h3>
             <div className="p-16 border-2 border-dashed border-white/10 rounded-[48px] bg-white/[0.01] flex flex-col items-center justify-center text-center group hover:border-blue-500/30 transition-all mb-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Drag & Drop files or <span className="text-blue-400 cursor-pointer">Browse</span></h4>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Supports: PDF, JPG, PNG. Max size: 5MB</p>
             </div>

             <div className="space-y-4">
                {uploadedFiles.map((file, i) => (
                   <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 group">
                      <div className="flex items-center gap-4 flex-1">
                         <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500"><File className="w-6 h-6" /></div>
                         <div className="flex-1">
                            <h5 className="text-sm font-bold mb-1 truncate">{file.name}</h5>
                            {file.status === 'uploading' && (
                               <div className="h-1 w-full max-w-[200px] bg-white/5 rounded-full overflow-hidden mt-2">
                                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${file.progress}%` }}></div>
                               </div>
                            )}
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         {file.status === 'uploaded' && <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Uploaded</span>}
                         <button className="p-2 rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all">
                            {file.status === 'uploaded' ? <X className="w-4 h-4" /> : <X className="w-4 h-4" />}
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </section>

          <div className="flex flex-col items-center gap-10">
             <label className="flex items-center gap-4 cursor-pointer group">
                <input type="checkbox" className="hidden" />
                <div className="w-6 h-6 rounded-lg border-2 border-white/10 flex items-center justify-center group-hover:border-blue-500/50 transition-all">
                   <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <span className="text-sm text-gray-500">I confirm that the information provided is accurate and I agree to FINODIV's <span className="text-blue-400 font-bold">Terms of Service</span> and <span className="text-blue-400 font-bold">Privacy Policy</span>.</span>
             </label>

             <button className="w-full max-w-lg py-6 rounded-3xl bg-[#2F6DF2] hover:bg-blue-600 transition-all font-black text-xl shadow-2xl shadow-blue-500/20">
                Submit for Verification
             </button>
             
             <div className="flex items-center gap-2 text-gray-600 font-bold text-[10px] uppercase tracking-widest">
                <Lock className="w-3 h-3" /> Your information is encrypted and securely stored.
             </div>
          </div>
       </div>
    </div>
  );
};

export default CompanyVerification;
