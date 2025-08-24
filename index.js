import { TerminalManager } from './core/TerminalManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const terminalManager = new TerminalManager();
  terminalManager.initializeTerminals();
});
