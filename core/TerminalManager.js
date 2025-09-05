import { Terminal } from '../Terminal.js';
import { typeWriter } from '../utils/typeWriter.js';

export class TerminalManager {
  constructor() {
    this.terminals = new Map(); // Store terminal instances
    this.activeTerminalId = null; // Track the active terminal
    this.nextTerminalId = 1; // Counter for generating unique IDs
    this.terminalContainer = document.querySelector('.terminal-container');
    this.terminalTabs = document.getElementById('terminal-tabs');
    this.terminalViews = document.getElementById('terminal-views');
    this.isSplitMode = false; // Track layout mode
    
    // Add layout toggle button
    this.addLayoutToggle();
    
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
   * Add layout toggle button
   */
  addLayoutToggle() {
    const layoutToggle = document.getElementById('layout-toggle');
    if (layoutToggle) {
      layoutToggle.addEventListener('click', () => {
        this.toggleLayout();
      });
    }
  }

  /**
   * Toggle between tabbed and split layout modes
   */
  toggleLayout() {
    this.isSplitMode = !this.isSplitMode;
    this.updateLayout();
    
    // Update toggle button appearance
    const layoutToggle = document.getElementById('layout-toggle');
    const toggleIcon = layoutToggle.querySelector('.toggle-icon');
    
    if (this.isSplitMode) {
      layoutToggle.classList.add('active');
      toggleIcon.textContent = '⊞'; // Split icon
      layoutToggle.title = 'Switch to Tabbed Layout';
    } else {
      layoutToggle.classList.remove('active');
      toggleIcon.textContent = '⚏'; // Tabbed icon
      layoutToggle.title = 'Switch to Split Layout';
    }
  }

  /**
   * Update the layout based on current mode
   */
  updateLayout() {
    const terminalCount = this.terminals.size;
    
    if (this.isSplitMode) {
      // Enable split mode
      this.terminalContainer.classList.add('split-layout');
      this.terminalViews.classList.add('split-mode');
      this.terminalViews.className = `terminal-views split-mode terminals-${terminalCount}`;
    } else {
      // Enable tabbed mode
      this.terminalContainer.classList.remove('split-layout');
      this.terminalViews.classList.remove('split-mode');
      this.terminalViews.className = 'terminal-views';
    }
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
   * @param {boolean} isFirstTerminal - Whether this is the first terminal (shows banner)
   * @returns {string} The ID of the created terminal
   */
  createTerminal(isFirstTerminal = false) {
    const terminalId = `terminal-${this.nextTerminalId++}`;
    const terminal = new Terminal(terminalId, isFirstTerminal);
    
    // Create UI elements for the terminal
    this.createTerminalUI(terminalId, isFirstTerminal);
    
    // Store the terminal instance
    this.terminals.set(terminalId, terminal);
    
    // Set as active
    this.setActiveTerminal(terminalId);
    
    // Initialize the terminal
    terminal.initialize();
    
    // Update layout after adding terminal
    this.updateLayout();
    
    return terminalId;
  }

  /**
   * Create UI elements for a terminal
   * @param {string} terminalId - The ID of the terminal
   * @param {boolean} showBanner - Whether to show the ASCII banner
   */
  createTerminalUI(terminalId, showBanner = false) {
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
    
    // Conditionally include banner with mobile-friendly version
    const bannerHTML = showBanner ? this.getBannerHTML() : '';
    
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
        ${bannerHTML}
      </div>
    `;
    
    this.terminalViews.appendChild(terminalView);

    // Add typewriter effect for banner if present
    if (showBanner) {
      setTimeout(() => {
        const bannerElement = terminalView.querySelector('.ascii-art.main-banner');
        if (bannerElement) {
          this.animateBanner(bannerElement);
        }
      }, 100);
    }
  }

  /**
   * Get banner HTML based on screen size
   */
  getBannerHTML() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Simple text banner for mobile
      return `
        <div class="ascii-art main-banner mobile-banner">
          <div class="banner-text">VAISHNAV</div>
          <div class="banner-subtitle">Portfolio Terminal v2.0</div>
        </div>`;
    } else {
      // Full ASCII art for desktop
      return `
        <pre class="ascii-art main-banner">
██╗   ██╗ █████╗ ██╗███████╗██╗  ██╗███╗   ██╗ █████╗ ██╗   ██╗
██║   ██║██╔══██╗██║██╔════╝██║  ██║████╗  ██║██╔══██╗██║   ██║
██║   ██║███████║██║███████╗███████║██╔██╗ ██║███████║██║   ██║
╚██╗ ██╔╝██╔══██║██║╚════██║██╔══██║██║╚██╗██║██╔══██║╚██╗ ██╔╝
 ╚████╔╝ ██║  ██║██║███████║██║  ██║██║ ╚████║██║  ██║ ╚████╔╝ 
  ╚═══╝  ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝  ╚═══╝  
        </pre>`;
    }
  }

  /**
   * Animate banner with typewriter effect
   */
  animateBanner(bannerElement) {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Animate mobile banner
      const bannerText = bannerElement.querySelector('.banner-text');
      const subtitle = bannerElement.querySelector('.banner-subtitle');
      
      if (bannerText && subtitle) {
        bannerText.style.opacity = '0';
        subtitle.style.opacity = '0';
        
        typeWriter('VAISHNAV', bannerText, 80);
        setTimeout(() => {
          typeWriter('Portfolio Terminal v2.0', subtitle, 40);
        }, 800);
        
        bannerText.style.opacity = '1';
        setTimeout(() => {
          subtitle.style.opacity = '1';
        }, 800);
      }
    } else {
      // Animate ASCII art with faster speed
      const originalText = bannerElement.textContent;
      typeWriter(originalText, bannerElement, 8);
    }
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
      
      // Update layout after removing terminal
      this.updateLayout();
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
      const terminalId = this.createTerminal(true); // Show banner for first terminal
      // The terminal is initialized in createTerminal
    } else {
      // Initialize all existing terminals
      for (const [id, terminal] of this.terminals) {
        await terminal.initialize();
      }
    }
  }

  /**
   * Get the tab number for a specific terminal ID
   * @param {string} terminalId - The terminal ID
   * @returns {number} The tab number (1-based)
   */
  getTabNumber(terminalId) {
    const terminalIds = Array.from(this.terminals.keys());
    const index = terminalIds.indexOf(terminalId);
    return index !== -1 ? index + 1 : 0;
  }

  /**
   * Get the current active tab number
   * @returns {number} The current tab number (1-based)
   */
  getCurrentTabNumber() {
    if (!this.activeTerminalId) return 0;
    return this.getTabNumber(this.activeTerminalId);
  }

  /**
   * Get total number of tabs
   * @returns {number} Total tab count
   */
  getTotalTabCount() {
    return this.terminals.size;
  }

  /**
   * Switch to a tab by number
   * @param {number} tabNumber - The tab number (1-based)
   * @returns {boolean} True if successful, false if tab doesn't exist
   */
  switchToTabByNumber(tabNumber) {
    const terminalIds = Array.from(this.terminals.keys());
    const index = tabNumber - 1; // Convert to 0-based index
    
    if (index >= 0 && index < terminalIds.length) {
      const terminalId = terminalIds[index];
      this.setActiveTerminal(terminalId);
      return true;
    }
    
    return false;
  }

  /**
   * Get information about all tabs
   * @returns {Array} Array of tab information objects
   */
  getAllTabsInfo() {
    const tabs = [];
    const terminalIds = Array.from(this.terminals.keys());
    
    terminalIds.forEach((id, index) => {
      tabs.push({
        id: id,
        number: index + 1,
        title: `Terminal ${index + 1}`,
        isActive: id === this.activeTerminalId
      });
    });
    
    return tabs;
  }
}