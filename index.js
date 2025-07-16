// Abstract base class for commands (Interface Segregation)
class Command {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  execute(params, context) {
    throw new Error('Execute method must be implemented');
  }
}

// File System Interface
class FileSystemInterface {
  getCurrentDirectory() {
    throw new Error('Method must be implemented');
  }

  resolvePath(path) {
    throw new Error('Method must be implemented');
  }

  exists(path) {
    throw new Error('Method must be implemented');
  }

  getItem(path) {
    throw new Error('Method must be implemented');
  }

  list(path) {
    throw new Error('Method must be implemented');
  }
}

// Output Interface
class OutputInterface {
  write(text) {
    throw new Error('Method must be implemented');
  }

  clear() {
    throw new Error('Method must be implemented');
  }

  addPrompt() {
    throw new Error('Method must be implemented');
  }
}

// Concrete File System Implementation
class PortfolioFileSystem extends FileSystemInterface {
  constructor() {
    super();
    this.currentPath = '';
    this.userName = '';
    this.hostName = '';
    this.fileSystem = {};
  }

  async initialize() {
    try {
      const response = await fetch('portfolio-data.json');
      const data = await response.json();
      
      this.userName = data.user.name;
      this.hostName = data.user.hostname;
      this.currentPath = data.user.homePath;
      this.fileSystem = this.expandFileSystem(data.fileSystem);
    } catch (error) {
      throw new Error('Failed to load portfolio data');
    }
  }

  expandFileSystem(fileSystem) {
    const expanded = {};

    function expandDirectory(path, contents) {
      expanded[path] = {
        type: 'directory',
        contents: {}
      };

      Object.keys(contents).forEach(name => {
        const item = contents[name];
        if (item.type === 'directory') {
          const subPath = path + '/' + name;
          expanded[path].contents[name] = item;
          expandDirectory(subPath, item.contents);
        } else {
          expanded[path].contents[name] = item;
        }
      });
    }

    Object.keys(fileSystem).forEach(path => {
      expandDirectory(path, fileSystem[path].contents);
    });

    return expanded;
  }

  getCurrentDirectory() {
    return this.fileSystem[this.currentPath];
  }

  resolvePath(path) {
    if (path.startsWith('/')) {
      return path;
    } else if (path === '..') {
      const parts = this.currentPath.split('/');
      parts.pop();
      return parts.join('/') || '/';
    } else if (path === '.') {
      return this.currentPath;
    } else {
      return this.currentPath + '/' + path;
    }
  }

  exists(path) {
    return !!this.fileSystem[path];
  }

  getItem(path) {
    return this.fileSystem[path];
  }

  list(path = this.currentPath) {
    const dir = this.fileSystem[path];
    return dir && dir.type === 'directory' ? dir.contents : {};
  }

  changeDirectory(path) {
    const resolvedPath = this.resolvePath(path);
    if (this.exists(resolvedPath) && this.getItem(resolvedPath).type === 'directory') {
      this.currentPath = resolvedPath;
      return true;
    }
    return false;
  }

  getPrompt() {
    const shortPath = this.currentPath.replace(`/home/${this.userName}`, '~');
    return `${this.userName}@${this.hostName}:${shortPath}$`;
  }
}

// DOM Output Implementation
class DOMOutput extends OutputInterface {
  constructor(contentId) {
    super();
    this.contentElement = document.getElementById(contentId);
    this.fileSystem = null;
  }

  setFileSystem(fileSystem) {
    this.fileSystem = fileSystem;
  }

  write(text) {
    const output = document.createElement('div');
    output.className = 'output';
    output.innerHTML = text;

    const currentInput = this.contentElement.querySelector('.command-line');
    if (currentInput) {
      currentInput.remove();
    }

    this.contentElement.appendChild(output);
    this.scrollToBottom();
  }

  clear() {
    this.contentElement.innerHTML = '';
  }

  addPrompt() {
    const promptLine = document.createElement('div');
    promptLine.className = 'command-line';
    promptLine.innerHTML = `
      <span class="prompt">${this.fileSystem.getPrompt()}</span>
      <input type="text" class="user-input" id="user-input" autofocus>
      <span class="cursor">█</span>
    `;
    this.contentElement.appendChild(promptLine);
    
    const newInput = document.getElementById('user-input');
    newInput.focus();
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.contentElement.scrollTop = this.contentElement.scrollHeight;
  }
}

