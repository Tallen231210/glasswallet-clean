/**
 * Performance Monitoring and Metrics Collection
 * 
 * This module provides comprehensive monitoring capabilities including:
 * - API response time tracking
 * - Error rate monitoring  
 * - Resource utilization metrics
 * - Business metrics tracking
 * - Real-time alerts
 */

interface MetricData {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

interface Alert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggered: boolean;
  lastTriggered?: number;
  count: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, MetricData[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private maxMetricAge = 24 * 60 * 60 * 1000; // 24 hours
  private maxMetricsPerType = 1000;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    // Set up default alerts
    this.setupDefaultAlerts();
    
    // Clean up old metrics every hour
    setInterval(() => this.cleanupOldMetrics(), 60 * 60 * 1000);
  }

  // Record a metric
  recordMetric(name: string, value: number, labels?: Record<string, string>) {
    const metricData: MetricData = {
      timestamp: Date.now(),
      value,
      labels,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metricData);

    // Keep only the most recent metrics
    if (metrics.length > this.maxMetricsPerType) {
      metrics.splice(0, metrics.length - this.maxMetricsPerType);
    }

    // Check alerts
    this.checkAlerts(name, value);
  }

  // Record API response time
  recordApiResponse(endpoint: string, method: string, statusCode: number, responseTime: number) {
    const labels = { endpoint, method, status: statusCode.toString() };
    
    this.recordMetric('http_request_duration', responseTime, labels);
    this.recordMetric('http_requests_total', 1, labels);
    
    if (statusCode >= 400) {
      this.recordMetric('http_errors_total', 1, labels);
    }
  }

  // Record business metrics
  recordBusinessMetric(type: 'lead_created' | 'credit_pull' | 'pixel_sync' | 'user_signup', value: number = 1, labels?: Record<string, string>) {
    this.recordMetric(`business_${type}`, value, labels);
  }

  // Record system metrics
  recordSystemMetrics() {
    if (typeof process !== 'undefined') {
      const memUsage = process.memoryUsage();
      
      this.recordMetric('nodejs_heap_size_used_bytes', memUsage.heapUsed);
      this.recordMetric('nodejs_heap_size_total_bytes', memUsage.heapTotal);
      this.recordMetric('nodejs_external_memory_bytes', memUsage.external);
      this.recordMetric('nodejs_process_resident_memory_bytes', memUsage.rss);
      
      // CPU usage (approximation)
      const usage = process.cpuUsage();
      this.recordMetric('nodejs_process_cpu_user_seconds_total', usage.user / 1000000);
      this.recordMetric('nodejs_process_cpu_system_seconds_total', usage.system / 1000000);
    }
  }

