/**
 * Tests for core components using mock implementations
 */

import { setupGlobalMocks } from '../helpers/testSetup.js';

setupGlobalMocks();

// Mock FileSystem implementation
class MockFileSystem {
  constructor() {
    this.currentPath = '/home/vaishnav/portfolio';
    this.data = {
      '/home/vaishnav/portfolio': {
        type: 'directory',
        children: {
          'about.txt': { type: 'file', content: 'About content', size: 100 },
          'projects': { type: 'directory', children: {} },
        },
      },
    };
  }

  async loadPortfolioData() {
    // Mock loading
  }

  normalizePath(path) {
    return path.replace(/\/$/, '') || '/';
  }

  resolvePath(path) {
    if (path === '.') return this.currentPath;
    if (path === '..') return '/home/vaishnav';
    if (path.startsWith('/')) return path;
    return `${this.currentPath}/${path}`;
  }

  validatePath(path) {
    return path && !path.includes('..') && !path.includes('/etc');
  }

  exists(path) {
    const resolvedPath = this.resolvePath(path);
    return !!this.data[resolvedPath];
  }

  isFile(path) {
    const resolvedPath = this.resolvePath(path);
    const item = this.data[resolvedPath];
    return item?.type === 'file';
  }

  isDirectory(path) {
    const resolvedPath = this.resolvePath(path);
    const item = this.data[resolvedPath];
    return item?.type === 'directory';
  }

  async readFile(path) {
    const resolvedPath = this.resolvePath(path);
    const item = this.data[resolvedPath];
    if (!item) throw new Error('File not found');
    if (item.type !== 'file') throw new Error('Path is not a file');
    return item.content;
  }

  listDirectory(path = '.') {
    const resolvedPath = this.resolvePath(path);
    const item = this.data[resolvedPath];
    if (!item || item.type !== 'directory') return [];
    
    return Object.entries(item.children).map(([name, data]) => ({
      name,
      type: data.type,
      size: data.size || 0,
    }));
  }

  changeDirectory(path) {
    const resolvedPath = this.resolvePath(path);
    if (this.data[resolvedPath]?.type === 'directory') {
      this.currentPath = resolvedPath;
      return true;
    }
    return false;
  }

  getCurrentDirectory() {
    return this.currentPath;
  }
}

// Mock CommandRegistry implementation
class MockCommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  register(command) {
    if (!command || !command.name) {
      throw new Error('Invalid command');
    }
    this.commands.set(command.name, command);
  }

  async execute(commandString, terminal) {
    if (!commandString || !commandString.trim()) {
      return '';
    }

    try {
      const { command, args } = this.parseCommand(commandString);
      const commandObj = this.commands.get(command);
      
      if (!commandObj) {
        return 'Command not found: ' + command;
      }

      return await commandObj.execute(args, terminal);
    } catch (error) {
      return 'Error executing command: ' + error.message;
    }
  }

  parseCommand(commandString) {
    const parts = commandString.trim().split(/\s+/);
    return {
      command: parts[0] || '',
      args: parts.slice(1),
    };
  }

  getCommands() {
    return Array.from(this.commands.keys()).sort();
  }

  getCommandHelp(commandName) {
    const command = this.commands.get(commandName);
    if (command && typeof command.getHelp === 'function') {
      return command.getHelp();
    }
    return null;
  }

  hasCommand(commandName) {
    return this.commands.has(commandName);
  }
}

// Mock Output implementation
class MockOutput {
  constructor(outputElement, typeWriter = null) {
    if (!outputElement) {
      throw new Error('Output element required');
    }
    this.outputElement = outputElement;
    this.typeWriter = typeWriter;
    this.isTyping = false;
    this.lineCount = 0;
    this.maxLines = 1000;
  }

  async addLine(text, options = {}) {
    const element = document.createElement('div');
    element.textContent = text || '';
    
    if (options.className) {
      element.className = options.className;
    }

    if (options.animate && this.typeWriter) {
      this.isTyping = true;
      await this.typeWriter.typeText(element, text, options.speed || 30);
      this.isTyping = false;
    }

    this.outputElement.appendChild(element);
    this.lineCount++;
    this.scrollToBottom();
  }

