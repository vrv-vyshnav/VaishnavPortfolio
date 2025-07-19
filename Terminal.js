import { PortfolioFileSystem } from './core/FileSystem.js';
import { DOMOutput } from './core/Output.js';
import { HistoryService } from './core/History.js';
import { CommandRegistry } from './core/CommandRegistry.js';


import { TerminalContext } from './core/TerminalContext.js';
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
import { typeWriter } from './utils/typeWriter.js'; 
import { ExitCommand } from './commands/ExitCommand.js';

export class Terminal {
  constructor() {
    // Initialize all dependencies in the constructor or setup method
    this.fileSystem = new PortfolioFileSystem();
    this.output = new DOMOutput('terminal-content');
    this.history = new HistoryService();
    this.commandRegistry = new CommandRegistry();
    this.context = new TerminalContext(this.fileSystem, this.output, this.history, this.commandRegistry);

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
  }

  async initialize() {
    try {
      await this.fileSystem.initialize();
      this.output.setFileSystem(this.fileSystem);
      this.isLoading = false;
      this.showBootSequence();
    } catch (error) {
      this.output.write(`<span class="error">Error loading portfolio data. Please refresh the page.</span>`);
    }
  }

  showBootSequence() {
    const systemInfo = `
    System Information:
    ==================
    OS: Portfolio Linux 2.0
    Uptime: 2+ years in software engineering
    Memory: Full-stack development skills loaded
    Shell: /bin/vaishnav

    Status: Ready for new opportunities
    Location: Kerala, India`;

    const asciiElement = document.createElement('pre');
    asciiElement.className = 'ascii-art';
    asciiElement.style.color = '#00ff00';
    asciiElement.style.textShadow = '0 0 5px #00ff00';

    const systemElement = document.createElement('div');
    systemElement.className = 'output';
    systemElement.style.color = '#8be9fd';

    const content = document.getElementById('terminal-content');
    content.appendChild(asciiElement);
    content.appendChild(systemElement);

    setTimeout(() => {
      typeWriter(systemInfo, systemElement, 10);
    }, 1000);

    setTimeout(() => {
      this.output.write(`<span class="success">Terminal initialized. Type 'help' for available commands.</span>`);
      this.output.addPrompt();
      this.setupEventListeners();
    }, 4000);
  }

  setupEventListeners() {
    const content = document.getElementById('terminal-content');

    content.removeEventListener('keydown', this.handleKeyDown);
    content.removeEventListener('click', this.handleClick);

    this.handleKeyDown = (e) => {
      const input = document.getElementById('user-input');
      if (!input) return;

      if (e.key === 'Enter') {
        this.executeCommand(input.value.trim());
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = this.history.getPrevious();
        if (prev) input.value = prev;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = this.history.getNext();
        input.value = next;
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autoComplete(input);
      }
    };

    this.handleClick = () => {
      const input = document.getElementById('user-input');
      if (input) input.focus();
    };

    content.addEventListener('keydown', this.handleKeyDown);
    content.addEventListener('click', this.handleClick);
  }

  executeCommand(commandLine) {
    const args = commandLine.split(' ');
    const commandName = args[0];
    const params = args.slice(1);

    this.output.write(`<span class="prompt">${this.fileSystem.getPrompt()}</span>${commandLine}`);

    if (commandName === '') {
      // Empty command
    } else if (this.commandRegistry.has(commandName)) {
      this.history.add(commandLine);
      const command = this.commandRegistry.get(commandName);
      command.execute(params, this.context);
    } else {
      this.output.write(`<span class="error">Command not found: ${commandName}</span>`);
      this.output.write(`<span class="info">Type 'help' to see available commands</span>`);
    }

    this.output.addPrompt();
    this.setupEventListeners();
  }

  autoComplete(input) {
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
        this.setupEventListeners();
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
        this.setupEventListeners();
      }
    }
  }
}
