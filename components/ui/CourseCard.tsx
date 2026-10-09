import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Star } from 'lucide-react';

export interface CourseCardData {
  id: string;
  title: string;
  category: string;
  lessonCount: number;
  duration: string;
  priceNGN: number;
  priceUSD: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  enrolled: number;
  thumbnailColor?: string;
  rating?: number;
}

interface CourseCardProps {
  course: CourseCardData;
  onClick?: (id: string) => void;
  variant?: 'grid' | 'compact';
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Forex:          'linear-gradient(135deg, #1d3a6b 0%, #1e3a8a 50%, var(--color-accent) 100%)',
  Crypto:         'linear-gradient(135deg, #3b0764 0%, #5b21b6 50%, #7C3AED 100%)',
  DeFi:           'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #38bdf8 100%)',
  'Digital Skills':'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #10b981 100%)',
  Investing:      'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #f97316 100%)',
};

const LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: 'rgba(139,92,246,0.15)',  color: '#60a5fa'  },
  Intermediate: { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa'  },
  Advanced:     { bg: 'rgba(239,68,68,0.12)',   color: '#f87171'  },
};

const CATEGORY_ICONS: Record<string, string> = {
  Forex:           '💱',
  Crypto:          '₿',
  DeFi:            '⬡',
  'Digital Skills':'💻',
  Investing:       '📈',
};

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const gradient = CATEGORY_GRADIENTS[course.category] ?? 'linear-gradient(135deg, #1a0a3e 0%, #2d1b69 100%)';
  const level    = LEVEL_STYLES[course.level] ?? LEVEL_STYLES.Beginner;
  const icon     = CATEGORY_ICONS[course.category] ?? '📚';
  const rating   = course.rating ?? 4.8;

  return (
    <motion.article
      role="button"
      tabIndex={0}
      aria-label={`${course.title} — ${course.level}, ₦${course.priceNGN.toLocaleString()}`}
      onClick={() => onClick?.(course.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(course.id); }}}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="group flex flex-col rounded-[18px] overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.4)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(139,92,246,0.12)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: gradient }}>
        {/* Category icon */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
            {icon}
          </div>
        </div>
        {/* Category badge */}
        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
            padding: '4px 8px', borderRadius: 6,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            color: 'rgba(255,255,255,0.85)',
          }}>
            {course.category}
          </span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(139,92,246,0.08)' }} aria-hidden="true" />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Level + rating */}
        <div className="flex items-center justify-between">
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '3px 8px', borderRadius: 6,
            background: level.bg, color: level.color,
          }}>
            {course.level}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star style={{ width: 11, height: 11, fill: '#fbbf24', color: '#fbbf24' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)' }}>{rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2" style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: 'var(--color-text-primary)' }}>
          {course.title}
        </h3>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
            <BookOpen style={{ width: 12, height: 12 }} />
            {course.lessonCount} lessons
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
            <Clock style={{ width: 12, height: 12 }} />
            {course.duration}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            <Users style={{ width: 12, height: 12 }} />
            {course.enrolled.toLocaleString()}
          </span>
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              ₦{course.priceNGN.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>~${course.priceUSD}</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClick?.(course.id); }}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--color-accent)', color: '#fff',
              fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
            aria-label={`Enroll in ${course.title}`}
          >
            Enroll
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default CourseCard;
