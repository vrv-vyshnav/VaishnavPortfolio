import { Command } from '../core/Command.js';

export class NewTabCommand extends Command {
  constructor() {
    super('newtab', 'Create a new terminal tab');
  }

  async execute(args, context) {
    const terminalManager = window.terminalManager;
    if (!terminalManager) {
      context.output.write('Terminal manager not available');
      return;
    }

    const newTerminalId = terminalManager.createTerminal();
    const tabNumber = terminalManager.getTabNumber(newTerminalId);
    context.output.write(`<span class="success">New terminal created and switched to Tab ${tabNumber}</span>`);
  }

}