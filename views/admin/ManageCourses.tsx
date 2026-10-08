
import React, { useState, useEffect } from 'react';
import { api } from '../../services/backend';
import { Plus, Search, Edit3, Trash2, X, ChevronDown, Loader2 } from 'lucide-react';
import { Course } from '../../types';

const CATEGORIES = ['All','Smart Contracts','Marketing','DeFi','Security','ZK / L2','AI + Web3','Blockchain Data','Gaming','Community','RWA / Tokenization','MEV / Quant','DevRel'];

const ManageCourses: React.FC = () => {
  const [courses, setCourses]         = useState<Course[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isAdding, setIsAdding]       = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCatMenu, setShowCatMenu] = useState(false);

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '', description: '', price: 0, category: 'Smart Contracts', level: 'Beginner', instructor: '',
  });

  useEffect(() => { loadCourses(); }, []);

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
      instructor: formData.instructor || 'FINODIV Team',
      duration: '10h',
      image: `https://picsum.photos/seed/${Math.random()}/800/450`,
    };
    await api.addCourse(newCourse);
    await loadCourses();
    setIsAdding(false);
    setFormData({ title: '', description: '', price: 0, category: 'Smart Contracts', level: 'Beginner', instructor: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    setLoading(true);
    await api.deleteCourse(id);
    await loadCourses();
  };

  const handleUpdate = async () => {
    if (!editingCourse || !editingCourse.title) return;
    setLoading(true);
    await api.updateCourse(editingCourse.id, editingCourse);
    await loadCourses();
    setEditingCourse(null);
  };

  const filtered = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const inputCls = 'w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 transition-colors';

  return (
    <>
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">
            Manage <span className="text-blue-500">Courses</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-500 font-medium">Curate the learning paths for the ecosystem.</p>
        </div>
        <button onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 rounded-[20px] bg-blue-600 hover:bg-blue-500 transition-all font-black text-white shadow-xl shadow-blue-500/20 whitespace-nowrap">
          <Plus className="w-5 h-5" /> Add New Course
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6 mb-10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search courses…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 transition-colors" />
        </div>
        <div className="relative shrink-0">
          <button onClick={() => setShowCatMenu(v => !v)}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-gray-300 whitespace-nowrap hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
            {categoryFilter} <ChevronDown className="w-4 h-4" />
          </button>
          {showCatMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-20 py-2 max-h-72 overflow-y-auto">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setCategoryFilter(cat); setShowCatMenu(false); }}
                  className={`w-full text-left px-5 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                    categoryFilter === cat ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-gray-300'
                  }`}>{cat}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="mb-12 p-8 rounded-[40px] bg-white dark:bg-white/5 border border-blue-500/30 shadow-xl dark:shadow-none">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">New Course Details</h2>
            <button onClick={() => setIsAdding(false)}>
              <X className="w-6 h-6 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Course Title</label>
              <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. DeFi Fundamentals" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inputCls + ' appearance-none'}>
                {['Smart Contracts','Marketing','DeFi','Security','ZK / L2','AI + Web3','Blockchain Data','Gaming','Community','RWA / Tokenization','MEV / Quant','DevRel'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Description</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="What will students learn?" className={inputCls + ' resize-none'} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Price (USD)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Level</label>
              <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className={inputCls + ' appearance-none'}>
                {['Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Instructor Name</label>
              <input value={formData.instructor} onChange={e => setFormData({ ...formData, instructor: e.target.value })} placeholder="Instructor full name" className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button onClick={() => setIsAdding(false)} className="px-8 py-3 rounded-xl font-bold text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors">Cancel</button>
            <button onClick={handleAdd} className="px-10 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">Publish Course</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs">Loading courses…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center text-slate-400 dark:text-gray-600">
          <p className="text-xl font-black mb-2">No courses found</p>
          <p className="text-sm">Try a different search or add a new course.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map(course => (
            <div key={course.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[40px] overflow-hidden group hover:border-blue-500/30 transition-all shadow-sm dark:shadow-none">
              <div className="aspect-video relative overflow-hidden">
                <img src={course.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-blue-400 border border-white/10">
                    {course.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => setEditingCourse(course)} className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-blue-500 transition-all text-white">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-md hover:bg-red-500 transition-all text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-black mb-2 truncate text-slate-900 dark:text-white">{course.title}</h3>
                <p className="text-xs text-slate-500 dark:text-gray-500 mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">${course.price}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">{course.level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
    {editingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Edit Course</h2>
              <button onClick={() => setEditingCourse(null)}>
                <X className="w-6 h-6 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Course Title</label>
                <input value={editingCourse.title} onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Category</label>
                <select value={editingCourse.category} onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })} className={inputCls + ' appearance-none'}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Description</label>
                <textarea rows={3} value={editingCourse.description} onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })} className={inputCls + ' resize-none'} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Price (USD)</label>
                <input type="number" value={editingCourse.price} onChange={e => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Level</label>
                <select value={editingCourse.level} onChange={e => setEditingCourse({ ...editingCourse, level: e.target.value })} className={inputCls + ' appearance-none'}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Instructor</label>
                <input value={editingCourse.instructor} onChange={e => setEditingCourse({ ...editingCourse, instructor: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={() => setEditingCourse(null)} className="px-8 py-3 rounded-xl font-bold text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors">Cancel</button>
              <button onClick={handleUpdate} className="px-10 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageCourses;
