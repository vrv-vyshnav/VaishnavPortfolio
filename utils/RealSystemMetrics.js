export class RealSystemMetrics {
  constructor() {
    this.startTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.fps = 0;
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Initial updates
    this.updateTime();
    await this.updateMemory();
    this.updateNetwork();
    this.updatePerformance();
    await this.updateStorage();
    this.updateDevice();
    
    // Set up intervals
    this.timeInterval = setInterval(() => this.updateTime(), 1000);
    this.memoryInterval = setInterval(() => this.updateMemory(), 2000);
    this.networkInterval = setInterval(() => this.updateNetwork(), 5000);
    this.performanceInterval = setInterval(() => this.updatePerformance(), 1000);
    this.storageInterval = setInterval(() => this.updateStorage(), 10000);
    
    // FPS counter
    this.updateFPS();
  }

  stop() {
    this.isRunning = false;
    if (this.timeInterval) clearInterval(this.timeInterval);
    if (this.memoryInterval) clearInterval(this.memoryInterval);
    if (this.networkInterval) clearInterval(this.networkInterval);
    if (this.performanceInterval) clearInterval(this.performanceInterval);
    if (this.storageInterval) clearInterval(this.storageInterval);
  }

  updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit'
    });

    this.updateElement('time-display', timeString);
    this.updateElement('date-display', dateString);
  }

  async updateMemory() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const usedBytes = memory.usedJSHeapSize;
      const totalBytes = memory.totalJSHeapSize;
      const limitBytes = memory.jsHeapSizeLimit;
      
      const usedMB = Math.round(usedBytes / 1024 / 1024);
      const totalMB = Math.round(totalBytes / 1024 / 1024);
      const limitMB = Math.round(limitBytes / 1024 / 1024);
      
      // Calculate percentage based on totalJSHeapSize vs jsHeapSizeLimit for more realistic values
      const percentage = Math.min(100, Math.round((totalBytes / limitBytes) * 100));
      
      this.updateElement('memory-usage', `${percentage}%`);
      this.updateElement('memory-details', `${totalMB} / ${limitMB} MB`);
      
      const memoryFill = document.getElementById('memory-fill');
      if (memoryFill) {
        memoryFill.style.width = `${percentage}%`;
      }
      
      // Debug output
      console.log('Memory Debug:', {
        used: usedMB,
        total: totalMB,
        limit: limitMB,
        percentage: percentage
      });
    } else {
      this.updateElement('memory-usage', 'N/A');
      this.updateElement('memory-details', 'Chrome/Edge only');
    }
  }

  updateNetwork() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const type = connection.effectiveType || connection.type || 'unknown';
      const downlink = connection.downlink ? `${connection.downlink} Mbps` : 'Unknown';
      
      this.updateElement('connection-type', type.toUpperCase());
      this.updateElement('connection-speed', `${downlink}`);
    } else {
      this.updateElement('connection-type', 'Unknown');
      this.updateElement('connection-speed', 'API not supported');
    }

    // Update online status
    const status = navigator.onLine ? '● Online' : '● Offline';
    this.updateElement('dashboard-status', status);
  }

  updatePerformance() {
    // Calculate load time
    const loadTime = Math.round(performance.now() - this.startTime);
    this.updateElement('load-time', `Load: ${loadTime}ms`);
    
    // FPS is updated separately in updateFPS()
  }

  updateFPS() {
    const now = performance.now();
    this.frameCount++;
    
    if (now >= this.lastFrameTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
      this.frameCount = 0;
      this.lastFrameTime = now;
      
      this.updateElement('fps-display', `${this.fps} FPS`);
    }
    
    if (this.isRunning) {
      requestAnimationFrame(() => this.updateFPS());
    }
  }

  async updateStorage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedBytes = estimate.usage || 0;
        const quotaBytes = estimate.quota || 0;
        
        // Convert to MB for display
        const usedMB = Math.round(usedBytes / 1024 / 1024);
        const quotaGB = Math.round(quotaBytes / 1024 / 1024 / 1024);
        
        // Calculate percentage - if quota is very large, show a more meaningful percentage
        let percentage = 0;
        if (quotaBytes > 0) {
          percentage = Math.round((usedBytes / quotaBytes) * 100);
          // If percentage is 0 but we have used storage, show at least 1%
          if (percentage === 0 && usedBytes > 0) {
            percentage = 1;
          }
        }
        
        this.updateElement('storage-used', `${percentage}%`);
        this.updateElement('storage-details', `${usedMB} MB / ${quotaGB} GB`);
        
        const storageFill = document.getElementById('storage-fill');
        if (storageFill) {
          storageFill.style.width = `${Math.max(2, percentage)}%`; // Min 2% for visibility
        }
        
        // Debug output
        console.log('Storage Debug:', {
          usedMB: usedMB,
          quotaGB: quotaGB,
          percentage: percentage,
          usedBytes: usedBytes,
          quotaBytes: quotaBytes
        });
      } catch (error) {
        console.error('Storage API error:', error);
        this.updateElement('storage-used', 'Error');
        this.updateElement('storage-details', 'Access denied');
      }
    } else {
      this.updateElement('storage-used', 'N/A');
      this.updateElement('storage-details', 'API not supported');
    }
  }

  updateDevice() {
    // Screen resolution
    const screenRes = `${screen.width}×${screen.height}`;
    this.updateElement('screen-res', screenRes);
    
    // Browser info
    const browserInfo = this.getBrowserInfo();
    this.updateElement('browser-info', browserInfo);
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'Chrome';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
    } else if (ua.includes('Edg')) {
      browser = 'Edge';
    }
    
    // Get version
    const version = this.getBrowserVersion(ua, browser);
    return `${browser} ${version}`;
  }

  getBrowserVersion(ua, browser) {
    let version = 'Unknown';
    
    try {
      if (browser === 'Chrome') {
        version = ua.match(/Chrome\/([0-9]+)/)[1];
      } else if (browser === 'Firefox') {
        version = ua.match(/Firefox\/([0-9]+)/)[1];
      } else if (browser === 'Safari') {
        version = ua.match(/Version\/([0-9]+)/)[1];
      } else if (browser === 'Edge') {
        version = ua.match(/Edg\/([0-9]+)/)[1];
      }
    } catch (e) {
      version = 'Unknown';
    }
    
    return version;
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  // Get additional metrics
  getUptime() {
    return Math.round((performance.now() - this.startTime) / 1000);
  }

  getPageLoadTime() {
    if (performance.timing) {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    }
    return performance.now();
  }
}