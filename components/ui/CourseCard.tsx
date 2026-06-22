import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users } from 'lucide-react';

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
}

interface CourseCardProps {
  course: CourseCardData;
  onClick?: (id: string) => void;
  variant?: 'grid' | 'compact';
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     'rgba(47,109,242,0.15)',
  Intermediate: 'rgba(124,58,237,0.15)',
  Advanced:     'rgba(59,130,246,0.15)',
};
const LEVEL_TEXT: Record<string, string> = {
  Beginner:     '#2F6DF2',
  Intermediate: '#a78bfa',
  Advanced:     '#60a5fa',
};

// Thumbnail stays dark — represents actual course media
const Thumbnail: React.FC<{ color?: string; category: string }> = ({ color, category }) => (
  <div
    className="w-full h-full flex items-end p-4"
    style={{ background: color ?? 'linear-gradient(135deg, #0A1929 0%, #1e2530 100%)' }}
  >
    <span
      className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: '#94a3b8' }}
    >
      {category}
    </span>
  </div>
);

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const handleClick = () => onClick?.(course.id);
  const handleKey   = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(course.id); }
  };

  return (
    <motion.article
      role="button"
      tabIndex={0}
      aria-label={`${course.title} — ${course.level}, ₦${course.priceNGN.toLocaleString()}`}
      onClick={handleClick}
      onKeyDown={handleKey}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-[16px] overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(47,109,242,0.35)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
    >
      {/* Blue left-border accent on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 transition-opacity duration-200 opacity-0 group-hover:opacity-100"
        style={{ backgroundColor: 'var(--color-accent)' }}
        aria-hidden="true"
      />

      {/* Thumbnail */}
      <div className="aspect-[16/9] w-full overflow-hidden" style={{ backgroundColor: '#040D18' }}>
        <Thumbnail color={course.thumbnailColor} category={course.category} />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Level badge + enrolled */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md"
            style={{ backgroundColor: LEVEL_COLORS[course.level], color: LEVEL_TEXT[course.level] }}
          >
            {course.level}
          </span>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Users className="w-3.5 h-3.5" />
            <span>{course.enrolled.toLocaleString()}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
          {course.title}
        </h3>

        {/* Meta */}
        <div
          className="flex items-center gap-4 text-xs mt-auto pt-3"
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {course.lessonCount} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              ₦{course.priceNGN.toLocaleString()}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              ~${course.priceUSD}
            </div>
          </div>
          <button
            className="px-4 py-2 rounded-[8px] text-xs font-semibold text-white transition-colors duration-150"
            style={{ backgroundColor: 'var(--color-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
            onClick={e => { e.stopPropagation(); onClick?.(course.id); }}
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
