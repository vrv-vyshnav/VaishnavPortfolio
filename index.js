import { TerminalManager } from './core/TerminalManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  const terminalManager = new TerminalManager();
  
  // Make terminalManager globally accessible for commands
  window.terminalManager = terminalManager;
  
  // Initialize terminal
  terminalManager.initializeTerminals();
  
  // Initialize responsive features
  initializeResponsiveFeatures();
});

// Responsive features initialization
function initializeResponsiveFeatures() {
  // Any future responsive features can go here
  console.log('Terminal layout initialized');
}
