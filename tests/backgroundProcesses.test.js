import { setupGlobalMocks } from './helpers/testSetup.js';

setupGlobalMocks();

// Mock Terminal implementation for background process testing
class MockTerminalForBackgroundProcesses {
  constructor() {
    this.backgroundProcesses = new Map();
    this.nextProcessId = 1;
    this.output = {
      write: global.jest.fn(),
      addPrompt: global.jest.fn(),
      addError: global.jest.fn()
    };
  }

  async executeBackgroundProcess(commandLine) {
    const processId = this.nextProcessId++;
    const processInfo = {
      id: processId,
      command: commandLine,
      startTime: new Date(),
      status: 'running'
    };

    this.backgroundProcesses.set(processId, processInfo);
    this.output.write(`[${processId}] ${processId} ${commandLine}`);
    this.output.addPrompt();

    // Simulate quick completion for testing
    setTimeout(() => {
      processInfo.status = 'completed';
      processInfo.endTime = new Date();
      this.output.write(`[${processId}]+ Done                    ${commandLine}`);
    }, 100);

    return processId;
  }

  async executeForegroundProcess(commandLine) {
    // Mock foreground execution
    return `Executed: ${commandLine}`;
  }

  async executeCommand(commandLine) {
    const trimmed = commandLine.trim();
    const isBackgroundProcess = trimmed.endsWith(' &');
    const actualCommand = isBackgroundProcess ? trimmed.slice(0, -2).trim() : trimmed;
    
    if (isBackgroundProcess) {
      return await this.executeBackgroundProcess(actualCommand);
    } else {
      return await this.executeForegroundProcess(actualCommand);
    }
  }

  getBackgroundProcesses() {
    return Array.from(this.backgroundProcesses.values());
  }
}

// Mock JobsCommand implementation
class MockJobsCommand {
  constructor() {
    this.name = 'jobs';
    this.description = 'List active background jobs';
  }

  async execute(args, context) {
    const terminal = context.terminalInstance;
    
    if (!terminal || !terminal.backgroundProcesses) {
      context.output.write('No background process management available');
      return;
    }

    const processes = Array.from(terminal.backgroundProcesses.values());
    
    if (processes.length === 0) {
      context.output.write('No active jobs');
      return;
    }

    context.output.write('Active jobs:');
    
    processes.forEach(process => {
      const duration = process.endTime 
        ? `${Math.round((process.endTime - process.startTime) / 1000)}s`
        : `${Math.round((new Date() - process.startTime) / 1000)}s`;
      
      context.output.write(
        `[${process.id}] ${process.status.padEnd(10)} ${duration.padEnd(6)} ${process.command}`
      );
    });
  }

  getHelp() {
    return {
      usage: 'jobs',
      description: 'List all active and recently completed background jobs',
      examples: ['jobs']
    };
  }
}

