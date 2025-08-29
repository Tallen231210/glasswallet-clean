#!/usr/bin/env node

/**
 * Load Testing Script for GlassWallet API
 * 
 * This script performs load testing on various API endpoints to ensure
 * the application can handle expected traffic loads.
 * 
 * Usage:
 *   node scripts/load-test.js [endpoint] [options]
 * 
 * Examples:
 *   node scripts/load-test.js --all
 *   node scripts/load-test.js --endpoint=/api/health --concurrent=10 --duration=60
 */

const { performance } = require('perf_hooks');
const https = require('https');
const http = require('http');

class LoadTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.concurrent = options.concurrent || 5;
    this.duration = options.duration || 30; // seconds
    this.results = {
      requests: 0,
      errors: 0,
      timeouts: 0,
      responseTimes: [],
      errorDetails: [],
      statusCodes: {},
    };
  }

  async makeRequest(endpoint, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LoadTester/1.0',
          ...headers,
        },
      };

      const startTime = performance.now();
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            responseTime,
            body: responseBody,
            headers: res.headers,
          });
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        reject({
          error: error.message,
          responseTime: endTime - startTime,
        });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject({
          error: 'Request timeout',
          responseTime: 10000,
        });
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  async runLoadTest(endpoint, options = {}) {
    const startTime = Date.now();
    const endTime = startTime + (this.duration * 1000);
    const workers = [];

    console.log(`\n🚀 Starting load test for ${endpoint}`);
    console.log(`Concurrent requests: ${this.concurrent}`);
    console.log(`Duration: ${this.duration}s`);
    console.log('─'.repeat(50));

    // Create worker promises
    for (let i = 0; i < this.concurrent; i++) {
      workers.push(this.worker(endpoint, endTime, options));
    }

    // Wait for all workers to complete
    await Promise.all(workers);

    return this.generateReport(endpoint);
  }

  async worker(endpoint, endTime, options = {}) {
    while (Date.now() < endTime) {
      try {
        const result = await this.makeRequest(
          endpoint,
          options.method,
          options.body,
          options.headers
        );

        this.results.requests++;
        this.results.responseTimes.push(result.responseTime);
        
        // Track status codes
        const status = result.statusCode;
        this.results.statusCodes[status] = (this.results.statusCodes[status] || 0) + 1;

        if (status >= 400) {
          this.results.errors++;
          this.results.errorDetails.push({
            statusCode: status,
            responseTime: result.responseTime,
            endpoint,
          });
        }

      } catch (error) {
        this.results.requests++;
        
        if (error.error === 'Request timeout') {
          this.results.timeouts++;
        } else {
          this.results.errors++;
        }
        
        this.results.errorDetails.push({
          error: error.error,
          responseTime: error.responseTime,
          endpoint,
        });
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  generateReport(endpoint) {
    const { requests, errors, timeouts, responseTimes, statusCodes } = this.results;
    
    if (responseTimes.length === 0) {
      return {
        endpoint,
        requests: 0,
        rps: 0,
        errors: errors,
        errorRate: '100%',
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      };
    }

    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const rps = requests / this.duration;
    const errorRate = ((errors + timeouts) / requests * 100).toFixed(2);

    const report = {
      endpoint,
      requests,
      rps: rps.toFixed(2),
      errors: errors + timeouts,
      errorRate: `${errorRate}%`,
      avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b) / responseTimes.length),
      minResponseTime: Math.round(Math.min(...responseTimes)),
      maxResponseTime: Math.round(Math.max(...responseTimes)),
      p95ResponseTime: Math.round(sortedTimes[Math.floor(sortedTimes.length * 0.95)]),
      p99ResponseTime: Math.round(sortedTimes[Math.floor(sortedTimes.length * 0.99)]),
      statusCodes,
    };

    // Print report
    console.log('\n📊 Load Test Results');
    console.log('─'.repeat(50));
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Total Requests: ${report.requests}`);
    console.log(`Requests/sec: ${report.rps}`);
    console.log(`Errors: ${report.errors} (${report.errorRate})`);
    console.log(`Avg Response Time: ${report.avgResponseTime}ms`);
    console.log(`Min Response Time: ${report.minResponseTime}ms`);
    console.log(`Max Response Time: ${report.maxResponseTime}ms`);
    console.log(`95th Percentile: ${report.p95ResponseTime}ms`);
    console.log(`99th Percentile: ${report.p99ResponseTime}ms`);
    
    console.log('\nStatus Codes:');
    Object.entries(statusCodes).forEach(([code, count]) => {
      console.log(`  ${code}: ${count}`);
    });

    if (this.results.errorDetails.length > 0 && this.results.errorDetails.length <= 5) {
      console.log('\nError Details:');
      this.results.errorDetails.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.error || `HTTP ${error.statusCode}`} (${Math.round(error.responseTime)}ms)`);
      });
    }

    return report;
  }

  reset() {
    this.results = {
      requests: 0,
      errors: 0,
      timeouts: 0,
      responseTimes: [],
      errorDetails: [],
      statusCodes: {},
    };
  }
}