  // Get metrics for a specific type
  getMetrics(name: string, timeRange?: { start: number; end: number }): MetricData[] {
    const metrics = this.metrics.get(name) || [];
    
    if (!timeRange) {
      return [...metrics];
    }
    
    return metrics.filter(m => 
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  // Get aggregated metrics
  getAggregatedMetrics(name: string, timeRange?: { start: number; end: number }) {
    const metrics = this.getMetrics(name, timeRange);
    
    if (metrics.length === 0) {
      return {
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        p95: 0,
        p99: 0,
      };
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      count: values.length,
      sum,
      avg: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    };
  }

  // Get metrics by labels
  getMetricsByLabel(name: string, labelKey: string, labelValue: string): MetricData[] {
    const metrics = this.getMetrics(name);
    return metrics.filter(m => m.labels?.[labelKey] === labelValue);
  }

  // Setup default monitoring alerts
  private setupDefaultAlerts() {
    const defaultAlerts: Omit<Alert, 'triggered' | 'count' | 'lastTriggered'>[] = [
      {
        id: 'high_response_time',
        name: 'High API Response Time',
        condition: 'avg(http_request_duration) > threshold',
        threshold: 2000, // 2 seconds
        severity: 'medium',
      },
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: 'rate(http_errors_total) / rate(http_requests_total) > threshold',
        threshold: 0.05, // 5%
        severity: 'high',
      },
      {
        id: 'high_memory_usage',
        name: 'High Memory Usage',
        condition: 'nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes > threshold',
        threshold: 0.9, // 90%
        severity: 'critical',
      },
      {
        id: 'low_lead_creation_rate',
        name: 'Low Lead Creation Rate',
        condition: 'rate(business_lead_created) < threshold',
        threshold: 0.1, // Less than 1 lead per 10 minutes
        severity: 'low',
      },
    ];

    defaultAlerts.forEach(alert => {
      this.alerts.set(alert.id, {
        ...alert,
        triggered: false,
        count: 0,
      });
    });
  }

  // Check alerts against current metrics
  private checkAlerts(metricName: string, currentValue: number) {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    this.alerts.forEach((alert, alertId) => {
      let shouldTrigger = false;

      switch (alertId) {
        case 'high_response_time':
          if (metricName === 'http_request_duration') {
            const recentMetrics = this.getMetrics(metricName, { start: fiveMinutesAgo, end: now });
            if (recentMetrics.length > 0) {
              const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
              shouldTrigger = avgResponseTime > alert.threshold;
            }
          }
          break;

        case 'high_error_rate':
          if (metricName === 'http_errors_total') {
            const errorMetrics = this.getMetrics('http_errors_total', { start: fiveMinutesAgo, end: now });
            const totalMetrics = this.getMetrics('http_requests_total', { start: fiveMinutesAgo, end: now });
            
            if (totalMetrics.length > 0) {
              const errorRate = errorMetrics.length / totalMetrics.length;
              shouldTrigger = errorRate > alert.threshold;
            }
          }
          break;

        case 'high_memory_usage':
          if (metricName === 'nodejs_heap_size_used_bytes') {
            const totalMemoryMetrics = this.getMetrics('nodejs_heap_size_total_bytes');
            if (totalMemoryMetrics.length > 0) {
              const latestTotal = totalMemoryMetrics[totalMemoryMetrics.length - 1].value;
              const memoryUsageRatio = currentValue / latestTotal;
              shouldTrigger = memoryUsageRatio > alert.threshold;
            }
          }
          break;

        case 'low_lead_creation_rate':
          if (metricName === 'business_lead_created') {
            const leadMetrics = this.getMetrics(metricName, { start: fiveMinutesAgo, end: now });
            const leadRate = leadMetrics.length / 5; // leads per minute
            shouldTrigger = leadRate < alert.threshold;
          }
          break;
      }

      if (shouldTrigger && !alert.triggered) {
        alert.triggered = true;
        alert.lastTriggered = now;
        alert.count++;
        this.triggerAlert(alert);
      } else if (!shouldTrigger && alert.triggered) {
        alert.triggered = false;
      }
    });
  }

  // Trigger an alert
  private triggerAlert(alert: Alert) {
    const alertData = {
      id: alert.id,
      name: alert.name,
      severity: alert.severity,
      message: `Alert: ${alert.name} - ${alert.condition}`,
      timestamp: Date.now(),
      count: alert.count,
    };

    // Log the alert
    console.warn('🚨 ALERT TRIGGERED:', alertData);

    // In production, you would send this to your monitoring service
    // Examples: Datadog, New Relic, Sentry, PagerDuty, etc.
    
    if (typeof window !== 'undefined') {
      // Browser environment - could send to analytics
      console.warn('Browser alert:', alertData);
    }
  }

  // Get current alert status
  getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.triggered);
  }

  // Add custom alert
  addAlert(alert: Omit<Alert, 'triggered' | 'count'>) {
    this.alerts.set(alert.id, {
      ...alert,
      triggered: false,
      count: 0,
    });
  }

  // Remove alert
  removeAlert(alertId: string) {
    this.alerts.delete(alertId);
  }

  // Clean up old metrics
  private cleanupOldMetrics() {
    const cutoffTime = Date.now() - this.maxMetricAge;
    
    this.metrics.forEach((metrics, name) => {
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoffTime);
      this.metrics.set(name, filteredMetrics);
    });
  }

  // Export metrics in Prometheus format
  exportPrometheusMetrics(): string {
    const lines: string[] = [];
    
    this.metrics.forEach((metrics, name) => {
      if (metrics.length === 0) return;
      
      const latest = metrics[metrics.length - 1];
      const metricName = name.replace(/-/g, '_');
      
      // Add metric help and type
      lines.push(`# HELP ${metricName} ${name} metric`);
      lines.push(`# TYPE ${metricName} gauge`);
      
      if (latest.labels) {
        const labelStr = Object.entries(latest.labels)
          .map(([key, value]) => `${key}="${value}"`)
          .join(',');
        lines.push(`${metricName}{${labelStr}} ${latest.value}`);
      } else {
        lines.push(`${metricName} ${latest.value}`);
      }
    });
    
    return lines.join('\n');
  }

  // Get dashboard data
  getDashboardData(timeRange?: { start: number; end: number }) {
    const now = Date.now();
    const range = timeRange || { 
      start: now - (60 * 60 * 1000), // Last hour
      end: now 
    };

    return {
      responseTime: this.getAggregatedMetrics('http_request_duration', range),
      requestRate: this.getAggregatedMetrics('http_requests_total', range),
      errorRate: this.getAggregatedMetrics('http_errors_total', range),
      memoryUsage: this.getAggregatedMetrics('nodejs_heap_size_used_bytes', range),
      businessMetrics: {
        leads: this.getAggregatedMetrics('business_lead_created', range),
        creditPulls: this.getAggregatedMetrics('business_credit_pull', range),
        pixelSyncs: this.getAggregatedMetrics('business_pixel_sync', range),
      },
      alerts: this.getActiveAlerts(),
    };
  }
}

// Middleware to automatically track API performance
export function withPerformanceMonitoring(
  handler: Function,
  options: { name?: string } = {}
) {
  return async (req: any, ...args: any[]) => {
    const startTime = Date.now();
    const monitor = PerformanceMonitor.getInstance();
    
    try {
      const response = await handler(req, ...args);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Extract endpoint info
      const endpoint = options.name || req.nextUrl?.pathname || 'unknown';
      const method = req.method || 'GET';
      const statusCode = response.status || 200;
      
      // Record metrics
      monitor.recordApiResponse(endpoint, method, statusCode, responseTime);
      
      return response;
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Record error
      const endpoint = options.name || req.nextUrl?.pathname || 'unknown';
      const method = req.method || 'GET';
      monitor.recordApiResponse(endpoint, method, 500, responseTime);
      
      throw error;
    }
  };
}

// System metrics collection interval
let systemMetricsInterval: NodeJS.Timeout | null = null;

export function startSystemMetricsCollection(intervalMs: number = 30000) {
  if (systemMetricsInterval) {
    clearInterval(systemMetricsInterval);
  }
  
  const monitor = PerformanceMonitor.getInstance();
  
  systemMetricsInterval = setInterval(() => {
    monitor.recordSystemMetrics();
  }, intervalMs);
}

export function stopSystemMetricsCollection() {
  if (systemMetricsInterval) {
    clearInterval(systemMetricsInterval);
    systemMetricsInterval = null;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Start system metrics collection by default in server environment
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  startSystemMetricsCollection();
}