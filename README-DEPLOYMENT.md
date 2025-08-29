# GlassWallet Deployment Guide

This guide provides comprehensive instructions for deploying GlassWallet to various environments, from development to production scale.

## 🚀 Quick Start Deployment

### Vercel (Recommended for MVP)

1. **Prepare Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Required variables:
   NEXTAUTH_URL=https://your-app.vercel.app
   ENCRYPTION_KEY=your-32-character-hex-key
   CRS_API_KEY=your-crs-api-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings in Vercel
   - Add all required environment variables
   - Redeploy if necessary

### Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Access at http://localhost:3000
```

## 🏗️ Production Deployments

### Docker Deployment

1. **Build Docker Image**
   ```bash
   # Build the production image
   docker build -t glasswallet:latest .
   
   # Run with docker-compose
   docker-compose up -d
   ```

2. **Docker Environment Setup**
   ```yaml
   # docker-compose.yml includes:
   - Next.js application server
   - PostgreSQL database
   - Redis for caching
   - Nginx reverse proxy
   ```

### Kubernetes Deployment

1. **Apply Kubernetes Manifests**
   ```bash
   # Apply all manifests
   kubectl apply -f deployment/k8s-manifest.yaml
   
   # Check deployment status
   kubectl get pods -n glasswallet
   ```

2. **Features Included**
   - Horizontal Pod Autoscaler (HPA)
   - Health checks and readiness probes
   - Resource limits and requests
   - ConfigMaps and Secrets management

## 📊 Performance & Scaling

### Load Testing

Run comprehensive load tests:

```bash
# Test all endpoints
node scripts/load-test.js --all

# Test specific endpoint
node scripts/load-test.js --endpoint=/api/health --concurrent=10 --duration=60

# Test with production URL
node scripts/load-test.js --endpoint=/api/leads --baseurl=https://your-app.vercel.app
```

### Scaling Configuration

Generate scaling configurations:

```bash
# Generate all deployment configs
node scripts/scaling-config.js --generate

# Files generated in deployment/ directory:
- vercel.json (Vercel deployment config)
- Dockerfile & docker-compose.yml (Docker setup)
- k8s-manifest.yaml (Kubernetes deployment)
- grafana-dashboard.json (Monitoring dashboard)
- alert-rules.yml (Monitoring alerts)
- scaling-recommendations.json (Scaling guidance)
```

### Performance Monitoring

The application includes built-in performance monitoring:

- **Real-time metrics collection**
- **API response time tracking**
- **Error rate monitoring**
- **Resource utilization metrics**
- **Business metrics (leads, credit pulls, etc.)**

Access monitoring data via the performance monitor:

```typescript
import { performanceMonitor } from '@/lib/monitoring';

// Get dashboard data
const metrics = performanceMonitor.getDashboardData();

// Record custom business metrics
performanceMonitor.recordBusinessMetric('lead_created', 1, { source: 'website' });
```

## 🔒 Security & Compliance

### Security Features

- **FCRA Compliance**: Built-in audit logging and data retention policies
- **Data Encryption**: All PII data encrypted at rest and in transit
- **Input Validation**: Comprehensive input sanitization and validation
- **Security Headers**: HSTS, CSP, XSS protection, and more
- **Rate Limiting**: Configurable rate limiting per endpoint
- **PII Detection**: Automatic detection and masking of sensitive data

### Security Audit

The application includes a security audit component accessible via admin panel:

- Overall security score tracking
- FCRA compliance monitoring
- Vulnerability scanning results
- Security recommendations

## 📱 Mobile Responsiveness

### Features Implemented

- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Touch Optimization**: Touch-friendly buttons and interactions
- **Mobile Components**: 
  - SwipeableCard for gesture interactions
  - TouchButton with haptic feedback
  - PullToRefresh for data updates
  - MobileModal for mobile-optimized dialogs
- **Adaptive Tables**: Cards view on mobile, table view on desktop
- **Performance**: Optimized bundle sizes and lazy loading

### Testing Mobile Responsiveness

```bash
# Test on various screen sizes
npm run dev

# Use browser dev tools to test:
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad (768x1024)
- Various Android devices
```

## 🚦 Deployment Environments

### Development
- Local development with hot reload
- Mock data for rapid development
- Performance monitoring in development mode
- Security audit tools enabled

### Staging
- Production-like environment for testing
- Full security implementation
- Load testing validation
- FCRA compliance verification

### Production
- Optimized builds with code splitting
- Full security headers and monitoring
- Error tracking and alerting
- Performance optimization enabled

## 📈 Monitoring & Alerting

### Built-in Alerts

The application includes default alerts for:

- **High API Response Time** (>2 seconds)
- **High Error Rate** (>5%)
- **High Memory Usage** (>90%)
- **Low Lead Creation Rate** (<0.1 per minute)

### Custom Monitoring

```typescript
// Add custom alerts
performanceMonitor.addAlert({
  id: 'custom_alert',
  name: 'Custom Business Metric',
  condition: 'business_metric > threshold',
  threshold: 100,
  severity: 'medium'
});
```

### Grafana Integration

- Pre-built dashboard configuration included
- Prometheus metrics export available
- Alert rules for monitoring systems

## 🛠️ Maintenance

### Database Migrations

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply to production
npx prisma migrate deploy
```

### Cache Management

```bash
# Clear all caches
npm run cache:clear

# Clear specific cache patterns
npm run cache:clear:pattern leads
```

### Log Management

- Application logs in structured JSON format
- Security event logging for FCRA compliance
- Performance metrics logging
- Error tracking with stack traces

## 🔧 Troubleshooting

### Common Issues

1. **Build Timeouts**: Increase Vercel function timeout in vercel.json
2. **Memory Issues**: Adjust memory limits in deployment configs
3. **Database Connection**: Check connection string and pooling settings
4. **Rate Limiting**: Adjust rate limits in security middleware

### Performance Issues

1. **Slow Response Times**: Check database queries and implement caching
2. **High Memory Usage**: Review component memoization and lazy loading
3. **High Error Rates**: Check error handling and circuit breaker patterns

### Security Issues

1. **Failed Security Audit**: Review security audit recommendations
2. **FCRA Compliance**: Ensure proper audit logging and data retention
3. **PII Exposure**: Verify PII masking in logs and responses

## 📞 Support

For deployment support and questions:

1. Check the deployment logs first
2. Review monitoring dashboards for insights
3. Run security audit for compliance issues
4. Check load testing results for performance bottlenecks

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Platform Documentation](https://vercel.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [FCRA Compliance Guidelines](https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/fair-credit-reporting-act)