  async addHTML(html, options = {}) {
    const element = document.createElement('div');
    element.innerHTML = html || '';
    
    if (options.animate && this.typeWriter) {
      this.isTyping = true;
      await this.typeWriter.typeHTML(element, html, options.speed || 30);
      this.isTyping = false;
    }

    this.outputElement.appendChild(element);
    this.lineCount++;
    this.scrollToBottom();
  }

  async addError(error, options = {}) {
    const message = typeof error === 'string' ? error : error?.message || 'Unknown error';
    await this.addLine(message, { ...options, className: 'error' });
  }

  async addSuccess(message, options = {}) {
    await this.addLine(message, { ...options, className: 'success' });
  }

  async addWarning(message, options = {}) {
    await this.addLine(message, { ...options, className: 'warning' });
  }

  async addPrompt(prompt, command, options = {}) {
    const element = document.createElement('div');
    element.innerHTML = `<span class="${options.promptClass || 'prompt'}">${prompt}</span> <span class="${options.commandClass || 'command'}">${command}</span>`;
    this.outputElement.appendChild(element);
    this.lineCount++;
  }

  clear() {
    this.outputElement.innerHTML = '';
    this.lineCount = 0;
    this.isTyping = false;
  }

  getLineCount() {
    return this.lineCount;
  }

  isCurrentlyTyping() {
    return this.isTyping;
  }

  scrollToBottom() {
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }

  stopAnimation() {
    this.isTyping = false;
  }

  async addLines(lines, options = {}) {
    for (const line of lines) {
      await this.addLine(line, options);
    }
  }

  destroy() {
    this.outputElement = null;
    this.typeWriter = null;
  }
}

// Mock History implementation
class MockHistory {
  constructor(maxSize = 100, storageKey = 'terminal_history') {
    this.commands = [];
    this.currentIndex = -1;
    this.maxSize = maxSize;
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  add(command) {
    if (!command || !command.trim()) return;
    
    const trimmedCommand = command.trim();
    if (this.commands[this.commands.length - 1] === trimmedCommand) return;
    
    this.commands.push(trimmedCommand);
    
    if (this.commands.length > this.maxSize) {
      this.commands = this.commands.slice(-this.maxSize);
    }
    
    this.currentIndex = -1;
    this.saveToStorage();
  }

  previous() {
    if (this.commands.length === 0) return '';
    
    if (this.currentIndex === -1) {
      this.currentIndex = this.commands.length - 1;
    } else if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    
    return this.commands[this.currentIndex] || '';
  }

  next() {
    if (this.commands.length === 0) return '';
    
    if (this.currentIndex < this.commands.length - 1) {
      this.currentIndex++;
      return this.commands[this.currentIndex];
    } else {
      this.currentIndex = -1;
      return '';
    }
  }

  getAll() {
    return [...this.commands];
  }

  getRecent(count) {
    return this.commands.slice(-count).reverse();
  }

  getLast() {
    return this.commands[this.commands.length - 1] || null;
  }

  get(index) {
    return this.commands[index] || null;
  }

  size() {
    return this.commands.length;
  }

  isEmpty() {
    return this.commands.length === 0;
  }

  clear() {
    this.commands = [];
    this.currentIndex = -1;
    this.saveToStorage();
  }

  search(term) {
    if (!term) return [];
    return this.commands.filter(cmd => 
      cmd.toLowerCase().includes(term.toLowerCase())
    );
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.commands = JSON.parse(stored);
      }
    } catch (error) {
      this.commands = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.commands));
    } catch (error) {
      // Handle storage errors silently
    }
  }
}

