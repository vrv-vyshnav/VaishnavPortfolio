import { PortfolioFileSystem } from './core/FileSystem.js';
import { DOMOutput } from './core/Output.js';
import { HistoryService } from './core/History.js';
import { CommandRegistry } from './core/CommandRegistry.js';
import { TerminalContext } from './core/TerminalContext.js';

// Command imports
import { HelpCommand } from './commands/HelpCommand.js';
import { ListCommand } from './commands/ListCommand.js';
import { ChangeDirectoryCommand } from './commands/ChangeDirectoryCommand.js';
import { CatCommand } from './commands/CatCommand.js';
import { PrintWorkingDirectoryCommand } from './commands/PrintWorkingDirectoryCommand.js';
import { WhoAmICommand } from './commands/WhoAmICommand.js';
import { ClearCommand } from './commands/ClearCommand.js';
import { HistoryCommand } from './commands/HistoryCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { FindCommand } from './commands/FindCommand.js';
import { GrepCommand } from './commands/GrepCommand.js';
import { DateCommand } from './commands/DateCommand.js';
import { EchoCommand } from './commands/EchoCommand.js';
import { WordCountCommand } from './commands/WordCountCommand.js';
import { HeadCommand } from './commands/HeadCommand.js';
import { TailCommand } from './commands/TailCommand.js';
import { CurlCommand } from './commands/CurlCommand.js';
import { ExitCommand } from './commands/ExitCommand.js';
import { RmCommand } from './commands/RmCommand.js';
import { NewTabCommand } from './commands/NewTabCommand.js';
import { SwitchTabCommand } from './commands/SwitchTabCommand.js';
import { ListTabsCommand } from './commands/ListTabsCommand.js';
import { VimCommand, ViCommand } from './commands/VimCommand.js';

// Utility imports
import { typeWriter } from './utils/typeWriter.js';
import { EventManager } from './utils/EventManager.js';
import { ErrorHandler } from './utils/ErrorHandler.js';
import { SecurityManager } from './utils/security.js';
import { CONFIG } from './config/constants.js';

export class Terminal {
  constructor(terminalId, isFirstTerminal = false) {
    // Initialize error handler and event manager
    this.errorHandler = new ErrorHandler();
    this.eventManager = new EventManager();
    
    // Store terminal ID and whether this is the first terminal
    this.terminalId = terminalId;
    this.isFirstTerminal = isFirstTerminal;
    
    // Initialize all dependencies in the constructor or setup method
    this.fileSystem = new PortfolioFileSystem();
    this.output = new DOMOutput(`${terminalId}-content`);
    this.history = new HistoryService();
    this.commandRegistry = new CommandRegistry();
    this.context = new TerminalContext(this.fileSystem, this.output, this.history, this.commandRegistry, this.terminalId, this);

    // Unified search suggestions state
    this.searchResults = [];
    this.searchIndex = -1;

    this.isLoading = true;
    this.registerCommands();
  }


  registerCommands() {
    // Register commands (Open/Closed Principle)
    this.commandRegistry.register(new HelpCommand());
    this.commandRegistry.register(new ListCommand());
    this.commandRegistry.register(new ChangeDirectoryCommand());
    this.commandRegistry.register(new CatCommand());
    this.commandRegistry.register(new PrintWorkingDirectoryCommand());
    this.commandRegistry.register(new WhoAmICommand());
    this.commandRegistry.register(new ClearCommand());
    this.commandRegistry.register(new HistoryCommand());
    this.commandRegistry.register(new TreeCommand());
    this.commandRegistry.register(new FindCommand());
    this.commandRegistry.register(new GrepCommand());
    this.commandRegistry.register(new DateCommand());
    this.commandRegistry.register(new EchoCommand());
    this.commandRegistry.register(new WordCountCommand());
    this.commandRegistry.register(new HeadCommand());
    this.commandRegistry.register(new TailCommand());
    this.commandRegistry.register(new CurlCommand());
    this.commandRegistry.register(new ExitCommand());
    this.commandRegistry.register(new RmCommand());
    this.commandRegistry.register(new NewTabCommand());
    this.commandRegistry.register(new SwitchTabCommand());
    this.commandRegistry.register(new ListTabsCommand());
    this.commandRegistry.register(new VimCommand());
    this.commandRegistry.register(new ViCommand());

  }

