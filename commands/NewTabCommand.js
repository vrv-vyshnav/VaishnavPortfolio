import { Command } from '../core/Command.js';

export class NewTabCommand extends Command {
  constructor() {
    super('newtab', 'Create a new terminal tab', { category: 'Terminal Management' });
  }

  async execute(args, context) {
    const terminalManager = window.terminalManager;
    if (!terminalManager) {
      context.output.write('Terminal manager not available');
      return;
    }

    const newTerminalId = terminalManager.createTerminal();
    // Tab created silently
  }

}