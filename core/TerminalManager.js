import { Terminal } from '../Terminal.js';

export class TerminalManager {
  constructor() {
    this.terminals = new Map(); // Store terminal instances
    this.activeTerminalId = null; // Track the active terminal
    this.nextTerminalId = 1; // Counter for generating unique IDs
    this.terminalContainer = document.querySelector('.terminal-container');
    this.terminalTabs = document.getElementById('terminal-tabs');
    this.terminalViews = document.getElementById('terminal-views');
    
    // Add button to create new terminals
    this.addNewTerminalButton();
    
    // Listen for terminal exit events
    window.addEventListener('terminalExit', (event) => {
      const { terminalId } = event.detail;
      this.removeTerminal(terminalId);
    });
    
    // Listen for terminal exit all events
    window.addEventListener('terminalExitAll', () => {
      this.removeAllTerminals();
    });
  }

  /**
   * Add button to create new terminals
   */
  addNewTerminalButton() {
    const newTabButton = document.createElement('div');
    newTabButton.className = 'terminal-tab new-tab';
    newTabButton.innerHTML = '+';
    newTabButton.addEventListener('click', () => {
      this.createTerminal();
    });
    
    this.terminalTabs.appendChild(newTabButton);
  }

  /**
   * Create a new terminal instance
   * @returns {string} The ID of the created terminal
   */
  createTerminal() {
    const terminalId = `terminal-${this.nextTerminalId++}`;
    const terminal = new Terminal(terminalId);
    
    // Create UI elements for the terminal
    this.createTerminalUI(terminalId);
    
    // Store the terminal instance
    this.terminals.set(terminalId, terminal);
    
    // Set as active
    this.setActiveTerminal(terminalId);
    
    // Initialize the terminal
    terminal.initialize();
    
    return terminalId;
  }

  /**
   * Create UI elements for a terminal
   * @param {string} terminalId - The ID of the terminal
   */
  createTerminalUI(terminalId) {
    // Create tab
    const tab = document.createElement('div');
    tab.className = 'terminal-tab';
    tab.id = `${terminalId}-tab`;
    tab.innerHTML = `
      <span class="tab-title">Terminal ${this.nextTerminalId - 1}</span>
      <span class="close-tab">×</span>
    `;
    
    // Add click event to tab
    tab.addEventListener('click', (e) => {
      if (e.target.classList.contains('close-tab')) {
        this.removeTerminal(terminalId);
      } else {
        this.setActiveTerminal(terminalId);
      }
    });
    
    // Insert before the new tab button
    const newTabButton = this.terminalTabs.querySelector('.new-tab');
    this.terminalTabs.insertBefore(tab, newTabButton);
    
    // Create terminal view
    const terminalView = document.createElement('div');
    terminalView.className = 'terminal';
    terminalView.id = terminalId;
    terminalView.innerHTML = `
      <div class="terminal-header">
        <div class="terminal-buttons">
          <div class="terminal-button close"></div>
          <div class="terminal-button minimize"></div>
          <div class="terminal-button maximize"></div>
        </div>
        <div class="terminal-title">vaishnav@dev: ~/portfolio</div>
      </div>
      <div class="terminal-content" id="${terminalId}-content">
        <pre class="ascii-art">
        ██╗   ██╗ █████╗ ██╗███████╗██╗  ██╗███╗   ██╗ █████╗ ██╗   ██╗
        ██║   ██║██╔══██╗██║██╔════╝██║  ██║████╗  ██║██╔══██╗██║   ██║
        ██║   ██║███████║██║███████╗███████║██╔██╗ ██║███████║██║   ██║
        ╚██╗ ██╔╝██╔══██║██║╚════██║██╔══██║██║╚██╗██║██╔══██║╚██╗ ██╔╝
         ╚████╔╝ ██║  ██║██║███████║██║  ██║██║ ╚████║██║  ██║ ╚████╔╝ 
          ╚═══╝  ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝  ╚═══╝  
        </pre>
      </div>
    `;
    
    this.terminalViews.appendChild(terminalView);
  }

