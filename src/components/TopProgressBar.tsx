import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ultra-thin gold progress bar at the top of the screen.
 * Triggers on every route change — simulates NProgress without any dependency.
 */
const TopProgressBar = () => {
  const location = useLocation();
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Reset & start
    setWidth(0);
    setOpacity(1);

    const t1 = setTimeout(() => setWidth(40),  30);   // jump to 40% instantly
    const t2 = setTimeout(() => setWidth(75),  200);  // crawl to 75%
    const t3 = setTimeout(() => setWidth(100), 450);  // slam to 100%
    const t4 = setTimeout(() => setOpacity(0), 650);  // fade out
    const t5 = setTimeout(() => setWidth(0),   900);  // reset for next run

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5);
    };
  }, [location.pathname]);

  return (
    <div
      role="progressbar"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '2.5px',
        width: `${width}%`,
        opacity,
        background: 'linear-gradient(90deg, #C9A84C 0%, #F0DC8A 50%, #C9A84C 100%)',
        boxShadow: '0 0 10px rgba(201, 168, 76, 0.8), 0 0 4px rgba(201, 168, 76, 0.6)',
        transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
        zIndex: 99999,
        pointerEvents: 'none',
        borderRadius: '0 2px 2px 0',
      }}
    />
  );
};

export default TopProgressBar;
