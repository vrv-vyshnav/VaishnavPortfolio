import { TerminalManager } from './core/TerminalManager.js';
import { DemoManager } from './utils/DemoManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  const terminalManager = new TerminalManager();

  window.terminalManager = terminalManager;
  window.DemoManager = DemoManager;

  terminalManager.initializeTerminals();
  initializeResponsiveFeatures();
});

function initializeResponsiveFeatures() {
}