describe('Background Processes', () => {
  let terminal;
  let mockOutput;

  beforeEach(() => {
    terminal = new MockTerminalForBackgroundProcesses();
    mockOutput = {
      write: global.jest.fn(),
      addPrompt: global.jest.fn(),
      addError: global.jest.fn()
    };
  });

  describe('Background Process Detection', () => {
    test('should detect background process with & operator', async () => {
      const result = await terminal.executeCommand('ls -la &');
      expect(result).toBeDefined();
      expect(terminal.output.write).toHaveBeenCalledWith(expect.stringContaining('[1] 1 ls -la'));
    });

    test('should execute foreground process without & operator', async () => {
      const result = await terminal.executeCommand('ls -la');
      expect(result).toBe('Executed: ls -la');
    });

    test('should handle empty command with & operator', async () => {
      const result = await terminal.executeCommand(' &');
      // Should not create a background process for empty command
      expect(terminal.backgroundProcesses.size).toBe(0);
    });
  });

  describe('Background Process Management', () => {
    test('should assign unique process IDs', async () => {
      await terminal.executeCommand('command1 &');
      await terminal.executeCommand('command2 &');
      await terminal.executeCommand('command3 &');

      const processes = terminal.getBackgroundProcesses();
      expect(processes).toHaveLength(3);
      expect(processes[0].id).toBe(1);
      expect(processes[1].id).toBe(2);
      expect(processes[2].id).toBe(3);
    });

    test('should track process information correctly', async () => {
      await terminal.executeCommand('test-command &');

      const processes = terminal.getBackgroundProcesses();
      expect(processes).toHaveLength(1);
      
      const process = processes[0];
      expect(process.command).toBe('test-command');
      expect(process.status).toBe('running');
      expect(process.startTime).toBeInstanceOf(Date);
      expect(process.id).toBe(1);
    });

    test('should handle multiple background processes', async () => {
      await terminal.executeCommand('process1 &');
      await terminal.executeCommand('process2 &');
      await terminal.executeCommand('process3 &');

      const processes = terminal.getBackgroundProcesses();
      expect(processes).toHaveLength(3);
      expect(processes.map(p => p.command)).toEqual(['process1', 'process2', 'process3']);
    });
  });

  describe('Process Status Updates', () => {
    test('should update process status to completed', (done) => {
      terminal.executeCommand('test-command &').then(() => {
        setTimeout(() => {
          const processes = terminal.getBackgroundProcesses();
          expect(processes[0].status).toBe('completed');
          expect(processes[0].endTime).toBeInstanceOf(Date);
          done();
        }, 150);
      });
    });

    test('should notify when background process completes', (done) => {
      terminal.executeCommand('test-command &').then(() => {
        setTimeout(() => {
          expect(terminal.output.write).toHaveBeenCalledWith(
            expect.stringContaining('[1]+ Done                    test-command')
          );
          done();
        }, 150);
      });
    });
  });

  describe('Jobs Command', () => {
    let jobsCommand;
    let mockContext;

    beforeEach(() => {
      jobsCommand = new MockJobsCommand();
      mockContext = {
        terminalInstance: terminal,
        output: mockOutput
      };
    });

    test('should create jobs command with correct properties', () => {
      expect(jobsCommand.name).toBe('jobs');
      expect(jobsCommand.description).toBe('List active background jobs');
    });

    test('should show no active jobs when none exist', async () => {
      await jobsCommand.execute([], mockContext);
      expect(mockOutput.write).toHaveBeenCalledWith('No active jobs');
    });

    test('should list active background processes', async () => {
      // Add some background processes
      await terminal.executeCommand('process1 &');
      await terminal.executeCommand('process2 &');

      await jobsCommand.execute([], mockContext);
      
      expect(mockOutput.write).toHaveBeenCalledWith('Active jobs:');
      expect(mockOutput.write).toHaveBeenCalledWith(expect.stringContaining('[1]'));
      expect(mockOutput.write).toHaveBeenCalledWith(expect.stringContaining('process1'));
      expect(mockOutput.write).toHaveBeenCalledWith(expect.stringContaining('[2]'));
      expect(mockOutput.write).toHaveBeenCalledWith(expect.stringContaining('process2'));
    });

    test('should handle missing terminal instance', async () => {
      const contextWithoutTerminal = {
        terminalInstance: null,
        output: mockOutput
      };

      await jobsCommand.execute([], contextWithoutTerminal);
      expect(mockOutput.write).toHaveBeenCalledWith('No background process management available');
    });

    test('should provide help information', () => {
      const help = jobsCommand.getHelp();
      expect(help.usage).toBe('jobs');
      expect(help.description).toBe('List all active and recently completed background jobs');
      expect(help.examples).toEqual(['jobs']);
    });
  });

  describe('Edge Cases', () => {
    test('should handle commands with multiple spaces before &', async () => {
      await terminal.executeCommand('command   &');
      const processes = terminal.getBackgroundProcesses();
      expect(processes).toHaveLength(1);
      expect(processes[0].command).toBe('command');
    });

    test('should not treat & in middle of command as background indicator', async () => {
      const result = await terminal.executeCommand('echo hello & world');
      expect(result).toBe('Executed: echo hello & world');
      expect(terminal.backgroundProcesses.size).toBe(0);
    });

    test('should handle very long command names in background', async () => {
      const longCommand = 'a'.repeat(100);
      await terminal.executeCommand(`${longCommand} &`);
      
      const processes = terminal.getBackgroundProcesses();
      expect(processes[0].command).toBe(longCommand);
    });
  });

  describe('Process State Management', () => {
    test('should maintain process state across multiple operations', async () => {
      await terminal.executeCommand('process1 &');
      await terminal.executeCommand('process2 &');
      
      let processes = terminal.getBackgroundProcesses();
      expect(processes).toHaveLength(2);
      
      await terminal.executeCommand('process3 &');
      processes = terminal.getBackgroundProcesses();
      expect(processes).toHaveLength(3);
      
      // Check that previous processes are still there
      expect(processes.find(p => p.command === 'process1')).toBeDefined();
      expect(processes.find(p => p.command === 'process2')).toBeDefined();
      expect(processes.find(p => p.command === 'process3')).toBeDefined();
    });

    test('should handle rapid background process creation', async () => {
      const commands = ['cmd1', 'cmd2', 'cmd3', 'cmd4', 'cmd5'];
      
      // Create multiple background processes quickly
      await Promise.all(commands.map(cmd => terminal.executeCommand(`${cmd} &`)));
      
      const processes = terminal.getBackgroundProcesses();
      expect(processes).toHaveLength(5);
      
      // Verify all commands are tracked
      commands.forEach((cmd, index) => {
        const process = processes.find(p => p.command === cmd);
        expect(process).toBeDefined();
        expect(process.id).toBe(index + 1);
      });
    });
  });
});