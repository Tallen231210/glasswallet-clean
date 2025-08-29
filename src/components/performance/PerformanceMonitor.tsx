'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  memoryUsage?: number;
}

export const PerformanceMonitor = ({ enabled = false }: { enabled?: boolean }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const collectMetrics = () => {
      const performanceEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetrics = {
        renderTime: Date.now() - performance.timeOrigin,
        domContentLoaded: performanceEntries.domContentLoadedEventEnd - performanceEntries.domContentLoadedEventStart,
      };

      // Get paint metrics
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });

      // Get memory usage if available
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        metrics.memoryUsage = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024); // MB
      }

      setMetrics(metrics);
    };

    // Collect initial metrics
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    // Set up Web Vitals observer if available
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lastEntry.startTime } : null);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        entryList.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        setMetrics(prev => prev ? { ...prev, cumulativeLayoutShift: clsValue } : null);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          setMetrics(prev => prev ? { 
            ...prev, 
            firstInputDelay: (entry as any).processingStart - entry.startTime 
          } : null);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        fidObserver.disconnect();
      };
    }

    return () => {
      window.removeEventListener('load', collectMetrics);
    };
  }, [enabled]);

  if (!enabled || !metrics) return null;

  return (
    <>
      {/* Performance Toggle Button */}
      <button
        onClick={() => setShowMetrics(!showMetrics)}
        className="fixed bottom-4 right-4 bg-neon-green text-black px-3 py-2 rounded-lg text-xs font-semibold z-50 hover:bg-neon-green/80 transition-colors"
        title="Toggle Performance Metrics"
      >
        📊 Perf
      </button>

      {/* Performance Metrics Panel */}
      {showMetrics && (
        <div className="fixed bottom-16 right-4 bg-gray-900 border border-white/20 rounded-lg p-4 text-xs text-white z-50 max-w-xs">
          <h3 className="font-semibold mb-3 text-neon-green">Performance Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Render Time:</span>
              <span className={metrics.renderTime > 3000 ? 'text-red-400' : metrics.renderTime > 1000 ? 'text-yellow-400' : 'text-green-400'}>
                {metrics.renderTime.toFixed(0)}ms
              </span>
            </div>
            
            {metrics.firstContentfulPaint && (
              <div className="flex justify-between">
                <span>FCP:</span>
                <span className={metrics.firstContentfulPaint > 3000 ? 'text-red-400' : metrics.firstContentfulPaint > 1800 ? 'text-yellow-400' : 'text-green-400'}>
                  {metrics.firstContentfulPaint.toFixed(0)}ms
                </span>
              </div>
            )}
            
            {metrics.largestContentfulPaint && (
              <div className="flex justify-between">
                <span>LCP:</span>
                <span className={metrics.largestContentfulPaint > 4000 ? 'text-red-400' : metrics.largestContentfulPaint > 2500 ? 'text-yellow-400' : 'text-green-400'}>
                  {metrics.largestContentfulPaint.toFixed(0)}ms
                </span>
              </div>
            )}
            
            {metrics.cumulativeLayoutShift !== undefined && (
              <div className="flex justify-between">
                <span>CLS:</span>
                <span className={metrics.cumulativeLayoutShift > 0.25 ? 'text-red-400' : metrics.cumulativeLayoutShift > 0.1 ? 'text-yellow-400' : 'text-green-400'}>
                  {metrics.cumulativeLayoutShift.toFixed(3)}
                </span>
              </div>
            )}
            
            {metrics.firstInputDelay !== undefined && (
              <div className="flex justify-between">
                <span>FID:</span>
                <span className={metrics.firstInputDelay > 300 ? 'text-red-400' : metrics.firstInputDelay > 100 ? 'text-yellow-400' : 'text-green-400'}>
                  {metrics.firstInputDelay.toFixed(0)}ms
                </span>
              </div>
            )}
            
            {metrics.memoryUsage && (
              <div className="flex justify-between">
                <span>Memory:</span>
                <span className={metrics.memoryUsage > 100 ? 'text-red-400' : metrics.memoryUsage > 50 ? 'text-yellow-400' : 'text-green-400'}>
                  {metrics.memoryUsage}MB
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="text-gray-400">
              Green: Good, Yellow: Needs improvement, Red: Poor
            </div>
          </div>
        </div>
      )}
    </>
  );
};