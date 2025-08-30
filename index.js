import { TerminalManager } from './core/TerminalManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const terminalManager = new TerminalManager();
  // Make terminalManager globally accessible for commands
  window.terminalManager = terminalManager;
  terminalManager.initializeTerminals();
});
