import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CourseCard, { CourseCardData } from './CourseCard';

const COURSES: CourseCardData[] = [
  {
    id: 'forex-beginners',
    title: 'Forex for Beginners: The Naija Starter Guide',
    category: 'Forex',
    lessonCount: 24,
    duration: '6h 40m',
    priceNGN: 15000,
    priceUSD: 9,
    level: 'Beginner',
    enrolled: 4820,
    thumbnailColor: 'linear-gradient(135deg, #0c1a36 0%, #1a2f5a 50%, #0A1929 100%)',
  },
  {
    id: 'dollar-proof',
    title: 'Dollar-Proof Your Money: USDT and Crypto Savings',
    category: 'Crypto',
    lessonCount: 18,
    duration: '4h 55m',
    priceNGN: 12000,
    priceUSD: 7,
    level: 'Beginner',
    enrolled: 3210,
    thumbnailColor: 'linear-gradient(135deg, #0e1535 0%, #1e1050 50%, #0A1929 100%)',
  },
  {
    id: 'defi-scratch',
    title: 'DeFi from Scratch',
    category: 'DeFi',
    lessonCount: 30,
    duration: '9h 20m',
    priceNGN: 22000,
    priceUSD: 14,
    level: 'Intermediate',
    enrolled: 1980,
    thumbnailColor: 'linear-gradient(135deg, #0d1f3c 0%, #0f2a4a 50%, #0A1929 100%)',
  },
  {
    id: 'paid-in-dollars',
    title: 'How to Get Paid in Dollars as a Freelancer',
    category: 'Digital Skills',
    lessonCount: 16,
    duration: '3h 30m',
    priceNGN: 9500,
    priceUSD: 6,
    level: 'Beginner',
    enrolled: 6540,
    thumbnailColor: 'linear-gradient(135deg, #0a1c2e 0%, #0d2640 50%, #0A1929 100%)',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

interface FeaturedCoursesProps {
  onCourseClick?: (id: string) => void;
  onViewAll?: () => void;
}

const FeaturedCourses: React.FC<FeaturedCoursesProps> = ({ onCourseClick, onViewAll }) => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24 px-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-6xl mx-auto">

        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="eyebrow mb-3">What we teach</p>
            <h2
              className="text-3xl sm:text-4xl font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Featured Courses
            </h2>
          </div>
          <button
            onClick={onViewAll}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150"
            style={{ color: 'var(--color-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
          >
            View all courses
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Desktop grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {COURSES.map(course => (
            <motion.div key={course.id} variants={cardVariants}>
              <CourseCard course={course} onClick={onCourseClick} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile horizontal scroll */}
        <div
          className="sm:hidden flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 custom-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {COURSES.map(course => (
            <div key={course.id} className="flex-none w-72" style={{ scrollSnapAlign: 'start' }}>
              <CourseCard course={course} onClick={onCourseClick} />
            </div>
          ))}
        </div>

        <div className="sm:hidden mt-8 text-center">
          <button
            onClick={onViewAll}
            className="px-6 py-3 rounded-[10px] text-sm font-semibold transition-colors duration-150"
            style={{ border: '1.5px solid var(--color-accent)', color: 'var(--color-accent)' }}
          >
            View all courses
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
