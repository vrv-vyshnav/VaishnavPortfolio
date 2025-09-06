export class SystemMetrics {
  constructor() {
    this.startTime = Date.now();
    this.memoryUsage = 65; // Starting memory percentage
    this.networkDown = 125;
    this.networkUp = 45;
    this.cpuUsage = 42;
    this.cpuHistory = [1, 3, 5, 7, 6, 4, 2, 1, 3, 5]; // ASCII chart history
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.updateInterval = setInterval(() => {
      this.updateTime();
      this.updateMemory();
      this.updateNetwork();
      this.updateCPU();
    }, 1000);

    // Initial update
    this.updateTime();
    this.updateMemory();
    this.updateNetwork();
    this.updateCPU();
  }

  stop() {
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    const dateString = now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');
    
    if (timeDisplay) {
      timeDisplay.textContent = `│ ${timeString.padEnd(15)} │`;
    }
    if (dateDisplay) {
      dateDisplay.textContent = `│ ${dateString.padEnd(15)} │`;
    }
  }

  updateMemory() {
    // Simulate memory usage fluctuation
    this.memoryUsage += (Math.random() - 0.5) * 4;
    this.memoryUsage = Math.max(30, Math.min(95, this.memoryUsage));
    
    const percentage = Math.round(this.memoryUsage);
    const bars = Math.floor(percentage / 10);
    const memoryBar = '█'.repeat(bars) + '-'.repeat(10 - bars);
    
    const totalMemory = 8.0;
    const usedMemory = (totalMemory * percentage / 100).toFixed(1);
    
    const memoryBarElement = document.getElementById('memory-bar');
    const memoryInfoElement = document.getElementById('memory-info');
    
    if (memoryBarElement) {
      memoryBarElement.textContent = `│ [${memoryBar}] ${percentage}%  │`;
    }
    if (memoryInfoElement) {
      memoryInfoElement.textContent = `│ ${usedMemory}GB / ${totalMemory.toFixed(1)}GB     │`;
    }
  }

  updateNetwork() {
    // Simulate network speed fluctuation
    this.networkDown += (Math.random() - 0.5) * 20;
    this.networkUp += (Math.random() - 0.5) * 8;
    
    this.networkDown = Math.max(50, Math.min(200, this.networkDown));
    this.networkUp = Math.max(20, Math.min(80, this.networkUp));
    
    const downSpeed = Math.round(this.networkDown);
    const upSpeed = Math.round(this.networkUp);
    
    const networkDownElement = document.getElementById('network-down');
    const networkUpElement = document.getElementById('network-up');
    
    if (networkDownElement) {
      networkDownElement.textContent = `│ ↓ ${downSpeed} Mbps        │`;
    }
    if (networkUpElement) {
      networkUpElement.textContent = `│ ↑ ${upSpeed} Mbps         │`;
    }
  }

  updateCPU() {
    // Simulate CPU usage and update history
    this.cpuUsage += (Math.random() - 0.5) * 10;
    this.cpuUsage = Math.max(10, Math.min(90, this.cpuUsage));
    
    // Update CPU history for chart
    const newValue = Math.floor(this.cpuUsage / 10);
    this.cpuHistory.push(newValue);
    this.cpuHistory.shift(); // Remove oldest value
    
    // Create ASCII chart
    const chartChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const chart = this.cpuHistory.map(val => chartChars[Math.min(val, 7)]).join('');
    
    const cpuChartElement = document.getElementById('cpu-chart');
    if (cpuChartElement) {
      const percentage = Math.round(this.cpuUsage);
      cpuChartElement.textContent = `│ ${chart} ${percentage}%   │`;
    }
  }

  getUptime() {
    const uptime = Date.now() - this.startTime;
    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / 60000) % 60;
    const hours = Math.floor(uptime / 3600000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}