// Command Registry (Open/Closed Principle)
class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  register(command) {
    this.commands.set(command.name, command);
  }

  get(name) {
    return this.commands.get(name);
  }

  list() {
    return Array.from(this.commands.values());
  }

  has(name) {
    return this.commands.has(name);
  }
}

// Terminal Context (Dependency Injection)
class TerminalContext {
  constructor(fileSystem, output, history, commandRegistry) {
    this.fileSystem = fileSystem;
    this.output = output;
    this.history = history;
    this.commandRegistry = commandRegistry;
  }
}

// History Service
class HistoryService {
  constructor() {
    this.commands = [];
    this.currentIndex = -1;
  }

  add(command) {
    if (command.trim()) {
      this.commands.push(command);
      this.currentIndex = this.commands.length;
    }
  }

  getPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.commands[this.currentIndex];
    }
    return null;
  }

  getNext() {
    if (this.currentIndex < this.commands.length - 1) {
      this.currentIndex++;
      return this.commands[this.currentIndex];
    } else {
      this.currentIndex = this.commands.length;
      return '';
    }
  }

  getAll() {
    return [...this.commands];
  }
}

// Individual Command Classes (Single Responsibility)
class HelpCommand extends Command {
  constructor() {
    super('help', 'Show this help message');
  }

  execute(params, context) {
    const commands = context.commandRegistry.list();
    let output = `<span class="success">Available Commands:</span>\n\n`;
    output += '<div class="help-table">';

    commands.forEach(cmd => {
      output += `<div class="help-row">
        <div class="help-command-cell"><span class="help-command">${cmd.name}</span></div>
        <div class="help-desc-cell">${cmd.description}</div>
      </div>`;
    });

    output += '</div>';
    output += `\n<span class="info">Navigation Tips:</span>
- Use 'ls' to see what's available
- Use 'cd projects' to explore projects
- Use 'cat about.txt' to learn more
- Use Tab for auto-completion
- Use Up/Down arrows for command history`;

    context.output.write(output);
  }
}

class ListCommand extends Command {
  constructor() {
    super('ls', 'List directory contents');
  }

  execute(params, context) {
    const items = context.fileSystem.list();
    const itemNames = Object.keys(items);
    
    if (itemNames.length === 0) {
      context.output.write(`<span class="info">Directory is empty</span>`);
      return;
    }

    let output = '';
    itemNames.forEach(item => {
      const itemObj = items[item];
      if (itemObj.type === 'directory') {
        output += `<span class="directory">${item}/</span>  `;
      } else {
        output += `<span class="file">${item}</span>  `;
      }
    });

    context.output.write(output);
  }
}

class ChangeDirectoryCommand extends Command {
  constructor() {
    super('cd', 'Change directory');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.fileSystem.currentPath = `/home/${context.fileSystem.userName}`;
      return;
    }

    const success = context.fileSystem.changeDirectory(params[0]);
    if (!success) {
      context.output.write(`<span class="error">cd: ${params[0]}: No such directory</span>`);
    }
  }
}

class CatCommand extends Command {
  constructor() {
    super('cat', 'Display file contents');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">cat: missing file operand</span>`);
      return;
    }

    const currentDir = context.fileSystem.getCurrentDirectory();
    const fileName = params[0];

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {
      const content = currentDir.contents[fileName].content;
      context.output.write(`<span class="file">${content}</span>`);
    } else {
      context.output.write(`<span class="error">cat: ${fileName}: No such file</span>`);
    }
  }
}

class PrintWorkingDirectoryCommand extends Command {
  constructor() {
    super('pwd', 'Print working directory');
  }

  execute(params, context) {
    context.output.write(`<span class="info">${context.fileSystem.currentPath}</span>`);
  }
}

class WhoAmICommand extends Command {
  constructor() {
    super('whoami', 'Display current user');
  }

  execute(params, context) {
    context.output.write(`<span class="success">${context.fileSystem.userName}</span>`);
  }
}

class ClearCommand extends Command {
  constructor() {
    super('clear', 'Clear terminal screen');
  }

  execute(params, context) {
    context.output.clear();
  }
}

class HistoryCommand extends Command {
  constructor() {
    super('history', 'Show command history');
  }