  async initialize() {
    try {
      this.errorHandler.validateInput(this.fileSystem, 'object', 'fileSystem');
      this.errorHandler.validateInput(this.output, 'object', 'output');
      
      if (this.isFirstTerminal) {
        this.showBootSequence();
      } else {
        this.showQuickStart();
      }
      await this.fileSystem.initialize();
      this.output.setFileSystem(this.fileSystem);
      this.isLoading = false;
      
      // Set up event listeners after initialization
      this.setupEventListeners();
    } catch (error) {
      this.errorHandler.handleError(error, 'initialization', { silent: false });
    }
  }

  showBootSequence() {
    const systemInfo = `
    System Information:
    ==================
    OS: ${CONFIG.SYSTEM_INFO.OS}
    Uptime: ${CONFIG.SYSTEM_INFO.UPTIME}
    Memory: ${CONFIG.SYSTEM_INFO.MEMORY}
    Shell: ${CONFIG.SYSTEM_INFO.SHELL}

    Status: ${CONFIG.SYSTEM_INFO.STATUS}
    Location: ${CONFIG.SYSTEM_INFO.LOCATION}`;

    const asciiElement = document.createElement('pre');
    asciiElement.className = 'ascii-art main-banner';
    asciiElement.style.color = CONFIG.TERMINAL.SUCCESS_COLOR;
    asciiElement.style.textShadow = `0 0 5px ${CONFIG.TERMINAL.SUCCESS_COLOR}`;

    const systemElement = document.createElement('div');
    systemElement.className = 'output';
    systemElement.style.color = CONFIG.TERMINAL.INFO_COLOR;

    const contentId = `${this.terminalId}-content`;
    const content = document.getElementById(contentId);
    if (content) {
      content.appendChild(asciiElement);
      content.appendChild(systemElement);

      setTimeout(() => {
        typeWriter(systemInfo, systemElement, CONFIG.TYPING_SPEED);
      }, CONFIG.BOOT_DELAY);

      setTimeout(() => {
        this.output.write(`<span class="success">${CONFIG.SUCCESS_MESSAGES.TERMINAL_READY}</span>`);
        this.output.addPrompt();
        // Remove setupEventListeners call from here since it's now in initialize
      }, CONFIG.INIT_DELAY);
    } else {
      this.errorHandler.handleError(
        this.errorHandler.createError('Terminal content element not found', 'boot_sequence', 'ReferenceError'),
        'boot_sequence'
      );
    }
  }

  showQuickStart() {
    // For new tabs, just show the prompt immediately without any boot sequence
    setTimeout(() => {
      this.output.addPrompt();
    }, 100); // Small delay to ensure DOM is ready
  }

  setupEventListeners() {
    const contentId = `${this.terminalId}-content`;
    const content = document.getElementById(contentId);
    if (!content) {
      this.errorHandler.handleError(
        this.errorHandler.createError('Terminal content element not found', 'event_setup', 'ReferenceError'),
        'event_setup'
      );
      return;
    }

    // Clean up existing listeners
    this.eventManager.removeAllListeners(content);

    // Create bound event handlers
    this.handleKeyDown = this.eventManager.bind(this, 'handleKeyDown');
    this.handleClick = this.eventManager.bind(this, 'handleClick');

    // Add new listeners
    this.eventManager.addListener(content, 'keydown', this.handleKeyDown);
    this.eventManager.addListener(content, 'click', this.handleClick);
  }

