import React, { useState, useEffect, useRef } from 'react';

export const Ripple: React.FC<{ color?: string }> = ({ color }) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const parent = container.parentElement;
    if (!parent) return;

    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.position === 'static') {
        parent.style.position = 'relative';
    }
    if (parentStyle.overflow !== 'hidden') {
        parent.style.overflow = 'hidden';
    }

    const handleMouseDown = (e: MouseEvent) => {
      if ((parent as HTMLButtonElement).disabled) return;

      const rect = parent.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple = { x, y, size, id: Date.now() };
      setRipples((prev) => [...prev, newRipple]);
    };

    parent.addEventListener('mousedown', handleMouseDown);

    return () => {
      parent.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    if (ripples.length > 0) {
      const timeout = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [ripples]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-[1] rounded-[inherit]">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="animate-ripple absolute rounded-full opacity-20"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color || 'currentColor',
            transform: 'scale(0)',
          }}
        />
      ))}
    </div>
  );
};