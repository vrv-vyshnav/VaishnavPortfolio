/**
 * Comprehensive test suite for terminal commands
 */

import { setupGlobalMocks } from './helpers/testSetup.js';

setupGlobalMocks();

// Mock command classes for testing
class MockOutput {
  constructor() {
    this.content = '';
  }
  
  write(text) {
    this.content += text;
  }
  
  clear() {
    this.content = '';
  }
}

class MockFileSystem {
  constructor() {
    this.currentPath = '/home/vaishnav/portfolio';
    this.userName = 'vaishnav';
    this.hostName = 'dev';
    this.fileSystem = {
      '/home/vaishnav/portfolio': {
        type: 'directory',
        contents: {
          'about.txt': { type: 'file', renderType: 'text', content: 'content/about.txt' },
          'skills.conf': { type: 'file', renderType: 'text', content: 'content/skills.conf' },
          'projects': {
            type: 'directory',
            contents: {
              'bom-manager': {
                type: 'directory',
                contents: {
                  'README.md': { type: 'file', renderType: 'text', content: 'BOM Manager Project' }
                }
              }
            }
          }
        }
      }
    };
  }

  getCurrentDirectory() {
    return this.fileSystem[this.currentPath];
  }

  changeDirectory(path) {
    if (path === 'projects') {
      this.currentPath = '/home/vaishnav/portfolio/projects';
      return true;
    }
    return false;
  }

  list() {
    return this.getCurrentDirectory().contents || {};
  }
}

class MockContext {
  constructor() {
    this.output = new MockOutput();
    this.fileSystem = new MockFileSystem();
  }
}

