
import React, { useState, useEffect } from 'react';
import { api } from '../../services/backend';
import { Plus, Search, Edit3, Trash2, MoreVertical, Image as ImageIcon, Check, X, Filter, Loader2 } from 'lucide-react';
import { Course } from '../../types';

const ManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    price: 0,
    category: 'Smart Contracts',
    level: 'Beginner',
    instructor: 'Alex Morgan'
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const data = await api.getCourses();
    setCourses(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.description) return;
    
    setLoading(true);
    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      price: Number(formData.price) || 0,
      category: formData.category || 'Smart Contracts',
      level: formData.level || 'Beginner',
      instructor: formData.instructor || 'Alex Morgan',
      duration: '10h',
      image: `https://picsum.photos/seed/${Math.random()}/800/450`
    };
    
    await api.addCourse(newCourse);
    await loadCourses();
    setIsAdding(false);
    setFormData({ title: '', description: '', price: 0 });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      setLoading(true);
      await api.deleteCourse(id);
      await loadCourses();
    }
  };

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Manage <span className="text-blue-500">Courses</span></h1>
          <p className="text-gray-500 font-medium">Curate the learning paths for the ecosystem.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 rounded-[20px] bg-blue-600 hover:bg-blue-500 transition-all font-black text-white shadow-xl shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" /> Add New Course
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search courses by name or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold">
              <Filter className="w-4 h-4 text-gray-500" /> All Categories
           </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-12 p-8 rounded-[40px] bg-white/5 border border-blue-500/30 backdrop-blur-3xl animate-in fade-in slide-in-from-top-4">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black">New Course Details</h2>
              <button onClick={() => setIsAdding(false)}><X className="w-6 h-6 text-gray-500 hover:text-white" /></button>
           </div>
           <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Course Title</label>
                 <input 
                   type="text" 
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Category</label>
                 <select 
                   value={formData.category}
                   onChange={(e) => setFormData({...formData, category: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                 >
                    <option>Smart Contracts</option>
                    <option>Marketing</option>
                    <option>DeFi</option>
                    <option>Security</option>
                 </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Description</label>
                 <textarea 
                   rows={3}
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                 ></textarea>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Price ($)</label>
                 <input 
                   type="number" 
                   value={formData.price}
                   onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Level</label>
                 <select 
                   value={formData.level}
                   onChange={(e) => setFormData({...formData, level: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                 >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                 </select>
              </div>
           </div>
           <div className="flex justify-end gap-4">
              <button onClick={() => setIsAdding(false)} className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-all">Cancel</button>
              <button onClick={handleAdd} className="px-10 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">Publish Course</button>
           </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing with blockchain nodes...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map(course => (
            <div key={course.id} className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden group hover:border-blue-500/20 transition-all">
               <div className="aspect-video relative overflow-hidden">
                  <img src={course.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 flex gap-2">
                     <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-blue-400 border border-white/10">
                        {course.category}
                     </span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                     <button className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"><Edit3 className="w-4 h-4" /></button>
                     <button onClick={() => handleDelete(course.id)} className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-md hover:bg-red-500 transition-all text-white"><Trash2 className="w-4 h-4" /></button>
                  </div>
               </div>
               <div className="p-8">
                  <h3 className="text-xl font-black mb-2 truncate">{course.title}</h3>
                  <p className="text-xs text-gray-500 mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                     <span className="text-2xl font-black">${course.price}</span>
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{course.level}</span>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
