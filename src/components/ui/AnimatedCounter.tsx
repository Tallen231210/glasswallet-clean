'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  style?: React.CSSProperties;
}

export function AnimatedCounter({ 
  value, 
  duration = 1500, 
  className = '', 
  suffix = '',
  prefix = '',
  style = {}
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  
  // Extract numeric value if it's a string with suffix (like "89%")
  const numericValue = typeof value === 'string' 
    ? parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
    : value;

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(numericValue * easeOutQuart));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(numericValue);
      }
    };

    // Start animation after a small delay
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [numericValue, duration]);

  // Handle string values that aren't purely numeric
  const displayValue = typeof value === 'string' && value.includes('%')
    ? `${count}%`
    : typeof value === 'string' && value.includes('$')
    ? `$${count.toLocaleString()}`
    : typeof value === 'string' && isNaN(parseInt(value))
    ? value // Return original string if it's not numeric
    : `${prefix}${count.toLocaleString()}${suffix}`;

  return (
    <span className={className} style={style}>
      {displayValue}
    </span>
  );
}