  /**
   * Remove a terminal instance
   * @param {string} terminalId - The ID of the terminal to remove
   */
  removeTerminal(terminalId) {
    // Prevent removing the last terminal
    if (this.terminals.size <= 1) {
      // For the last terminal, close the window directly
      window.close();
      return;
    }
    
    if (this.terminals.has(terminalId)) {
      const terminal = this.terminals.get(terminalId);
      
      // Clean up the terminal
      terminal.cleanup();
      
      // Remove UI elements
      const tab = document.getElementById(`${terminalId}-tab`);
      const view = document.getElementById(terminalId);
      
      if (tab) tab.remove();
      if (view) view.remove();
      
      // Remove from storage
      this.terminals.delete(terminalId);
      
      // Update active terminal if necessary
      if (this.activeTerminalId === terminalId) {
        // If there are other terminals, activate the first one
        if (this.terminals.size > 0) {
          const firstTerminalId = this.terminals.keys().next().value;
          this.setActiveTerminal(firstTerminalId);
        } else {
          // No terminals left
          this.activeTerminalId = null;
        }
      }
    }
  }

  /**
   * Remove all terminal instances
   */
  removeAllTerminals() {
    // Clean up all terminals
    for (const [terminalId, terminal] of this.terminals) {
      terminal.cleanup();
      
      // Remove UI elements
      const tab = document.getElementById(`${terminalId}-tab`);
      const view = document.getElementById(terminalId);
      
      if (tab) tab.remove();
      if (view) view.remove();
    }
    
    // Clear storage
    this.terminals.clear();
    this.activeTerminalId = null;
    
    // Close the window
    window.close();
  }

  /**
   * Get a terminal instance by ID
   * @param {string} terminalId - The ID of the terminal to get
   * @returns {Terminal|null} The terminal instance or null if not found
   */
  getTerminal(terminalId) {
    return this.terminals.get(terminalId) || null;
  }

  /**
   * Get all terminal instances
   * @returns {Map} A map of all terminal instances
   */
  getAllTerminals() {
    return this.terminals;
  }

  /**
   * Set the active terminal
   * @param {string} terminalId - The ID of the terminal to set as active
   */
  setActiveTerminal(terminalId) {
    if (this.terminals.has(terminalId)) {
      // Deactivate current active terminal
      if (this.activeTerminalId) {
        const currentTab = document.getElementById(`${this.activeTerminalId}-tab`);
        const currentView = document.getElementById(this.activeTerminalId);
        
        if (currentTab) currentTab.classList.remove('active');
        if (currentView) currentView.classList.remove('active');
      }
      
      // Activate new terminal
      this.activeTerminalId = terminalId;
      const newTab = document.getElementById(`${terminalId}-tab`);
      const newView = document.getElementById(terminalId);
      
      if (newTab) newTab.classList.add('active');
      if (newView) newView.classList.add('active');
      
      // Focus on the input field after a short delay to ensure DOM is updated
      setTimeout(() => {
        const contentElement = document.getElementById(`${terminalId}-content`);
        if (contentElement) {
          const input = contentElement.querySelector('.user-input');
          if (input) input.focus();
        }
      }, 100);
    }
  }

  /**
   * Get the active terminal ID
   * @returns {string|null} The ID of the active terminal or null if none
   */
  getActiveTerminalId() {
    return this.activeTerminalId;
  }

  /**
   * Get the active terminal instance
   * @returns {Terminal|null} The active terminal instance or null if none
   */
  getActiveTerminal() {
    if (this.activeTerminalId) {
      return this.terminals.get(this.activeTerminalId) || null;
    }
    return null;
  }

  /**
   * Initialize all terminals
   */
  async initializeTerminals() {
    // Create the first terminal if none exist
    if (this.terminals.size === 0) {
      const terminalId = this.createTerminal();
      // The terminal is initialized in createTerminal
    } else {
      // Initialize all existing terminals
      for (const [id, terminal] of this.terminals) {
        await terminal.initialize();
      }
    }
  }
}