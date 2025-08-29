'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Simple Line Chart Component
interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
  gradient?: boolean;
  animated?: boolean;
  className?: string;
  showGrid?: boolean;
  showDots?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  color = '#00ff88',
  gradient = true,
  animated = true,
  className,
  showGrid = true,
  showDots = true
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!animated) {
      setAnimationProgress(1);
      return;
    }

    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animated]);

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((maxValue - point.value) / range) * 80 + 10;
    return { x, y, value: point.value, label: point.label };
  });

  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  const animatedPoints = points.slice(0, Math.ceil(points.length * animationProgress));
  const animatedPathData = animatedPoints.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Grid Lines */}
        {showGrid && (
          <g className="opacity-20">
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-white"
              />
            ))}
            {[0, 25, 50, 75, 100].map(x => (
              <line
                key={x}
                x1={x}
                y1="0"
                x2={x}
                y2="100"
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-white"
              />
            ))}
          </g>
        )}

        {/* Gradient Definition */}
        {gradient && (
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}

        {/* Gradient Fill Area */}
        {gradient && animatedPoints.length > 1 && (
          <path
            d={`${animatedPathData} L ${animatedPoints[animatedPoints.length - 1]?.x || 0} 100 L 0 100 Z`}
            fill="url(#lineGradient)"
          />
        )}

        {/* Line Path */}
        <path
          d={animatedPathData}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* Data Points */}
        {showDots && animatedPoints.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="0.8"
              fill={color}
              className="drop-shadow-sm"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="0.3"
              fill="white"
              className="opacity-90"
            />
          </g>
        ))}
      </svg>

      {/* Value Labels */}
      <div className="absolute inset-0 pointer-events-none">
        {animatedPoints.map((point, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              opacity: animationProgress
            }}
          >
            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded mb-1 whitespace-nowrap">
              {point.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut Chart Component
interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
  centerContent?: React.ReactNode;
  animated?: boolean;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  strokeWidth = 20,
  centerContent,
  animated = true,
  className
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!animated) {
      setAnimationProgress(1);
      return;
    }

    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animated]);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentAngle = -90; // Start from top

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} className="transform rotate-0">
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Data Segments */}
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference * animationProgress} ${circumference}`;
          const strokeDashoffset = -((currentAngle + 90) / 360) * circumference;

          const segment = (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 hover:brightness-110"
              style={{
                filter: `drop-shadow(0 0 6px ${item.color}40)`
              }}
            />
          );

          currentAngle += (percentage / 100) * 360;
          return segment;
        })}
      </svg>

      {/* Center Content */}
      {centerContent && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">{centerContent}</div>
        </div>
      )}
    </div>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
  animated?: boolean;
  className?: string;
  showValues?: boolean;
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  animated = true,
  className,
  showValues = true,
  horizontal = false
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!animated) {
      setAnimationProgress(1);
      return;
    }

    const startTime = Date.now();
    const duration = 1200;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animated]);

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <div className={cn(
        'h-full flex gap-2',
        horizontal ? 'flex-col' : 'items-end'
      )}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100 * animationProgress;
          const color = item.color || '#00ff88';

          return (
            <div
              key={index}
              className={cn(
                'relative flex-1 group cursor-pointer',
                horizontal ? 'flex items-center' : 'flex flex-col justify-end'
              )}
            >
              {/* Bar */}
              <div
                className={cn(
                  'transition-all duration-300 hover:brightness-110 rounded',
                  horizontal ? 'h-8' : 'w-full'
                )}
                style={{
                  backgroundColor: color,
                  [horizontal ? 'width' : 'height']: `${percentage}%`,
                  boxShadow: `0 0 10px ${color}40`
                }}
              />

              {/* Value Label */}
              {showValues && (
                <div
                  className={cn(
                    'absolute text-xs font-medium text-white transition-opacity duration-300',
                    'group-hover:opacity-100',
                    horizontal ? 'right-2 top-1/2 transform -translate-y-1/2' : 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full'
                  )}
                  style={{ opacity: animationProgress }}
                >
                  {item.value}
                </div>
              )}

              {/* Label */}
              <div
                className={cn(
                  'text-xs text-gray-400 mt-2 text-center truncate',
                  horizontal && 'absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full mr-2'
                )}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Heat Map Component
interface HeatMapProps {
  data: Array<Array<{ value: number; label?: string }>>;
  colorScale?: [string, string];
  cellSize?: number;
  gap?: number;
  animated?: boolean;
  className?: string;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  colorScale = ['#1a1a2e', '#00ff88'],
  cellSize = 20,
  gap = 1,
  animated = true,
  className
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!animated) {
      setAnimationProgress(1);
      return;
    }

    const startTime = Date.now();
    const duration = 2000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animated]);

  const flatData = data.flat();
  const maxValue = Math.max(...flatData.map(d => d.value));
  const minValue = Math.min(...flatData.map(d => d.value));
  const range = maxValue - minValue || 1;

  const getColor = (value: number) => {
    const intensity = (value - minValue) / range;
    const r1 = parseInt(colorScale[0].slice(1, 3), 16);
    const g1 = parseInt(colorScale[0].slice(3, 5), 16);
    const b1 = parseInt(colorScale[0].slice(5, 7), 16);
    const r2 = parseInt(colorScale[1].slice(1, 3), 16);
    const g2 = parseInt(colorScale[1].slice(3, 5), 16);
    const b2 = parseInt(colorScale[1].slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * intensity);
    const g = Math.round(g1 + (g2 - g1) * intensity);
    const b = Math.round(b1 + (b2 - b1) * intensity);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className={cn('inline-block', className)}>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${data[0]?.length || 0}, ${cellSize}px)` }}>
        {data.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const delay = (rowIndex + colIndex) * 50;
            const cellProgress = Math.max(0, Math.min(1, (animationProgress * 1000 - delay) / 300));
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="relative group cursor-pointer transition-transform hover:scale-110"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: getColor(cell.value),
                  opacity: cellProgress,
                  transform: `scale(${cellProgress})`
                }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {cell.label || `${cell.value}`}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Metric Display Component
interface MetricDisplayProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
    period?: string;
  };
  prefix?: string;
  suffix?: string;
  animated?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  title,
  value,
  change,
  prefix = '',
  suffix = '',
  animated = true,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-neon-green';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'positive': return '↗';
      case 'negative': return '↘';
      default: return '→';
    }
  };

  return (
    <div className={cn('text-center', className)}>
      <h3 className="text-sm text-gray-400 mb-2">{title}</h3>
      <div className={cn('font-bold text-white mb-2', sizeClasses[size])}>
        {prefix}
        {animated && typeof value === 'number' ? (
          <span>{value.toLocaleString()}</span>
        ) : (
          value
        )}
        {suffix}
      </div>
      {change && (
        <div className={cn('text-sm flex items-center justify-center gap-1', getChangeColor(change.type))}>
          <span>{getChangeIcon(change.type)}</span>
          <span>{change.value > 0 ? '+' : ''}{change.value}%</span>
          {change.period && <span className="text-gray-500">vs {change.period}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricDisplay;
