import { Command } from '../core/Command.js';

export class SwitchTabCommand extends Command {
  constructor() {
    super('switchtab', 'Switch to a specific terminal tab', { category: 'Terminal Management' });
  }

  async execute(args, context) {
    const terminalManager = window.terminalManager;
    if (!terminalManager) {
      context.output.write('Terminal manager not available');
      return;
    }

    if (args.length === 0) {
      const currentTab = terminalManager.getCurrentTabNumber();
      context.output.write(`<span class="info">Currently on Tab ${currentTab}. Usage: switchtab &lt;number&gt;</span>`);
      return;
    }

    const tabNumber = parseInt(args[0]);
    if (isNaN(tabNumber)) {
      context.output.write(`<span class="error">Invalid tab number: ${args[0]}. Please enter a valid number.</span>`);
      return;
    }

    const success = terminalManager.switchToTabByNumber(tabNumber);
    if (!success) {
      context.output.write(`<span class="error">Tab ${tabNumber} does not exist.</span>`);
    }
    // Tab switched silently on success
  }

}