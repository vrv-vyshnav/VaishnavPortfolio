import { Command } from '../core/Command.js';

export class ExitCommand extends Command {
  constructor() {
    super('exit', 'Exit the terminal and close the tab. Use "exit -all" to close all terminals.');
  }

  execute(params, context) {
    // Get the terminal ID from the context
    const terminalId = context.terminalId;
    
    // Check if -all flag is used
    if (params.includes('-all')) {
      // Dispatch a custom event to notify the TerminalManager to close all terminals
      const event = new CustomEvent('terminalExitAll');
      window.dispatchEvent(event);
      return;
    }
    
    if (terminalId) {
      // Dispatch a custom event to notify the TerminalManager to close this terminal
      const event = new CustomEvent('terminalExit', { 
        detail: { terminalId } 
      });
      window.dispatchEvent(event);
    } else {
      // Fallback for single terminal mode
      context.output.write('<span class="info">Closing terminal...</span>');
      context.output.clear();
    }
  }
}
