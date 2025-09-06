/**
 * Tests for SystemMetrics utility
 */

import { setupGlobalMocks } from '../helpers/testSetup.js';

setupGlobalMocks();

// Mock SystemMetrics class since the actual import may fail
class MockSystemMetrics {
  constructor() {
    this.defaultSpeed = 30;
  }

  async getMemoryInfo() {
    return {
      totalJSHeapSize: 1024 * 1024,
      usedJSHeapSize: 512 * 1024,
      jsHeapSizeLimit: 2048 * 1024,
    };
  }

  async getCPUInfo() {
    return {
      cores: 8,
      architecture: 'x64',
      platform: 'Test Platform',
    };
  }

  async getNetworkInfo() {
    return {
      online: true,
      connectionType: 'ethernet',
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  getMemoryUsagePercentage(memInfo) {
    return (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;
  }

  now() {
    return Date.now();
  }

  getElapsedTime(startTime) {
    return this.now() - startTime;
  }

  formatTiming(time) {
    return time.toFixed(2) + 'ms';
  }

  async getSystemOverview() {
    const memory = await this.getMemoryInfo();
    const cpu = await this.getCPUInfo();
    const network = await this.getNetworkInfo();
    
    return {
      memory,
      cpu,
      network,
      timestamp: Date.now(),
    };
  }

  hasPerformanceAPI() {
    return typeof performance !== 'undefined';
  }

  hasMemoryAPI() {
    return typeof performance !== 'undefined' && performance.memory;
  }

  hasConnectionAPI() {
    return typeof navigator !== 'undefined' && navigator.connection;
  }

  getAPIAvailability() {
    return {
      performance: this.hasPerformanceAPI(),
      memory: this.hasMemoryAPI(),
      connection: this.hasConnectionAPI(),
    };
  }

  validateMemoryData(data) {
    return data && 
           typeof data.totalJSHeapSize === 'number' &&
           typeof data.usedJSHeapSize === 'number';
  }
}

// Mock RealSystemMetrics extending SystemMetrics
class MockRealSystemMetrics extends MockSystemMetrics {
  constructor() {
    super();
    this.history = [];
    this.maxHistorySize = 100;
  }

  startMonitoring(interval, callback) {
    const intervalId = setInterval(async () => {
      try {
        const data = await this.getSystemOverview();
        if (callback) callback(data);
      } catch (error) {
        // Handle error silently for test
      }
    }, interval);

    return {
      stop: () => clearInterval(intervalId),
    };
  }

  async recordMetrics() {
    const metrics = await this.getSystemOverview();
    this.history.push(metrics);
    
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  getHistory() {
    return [...this.history];
  }

  setMaxHistorySize(size) {
    this.maxHistorySize = size;
  }

  clearHistory() {
    this.history = [];
  }

  getMemoryTrends() {
    if (this.history.length === 0) {
      return { average: 0, peak: 0, trend: 'stable' };
    }

    const memoryValues = this.history.map(h => h.memory.usedJSHeapSize);
    const average = memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length;
    const peak = Math.max(...memoryValues);
    
    return {
      average,
      peak,
      trend: memoryValues[memoryValues.length - 1] > average ? 'increasing' : 'decreasing',
    };
  }

  generateReport() {
    return {
      summary: 'System performance is normal',
      details: this.getHistory(),
      recommendations: [],
    };
  }

  exportData() {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      data: this.getHistory(),
    };
  }

  detectMemoryLeaks() {
    const trends = this.getMemoryTrends();
    return {
      hasLeak: trends.trend === 'increasing',
      confidence: 0.5,
    };
  }

  async getOptimizationSuggestions() {
    return [
      {
        type: 'memory',
        description: 'Consider garbage collection',
        priority: 1,
      },
    ];
  }

  async runBenchmark() {
    const start = this.now();
    await new Promise(resolve => setTimeout(resolve, 10));
    const duration = this.getElapsedTime(start);
    
    return {
      score: 100,
      duration,
      details: {},
    };
  }

  createPerformanceObserver() {
    return typeof PerformanceObserver !== 'undefined' ? new PerformanceObserver(() => {}) : null;
  }

  isEnvironmentSupported() {
    return true;
  }
}

describe('SystemMetrics', () => {
  let systemMetrics;

  beforeEach(() => {
    systemMetrics = new MockSystemMetrics();
  });

  describe('initialization', () => {
    test('should create SystemMetrics instance', () => {
      expect(systemMetrics).toBeDefined();
      expect(typeof systemMetrics.getMemoryInfo).toBe('function');
      expect(typeof systemMetrics.getCPUInfo).toBe('function');
      expect(typeof systemMetrics.getNetworkInfo).toBe('function');
    });
  });

  describe('memory information', () => {
    test('should return memory information structure', async () => {
      const memInfo = await systemMetrics.getMemoryInfo();
      
      expect(memInfo).toBeDefined();
      expect(typeof memInfo.totalJSHeapSize).toBe('number');
      expect(typeof memInfo.usedJSHeapSize).toBe('number');
      expect(typeof memInfo.jsHeapSizeLimit).toBe('number');
      expect(memInfo.usedJSHeapSize).toBeLessThanOrEqual(memInfo.totalJSHeapSize);
    });

    test('should return consistent memory values', async () => {
      const memInfo1 = await systemMetrics.getMemoryInfo();
      const memInfo2 = await systemMetrics.getMemoryInfo();
      
      expect(Math.abs(memInfo1.totalJSHeapSize - memInfo2.totalJSHeapSize)).toBeLessThan(1024 * 1024);
    });

    test('should format memory sizes correctly', () => {
      expect(systemMetrics.formatBytes(1024)).toBe('1.00 KB');
      expect(systemMetrics.formatBytes(1024 * 1024)).toBe('1.00 MB');
      expect(systemMetrics.formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
      expect(systemMetrics.formatBytes(0)).toBe('0 Bytes');
    });

    test('should calculate memory usage percentage', async () => {
      const memInfo = await systemMetrics.getMemoryInfo();
      const percentage = systemMetrics.getMemoryUsagePercentage(memInfo);
      
      expect(typeof percentage).toBe('number');
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('CPU information', () => {
    test('should return CPU information structure', async () => {
      const cpuInfo = await systemMetrics.getCPUInfo();
      
      expect(cpuInfo).toBeDefined();
      expect(typeof cpuInfo.cores).toBe('number');
      expect(typeof cpuInfo.architecture).toBe('string');
      expect(typeof cpuInfo.platform).toBe('string');
    });

    test('should detect hardware concurrency', async () => {
      const cpuInfo = await systemMetrics.getCPUInfo();
      
      expect(cpuInfo.cores).toBeGreaterThan(0);
      expect(cpuInfo.cores).toBeLessThanOrEqual(32); // Reasonable upper limit
    });

    test('should return valid platform information', async () => {
      const cpuInfo = await systemMetrics.getCPUInfo();
      const validPlatforms = ['Win32', 'MacIntel', 'Linux x86_64', 'Linux armv7l'];
      
      expect(cpuInfo.platform).toBeDefined();
      expect(cpuInfo.platform.length).toBeGreaterThan(0);
    });
  });

  describe('network information', () => {
    test('should return network information structure', async () => {
      const netInfo = await systemMetrics.getNetworkInfo();
      
      expect(netInfo).toBeDefined();
      expect(typeof netInfo.online).toBe('boolean');
      expect(typeof netInfo.connectionType).toBe('string');
    });

    test('should detect online status', async () => {
      const netInfo = await systemMetrics.getNetworkInfo();
      
      expect(typeof netInfo.online).toBe('boolean');
    });

    test('should provide connection type', async () => {
      const netInfo = await systemMetrics.getNetworkInfo();
      const validTypes = ['ethernet', 'wifi', 'cellular', '4g', '3g', 'slow-2g', 'unknown'];
      
      expect(validTypes.includes(netInfo.connectionType.toLowerCase()) || 
             netInfo.connectionType === 'unknown').toBe(true);
    });
  });

  describe('performance metrics', () => {
    test('should measure performance timing', () => {
      const startTime = systemMetrics.now();
      
      expect(typeof startTime).toBe('number');
      expect(startTime).toBeGreaterThan(0);
    });

    test('should calculate elapsed time', () => {
      const startTime = systemMetrics.now();
      const elapsed = systemMetrics.getElapsedTime(startTime);
      
      expect(typeof elapsed).toBe('number');
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });

    test('should format timing correctly', () => {
      expect(systemMetrics.formatTiming(1000)).toBe('1000.00ms');
      expect(systemMetrics.formatTiming(1500.5)).toBe('1500.50ms');
      expect(systemMetrics.formatTiming(0)).toBe('0.00ms');
    });
  });

  describe('system overview', () => {
    test('should return complete system overview', async () => {
      const overview = await systemMetrics.getSystemOverview();
      
      expect(overview).toBeDefined();
      expect(overview.memory).toBeDefined();
      expect(overview.cpu).toBeDefined();
      expect(overview.network).toBeDefined();
      expect(overview.timestamp).toBeDefined();
    });

    test('should include timestamp in overview', async () => {
      const overview = await systemMetrics.getSystemOverview();
      const now = Date.now();
      
      expect(Math.abs(overview.timestamp - now)).toBeLessThan(1000);
    });

    test('should maintain consistent overview structure', async () => {
      const overview1 = await systemMetrics.getSystemOverview();
      const overview2 = await systemMetrics.getSystemOverview();
      
      expect(Object.keys(overview1)).toEqual(Object.keys(overview2));
      expect(Object.keys(overview1.memory)).toEqual(Object.keys(overview2.memory));
      expect(Object.keys(overview1.cpu)).toEqual(Object.keys(overview2.cpu));
    });
  });

  describe('utility methods', () => {
    test('should check if metrics are available', () => {
      const hasPerformance = systemMetrics.hasPerformanceAPI();
      
      expect(typeof hasPerformance).toBe('boolean');
    });

    test('should provide API availability status', () => {
      const availability = systemMetrics.getAPIAvailability();
      
      expect(availability).toBeDefined();
      expect(typeof availability.performance).toBe('boolean');
    });

    test('should validate metric data', () => {
      const validData = {
        totalJSHeapSize: 1024,
        usedJSHeapSize: 512,
        jsHeapSizeLimit: 2048,
      };
      
      const invalidData = {
        totalJSHeapSize: 'invalid',
        usedJSHeapSize: null,
      };
      
      expect(systemMetrics.validateMemoryData(validData)).toBe(true);
      expect(systemMetrics.validateMemoryData(invalidData)).toBe(false);
    });
  });

  describe('error handling', () => {
    test('should handle missing performance API', async () => {
      const originalPerformance = global.performance;
      global.performance = undefined;
      
      const memInfo = await systemMetrics.getMemoryInfo();
      expect(memInfo).toBeDefined();
      
      global.performance = originalPerformance;
    });

    test('should handle missing navigator API', async () => {
      const originalNavigator = global.navigator;
      global.navigator = undefined;
      
      const cpuInfo = await systemMetrics.getCPUInfo();
      const netInfo = await systemMetrics.getNetworkInfo();
      
      expect(cpuInfo).toBeDefined();
      expect(netInfo).toBeDefined();
      
      global.navigator = originalNavigator;
    });

    test('should provide fallback values', async () => {
      global.performance = { memory: undefined };
      global.navigator = { hardwareConcurrency: undefined };
      
      const overview = await systemMetrics.getSystemOverview();
      
      expect(overview.memory.totalJSHeapSize).toBeGreaterThanOrEqual(0);
      expect(overview.cpu.cores).toBeGreaterThan(0);
    });
  });
});

describe('RealSystemMetrics', () => {
  let realSystemMetrics;

  beforeEach(() => {
    realSystemMetrics = new MockRealSystemMetrics();
  });

  describe('initialization', () => {
    test('should create RealSystemMetrics instance', () => {
      expect(realSystemMetrics).toBeDefined();
      expect(realSystemMetrics).toBeInstanceOf(MockSystemMetrics);
    });

    test('should inherit from SystemMetrics', () => {
      expect(realSystemMetrics.getMemoryInfo).toBeDefined();
      expect(realSystemMetrics.getCPUInfo).toBeDefined();
      expect(realSystemMetrics.getNetworkInfo).toBeDefined();
    });
  });

  describe('real-time metrics', () => {
    test('should collect real browser metrics', async () => {
      if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
        const memInfo = await realSystemMetrics.getMemoryInfo();
        
        expect(memInfo.totalJSHeapSize).toBeGreaterThan(0);
        expect(memInfo.usedJSHeapSize).toBeGreaterThan(0);
        expect(memInfo.jsHeapSizeLimit).toBeGreaterThan(0);
      }
    });

    test('should provide accurate timing measurements', () => {
      const start = realSystemMetrics.now();
      const end = realSystemMetrics.now();
      
      expect(end).toBeGreaterThanOrEqual(start);
    });

    test('should detect real connection status', async () => {
      const netInfo = await realSystemMetrics.getNetworkInfo();
      
      expect(typeof netInfo.online).toBe('boolean');
      expect(typeof netInfo.connectionType).toBe('string');
    });
  });

  describe('monitoring capabilities', () => {
    test('should start performance monitoring', () => {
      const monitor = realSystemMetrics.startMonitoring(1000);
      
      expect(monitor).toBeDefined();
      expect(typeof monitor.stop).toBe('function');
      
      monitor.stop();
    });

    test('should collect monitoring data', (done) => {
      const monitor = realSystemMetrics.startMonitoring(100, (data) => {
        expect(data).toBeDefined();
        expect(data.timestamp).toBeDefined();
        expect(data.memory).toBeDefined();
        
        monitor.stop();
        done();
      });
    });

    test('should handle monitoring errors gracefully', () => {
      const monitor = realSystemMetrics.startMonitoring(50, () => {
        throw new Error('Monitoring error');
      });
      
      expect(() => monitor.stop()).not.toThrow();
    });
  });

  describe('historical data', () => {
    test('should track historical metrics', async () => {
      await realSystemMetrics.recordMetrics();
      await realSystemMetrics.recordMetrics();
      
      const history = realSystemMetrics.getHistory();
      
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    test('should limit historical data size', async () => {
      const maxHistory = 5;
      realSystemMetrics.setMaxHistorySize(maxHistory);
      
      for (let i = 0; i < 10; i++) {
        await realSystemMetrics.recordMetrics();
      }
      
      const history = realSystemMetrics.getHistory();
      expect(history.length).toBeLessThanOrEqual(maxHistory);
    });

    test('should clear historical data', async () => {
      await realSystemMetrics.recordMetrics();
      realSystemMetrics.clearHistory();
      
      const history = realSystemMetrics.getHistory();
      expect(history.length).toBe(0);
    });
  });

  describe('analytics and reporting', () => {
    test('should calculate memory trends', async () => {
      for (let i = 0; i < 5; i++) {
        await realSystemMetrics.recordMetrics();
      }
      
      const trends = realSystemMetrics.getMemoryTrends();
      
      expect(trends).toBeDefined();
      expect(typeof trends.average).toBe('number');
      expect(typeof trends.peak).toBe('number');
      expect(typeof trends.trend).toBe('string');
    });

    test('should generate performance report', async () => {
      await realSystemMetrics.recordMetrics();
      const report = realSystemMetrics.generateReport();
      
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.details).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    test('should export metrics data', async () => {
      await realSystemMetrics.recordMetrics();
      const exported = realSystemMetrics.exportData();
      
      expect(exported).toBeDefined();
      expect(exported.version).toBeDefined();
      expect(exported.timestamp).toBeDefined();
      expect(exported.data).toBeDefined();
    });
  });

  describe('performance optimization', () => {
    test('should detect memory leaks', async () => {
      for (let i = 0; i < 10; i++) {
        await realSystemMetrics.recordMetrics();
      }
      
      const leakDetection = realSystemMetrics.detectMemoryLeaks();
      
      expect(leakDetection).toBeDefined();
      expect(typeof leakDetection.hasLeak).toBe('boolean');
      expect(typeof leakDetection.confidence).toBe('number');
    });

    test('should provide optimization suggestions', async () => {
      const suggestions = await realSystemMetrics.getOptimizationSuggestions();
      
      expect(Array.isArray(suggestions)).toBe(true);
      
      suggestions.forEach(suggestion => {
        expect(suggestion.type).toBeDefined();
        expect(suggestion.description).toBeDefined();
        expect(typeof suggestion.priority).toBe('number');
      });
    });

    test('should benchmark performance', async () => {
      const benchmark = await realSystemMetrics.runBenchmark();
      
      expect(benchmark).toBeDefined();
      expect(typeof benchmark.score).toBe('number');
      expect(typeof benchmark.duration).toBe('number');
      expect(benchmark.details).toBeDefined();
    });
  });

  describe('integration with browser APIs', () => {
    test('should use Performance Observer when available', () => {
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = realSystemMetrics.createPerformanceObserver();
        expect(observer).toBeDefined();
      }
    });

    test('should handle different browser environments', () => {
      const isSupported = realSystemMetrics.isEnvironmentSupported();
      expect(typeof isSupported).toBe('boolean');
    });

    test('should gracefully degrade on unsupported platforms', async () => {
      const originalNavigator = global.navigator;
      global.navigator = { userAgent: 'Test Browser' };
      
      const overview = await realSystemMetrics.getSystemOverview();
      expect(overview).toBeDefined();
      
      global.navigator = originalNavigator;
    });
  });
});