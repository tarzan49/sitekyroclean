import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number;
  color: string;
  rotation: number;
  rotV: number;
  w: number; h: number;
}

const GOLD_COLORS = ['#D4AF37', '#F0DC8A', '#C9A84C', '#fff7d6', '#f5e27a', '#e8d06a'];

const ConfettiGold = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Particle[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      alpha: 1,
      color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.25,
      w: 7 + Math.random() * 9,
      h: 3 + Math.random() * 5,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let hasAlive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.rotation += p.rotV;
        p.alpha = p.y < canvas.height
          ? Math.max(0, 1 - (p.y / canvas.height) * 0.5)
          : 0;
        if (p.alpha > 0) hasAlive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (hasAlive) animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      style={{ borderRadius: 'inherit' }}
    />
  );
};

export default ConfettiGold;