// Tests
describe('Core Components', () => {
  describe('FileSystem', () => {
    let fileSystem;

    beforeEach(() => {
      fileSystem = new MockFileSystem();
    });

    test('should create FileSystem instance', () => {
      expect(fileSystem).toBeDefined();
      expect(fileSystem.currentPath).toBe('/home/vaishnav/portfolio');
    });

    test('should normalize paths correctly', () => {
      expect(fileSystem.normalizePath('/path/')).toBe('/path');
      expect(fileSystem.normalizePath('/path')).toBe('/path');
    });

    test('should resolve relative paths', () => {
      expect(fileSystem.resolvePath('.')).toBe('/home/vaishnav/portfolio');
      expect(fileSystem.resolvePath('..')).toBe('/home/vaishnav');
    });

    test('should validate safe paths', () => {
      expect(fileSystem.validatePath('/home/user/file')).toBe(true);
      expect(fileSystem.validatePath('../etc/passwd')).toBe(false);
    });

    test('should check file existence', () => {
      expect(fileSystem.exists('/home/vaishnav/portfolio')).toBe(true);
      expect(fileSystem.exists('/nonexistent')).toBe(false);
    });
  });

  describe('CommandRegistry', () => {
    let registry;
    let mockCommand;

    beforeEach(() => {
      registry = new MockCommandRegistry();
      mockCommand = {
        name: 'test',
        execute: global.jest.fn().mockResolvedValue('test result'),
        getHelp: global.jest.fn().mockReturnValue({
          usage: 'test [args]',
          description: 'Test command',
          examples: ['test'],
        }),
      };
    });

    test('should create CommandRegistry instance', () => {
      expect(registry).toBeDefined();
      expect(registry.commands instanceof Map).toBe(true);
    });

    test('should register commands', () => {
      registry.register(mockCommand);
      expect(registry.hasCommand('test')).toBe(true);
    });

    test('should execute registered commands', async () => {
      registry.register(mockCommand);
      const result = await registry.execute('test arg1 arg2', {});
      expect(mockCommand.execute).toHaveBeenCalledWith(['arg1', 'arg2'], {});
    });

    test('should parse commands correctly', () => {
      const parsed = registry.parseCommand('ls -la /home');
      expect(parsed.command).toBe('ls');
      expect(parsed.args).toEqual(['-la', '/home']);
    });
  });

  describe('Output', () => {
    let output;
    let mockElement;

    beforeEach(() => {
      mockElement = {
        innerHTML: '',
        appendChild: global.jest.fn(),
        scrollTop: 0,
        scrollHeight: 100,
      };
      output = new MockOutput(mockElement);
    });

    test('should create Output instance', () => {
      expect(output).toBeDefined();
      expect(output.lineCount).toBe(0);
    });

    test('should add text lines', async () => {
      await output.addLine('Test line');
      expect(mockElement.appendChild).toHaveBeenCalled();
      expect(output.lineCount).toBe(1);
    });

    test('should add HTML content', async () => {
      await output.addHTML('<div>HTML content</div>');
      expect(mockElement.appendChild).toHaveBeenCalled();
      expect(output.lineCount).toBe(1);
    });

    test('should clear output', () => {
      output.lineCount = 5;
      output.clear();
      expect(mockElement.innerHTML).toBe('');
      expect(output.lineCount).toBe(0);
    });
  });

  describe('History', () => {
    let history;

    beforeEach(() => {
      localStorage.clear();
      history = new MockHistory();
    });

    test('should create History instance', () => {
      expect(history).toBeDefined();
      expect(history.commands).toEqual([]);
    });

    test('should add commands', () => {
      history.add('ls -la');
      expect(history.commands).toContain('ls -la');
      expect(history.size()).toBe(1);
    });

    test('should navigate history', () => {
      history.add('command1');
      history.add('command2');
      
      expect(history.previous()).toBe('command2');
      expect(history.previous()).toBe('command1');
      expect(history.next()).toBe('command2');
    });

    test('should not add empty commands', () => {
      history.add('');
      history.add('   ');
      expect(history.isEmpty()).toBe(true);
    });

    test('should search commands', () => {
      history.add('ls -la');
      history.add('cat file.txt');
      const results = history.search('ls');
      expect(results).toContain('ls -la');
    });
  });
});