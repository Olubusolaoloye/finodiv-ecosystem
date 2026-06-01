
import React, { useState } from 'react';
// Add BookOpen to the lucide-react imports
import { Upload, File, CheckCircle2, X, ChevronDown, Info, BookOpen } from 'lucide-react';

const ProjectSubmission: React.FC = () => {
  const [files, setFiles] = useState([
    { name: 'Web3Fundamentals_AlexJohnson.pdf', size: '4.2 MB', progress: 75 },
    { name: 'ProjectAssets_AlexJohnson.zip', size: '15.7 MB', progress: 100 }
  ]);

  return (
    <div className="max-w-7xl mx-auto p-8 lg:p-12 pb-32 flex flex-col lg:flex-row gap-12">
      <div className="flex-1">
        <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">Project Submission for Web3 Fundamentals</h1>
        <p className="text-gray-500 text-lg mb-12">Please follow the instructions below to upload your proof-of-work.</p>

        <div className="bg-white/5 rounded-[40px] p-8 border border-white/5 mb-10">
           <div className="flex items-center justify-between mb-8 cursor-pointer group">
              <h3 className="text-lg font-bold flex items-center gap-3">
                 View Submission Requirements <Info className="w-5 h-5 text-blue-400" />
              </h3>
              <ChevronDown className="w-5 h-5 text-gray-500" />
           </div>
           
           <ul className="space-y-4 text-sm text-gray-400 pl-4">
              <li className="list-disc">Accepted file formats: PDF, ZIP, JPG.</li>
              <li className="list-disc">Please ensure your files are named according to the convention: 'ProjectName_YourName'.</li>
              <li className="list-disc">Maximum file size is 50MB.</li>
              <li className="list-disc">Double-check all requirements before submitting your final work.</li>
           </ul>
        </div>

        <div className="p-20 border-2 border-dashed border-white/10 rounded-[48px] bg-white/[0.01] flex flex-col items-center justify-center text-center group hover:border-blue-500/30 transition-all cursor-pointer mb-12">
           <div className="w-20 h-20 rounded-[32px] bg-blue-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-blue-400" />
           </div>
           <h4 className="text-2xl font-bold mb-3">Drag & Drop files here</h4>
           <p className="text-gray-500 mb-8">or</p>
           <button className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all">Browse Files</button>
        </div>

        <div className="space-y-4 mb-12">
          <h3 className="text-lg font-bold mb-6">Uploaded Files</h3>
          {files.map((file, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-6 group hover:border-white/20 transition-all">
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
                  <File className="w-7 h-7 text-gray-400" />
               </div>
               <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-sm truncate max-w-md">{file.name}</h5>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{file.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${file.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                  <p className="mt-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">{file.size}</p>
               </div>
               <div className="flex items-center gap-4">
                  {file.progress === 100 ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : null}
                  <button className="p-2 rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all">
                    <X className="w-5 h-5" />
                  </button>
               </div>
            </div>
          ))}
        </div>

        <button className="w-full py-6 rounded-3xl bg-[#2F6DF2] hover:bg-blue-600 transition-all font-black text-xl shadow-2xl shadow-blue-500/20">
          Submit Project
        </button>
      </div>

      {/* Sidebar - Quick Nav Simulation */}
      <div className="hidden lg:block w-72 h-fit space-y-8">
         <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Current Submission</h3>
            <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <BookOpen className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm font-bold truncate">Blockchain Basics</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Module 1 Project</p>
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-500">Status</span>
                  <span className="text-yellow-400">Drafting</span>
               </div>
               <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-500">Deadline</span>
                  <span className="text-white">Oct 30, 2023</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProjectSubmission;
