import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/backend';
import { Course } from '../types';
import CourseCard, { CourseCardData } from '../components/ui/CourseCard';
import { Search, SlidersHorizontal, X, Loader2, BookOpen } from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Forex', 'Crypto', 'DeFi', 'Digital Skills', 'Investing'];
const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];
const PRICE_RANGES = [
  { label: 'Any price',     min: 0,     max: Infinity },
  { label: 'Under ₦10k',   min: 0,     max: 10000   },
  { label: '₦10k – ₦20k', min: 10000, max: 20000   },
  { label: 'Above ₦20k',  min: 20000, max: Infinity },
];

// Map Supabase Course → CourseCardData (the design system card interface)
function toCardData(c: Course): CourseCardData {
  const priceNGN = Math.round((c.price || 15) * 1600);
  const priceUSD = c.price || 15;
  return {
    id:            c.id,
    title:         c.title,
    category:      c.category || 'General',
    lessonCount:   Math.min(60, Math.max(8, Math.round(priceUSD / 5))),
    duration:      c.duration || '4h 30m',
    priceNGN,
    priceUSD,
    level:         (['Beginner', 'Intermediate', 'Advanced'].includes(c.level)
                    ? c.level as 'Beginner' | 'Intermediate' | 'Advanced'
                    : 'Beginner'),
    enrolled:      Math.min(50000, Math.max(120, Math.round(priceUSD * 4.5))),
    thumbnailColor: undefined,
  };
}

// ── Active filter chip ─────────────────────────────────────────────────────────

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
    style={{ backgroundColor: 'rgba(47,109,242,0.15)', color: 'var(--color-accent-hover)', border: '1px solid rgba(47,109,242,0.3)' }}
  >
    {label}
    <button
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="hover:opacity-70 transition-opacity"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

// ── Sidebar filter panel ───────────────────────────────────────────────────────

