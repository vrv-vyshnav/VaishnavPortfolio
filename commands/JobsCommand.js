import { Command } from '../core/Command.js';

export class JobsCommand extends Command {
  constructor() {
    super('jobs', 'List active background jobs');
  }

  async execute(args, context) {
    // Access the terminal instance through the context
    // The terminal instance will be passed through context in TerminalContext
    let terminal = null;
    
    // Try to find the terminal instance
    if (context.terminalInstance) {
      terminal = context.terminalInstance;
    } else if (window.terminalManager) {
      terminal = window.terminalManager.getActiveTerminal();
    }

    if (!terminal || !terminal.backgroundProcesses) {
      context.output.write(`<span class="error">No background process management available</span>`);
      return;
    }

    const processes = Array.from(terminal.backgroundProcesses.values());
    
    if (processes.length === 0) {
      context.output.write(`<span class="info">No active jobs</span>`);
      return;
    }

    context.output.write(`<span class="info">Active jobs:</span>`);
    
    processes.forEach(process => {
      const duration = process.endTime 
        ? `${Math.round((process.endTime - process.startTime) / 1000)}s`
        : `${Math.round((new Date() - process.startTime) / 1000)}s`;
      
      const statusColor = process.status === 'completed' ? 'success' : 
                         process.status === 'failed' ? 'error' : 'info';
      
      context.output.write(
        `<span class="info">[${process.id}]</span> ` +
        `<span class="${statusColor}">${process.status.padEnd(10)}</span> ` +
        `<span class="info">${duration.padEnd(6)}</span> ` +
        `<span class="command">${process.command}</span>`
      );
    });
  }

  getHelp() {
    return {
      usage: 'jobs',
      description: 'List all active and recently completed background jobs',
      examples: [
        'jobs'
      ]
    };
  }
}