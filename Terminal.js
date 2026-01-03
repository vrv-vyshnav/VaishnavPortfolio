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
import { DemoCommand } from './commands/DemoCommand.js';

// Utility imports
import { DemoStorage } from './utils/DemoStorage.js';
import { typeWriter } from './utils/typeWriter.js';
import { EventManager } from './utils/EventManager.js';
import { ErrorHandler } from './utils/ErrorHandler.js';
import { SecurityManager } from './utils/security.js';
import { SmartSuggestions } from './utils/SmartSuggestions.js';
import { FileTypeDetector } from './utils/FileTypeDetector.js';
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
    this.fileTypeDetector = new FileTypeDetector();
    this.context = new TerminalContext(this.fileSystem, this.output, this.history, this.commandRegistry, this.terminalId, this);

    // Initialize smart suggestions after other services
    this.smartSuggestions = null; // Will be initialized after fileSystem is ready

    // Unified search suggestions state
    this.suggestions = [];
    this.suggestionIndex = -1;

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
    this.commandRegistry.register(new DemoCommand());

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
      
      // Initialize smart suggestions after fileSystem is ready
      this.smartSuggestions = new SmartSuggestions(this.commandRegistry, this.fileSystem);
      
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

        setTimeout(() => {
          if (DemoStorage.isFirstVisit()) {
            DemoStorage.markVisited();
            this.executeCommand('demo');
          }
        }, 500);
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
          // Always execute the typed command, not the suggestion
          this.executeCommand(command);
          input.value = '';
          this.clearSuggestionDisplay();
        }
      } else if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        // Ctrl+Up for smart suggestion navigation
        if (this.suggestions.length > 0) {
          this.navigateSuggestions(-1);
        }
      } else if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        // Ctrl+Down for smart suggestion navigation
        if (this.suggestions.length > 0) {
          this.navigateSuggestions(1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // Up arrow for command history navigation (previous command)
        const prev = this.history.getPrevious();
        if (prev) {
          input.value = prev;
          // Clear smart suggestions when using history
          this.clearSuggestionDisplay();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Down arrow for command history navigation (next command)
        const next = this.history.getNext();
        if (next) {
          input.value = next;
          // Clear smart suggestions when using history
          this.clearSuggestionDisplay();
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (this.suggestions.length > 0 && this.suggestionIndex >= 0) {
          // Complete with selected smart suggestion
          const selectedSuggestion = this.suggestions[this.suggestionIndex];
          input.value = selectedSuggestion.text;
          this.clearSuggestionDisplay();
        } else {
          // Fallback to normal autocompletion
          this.autoComplete(input);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.clearSuggestionDisplay();
      } else if (e.key === 'Backspace' || e.key.length === 1) {
        // Update smart suggestions as user types/deletes
        setTimeout(() => this.updateSmartSuggestions(input), 0);
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

  updateSmartSuggestions(input) {
    if (!this.smartSuggestions) {
      this.clearSuggestionDisplay();
      return;
    }

    const inputText = input.value.trim();
    
    if (inputText === '') {
      // Show default suggestions when input is empty
      this.suggestions = this.smartSuggestions.getDefaultSuggestions();
      this.suggestionIndex = -1;
      this.showSuggestionsInOutput();
      return;
    }
    
    this.suggestions = this.smartSuggestions.getSuggestions(inputText);
    this.suggestionIndex = 0;
    
    if (this.suggestions.length > 0) {
      this.showSuggestionsInOutput();
    } else {
      this.clearSuggestionDisplay();
    }
  }

  clearSuggestionDisplay() {
    this.suggestions = [];
    this.suggestionIndex = -1;
    
    const existingDisplay = document.getElementById(`${this.terminalId}-suggestions-display`);
    if (existingDisplay) {
      existingDisplay.remove();
    }
  }

  showSuggestionsInOutput() {
    const suggestionsDisplayId = `${this.terminalId}-suggestions-display`;
    let suggestionsDisplay = document.getElementById(suggestionsDisplayId);
    
    if (!suggestionsDisplay) {
      suggestionsDisplay = document.createElement('div');
      suggestionsDisplay.id = suggestionsDisplayId;
      suggestionsDisplay.className = 'suggestions-display';
      
      // Insert before the current input line
      const inputLine = this.output.contentElement.lastElementChild;
      this.output.contentElement.insertBefore(suggestionsDisplay, inputLine);
    }
    
    // Simple flat list without grouping
    let html = '';
    
    this.suggestions.forEach((suggestion, index) => {
      const isSelected = index === this.suggestionIndex;
      const className = isSelected ? 'suggestion-item selected' : 'suggestion-item';
      
      html += `<div class="${className}" data-suggestion="${suggestion.text}" data-index="${index}">→ ${suggestion.text}</div>`;
    });
    
    // Add navigation hint
    if (this.suggestions.length > 0) {
      html += `<div class="suggestion-hint">Tab: complete | Ctrl+↑↓: navigate | Esc: close</div>`;
    }
    
    suggestionsDisplay.innerHTML = html;
    
    // Add click handlers to suggestion items
    const suggestionItems = suggestionsDisplay.querySelectorAll('.suggestion-item');
    suggestionItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const suggestionText = item.getAttribute('data-suggestion');
        const inputId = `${this.terminalId}-content-input`;
        const input = document.getElementById(inputId);
        
        if (input && suggestionText) {
          input.value = suggestionText;
          this.clearSuggestionDisplay();
          input.focus();
        }
      });
    });
  }

  // Unused grouping methods removed

  navigateSuggestions(direction) {
    if (this.suggestions.length === 0) return;
    
    this.suggestionIndex += direction;
    if (this.suggestionIndex < 0) this.suggestionIndex = this.suggestions.length - 1;
    if (this.suggestionIndex >= this.suggestions.length) this.suggestionIndex = 0;
    
    // Update the display to show the new selection
    this.showSuggestionsInOutput();
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

      // Additional scroll after a short delay to ensure prompt is visible
      // Especially important for commands that output a lot of content
      setTimeout(() => {
        this.output.scrollToBottom();
      }, 100);
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
        const command = parts[0].toLowerCase();

        // Apply intelligent filtering based on command type
        let matches = itemNames.filter(item => item.startsWith(lastPart));

        // Filter out inappropriate files for text-only commands
        if (this.fileTypeDetector.isTextOnlyCommand(command)) {
          matches = matches.filter(item => {
            return this.fileTypeDetector.isTextFile(item);
          });
        }

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