interface FilterPanelProps {
  category:     string;
  level:        string;
  priceIdx:     number;
  searchQuery:  string;
  onCategory:   (c: string) => void;
  onLevel:      (l: string) => void;
  onPrice:      (i: number) => void;
  onSearch:     (q: string) => void;
  onReset:      () => void;
  resultCount:  number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  category, level, priceIdx, searchQuery,
  onCategory, onLevel, onPrice, onSearch, onReset, resultCount,
}) => (
  <aside
    className="flex flex-col gap-6"
    aria-label="Course filters"
  >
    {/* Search */}
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
        aria-hidden="true"
      />
      <input
        type="search"
        value={searchQuery}
        onChange={e => onSearch(e.target.value)}
        placeholder="Search courses…"
        className="w-full pl-9 pr-4 py-2.5 rounded-[10px] text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(47,109,242,0.6)')}
        onBlur={e  => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      />
    </div>

    {/* Result count */}
    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
      {resultCount} course{resultCount !== 1 ? 's' : ''} found
    </p>

    {/* Category */}
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Category
      </h3>
      <ul className="flex flex-col gap-1">
        {CATEGORIES.map(cat => (
          <li key={cat}>
            <button
              onClick={() => onCategory(cat)}
              className="w-full text-left px-3 py-2 rounded-[8px] text-sm transition-colors duration-150"
              style={{
                backgroundColor: category === cat ? 'rgba(47,109,242,0.12)' : 'transparent',
                color: category === cat ? 'var(--color-accent-hover)' : 'var(--color-text-muted)',
                fontWeight: category === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </div>

    {/* Level */}
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Level
      </h3>
      <ul className="flex flex-col gap-1">
        {LEVELS.map(lv => (
          <li key={lv}>
            <button
              onClick={() => onLevel(lv)}
              className="w-full text-left px-3 py-2 rounded-[8px] text-sm transition-colors duration-150"
              style={{
                backgroundColor: level === lv ? 'rgba(47,109,242,0.12)' : 'transparent',
                color: level === lv ? 'var(--color-accent-hover)' : 'var(--color-text-muted)',
                fontWeight: level === lv ? 600 : 400,
              }}
            >
              {lv}
            </button>
          </li>
        ))}
      </ul>
    </div>

    {/* Price */}
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Price range
      </h3>
      <ul className="flex flex-col gap-1">
        {PRICE_RANGES.map((pr, i) => (
          <li key={pr.label}>
            <button
              onClick={() => onPrice(i)}
              className="w-full text-left px-3 py-2 rounded-[8px] text-sm transition-colors duration-150"
              style={{
                backgroundColor: priceIdx === i ? 'rgba(47,109,242,0.12)' : 'transparent',
                color: priceIdx === i ? 'var(--color-accent-hover)' : 'var(--color-text-muted)',
                fontWeight: priceIdx === i ? 600 : 400,
              }}
            >
              {pr.label}
            </button>
          </li>
        ))}
      </ul>
    </div>

    {/* Reset */}
    <button
      onClick={onReset}
      className="text-xs text-left transition-colors duration-150 hover:opacity-80"
      style={{ color: 'var(--color-text-muted)' }}
    >
      Reset all filters
    </button>
  </aside>
);

// ── Main component ─────────────────────────────────────────────────────────────

const CourseList: React.FC = () => {
  const navigate = useNavigate();
  const [courses,     setCourses]     = useState<Course[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category,    setCategory]    = useState('All');
  const [level,       setLevel]       = useState('All levels');
  const [priceIdx,    setPriceIdx]    = useState(0);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    api.getCourses().then(data => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const reset = () => {
    setCategory('All');
    setLevel('All levels');
    setPriceIdx(0);
    setSearchQuery('');
  };

  const priceRange = PRICE_RANGES[priceIdx];

  const filtered = useMemo<CourseCardData[]>(() => {
    return courses
      .map(toCardData)
      .filter(c => {
        const matchCat   = category === 'All' || c.category === category;
        const matchLevel = level    === 'All levels' || c.level === level;
        const matchPrice = c.priceNGN >= priceRange.min && c.priceNGN < priceRange.max;
        const matchQ     = searchQuery === '' ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchLevel && matchPrice && matchQ;
      });
  }, [courses, category, level, priceIdx, searchQuery]);

  // Active filter chips
  const chips: { label: string; clear: () => void }[] = [];
  if (category !== 'All')         chips.push({ label: category,          clear: () => setCategory('All') });
  if (level    !== 'All levels')  chips.push({ label: level,             clear: () => setLevel('All levels') });
  if (priceIdx !== 0)             chips.push({ label: priceRange.label,  clear: () => setPriceIdx(0) });
  if (searchQuery !== '')         chips.push({ label: `"${searchQuery}"`, clear: () => setSearchQuery('') });

  const filterProps = {
    category, level, priceIdx, searchQuery,
    onCategory: setCategory,
    onLevel:    setLevel,
    onPrice:    setPriceIdx,
    onSearch:   setSearchQuery,
    onReset:    reset,
    resultCount: filtered.length,
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-12 border-b"
        style={{ backgroundColor: 'var(--color-bg-deep)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-[1200px] mx-auto">
          <p className="eyebrow mb-3">Browse</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2" style={{ color: 'var(--color-text-primary)' }}>
            All courses
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Master forex, crypto, DeFi, and digital income skills — built for Africans.
          </p>
        </div>
      </div>

      {/* ── Layout ───────────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-6 flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 flex-1">
            {chips.map(ch => <Chip key={ch.label} label={ch.label} onRemove={ch.clear} />)}
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium shrink-0"
            style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {chips.length > 0 && `(${chips.length})`}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-52 shrink-0 sticky top-6 self-start max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
            <FilterPanel {...filterProps} />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Active chips — desktop */}
            {chips.length > 0 && (
              <div className="hidden lg:flex flex-wrap gap-2 mb-6">
                {chips.map(ch => <Chip key={ch.label} label={ch.label} onRemove={ch.clear} />)}
              </div>
            )}

            {loading ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--color-accent)' }} />
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                  Loading courses…
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-4 text-center">
                <div
                  className="w-14 h-14 rounded-[14px] flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(47,109,242,0.1)' }}
                >
                  <BookOpen className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
                </div>
                <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>No courses match your filters</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Try adjusting or clearing your filters.</p>
                <button
                  onClick={reset}
                  className="mt-2 text-sm font-medium transition-opacity hover:opacity-75"
                  style={{ color: 'var(--color-accent-hover)' }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <motion.div
                key={`${category}-${level}-${priceIdx}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {filtered.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onClick={id => navigate(`/courses/${id}`)}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter bottom sheet ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ backgroundColor: 'var(--color-overlay)' }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-[24px] p-6 pb-10 max-h-[80vh] overflow-y-auto custom-scrollbar"
              style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Filters</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close filters"
                  className="p-1 rounded-full transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterPanel {...filterProps} />
              <button
                onClick={() => setMobileOpen(false)}
                className="mt-6 w-full py-3 rounded-[12px] text-sm font-semibold text-white transition-colors duration-150"
                style={{ backgroundColor: 'var(--color-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
              >
                Show {filtered.length} results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseList;
