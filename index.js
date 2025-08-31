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
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    systemMetrics.stop();
  });
});