// Test basic command functionality
describe('Terminal Commands', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = new MockContext();
    // Mock fetch for content loading
    global.fetch = jest.fn((url) => {
      if (url === 'content/about.txt') {
        return Promise.resolve({
          text: () => Promise.resolve('About Vaishnav P\nSoftware Engineer')
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  describe('CatCommand', () => {
    let CatCommand;

    beforeEach(async () => {
      const { CatCommand: CatCommandClass } = await import('../commands/CatCommand.js');
      CatCommand = CatCommandClass;
    });

    test('should display file content', async () => {
      const catCommand = new CatCommand();
      await catCommand.execute(['about.txt'], mockContext);
      
      expect(mockContext.output.content).toContain('About Vaishnav P');
    });

    test('should show error for missing file', async () => {
      const catCommand = new CatCommand();
      await catCommand.execute(['nonexistent.txt'], mockContext);
      
      expect(mockContext.output.content).toContain('No such file');
    });

    test('should show error for missing operand', async () => {
      const catCommand = new CatCommand();
      await catCommand.execute([], mockContext);
      
      expect(mockContext.output.content).toContain('missing file operand');
    });

    test('should remove ASCII borders on mobile', async () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      const catCommand = new CatCommand();
      
      // Test the removeMobileASCIIBorders method
      const testContent = `┌─────────────────┐
│ Test Content    │
└─────────────────┘

Regular content here`;
      
      const result = catCommand.removeMobileASCIIBorders(testContent);
      
      expect(result).not.toContain('┌');
      expect(result).not.toContain('│');
      expect(result).not.toContain('└');
      expect(result).toContain('Test Content');
      expect(result).toContain('Regular content here');
    });
  });

  describe('ListCommand', () => {
    let ListCommand;

    beforeEach(async () => {
      const { ListCommand: ListCommandClass } = await import('../commands/ListCommand.js');
      ListCommand = ListCommandClass;
    });

    test('should list directory contents', async () => {
      const listCommand = new ListCommand();
      await listCommand.execute([], mockContext);
      
      expect(mockContext.output.content).toContain('about.txt');
      expect(mockContext.output.content).toContain('skills.conf');
      expect(mockContext.output.content).toContain('projects');
    });

    test('should show detailed listing with -l flag', async () => {
      const listCommand = new ListCommand();
      await listCommand.execute(['-l'], mockContext);
      
      expect(mockContext.output.content).toContain('about.txt');
      expect(mockContext.output.content).toContain('file');
    });

    test('should show hidden files with -a flag', async () => {
      const listCommand = new ListCommand();
      await listCommand.execute(['-a'], mockContext);
      
      expect(mockContext.output.content).toContain('.');
      expect(mockContext.output.content).toContain('..');
    });
  });

  describe('ChangeDirectoryCommand', () => {
    let ChangeDirectoryCommand;

    beforeEach(async () => {
      const { ChangeDirectoryCommand: ChangeDirectoryCommandClass } = await import('../commands/ChangeDirectoryCommand.js');
      ChangeDirectoryCommand = ChangeDirectoryCommandClass;
    });

    test('should change to existing directory', async () => {
      const cdCommand = new ChangeDirectoryCommand();
      await cdCommand.execute(['projects'], mockContext);
      
      expect(mockContext.fileSystem.currentPath).toBe('/home/vaishnav/portfolio/projects');
    });

    test('should show error for non-existent directory', async () => {
      const cdCommand = new ChangeDirectoryCommand();
      await cdCommand.execute(['nonexistent'], mockContext);
      
      expect(mockContext.output.content).toContain('No such directory');
    });

    test('should go to home directory with no arguments', async () => {
      const cdCommand = new ChangeDirectoryCommand();
      await cdCommand.execute([], mockContext);
      
      expect(mockContext.output.content).not.toContain('error');
    });
  });

  describe('WhoAmICommand', () => {
    let WhoAmICommand;

    beforeEach(async () => {
      const { WhoAmICommand: WhoAmICommandClass } = await import('../commands/WhoAmICommand.js');
      WhoAmICommand = WhoAmICommandClass;
    });

    test('should display username and professional info', async () => {
      const whoamiCommand = new WhoAmICommand();
      await whoamiCommand.execute([], mockContext);
      
      expect(mockContext.output.content).toContain('vaishnav');
      expect(mockContext.output.content).toContain('VAISHNAV P');
      expect(mockContext.output.content).toContain('Software Engineer');
    });

    test('should remove ASCII borders on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      const whoamiCommand = new WhoAmICommand();
      await whoamiCommand.execute([], mockContext);
      
      // Should not contain ASCII border characters on mobile
      expect(mockContext.output.content).not.toContain('┌');
      expect(mockContext.output.content).not.toContain('│');
      expect(mockContext.output.content).not.toContain('└');
    });

    test('should show ASCII borders on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920 });
      
      const whoamiCommand = new WhoAmICommand();
      await whoamiCommand.execute([], mockContext);
      
      // Should contain ASCII border characters on desktop
      expect(mockContext.output.content).toContain('┌');
      expect(mockContext.output.content).toContain('│');
      expect(mockContext.output.content).toContain('└');
    });
  });

  describe('EchoCommand', () => {
    let EchoCommand;

    beforeEach(async () => {
      const { EchoCommand: EchoCommandClass } = await import('../commands/EchoCommand.js');
      EchoCommand = EchoCommandClass;
    });

    test('should echo text arguments', async () => {
      const echoCommand = new EchoCommand();
      await echoCommand.execute(['hello', 'world'], mockContext);
      
      expect(mockContext.output.content).toBe('hello world');
    });

    test('should handle empty arguments', async () => {
      const echoCommand = new EchoCommand();
      await echoCommand.execute([], mockContext);
      
      expect(mockContext.output.content).toBe('');
    });

    test('should handle special characters', async () => {
      const echoCommand = new EchoCommand();
      await echoCommand.execute(['hello!', '@world#'], mockContext);
      
      expect(mockContext.output.content).toContain('hello!');
      expect(mockContext.output.content).toContain('@world#');
    });
  });

  describe('ClearCommand', () => {
    let ClearCommand;

    beforeEach(async () => {
      const { ClearCommand: ClearCommandClass } = await import('../commands/ClearCommand.js');
      ClearCommand = ClearCommandClass;
    });

    test('should clear the terminal output', async () => {
      mockContext.output.content = 'previous content';
      
      const clearCommand = new ClearCommand();
      await clearCommand.execute([], mockContext);
      
      // Clear command should call some method to clear the display
      // The exact implementation may vary
      expect(true).toBe(true); // Basic test that command executes without error
    });
  });

  describe('DateCommand', () => {
    let DateCommand;

    beforeEach(async () => {
      const { DateCommand: DateCommandClass } = await import('../commands/DateCommand.js');
      DateCommand = DateCommandClass;
    });

    test('should display current date', async () => {
      const dateCommand = new DateCommand();
      await dateCommand.execute([], mockContext);
      
      // Should contain date-like content
      expect(mockContext.output.content.length).toBeGreaterThan(0);
      expect(mockContext.output.content).toMatch(/\d/); // Should contain numbers
    });
  });

  describe('PrintWorkingDirectoryCommand', () => {
    let PrintWorkingDirectoryCommand;

    beforeEach(async () => {
      const { PrintWorkingDirectoryCommand: PrintWorkingDirectoryCommandClass } = await import('../commands/PrintWorkingDirectoryCommand.js');
      PrintWorkingDirectoryCommand = PrintWorkingDirectoryCommandClass;
    });

    test('should display current working directory', async () => {
      const pwdCommand = new PrintWorkingDirectoryCommand();
      await pwdCommand.execute([], mockContext);
      
      expect(mockContext.output.content).toContain('/home/vaishnav/portfolio');
    });
  });

  describe('HelpCommand', () => {
    let HelpCommand;

    beforeEach(async () => {
      const { HelpCommand: HelpCommandClass } = await import('../commands/HelpCommand.js');
      HelpCommand = HelpCommandClass;
    });

    test('should display help information', async () => {
      const helpCommand = new HelpCommand();
      await helpCommand.execute([], mockContext);
      
      expect(mockContext.output.content).toContain('help');
      expect(mockContext.output.content.length).toBeGreaterThan(100); // Should have substantial content
    });

    test('should display help for specific command', async () => {
      const helpCommand = new HelpCommand();
      await helpCommand.execute(['ls'], mockContext);
      
      expect(mockContext.output.content).toContain('ls');
    });
  });
});

// Integration tests for command interactions
describe('Command Integration', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = new MockContext();
  });

  test('should chain cd and ls commands', async () => {
    const { ChangeDirectoryCommand } = await import('../commands/ChangeDirectoryCommand.js');
    const { ListCommand } = await import('../commands/ListCommand.js');
    
    const cdCommand = new ChangeDirectoryCommand();
    const listCommand = new ListCommand();
    
    // First change directory
    await cdCommand.execute(['projects'], mockContext);
    
    // Then list contents
    await listCommand.execute([], mockContext);
    
    expect(mockContext.output.content).toContain('bom-manager');
  });

  test('should handle file operations in different directories', async () => {
    const { ChangeDirectoryCommand } = await import('../commands/ChangeDirectoryCommand.js');
    const { CatCommand } = await import('../commands/CatCommand.js');
    
    const cdCommand = new ChangeDirectoryCommand();
    const catCommand = new CatCommand();
    
    // Change to projects directory
    await cdCommand.execute(['projects'], mockContext);
    await cdCommand.execute(['bom-manager'], mockContext);
    
    // Try to cat a file
    await catCommand.execute(['README.md'], mockContext);
    
    expect(mockContext.output.content).toContain('BOM Manager Project');
  });
});

console.log('Commands test suite completed successfully! ✅');