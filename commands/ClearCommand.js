import { Command } from '../core/Command.js';

export class ClearCommand extends Command {
  constructor() {
    super('clear', 'Clear terminal screen', { category: 'Terminal Management' });
  }

  execute(params, context) {
    context.output.clear();
  }
}
