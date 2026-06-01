
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Search, ShieldCheck, Zap, ArrowRight, Star } from 'lucide-react';
import { COURSES } from '../constants';
import { UserRole } from '../types';
import Logo from '../components/Logo';

interface HomeProps {
  onJoin: (role: UserRole) => void;
}

const Home: React.FC<HomeProps> = ({ onJoin }) => {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square bg-[#5D26D6]/20 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4 fill-current" />
            <span>Empowering the next generation of Web3 builders</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Learn. Build. Earn. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Belong.</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            The Web3-powered learning and hiring ecosystem. Master the skills, verify your proficiency on-chain, and get hired by top projects.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/join"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#2F6DF2] hover:bg-blue-600 transition-all font-bold text-lg shadow-xl shadow-blue-500/20"
            >
              Start Learning
            </Link>
            <button 
              onClick={() => onJoin(UserRole.EMPLOYER)}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-lg"
            >
              Hire Talent
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">Your Journey in Web3 Starts Here</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Play, title: 'Learn', text: 'Master in-demand skills with our comprehensive Web3 courses.' },
            { icon: ShieldCheck, title: 'Verify', text: 'Receive your proof-of-skills as a unique NFT Certificate on the blockchain.' },
            { icon: Search, title: 'Get Hired', text: 'Connect with top companies and land your dream job in the ecosystem.' },
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Course List */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold">Explore Our Top Courses</h2>
          <Link to="/courses" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 font-medium">
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {COURSES.slice(0, 3).map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="group bg-white/5 rounded-3xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all">
              <div className="aspect-video overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={`https://i.pravatar.cc/50?u=${course.instructor}`} alt={course.instructor} className="w-6 h-6 rounded-full" />
                    <span className="text-xs text-gray-400">{course.instructor}</span>
                  </div>
                  <span className="font-bold text-blue-400">${course.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Talent CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="p-12 rounded-[40px] bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
           <div className="relative z-10 text-center md:text-left">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">Hire verified experts <br className="hidden md:block" /> directly from the source.</h2>
             <p className="text-blue-100/80">Connect with the top 1% of Web3 talent, vetted and verified.</p>
           </div>
           <Link to="/talent" className="relative z-10 px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-100 transition-all">
             Browse Talent
           </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 pt-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12">
          <div className="flex items-center gap-3 opacity-50">
            <Logo className="w-6 h-6 grayscale" />
            <span className="text-lg font-bold">FINODIV</span>
          </div>
          <p className="text-sm text-gray-600">© 2024 FINODIV. All rights reserved.</p>
          <div className="flex items-center gap-6 opacity-40">
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">Discord</span>
            <span className="hover:text-white cursor-pointer transition-colors">Telegram</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
