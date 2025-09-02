import { TerminalManager } from './core/TerminalManager.js';
import { RealSystemMetrics } from './utils/RealSystemMetrics.js';

document.addEventListener('DOMContentLoaded', async () => {
  const terminalManager = new TerminalManager();
  const systemMetrics = new RealSystemMetrics();
  
  // Make terminalManager globally accessible for commands
  window.terminalManager = terminalManager;
  
  // Initialize terminal and start real system metrics
  terminalManager.initializeTerminals();
  await systemMetrics.start();
  
  // Initialize responsive features
  initializeResponsiveFeatures();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    systemMetrics.stop();
  });
});

// Responsive features initialization
function initializeResponsiveFeatures() {
  const dashboardToggle = document.getElementById('dashboard-toggle');
  const systemDashboard = document.getElementById('system-dashboard');
  
  // Show/hide dashboard toggle based on screen size
  function checkScreenSize() {
    if (window.innerWidth <= 768) {
      dashboardToggle.style.display = 'flex';
    } else {
      dashboardToggle.style.display = 'none';
      systemDashboard.classList.remove('mobile-open');
    }
  }
  
  // Dashboard toggle functionality
  dashboardToggle.addEventListener('click', () => {
    systemDashboard.classList.toggle('mobile-open');
    // Change icon based on state
    dashboardToggle.textContent = systemDashboard.classList.contains('mobile-open') ? '✕' : '📊';
  });
  
  // Close dashboard when clicking outside
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        !systemDashboard.contains(e.target) && 
        !dashboardToggle.contains(e.target) &&
        systemDashboard.classList.contains('mobile-open')) {
      systemDashboard.classList.remove('mobile-open');
      dashboardToggle.textContent = '📊';
    }
  });
  
  // Close dashboard on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && systemDashboard.classList.contains('mobile-open')) {
      systemDashboard.classList.remove('mobile-open');
      dashboardToggle.textContent = '📊';
    }
  });
  
  // Initial check and resize listener
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
}
