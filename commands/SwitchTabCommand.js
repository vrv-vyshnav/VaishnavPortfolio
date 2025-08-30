import { Command } from '../core/Command.js';

export class SwitchTabCommand extends Command {
  constructor() {
    super('switchtab', 'Switch to a specific terminal tab');
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
    if (success) {
      context.output.write(`<span class="success">Switched to Tab ${tabNumber}</span>`);
    } else {
      context.output.write(`<span class="error">Warning: Tab ${tabNumber} does not exist. `);
    }
  }

}