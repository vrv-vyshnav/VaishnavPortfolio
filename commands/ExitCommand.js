import { Command } from '../core/Command.js';

export class ExitCommand extends Command {
  constructor() {
    super('exit', 'Exit the terminal and close the tab');
  }

  execute(params, context) {
    context.output.clear();
    window.close();
    
  }
}