// Test scenarios
const testScenarios = {
  health: {
    endpoint: '/api/health',
    method: 'GET',
    description: 'Health check endpoint',
  },
  
  auth: {
    endpoint: '/api/auth/user',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-token-123',
    },
    description: 'User authentication endpoint',
  },
  
  leads: {
    endpoint: '/api/leads',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-token-123',
    },
    description: 'Leads listing endpoint',
  },
  
  leadCreation: {
    endpoint: '/api/leads',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer test-token-123',
    },
    body: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      source: 'load-test',
    },
    description: 'Lead creation endpoint',
  },
  
  analytics: {
    endpoint: '/api/analytics/realtime',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-token-123',
    },
    description: 'Analytics endpoint',
  },
};

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  let testEndpoint = null;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--concurrent=')) {
      options.concurrent = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--duration=')) {
      options.duration = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--endpoint=')) {
      testEndpoint = arg.split('=')[1];
    } else if (arg.startsWith('--baseurl=')) {
      options.baseUrl = arg.split('=')[1];
    } else if (arg === '--all') {
      testEndpoint = 'all';
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Load Testing Script for GlassWallet

Usage: node load-test.js [options]

Options:
  --endpoint=PATH     Test specific endpoint (e.g., /api/health)
  --all              Run all predefined test scenarios
  --concurrent=N     Number of concurrent requests (default: 5)
  --duration=N       Test duration in seconds (default: 30)
  --baseurl=URL      Base URL for testing (default: http://localhost:3000)
  --help, -h         Show this help message

Examples:
  node load-test.js --all
  node load-test.js --endpoint=/api/health --concurrent=10 --duration=60
  node load-test.js --endpoint=/api/leads --baseurl=https://your-app.vercel.app
      `);
      return;
    }
  }

  const tester = new LoadTester(options);
  
  if (testEndpoint === 'all') {
    console.log('🧪 Running all load test scenarios...\n');
    
    for (const [name, scenario] of Object.entries(testScenarios)) {
      console.log(`\n📋 Testing: ${scenario.description}`);
      
      try {
        await tester.runLoadTest(scenario.endpoint, scenario);
      } catch (error) {
        console.error(`❌ Error testing ${scenario.endpoint}:`, error.message);
      }
      
      tester.reset();
      
      // Brief pause between tests
      if (name !== Object.keys(testScenarios)[Object.keys(testScenarios).length - 1]) {
        console.log('\n⏳ Waiting 5 seconds before next test...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
  } else if (testEndpoint) {
    await tester.runLoadTest(testEndpoint);
  } else {
    console.log('❌ Please specify an endpoint with --endpoint=PATH or use --all to run all tests');
    console.log('Use --help for more information');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⏹️  Load test interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Load test failed:', error);
    process.exit(1);
  });
}

module.exports = LoadTester;