  execute(params, context) {
    const history = context.history.getAll();
    if (history.length === 0) {
      context.output.write(`<span class="info">No commands in history</span>`);
      return;
    }

    history.forEach((cmd, index) => {
      context.output.write(`<span class="info">${index + 1}  ${cmd}</span>`);
    });
  }
}

// Additional commands from the original code
class TreeCommand extends Command {
  constructor() {
    super('tree', 'Show directory tree');
  }

  execute(params, context) {
    const showTree = (path, prefix = '', isLast = true) => {
      const dir = context.fileSystem.getItem(path);
      if (!dir || dir.type !== 'directory') return '';

      let result = '';
      const items = Object.keys(dir.contents);
      items.forEach((item, index) => {
        const isLastItem = index === items.length - 1;
        const itemPath = path + '/' + item;
        const itemObj = dir.contents[item];

        const connector = isLastItem ? '└── ' : '├── ';
        const color = itemObj.type === 'directory' ? 'directory' : 'file';

        result += `${prefix}${connector}<span class="${color}">${item}</span>\n`;

        if (itemObj.type === 'directory') {
          const nextPrefix = prefix + (isLastItem ? '    ' : '│   ');
          result += showTree(itemPath, nextPrefix, isLastItem);
        }
      });

      return result;
    };

    const treeOutput = showTree(context.fileSystem.currentPath);
    context.output.write(`<span class="directory">.</span>\n${treeOutput}`);
  }
}

class FindCommand extends Command {
  constructor() {
    super('find', 'Find files by name');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">find: missing argument</span>`);
      return;
    }

    const searchTerm = params[0];
    const findInDirectory = (path) => {
      const dir = context.fileSystem.getItem(path);
      if (!dir || dir.type !== 'directory') return [];

      let results = [];
      Object.keys(dir.contents).forEach(item => {
        const itemPath = path + '/' + item;
        if (item.includes(searchTerm)) {
          results.push(itemPath);
        }

        if (dir.contents[item].type === 'directory') {
          results = results.concat(findInDirectory(itemPath));
        }
      });

      return results;
    };

    const results = findInDirectory(context.fileSystem.currentPath);
    if (results.length === 0) {
      context.output.write(`<span class="warning">No files found matching '${searchTerm}'</span>`);
    } else {
      results.forEach(result => {
        context.output.write(`<span class="info">${result}</span>`);
      });
    }
  }
}

class GrepCommand extends Command {
  constructor() {
    super('grep', 'Search text in files');
  }

  execute(params, context) {
    if (params.length < 2) {
      context.output.write(`<span class="error">grep: usage: grep pattern file</span>`);
      return;
    }

    const pattern = params[0];
    const fileName = params[1];
    const currentDir = context.fileSystem.getCurrentDirectory();

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {
      const content = currentDir.contents[fileName].content;
      const lines = content.split('\n');
      const matches = lines.filter(line => 
        line.toLowerCase().includes(pattern.toLowerCase())
      );

      if (matches.length === 0) {
        context.output.write(`<span class="warning">No matches found for '${pattern}'</span>`);
      } else {
        matches.forEach(match => {
          const highlighted = match.replace(
            new RegExp(`(${pattern})`, 'gi'),
            `<span class="warning">$1</span>`
          );
          context.output.write(`<span class="info">${highlighted}</span>`);
        });
      }
    } else {
      context.output.write(`<span class="error">grep: ${fileName}: No such file</span>`);
    }
  }
}

class DateCommand extends Command {
  constructor() {
    super('date', 'Show current date and time');
  }

  execute(params, context) {
    const now = new Date();
    context.output.write(`<span class="success">${now.toString()}</span>`);
  }
}

class EchoCommand extends Command {
  constructor() {
    super('echo', 'Display text');
  }

  execute(params, context) {
    const text = params.join(' ');
    context.output.write(`<span class="info">${text}</span>`);
  }
}

class WordCountCommand extends Command {
  constructor() {
    super('wc', 'Count lines, words, characters');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">wc: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = context.fileSystem.getCurrentDirectory();

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {
      const content = currentDir.contents[fileName].content;
      const lines = content.split('\n').length;
      const words = content.split(/\s+/).filter(w => w.length > 0).length;
      const chars = content.length;

      context.output.write(`<span class="info">  ${lines}  ${words}  ${chars} ${fileName}</span>`);
    } else {
      context.output.write(`<span class="error">wc: ${fileName}: No such file</span>`);
    }
  }
}

