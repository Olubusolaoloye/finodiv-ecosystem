import React, { useEffect, useRef } from 'react';

interface AmbientGridProps {
  className?: string;
  /** Grid cell size in px. Default: 48 */
  cellSize?: number;
  /** Drift speed in seconds. Default: 24 */
  speed?: number;
}

/**
 * Slow-drifting dot grid using #2F6DF2 at ~7% opacity.
 * Renders on a <canvas> for zero DOM overhead.
 * Respects prefers-reduced-motion.
 */
const AmbientGrid: React.FC<AmbientGridProps> = ({
  className = '',
  cellSize = 48,
  speed = 24,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let startTime: number | null = null;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000; // seconds

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Drift offset: cycle over `speed` seconds
      const offset = prefersReduced ? 0 : (elapsed % speed) / speed;
      const dx = offset * cellSize;
      const dy = offset * cellSize;

      // Start one cell outside canvas so dots slide in smoothly
      const startX = -(cellSize - (dx % cellSize));
      const startY = -(cellSize - (dy % cellSize));

      ctx.fillStyle = 'rgba(47, 109, 242, 0.07)';

      for (let x = startX; x < w + cellSize; x += cellSize) {
        for (let y = startY; y < h + cellSize; y += cellSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!prefersReduced) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [cellSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};

export default AmbientGrid;
