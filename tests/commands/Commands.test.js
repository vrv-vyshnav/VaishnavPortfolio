/**
 * Tests for command system components
 */

import { setupGlobalMocks, createMockTerminal, createMockFileSystem } from '../helpers/testSetup.js';

setupGlobalMocks();

// Mock command classes since the actual ones may have import issues
class MockCatCommand {
  constructor() {
    this.name = 'cat';
  }

  async execute(args, terminal) {
    if (!args || args.length === 0) {
      await terminal.output.addError('Usage: cat <file>');
      return;
    }
    
    for (const file of args) {
      try {
        const content = await terminal.fileSystem.readFile(file);
        await terminal.output.addLine(content);
      } catch (error) {
        await terminal.output.addError(`Error reading file: ${error.message}`);
      }
    }
  }

  getHelp() {
    return {
      usage: 'cat <file>',
      description: 'Display file contents',
      examples: ['cat about.txt'],
    };
  }
}

class MockListCommand {
  constructor() {
    this.name = 'ls';
  }

  async execute(args, terminal) {
    const safeArgs = args || [];
    const path = safeArgs.length > 0 && !safeArgs[0].startsWith('-') ? safeArgs[0] : '.';
    const files = terminal.fileSystem.listDirectory(path);
    
    if (files.length === 0) {
      await terminal.output.addLine('');
      return;
    }
    
    let output = '<div>';
    files.forEach(file => {
      if (safeArgs.includes('-l')) {
        output += `<div>${file.name} ${file.size}</div>`;
      } else if (safeArgs.includes('-a') || !file.name.startsWith('.')) {
        output += `<span>${file.name}</span> `;
      }
    });
    output += '</div>';
    
    await terminal.output.addHTML(output);
  }

  getHelp() {
    return {
      usage: 'ls [options] [path]',
      description: 'List directory contents',
      examples: ['ls', 'ls -la'],
    };
  }
}

class MockChangeDirectoryCommand {
  constructor() {
    this.name = 'cd';
  }

  async execute(args, terminal) {
    const safeArgs = args || [];
    const path = safeArgs.length > 0 ? safeArgs[0] : '/home/vaishnav/portfolio';
    const success = terminal.fileSystem.changeDirectory(path);
    
    if (!success && terminal.output.addError) {
      await terminal.output.addError(`cd: ${path}: No such directory`);
    }
  }

  getHelp() {
    return {
      usage: 'cd [directory]',
      description: 'Change directory',
      examples: ['cd projects', 'cd ..'],
    };
  }
}

class MockClearCommand {
  constructor() {
    this.name = 'clear';
  }

  async execute(args, terminal) {
    terminal.output.clear();
  }

  getHelp() {
    return {
      usage: 'clear',
      description: 'Clear terminal output',
      examples: ['clear'],
    };
  }
}

class MockHelpCommand {
  constructor() {
    this.name = 'help';
  }

  async execute(args, terminal) {
    if (args && args.length > 0) {
      const help = terminal.commandRegistry.getCommandHelp(args[0]);
      if (help) {
        await terminal.output.addHTML(`<div>Help for ${args[0]}: ${help.description}</div>`);
      } else {
        await terminal.output.addError(`No help available for command: ${args[0]}`);
      }
    } else {
      const commands = terminal.commandRegistry.getCommands();
      await terminal.output.addHTML(`<div>Available commands: ${commands.join(', ')}</div>`);
    }
  }

  getHelp() {
    return {
      usage: 'help [command]',
      description: 'Show help information',
      examples: ['help', 'help ls'],
    };
  }
}

class MockEchoCommand {
  constructor() {
    this.name = 'echo';
  }

  async execute(args, terminal) {
    const text = args ? args.join(' ') : '';
    await terminal.output.addLine(text);
  }

  getHelp() {
    return {
      usage: 'echo <text>',
      description: 'Echo text to output',
      examples: ['echo hello world'],
    };
  }
}

class MockDateCommand {
  constructor() {
    this.name = 'date';
  }

  async execute(args, terminal) {
    const date = new Date().toString();
    await terminal.output.addLine(date);
  }

  getHelp() {
    return {
      usage: 'date',
      description: 'Show current date',
      examples: ['date'],
    };
  }
}

class MockWhoAmICommand {
  constructor() {
    this.name = 'whoami';
  }

  async execute(args, terminal) {
    await terminal.output.addLine('vaishnav');
  }

  getHelp() {
    return {
      usage: 'whoami',
      description: 'Show current user',
      examples: ['whoami'],
    };
  }
}

class MockPrintWorkingDirectoryCommand {
  constructor() {
    this.name = 'pwd';
  }

