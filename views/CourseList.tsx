
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/backend';
import { Course } from '../types';
import { Search, Filter, ChevronDown, BookOpen, Clock, Star, XCircle, Loader2 } from 'lucide-react';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    api.getCourses().then(data => {
      setCourses(data);
      const cats = ['All', ...Array.from(new Set(data.map(c => c.category).filter(Boolean)))];
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, courses]);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
        <p className="text-gray-500 text-lg">Unlock your potential in the Web3 space with our expert-led courses.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for courses..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           {['Price', 'Popularity'].map(f => (
             <button key={f} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all">
               {f} <ChevronDown className="w-4 h-4 opacity-50" />
             </button>
           ))}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 mb-12 custom-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeCategory === cat ? 'bg-[#2F6DF2] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
         <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading ecosystem content...</p>
         </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCourses.map(course => (
            <Link key={course.id} to={`/courses/${course.id}`} className="flex flex-col group h-full">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-6 relative border border-white/5 shadow-2xl">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {course.category}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                  <span className="text-2xl font-bold">${course.price}</span>
                  <button className="px-6 py-2.5 rounded-xl bg-[#2F6DF2] hover:bg-blue-600 transition-all text-sm font-bold shadow-lg shadow-blue-500/10">
                    View Course
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <XCircle className="w-16 h-16 text-gray-700 mb-6" />
          <h3 className="text-2xl font-bold mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query.</p>
          <button 
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            className="mt-8 text-blue-400 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination (Visual only for now) */}
      {!loading && filteredCourses.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-20">
           <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-gray-500"><ChevronDown className="w-5 h-5 rotate-90" /></button>
           <button className="w-10 h-10 rounded-xl bg-[#2F6DF2] text-white font-bold flex items-center justify-center">1</button>
           <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-gray-500"><ChevronDown className="w-5 h-5 -rotate-90" /></button>
        </div>
      )}
    </div>
  );
};

export default CourseList;