class HeadCommand extends Command {
  constructor() {
    super('head', 'Show first lines of file');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">head: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = context.fileSystem.getCurrentDirectory();

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {
      const content = currentDir.contents[fileName].content;
      const lines = content.split('\n').slice(0, 10);
      context.output.write(`<span class="file">${lines.join('\n')}</span>`);
    } else {
      context.output.write(`<span class="error">head: ${fileName}: No such file</span>`);
    }
  }
}

class TailCommand extends Command {
  constructor() {
    super('tail', 'Show last lines of file');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">tail: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = context.fileSystem.getCurrentDirectory();

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {
      const content = currentDir.contents[fileName].content;
      const lines = content.split('\n').slice(-10);
      context.output.write(`<span class="file">${lines.join('\n')}</span>`);
    } else {
      context.output.write(`<span class="error">tail: ${fileName}: No such file</span>`);
    }
  }
}

class CurlCommand extends Command {
  constructor() {
    super('curl', 'Download file');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">curl: missing URL or file name</span>`);
      return;
    }

    if (params[0] === '-O' && params[1] === 'resume.pdf') {
      const currentDir = context.fileSystem.getCurrentDirectory();
      if (currentDir.contents['resume.pdf']) {
        const link = document.createElement('a');
        link.href = 'Vaishnav_Resume.pdf';
        link.download = 'Vaishnav_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        context.output.write(`<span class="success">Resume Downloaded</span>`);
      } else {
        context.output.write(`<span class="error">curl: resume.pdf: No such file</span>`);
      }
    } else {
      context.output.write(`<span class="error">curl: only 'curl -O resume.pdf' is supported</span>`);
    }
  }
}

// Main Terminal Class (Orchestrator)
class Terminal {
  constructor() {
    this.fileSystem = new PortfolioFileSystem();
    this.output = new DOMOutput('terminal-content');
    this.history = new HistoryService();
    this.commandRegistry = new CommandRegistry();
    this.context = new TerminalContext(this.fileSystem, this.output, this.history, this.commandRegistry);
    
    this.isLoading = true;
    this.registerCommands();
  }

  registerCommands() {
    // Register all commands (Open/Closed Principle)
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
  }

  async initialize() {
    try {
      await this.fileSystem.initialize();
      this.output.setFileSystem(this.fileSystem);
      this.isLoading = false;
      
      this.setupEventListeners();
      this.showBootSequence();
    } catch (error) {
      this.output.write(`<span class="error">Error loading portfolio data. Please refresh the page.</span>`);
    }
  }

  setupEventListeners() {
    const content = document.getElementById('terminal-content');
    
    // Remove existing event listeners to prevent duplicates
    content.removeEventListener('keydown', this.handleKeyDown);
    content.removeEventListener('click', this.handleClick);
    
    // Add new event listeners
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
      // Auto-complete commands
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
      // Auto-complete file/directory names
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


    showBootSequence () {
        const systemInfo = `
    System Information:
    ==================
    OS: Portfolio Linux 2.0
    Uptime: 2+ years in software engineering
    Memory: Full-stack development skills loaded
    Shell: /bin/vaishnav

    Status: Ready for new opportunities
    Location: Kerala, India`

        // Create ASCII art element
        const asciiElement = document.createElement('pre')
        asciiElement.className = 'ascii-art'
        asciiElement.style.color = '#00ff00'
        asciiElement.style.textShadow = '0 0 5px #00ff00'

        // Create system info element
        const systemElement = document.createElement('div')
        systemElement.className = 'output'
        systemElement.style.color = '#8be9fd'

        const content = document.getElementById('terminal-content')
        content.appendChild(asciiElement)
        content.appendChild(systemElement)

        // Then type system info (medium speed)
        setTimeout(() => {
        typeWriter(systemInfo, systemElement, 10)
        }, 1000)

        // Finally initialize terminal
        setTimeout(() => {
        this.output.write(`<span class="success">Terminal initialized. Type 'help' for available commands.</span>`);
        this.output.addPrompt();
        this.setupEventListeners();
        }, 5000);
    }

}

// Utility function for typewriter effect
function typeWriter(text, element, speed = 20) {
  let i = 0;
  element.innerHTML = '';

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
  const terminal = new Terminal();
  terminal.initialize();
});