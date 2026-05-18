import { useState, useRef, useEffect, memo } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill";
  objectPosition?: string;
  /** Mobile-specific smaller image source */
  mobileSrc?: string;
  /** Width for srcset generation */
  width?: number;
  /** Height for srcset generation */
  height?: number;
}

/**
 * Optimized image component with:
 * - Lazy loading for non-priority images
 * - Blur placeholder while loading
 * - Proper loading priority for LCP images
 * - Mobile-optimized image sources
 * - Explicit dimensions to prevent CLS
 */
const OptimizedImage = memo(({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  aspectRatio,
  objectFit = "cover",
  objectPosition = "center",
  mobileSrc,
  width,
  height,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState(src);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mobile source selection on mount and resize
  useEffect(() => {
    if (!mobileSrc) {
      setCurrentSrc(src);
      return;
    }

    const updateSource = () => {
      const isMobile = window.innerWidth < 768;
      setCurrentSrc(isMobile ? mobileSrc : src);
    };

    updateSource();
    
    // Debounced resize handler
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateSource, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [src, mobileSrc]);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    // Use native lazy loading support detection
    if ('loading' in HTMLImageElement.prototype) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Reduced from 200px for faster initial paint
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Preload priority images
  useEffect(() => {
    if (priority && currentSrc) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = currentSrc;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
      
      return () => {
        if (link.parentNode) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, currentSrc]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        aspectRatio,
        contain: 'layout style paint',
      }}
    >
      {/* Minimal placeholder - just background color */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-secondary/20" 
          aria-hidden="true"
        />
      )}
      
      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            objectFit,
            objectPosition,
          }}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
