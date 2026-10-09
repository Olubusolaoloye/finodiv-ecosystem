
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Search, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { COURSES } from '../constants';
import { UserRole } from '../types';
import Logo from '../components/Logo';

interface HomeProps {
  onJoin: (role: UserRole) => void;
}

const Home: React.FC<HomeProps> = ({ onJoin }) => {
  return (
    <div className="pb-20" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 120, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 960, aspectRatio: '1/1', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 1152, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 999, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--color-accent)', fontSize: 13, fontWeight: 600, marginBottom: 32 }}>
            <Zap style={{ width: 14, height: 14 }} />
            <span>Empowering the next generation of Web3 builders</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24, color: 'var(--color-text-primary)' }}>
            Learn. Build. Earn.{' '}
            <br />
            <span style={{ background: 'linear-gradient(135deg,#7C3AED,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Belong.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'var(--color-text-muted)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.65 }}>
            The Web3-powered learning and hiring ecosystem. Master the skills, verify your proficiency on-chain, and get hired by top projects.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Link to="/join" style={{ padding: '14px 36px', borderRadius: 16, background: 'var(--color-accent)', color: '#fff', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 8px 32px rgba(139,92,246,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-hover)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              Start Learning
            </Link>
            <button onClick={() => onJoin(UserRole.EMPLOYER)} style={{ padding: '14px 36px', borderRadius: 16, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
            >
              Hire Talent
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: 1152, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, textAlign: 'center', marginBottom: 60, color: 'var(--color-text-primary)' }}>
          Your Journey in Web3 Starts Here
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
          {[
            { icon: Play,        title: 'Learn',    text: 'Master in-demand skills with our comprehensive Web3 courses.' },
            { icon: ShieldCheck, title: 'Verify',   text: 'Receive your proof-of-skills as a unique NFT Certificate on the blockchain.' },
            { icon: Search,      title: 'Get Hired', text: 'Connect with top companies and land your dream job in the ecosystem.' },
          ].map((f, i) => (
            <div key={i} style={{ padding: 32, borderRadius: 28, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 56, height: 56, background: 'rgba(139,92,246,0.1)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <f.icon style={{ width: 26, height: 26, color: 'var(--color-accent)' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: 'var(--color-text-primary)' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Course List */}
      <section style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 900, color: 'var(--color-text-primary)' }}>Explore Our Top Courses</h2>
          <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-accent-hover)', fontWeight: 600, textDecoration: 'none', fontSize: 14, transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Browse all <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
          {COURSES.slice(0, 3).map(course => (
            <Link key={course.id} to={`/courses/${course.id}`} style={{ background: 'var(--color-bg-card)', borderRadius: 24, border: '1px solid var(--color-border)', overflow: 'hidden', textDecoration: 'none', transition: 'border-color 0.2s, transform 0.2s', display: 'block' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} />
              </div>
              <div style={{ padding: '20px 24px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{course.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.55 }}>{course.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={`https://i.pravatar.cc/50?u=${course.instructor}`} alt={course.instructor} style={{ width: 24, height: 24, borderRadius: '50%', display: 'block' }} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{course.instructor}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-accent)', fontSize: 14 }}>${course.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Talent CTA */}
      <section style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ padding: 'clamp(40px,5vw,64px)', borderRadius: 36, background: 'linear-gradient(135deg,#4C1D95 0%,#1D4ED8 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)', transform: 'translate(30%, -30%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,2.2rem)', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
              Hire verified experts <br className="hidden md:block" /> directly from the source.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>Connect with the top 1% of Web3 talent, vetted and verified.</p>
          </div>
          <Link to="/talent" style={{ position: 'relative', zIndex: 1, padding: '14px 32px', background: '#fff', color: '#4C1D95', borderRadius: 16, fontWeight: 800, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            Browse Talent
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: 1152, margin: '0 auto', padding: '48px 24px 24px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5 }}>
            <Logo className="w-6 h-6 grayscale" />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>FINODIV</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>© 2026 FINODIV. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24, opacity: 0.5 }}>
            {['Twitter', 'Discord', 'Telegram'].map(l => (
              <span key={l} style={{ fontSize: 13, color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