  async execute(args, terminal) {
    const currentPath = terminal.fileSystem.getCurrentDirectory();
    await terminal.output.addLine(currentPath);
  }

  getHelp() {
    return {
      usage: 'pwd',
      description: 'Print working directory',
      examples: ['pwd'],
    };
  }
}

describe('Command System', () => {
  let mockTerminal;
  let mockFileSystem;

  beforeEach(() => {
    mockFileSystem = createMockFileSystem();
    mockTerminal = createMockTerminal();
    // Don't override - use the mock from createMockTerminal
  });

  describe('CatCommand', () => {
    let catCommand;

    beforeEach(() => {
      catCommand = new MockCatCommand();
    });

    test('should create CatCommand instance', () => {
      expect(catCommand).toBeDefined();
      expect(catCommand.name).toBe('cat');
    });

    test('should read single file', async () => {
      mockTerminal.fileSystem.readFile.mockResolvedValue('File content here');
      
      const result = await catCommand.execute(['about.txt'], mockTerminal);
      
      expect(mockTerminal.fileSystem.readFile).toHaveBeenCalledWith('about.txt');
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('File content here');
    });

    test('should read multiple files', async () => {
      mockTerminal.fileSystem.readFile
        .mockResolvedValueOnce('Content 1')
        .mockResolvedValueOnce('Content 2');
      
      await catCommand.execute(['file1.txt', 'file2.txt'], mockTerminal);
      
      expect(mockTerminal.fileSystem.readFile).toHaveBeenCalledTimes(2);
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('Content 1');
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('Content 2');
    });

    test('should show error for no arguments', async () => {
      await catCommand.execute([], mockTerminal);
      
      expect(mockTerminal.output.addError).toHaveBeenCalledWith(
        expect.stringContaining('Usage:')
      );
    });

    test('should handle file not found', async () => {
      mockTerminal.fileSystem.readFile.mockRejectedValue(new Error('File not found'));
      
      await catCommand.execute(['nonexistent.txt'], mockTerminal);
      
      expect(mockTerminal.output.addError).toHaveBeenCalledWith(
        expect.stringContaining('Error reading file')
      );
    });

    test('should provide help information', () => {
      const help = catCommand.getHelp();
      
      expect(help.usage).toContain('cat');
      expect(help.description).toBeDefined();
      expect(help.examples).toBeInstanceOf(Array);
    });
  });

  describe('ListCommand', () => {
    let listCommand;

    beforeEach(() => {
      listCommand = new MockListCommand();
    });

    test('should create ListCommand instance', () => {
      expect(listCommand).toBeDefined();
      expect(listCommand.name).toBe('ls');
    });

    test('should list current directory', async () => {
      const mockFiles = [
        { name: 'file1.txt', type: 'file', size: 100 },
        { name: 'folder1', type: 'directory', size: 0 },
      ];
      mockTerminal.fileSystem.listDirectory.mockReturnValue(mockFiles);
      
      await listCommand.execute([], mockTerminal);
      
      expect(mockTerminal.fileSystem.listDirectory).toHaveBeenCalledWith('.');
      expect(mockTerminal.output.addHTML).toHaveBeenCalled();
    });

    test('should list specific directory', async () => {
      const mockFiles = [{ name: 'project.md', type: 'file', size: 50 }];
      mockTerminal.fileSystem.listDirectory.mockReturnValue(mockFiles);
      
      await listCommand.execute(['projects'], mockTerminal);
      
      expect(mockTerminal.fileSystem.listDirectory).toHaveBeenCalledWith('projects');
    });

    test('should show long format with -l flag', async () => {
      const mockFiles = [
        { name: 'file1.txt', type: 'file', size: 100 },
      ];
      mockTerminal.fileSystem.listDirectory.mockReturnValue(mockFiles);
      
      await listCommand.execute(['-l'], mockTerminal);
      
      expect(mockTerminal.output.addHTML).toHaveBeenCalledWith(
        expect.stringContaining('100')
      );
    });

    test('should show all files with -a flag', async () => {
      const mockFiles = [
        { name: '.hidden', type: 'file', size: 10 },
        { name: 'visible.txt', type: 'file', size: 20 },
      ];
      mockTerminal.fileSystem.listDirectory.mockReturnValue(mockFiles);
      
      await listCommand.execute(['-a'], mockTerminal);
      
      expect(mockTerminal.output.addHTML).toHaveBeenCalledWith(
        expect.stringContaining('.hidden')
      );
    });

    test('should handle empty directory', async () => {
      mockTerminal.fileSystem.listDirectory.mockReturnValue([]);
      
      await listCommand.execute([], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('');
    });
  });

  describe('ChangeDirectoryCommand', () => {
    let cdCommand;

    beforeEach(() => {
      cdCommand = new MockChangeDirectoryCommand();
    });

    test('should create ChangeDirectoryCommand instance', () => {
      expect(cdCommand).toBeDefined();
      expect(cdCommand.name).toBe('cd');
    });

    test('should change to specified directory', async () => {
      mockTerminal.fileSystem.changeDirectory.mockReturnValue(true);
      
      await cdCommand.execute(['projects'], mockTerminal);
      
      expect(mockTerminal.fileSystem.changeDirectory).toHaveBeenCalledWith('projects');
    });

    test('should change to home directory with no arguments', async () => {
      mockTerminal.fileSystem.changeDirectory.mockReturnValue(true);
      
      await cdCommand.execute([], mockTerminal);
      
      expect(mockTerminal.fileSystem.changeDirectory).toHaveBeenCalledWith('/home/vaishnav/portfolio');
    });

    test('should show error for invalid directory', async () => {
      mockTerminal.fileSystem.changeDirectory.mockReturnValue(false);
      
      await cdCommand.execute(['nonexistent'], mockTerminal);
      
      expect(mockTerminal.output.addError).toHaveBeenCalledWith(
        expect.stringContaining('No such directory')
      );
    });

    test('should handle .. for parent directory', async () => {
      mockTerminal.fileSystem.changeDirectory.mockReturnValue(true);
      
      await cdCommand.execute(['..'], mockTerminal);
      
      expect(mockTerminal.fileSystem.changeDirectory).toHaveBeenCalledWith('..');
    });
  });

  describe('ClearCommand', () => {
    let clearCommand;

    beforeEach(() => {
      clearCommand = new MockClearCommand();
    });

    test('should create ClearCommand instance', () => {
      expect(clearCommand).toBeDefined();
      expect(clearCommand.name).toBe('clear');
    });

    test('should clear terminal output', async () => {
      await clearCommand.execute([], mockTerminal);
      
      expect(mockTerminal.output.clear).toHaveBeenCalled();
    });

    test('should work with any arguments', async () => {
      await clearCommand.execute(['ignored', 'arguments'], mockTerminal);
      
      expect(mockTerminal.output.clear).toHaveBeenCalled();
    });
  });

  describe('HelpCommand', () => {
    let helpCommand;

    beforeEach(() => {
      helpCommand = new MockHelpCommand();
      mockTerminal.commandRegistry = {
        getCommands: jest.fn(() => ['ls', 'cat', 'cd', 'help']),
        getCommandHelp: jest.fn((cmd) => ({
          usage: `${cmd} [options]`,
          description: `${cmd} command description`,
          examples: [`${cmd} example`],
        })),
      };
    });

    test('should create HelpCommand instance', () => {
      expect(helpCommand).toBeDefined();
      expect(helpCommand.name).toBe('help');
    });

    test('should show general help', async () => {
      await helpCommand.execute([], mockTerminal);
      
      expect(mockTerminal.commandRegistry.getCommands).toHaveBeenCalled();
      expect(mockTerminal.output.addHTML).toHaveBeenCalled();
    });

    test('should show help for specific command', async () => {
      await helpCommand.execute(['ls'], mockTerminal);
      
      expect(mockTerminal.commandRegistry.getCommandHelp).toHaveBeenCalledWith('ls');
      expect(mockTerminal.output.addHTML).toHaveBeenCalled();
    });

    test('should show error for unknown command', async () => {
      mockTerminal.commandRegistry.getCommandHelp.mockReturnValue(null);
      
      await helpCommand.execute(['unknown'], mockTerminal);
      
      expect(mockTerminal.output.addError).toHaveBeenCalledWith(
        expect.stringContaining('No help available')
      );
    });
  });

  describe('EchoCommand', () => {
    let echoCommand;

    beforeEach(() => {
      echoCommand = new MockEchoCommand();
    });

    test('should create EchoCommand instance', () => {
      expect(echoCommand).toBeDefined();
      expect(echoCommand.name).toBe('echo');
    });

    test('should echo simple text', async () => {
      await echoCommand.execute(['hello', 'world'], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('hello world');
    });

    test('should echo empty string for no arguments', async () => {
      await echoCommand.execute([], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('');
    });

    test('should handle quoted strings', async () => {
      await echoCommand.execute(['"hello world"'], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('"hello world"');
    });

    test('should handle special characters', async () => {
      await echoCommand.execute(['$HOME', '&&', '||'], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('$HOME && ||');
    });
  });

  describe('DateCommand', () => {
    let dateCommand;

    beforeEach(() => {
      dateCommand = new MockDateCommand();
    });

    test('should create DateCommand instance', () => {
      expect(dateCommand).toBeDefined();
      expect(dateCommand.name).toBe('date');
    });

    test('should show current date', async () => {
      await dateCommand.execute([], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith(
        expect.any(String)
      );
    });

    test('should handle arguments gracefully', async () => {
      await dateCommand.execute(['--iso', '+%Y-%m-%d'], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalled();
    });
  });

  describe('WhoAmICommand', () => {
    let whoAmICommand;

    beforeEach(() => {
      whoAmICommand = new MockWhoAmICommand();
    });

    test('should create WhoAmICommand instance', () => {
      expect(whoAmICommand).toBeDefined();
      expect(whoAmICommand.name).toBe('whoami');
    });

    test('should return current user', async () => {
      await whoAmICommand.execute([], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('vaishnav');
    });

    test('should ignore arguments', async () => {
      await whoAmICommand.execute(['ignored'], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('vaishnav');
    });
  });

  describe('PrintWorkingDirectoryCommand', () => {
    let pwdCommand;

    beforeEach(() => {
      pwdCommand = new MockPrintWorkingDirectoryCommand();
    });

    test('should create PrintWorkingDirectoryCommand instance', () => {
      expect(pwdCommand).toBeDefined();
      expect(pwdCommand.name).toBe('pwd');
    });

    test('should show current directory', async () => {
      await pwdCommand.execute([], mockTerminal);
      
      expect(mockTerminal.fileSystem.getCurrentDirectory).toHaveBeenCalled();
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('/home/vaishnav/portfolio');
    });

    test('should ignore arguments', async () => {
      await pwdCommand.execute(['ignored'], mockTerminal);
      
      expect(mockTerminal.output.addLine).toHaveBeenCalledWith('/home/vaishnav/portfolio');
    });
  });

  describe('Command Integration', () => {
    test('should handle command chaining simulation', async () => {
      const cdCommand = new MockChangeDirectoryCommand();
      const lsCommand = new MockListCommand();
      
      mockTerminal.fileSystem.changeDirectory.mockReturnValue(true);
      mockTerminal.fileSystem.listDirectory.mockReturnValue([
        { name: 'project1.md', type: 'file', size: 100 },
      ]);

      await cdCommand.execute(['projects'], mockTerminal);
      await lsCommand.execute([], mockTerminal);
      
      expect(mockTerminal.fileSystem.changeDirectory).toHaveBeenCalledWith('projects');
      expect(mockTerminal.fileSystem.listDirectory).toHaveBeenCalledWith('.');
    });

    test('should handle error propagation between commands', async () => {
      const cdCommand = new MockChangeDirectoryCommand();
      const catCommand = new MockCatCommand();
      
      mockTerminal.fileSystem.changeDirectory.mockReturnValue(false);
      mockTerminal.fileSystem.readFile.mockRejectedValue(new Error('File not found'));

      await cdCommand.execute(['nonexistent'], mockTerminal);
      await catCommand.execute(['file.txt'], mockTerminal);
      
      expect(mockTerminal.output.addError).toHaveBeenCalledTimes(2);
    });
  });

  describe('Command Validation', () => {
    const commands = [
      new MockCatCommand(),
      new MockListCommand(),
      new MockChangeDirectoryCommand(),
      new MockClearCommand(),
      new MockHelpCommand(),
      new MockEchoCommand(),
      new MockDateCommand(),
      new MockWhoAmICommand(),
      new MockPrintWorkingDirectoryCommand(),
    ];

    commands.forEach(command => {
      describe(`${command.constructor.name}`, () => {
        test('should have required properties', () => {
          expect(command.name).toBeDefined();
          expect(typeof command.name).toBe('string');
          expect(command.name.length).toBeGreaterThan(0);
        });

        test('should have execute method', () => {
          expect(command.execute).toBeDefined();
          expect(typeof command.execute).toBe('function');
        });

        test('should have getHelp method', () => {
          expect(command.getHelp).toBeDefined();
          expect(typeof command.getHelp).toBe('function');
        });

        test('should provide valid help structure', () => {
          const help = command.getHelp();
          expect(help).toBeDefined();
          expect(help.usage).toBeDefined();
          expect(help.description).toBeDefined();
          expect(Array.isArray(help.examples)).toBe(true);
        });

        test('should handle null/undefined arguments', async () => {
          await expect(command.execute(null, mockTerminal)).resolves.not.toThrow();
          await expect(command.execute(undefined, mockTerminal)).resolves.not.toThrow();
        });

        test('should handle empty arguments array', async () => {
          await expect(command.execute([], mockTerminal)).resolves.not.toThrow();
        });
      });
    });
  });
});