  handleKeyDown(e) {
    try {
      // Use the unique input ID based on the terminal ID
      const inputId = `${this.terminalId}-content-input`;
      const input = document.getElementById(inputId);
      if (!input) return;

      // Unified input handling with integrated search
      if (e.key === 'Enter') {
        e.preventDefault();
        const command = input.value.trim();
        if (command) {
          // If there's a selected suggestion, use it
          if (this.searchResults.length > 0 && this.searchIndex >= 0) {
            const selectedCommand = this.searchResults[this.searchIndex].cmd;
            this.executeCommand(selectedCommand);
          } else {
            this.executeCommand(command);
          }
          input.value = '';
          this.clearSearchDisplay();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.searchResults.length > 0) {
          // Navigate through search results
          this.navigateSearchResults(-1, input);
        } else {
          // Normal history navigation
          const prev = this.history.getPrevious();
          if (prev) {
            input.value = prev;
            this.updateSearchSuggestions(input);
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.searchResults.length > 0) {
          // Navigate through search results
          this.navigateSearchResults(1, input);
        } else {
          // Normal history navigation
          const next = this.history.getNext();
          if (next) {
            input.value = next;
            this.updateSearchSuggestions(input);
          }
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (this.searchResults.length > 0 && this.searchIndex >= 0) {
          // Complete with selected suggestion
          const selectedCommand = this.searchResults[this.searchIndex].cmd;
          input.value = selectedCommand;
          this.clearSearchDisplay();
        } else {
          // Normal autocompletion
          this.autoComplete(input);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.clearSearchDisplay();
      } else if (e.key === 'Backspace' || e.key.length === 1) {
        // Update suggestions as user types/deletes
        setTimeout(() => this.updateSearchSuggestions(input), 0);
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'keyboard_input');
    }
  }

  handleClick() {
    try {
      // Use the unique input ID based on the terminal ID
      const inputId = `${this.terminalId}-content-input`;
      const input = document.getElementById(inputId);
      if (input) input.focus();
    } catch (error) {
      this.errorHandler.handleError(error, 'mouse_click');
    }
  }

  updateSearchSuggestions(input) {
    const searchTerm = input.value.trim();
    
    if (searchTerm === '') {
      // No input, clear suggestions
      this.clearSearchDisplay();
      return;
    }
    
    this.searchResults = this.history.search(searchTerm);
    this.searchIndex = 0;
    
    if (this.searchResults.length > 0) {
      this.showSearchResultsInOutput(searchTerm);
    } else {
      this.clearSearchDisplay();
    }
  }

  clearSearchDisplay() {
    this.searchResults = [];
    this.searchIndex = -1;
    
    const existingDisplay = document.getElementById(`${this.terminalId}-search-display`);
    if (existingDisplay) {
      existingDisplay.remove();
    }
  }

  showSearchResultsInOutput(searchTerm) {
    const searchDisplayId = `${this.terminalId}-search-display`;
    let searchDisplay = document.getElementById(searchDisplayId);
    
    if (!searchDisplay) {
      searchDisplay = document.createElement('div');
      searchDisplay.id = searchDisplayId;
      searchDisplay.className = 'search-results-display';
      
      // Insert before the current input line
      const inputLine = this.output.contentElement.lastElementChild;
      this.output.contentElement.insertBefore(searchDisplay, inputLine);
    }
    
    // Show up to 5 results
    const displayResults = this.searchResults.slice(0, 5);
    const resultsHtml = displayResults.map((result, index) => {
      const isSelected = index === this.searchIndex;
      const className = isSelected ? 'search-result selected' : 'search-result';
      
      // Highlight the search term in the command
      const highlightedCmd = result.cmd.replace(
        new RegExp(`(${searchTerm})`, 'gi'), 
        '<span class="search-term-highlight">$1</span>'
      );
      
      return `<div class="${className}">→ ${highlightedCmd}</div>`;
    }).join('');
    
    searchDisplay.innerHTML = `
      <div class="search-header">Suggestions:</div>
      ${resultsHtml}
    `;
  }

  navigateSearchResults(direction, input) {
    if (this.searchResults.length === 0) return;
    
    this.searchIndex += direction;
    if (this.searchIndex < 0) this.searchIndex = this.searchResults.length - 1;
    if (this.searchIndex >= this.searchResults.length) this.searchIndex = 0;
    
    // Update the display to show the new selection
    const searchTerm = input.value.trim();
    this.showSearchResultsInOutput(searchTerm);
  }

  async executeCommand(commandLine) {
    try {
      // Validate input
      this.errorHandler.validateInput(commandLine, 'string', 'commandLine');
      
      // Security validation
      if (!SecurityManager.validateCommand(commandLine)) {
        this.errorHandler.handleError(
          this.errorHandler.createError('Security violation: Invalid command', 'command_execution', 'SecurityError'),
          'security'
        );
        return;
      }

      const trimmed = commandLine.trim();
      
      // Check for command chaining with &
      const commands = trimmed.split('&').map(cmd => cmd.trim()).filter(cmd => cmd !== '');
      
      this.output.write(`<span class="prompt">${this.fileSystem.getPrompt()}</span>${commandLine}`);

      if (commands.length === 0) {
        // Empty command - do nothing
        return;
      }

      // Execute each command sequentially
      for (const command of commands) {
        if (command !== '') {
          await this.executeForegroundProcess(command);
        }
      }
      
      this.history.add(commandLine);
      
    } catch (error) {
      this.errorHandler.handleError(error, 'command_execution');
    } finally {
      this.output.addPrompt();
    }
  }

  async executeForegroundProcess(commandLine) {
    return this.executeForegroundProcessWithContext(commandLine, this.context);
  }

  async executeForegroundProcessWithContext(commandLine, context) {
    // Try exact match first (handles "rm -rf", "ls", etc.)
    if (this.commandRegistry.has(commandLine)) {
      const command = this.commandRegistry.get(commandLine);
      await command.execute([], context);
    } else {
      // Fall back to single-word command with parameters
      const args = commandLine.split(' ');
      const commandName = args[0];
      const params = args.slice(1);
      
      if (this.commandRegistry.has(commandName)) {
        const command = this.commandRegistry.get(commandName);
        await command.execute(params, context);
      } else {
        context.output.write(`<span class="error">${CONFIG.ERROR_MESSAGES.COMMAND_NOT_FOUND}: ${commandName}</span>`);
        context.output.write(`<span class="info">Type 'help' to see available commands</span>`);
      }
    }
  }


  autoComplete(input) {
    try {
      this.errorHandler.validateInput(input, 'object', 'input');
      
      const value = input.value;
      const parts = value.split(' ');
      const lastPart = parts[parts.length - 1];

      if (parts.length === 1) {
        const commands = this.commandRegistry.list().map(cmd => cmd.name);
        const matches = commands.filter(cmd => cmd.startsWith(lastPart));

        if (matches.length === 1) {
          input.value = matches[0];
        } else if (matches.length > 1) {
          this.output.write(`<span class="info">${matches.join('  ')}</span>`);
          this.output.addPrompt();
          // Remove setupEventListeners call from here since it's now in initialize
        }
      } else {
        const items = this.fileSystem.list();
        const itemNames = Object.keys(items);
        const matches = itemNames.filter(item => item.startsWith(lastPart));

        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          input.value = parts.join(' ');
        } else if (matches.length > 1) {
          this.output.write(`<span class="info">${matches.join('  ')}</span>`);
          this.output.addPrompt();
          // Remove setupEventListeners call from here since it's now in initialize
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'autocomplete');
    }
  }

  /**
   * Cleanup method to prevent memory leaks
   * Should be called when the terminal is destroyed
   */
  cleanup() {
    try {
      // Clean up event listeners
      this.eventManager.cleanup();
      
      // Reset error handler
      this.errorHandler.reset();
      
      // Clear any pending timeouts
      if (this.bootTimeout) {
        clearTimeout(this.bootTimeout);
      }
      if (this.initTimeout) {
        clearTimeout(this.initTimeout);
      }
      
      console.log('Terminal cleanup completed');
    } catch (error) {
      console.error('Error during terminal cleanup:', error);
    }
  }
}
