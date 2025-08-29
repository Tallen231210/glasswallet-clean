#!/usr/bin/env node

/**
 * Scaling Configuration Generator for GlassWallet
 * 
 * Generates configuration files for various deployment platforms
 * and provides scaling recommendations based on load testing results.
 */

const fs = require('fs').promises;
const path = require('path');

class ScalingConfigurator {
  constructor() {
    this.loadTestResults = null;
  }

  // Generate Vercel configuration
  generateVercelConfig() {
    const vercelConfig = {
      version: 2,
      name: "glasswallet",
      framework: "nextjs",
      buildCommand: "npm run build",
      installCommand: "npm install",
      
      // Environment variables
      env: {
        NODE_ENV: "production",
        NEXTAUTH_URL: "@nextauth_url",
        ENCRYPTION_KEY: "@encryption_key",
        CRS_API_KEY: "@crs_api_key",
        STRIPE_SECRET_KEY: "@stripe_secret_key",
      },

      // Build environment
      build: {
        env: {
          NODE_ENV: "production"
        }
      },

      // Function configuration for scaling
      functions: {
        "src/app/api/**/*.ts": {
          maxDuration: 30,
          memory: 1024,
          runtime: "nodejs18.x"
        },
        "src/app/api/leads/[id]/credit-pull/route.ts": {
          maxDuration: 45,
          memory: 1024,
          runtime: "nodejs18.x"
        },
        "src/app/api/pixels/batch-sync/route.ts": {
          maxDuration: 300,
          memory: 3008,
          runtime: "nodejs18.x"
        }
      },

      // Headers for security and performance
      headers: [
        {
          source: "/api/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store, must-revalidate"
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff"
            },
            {
              key: "X-Frame-Options",
              value: "DENY"
            }
          ]
        },
        {
          source: "/(.*)",
          headers: [
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains; preload"
            }
          ]
        }
      ],

      // Redirects and rewrites
      rewrites: [
        {
          source: "/health",
          destination: "/api/health"
        }
      ],

      // Regions for global deployment
      regions: ["iad1", "sfo1", "lhr1"],

      // Output directory
      outputDirectory: ".next"
    };

    return JSON.stringify(vercelConfig, null, 2);
  }

  // Generate Docker configuration for self-hosting
  generateDockerConfig() {
    const dockerfile = `
# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
`;

    const dockerCompose = `
version: '3.8'

services:
  glasswallet-app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/glasswallet
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: glasswallet
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/schema.prisma:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - glasswallet-app
    restart: unless-stopped

volumes:
  postgres_data:
`;

    return { dockerfile, dockerCompose };
  }

  // Generate Kubernetes configuration
  generateKubernetesConfig() {
    const k8sManifest = `
apiVersion: v1
kind: Namespace
metadata:
  name: glasswallet
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: glasswallet-app
  namespace: glasswallet
spec:
  replicas: 3
  selector:
    matchLabels:
      app: glasswallet-app
  template:
    metadata:
      labels:
        app: glasswallet-app
    spec:
      containers:
      - name: glasswallet
        image: glasswallet:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: glasswallet-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: glasswallet-service
  namespace: glasswallet
spec:
  selector:
    app: glasswallet-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: glasswallet-hpa
  namespace: glasswallet
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: glasswallet-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
`;

    return k8sManifest;
  }

  // Generate performance monitoring configuration
  generateMonitoringConfig() {
    const grafanaDashboard = {
      dashboard: {
        id: null,
        title: "GlassWallet Performance Dashboard",
        tags: ["glasswallet", "nextjs", "performance"],
        timezone: "browser",
        panels: [
          {
            id: 1,
            title: "Response Time",
            type: "stat",
            targets: [
              {
                expr: "avg(http_request_duration_seconds_sum / http_request_duration_seconds_count)",
                legendFormat: "Average Response Time"
              }
            ]
          },
          {
            id: 2,
            title: "Request Rate",
            type: "stat",
            targets: [
              {
                expr: "sum(rate(http_requests_total[5m]))",
                legendFormat: "Requests per Second"
              }
            ]
          },
          {
            id: 3,
            title: "Error Rate",
            type: "stat",
            targets: [
              {
                expr: "sum(rate(http_requests_total{status=~\"4..|5..\"}[5m])) / sum(rate(http_requests_total[5m]))",
                legendFormat: "Error Rate %"
              }
            ]
          },
          {
            id: 4,
            title: "Memory Usage",
            type: "graph",
            targets: [
              {
                expr: "nodejs_heap_size_used_bytes",
                legendFormat: "Heap Used"
              }
            ]
          }
        ],
        time: {
          from: "now-1h",
          to: "now"
        },
        refresh: "5s"
      }
    };

    const alertRules = `
groups:
  - name: glasswallet-alerts
    rules:
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"4..|5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for the last 5 minutes"
      
      - alert: HighResponseTime
        expr: avg(http_request_duration_seconds_sum / http_request_duration_seconds_count) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "Average response time is {{ $value }}s for the last 5 minutes"
      
      - alert: HighMemoryUsage
        expr: nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
`;

    return { grafanaDashboard, alertRules };
  }

  // Generate scaling recommendations
  generateScalingRecommendations(loadTestResults) {
    const recommendations = {
      infrastructure: [],
      application: [],
      database: [],
      cdn: [],
    };

    if (loadTestResults) {
      // Analyze response times
      if (loadTestResults.avgResponseTime > 1000) {
        recommendations.application.push(
          "Consider implementing response caching for frequently accessed endpoints"
        );
        recommendations.infrastructure.push(
          "Increase server resources or implement horizontal scaling"
        );
      }

      // Analyze error rates
      const errorRate = parseFloat(loadTestResults.errorRate);
      if (errorRate > 5) {
        recommendations.application.push(
          "High error rate detected - review error handling and implement circuit breakers"
        );
      }

      // Analyze throughput
      if (loadTestResults.rps < 50) {
        recommendations.infrastructure.push(
          "Consider upgrading to higher performance hosting plan"
        );
        recommendations.application.push(
          "Optimize database queries and implement connection pooling"
        );
      }
    }

    // General recommendations
    recommendations.infrastructure.push(
      "Implement auto-scaling based on CPU and memory usage",
      "Set up multiple regions for global performance",
      "Configure CDN for static assets"
    );

    recommendations.application.push(
      "Implement Redis for session storage and caching",
      "Use database connection pooling",
      "Optimize bundle size with code splitting"
    );

    recommendations.database.push(
      "Implement read replicas for heavy read workloads",
      "Set up database connection pooling",
      "Monitor slow queries and optimize indexes"
    );

    recommendations.cdn.push(
      "Configure Cloudflare or similar CDN",
      "Enable compression for text-based responses",
      "Implement edge caching for API responses"
    );

    return recommendations;
  }

  // Save all configuration files
  async saveConfigurations() {
    const configDir = path.join(process.cwd(), 'deployment');
    
    try {
      await fs.mkdir(configDir, { recursive: true });
      
      // Save Vercel configuration
      await fs.writeFile(
        path.join(configDir, 'vercel.json'),
        this.generateVercelConfig()
      );

      // Save Docker configurations
      const docker = this.generateDockerConfig();
      await fs.writeFile(
        path.join(configDir, 'Dockerfile'),
        docker.dockerfile
      );
      await fs.writeFile(
        path.join(configDir, 'docker-compose.yml'),
        docker.dockerCompose
      );

      // Save Kubernetes configuration
      await fs.writeFile(
        path.join(configDir, 'k8s-manifest.yaml'),
        this.generateKubernetesConfig()
      );

      // Save monitoring configurations
      const monitoring = this.generateMonitoringConfig();
      await fs.writeFile(
        path.join(configDir, 'grafana-dashboard.json'),
        JSON.stringify(monitoring.grafanaDashboard, null, 2)
      );
      await fs.writeFile(
        path.join(configDir, 'alert-rules.yml'),
        monitoring.alertRules
      );

      // Save scaling recommendations
      const recommendations = this.generateScalingRecommendations();
      await fs.writeFile(
        path.join(configDir, 'scaling-recommendations.json'),
        JSON.stringify(recommendations, null, 2)
      );

      console.log('✅ All configuration files generated successfully!');
      console.log(`📁 Files saved to: ${configDir}`);
      
      return configDir;

    } catch (error) {
      console.error('❌ Error generating configuration files:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Scaling Configuration Generator for GlassWallet

Usage: node scaling-config.js [options]

Options:
  --generate     Generate all configuration files
  --help, -h     Show this help message

This script generates:
  - vercel.json (Vercel deployment config)
  - Dockerfile & docker-compose.yml (Docker deployment)
  - k8s-manifest.yaml (Kubernetes deployment)
  - grafana-dashboard.json (Performance monitoring)
  - alert-rules.yml (Monitoring alerts)
  - scaling-recommendations.json (Scaling guidance)
    `);
    return;
  }

  const configurator = new ScalingConfigurator();
  
  try {
    await configurator.saveConfigurations();
  } catch (error) {
    console.error('Failed to generate configurations:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ScalingConfigurator;